import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { requireDeveloper } from "@/lib/admin/admin.guards";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2025-08-27.basil" as never });
}

export const getFinancialOverview = createServerFn({ method: "GET" })
  .middleware([requireDeveloper])
  .handler(async () => {
    const stripe = getStripe();

    // Active subscriptions (paginate up to 500)
    const subs: Stripe.Subscription[] = [];
    let starting_after: string | undefined;
    for (let i = 0; i < 5; i++) {
      const page = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        starting_after,
        expand: ["data.items.data.price"],
      });
      subs.push(...page.data);
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1]?.id;
    }

    // MRR
    let mrr = 0;
    const byProduct: Record<string, { count: number; mrr: number }> = {};
    for (const sub of subs) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (!price.unit_amount || !price.recurring) continue;
        let monthly = (price.unit_amount / 100) * (item.quantity ?? 1);
        if (price.recurring.interval === "year") monthly = monthly / 12;
        else if (price.recurring.interval === "week") monthly = monthly * 4.345;
        else if (price.recurring.interval === "day") monthly = monthly * 30;
        mrr += monthly;
        const productId = String(price.product);
        if (!byProduct[productId]) byProduct[productId] = { count: 0, mrr: 0 };
        byProduct[productId].count += 1;
        byProduct[productId].mrr += monthly;
      }
    }

    // Churn — canceled in last 30 days vs active
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400;
    const canceled = await stripe.subscriptions.list({
      status: "canceled",
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });
    const churnRate = subs.length
      ? Math.round(
          (canceled.data.length / (subs.length + canceled.data.length)) * 10000,
        ) / 100
      : 0;

    // Recent invoices (last 20)
    const invoices = await stripe.invoices.list({
      limit: 20,
      expand: ["data.customer"],
    });
    const recentInvoices = invoices.data.map((inv) => ({
      id: inv.id,
      amount: (inv.amount_paid ?? 0) / 100,
      currency: inv.currency,
      status: inv.status,
      customer:
        typeof inv.customer === "object" &&
        inv.customer &&
        !("deleted" in inv.customer)
          ? inv.customer.email
          : null,
      created: inv.created,
      hostedUrl: inv.hosted_invoice_url,
    }));

    // Failed payments (last 30 days)
    const failed = await stripe.charges.list({
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });
    const failedCount = failed.data.filter((c) => c.status === "failed").length;

    // Monthly revenue series (last 6 months) from successful charges
    const monthsBack = 6;
    const sixMonthsAgo =
      Math.floor(Date.now() / 1000) - monthsBack * 30 * 86400;
    const charges: Stripe.Charge[] = [];
    starting_after = undefined;
    for (let i = 0; i < 10; i++) {
      const page = await stripe.charges.list({
        created: { gte: sixMonthsAgo },
        limit: 100,
        starting_after,
      });
      charges.push(...page.data);
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1]?.id;
    }
    const monthly: Record<string, number> = {};
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthly[d.toISOString().slice(0, 7)] = 0;
    }
    for (const c of charges) {
      if (c.status !== "succeeded") continue;
      const k = new Date(c.created * 1000).toISOString().slice(0, 7);
      if (k in monthly) monthly[k] += (c.amount ?? 0) / 100;
    }
    const revenueSeries = Object.entries(monthly).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    // Projection — average of last 3 full months, projected forward
    const lastThree = revenueSeries.slice(-3).map((r) => r.revenue);
    const avg = lastThree.length
      ? lastThree.reduce((a, b) => a + b, 0) / lastThree.length
      : mrr;
    const projection30 = avg;
    const projection90 = avg * 3;
    const arr = mrr * 12;
    const arpu = subs.length ? mrr / subs.length : 0;

    return {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      arpu: Math.round(arpu * 100) / 100,
      churnRate,
      activeSubscriptions: subs.length,
      canceledLast30: canceled.data.length,
      failedLast30: failedCount,
      byProduct,
      recentInvoices,
      revenueSeries,
      projection30: Math.round(projection30 * 100) / 100,
      projection90: Math.round(projection90 * 100) / 100,
    };
  });

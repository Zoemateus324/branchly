import { createServerFn } from "@tanstack/react-start";
import { requireDeveloper } from "@/lib/admin/admin.guards";

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireDeveloper])
  .handler(async () => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const now = new Date();
    const day = 86_400_000;
    const todayISO = new Date(now.getTime() - day).toISOString();
    const weekISO = new Date(now.getTime() - 7 * day).toISOString();
    const monthISO = new Date(now.getTime() - 30 * day).toISOString();

    const [
      locsAll,
      locsDay,
      locsWeek,
      locsMonth,
      lookups,
      reviews,
      reports,
      insights,
    ] = await Promise.all([
      supabaseAdmin
        .from("locations")
        .select("owner_id", { count: "exact", head: true }),
      supabaseAdmin
        .from("locations")
        .select("owner_id", { count: "exact", head: true })
        .gte("created_at", todayISO),
      supabaseAdmin
        .from("locations")
        .select("owner_id", { count: "exact", head: true })
        .gte("created_at", weekISO),
      supabaseAdmin
        .from("locations")
        .select("owner_id", { count: "exact", head: true })
        .gte("created_at", monthISO),
      supabaseAdmin
        .from("score_lookups")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("reviews")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("reports")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("insights")
        .select("id", { count: "exact", head: true }),
    ]);

    // Unique owners (proxy for active users)
    const { data: ownersData } = await supabaseAdmin
      .from("locations")
      .select("owner_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    const uniqueOwners = new Set((ownersData ?? []).map((r) => r.owner_id));

    // Daily series — last 30 days new locations
    const buckets: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * day);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    for (const row of ownersData ?? []) {
      const k = (row.created_at as string).slice(0, 10);
      if (k in buckets) buckets[k]++;
    }
    const series = Object.entries(buckets).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      totals: {
        locations: locsAll.count ?? 0,
        activeOwners: uniqueOwners.size,
        scoreLookups: lookups.count ?? 0,
        reviews: reviews.count ?? 0,
        reports: reports.count ?? 0,
        insights: insights.count ?? 0,
      },
      growth: {
        day: locsDay.count ?? 0,
        week: locsWeek.count ?? 0,
        month: locsMonth.count ?? 0,
      },
      series,
    };
  });

export const getRecentAuditLog = createServerFn({ method: "GET" })
  .middleware([requireDeveloper])
  .handler(async () => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return { entries: data ?? [] };
  });

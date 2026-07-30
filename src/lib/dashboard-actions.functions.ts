import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import { PLAN_LIMITS, planFromKey, type PlanTier } from "@/lib/plans";

const DEVELOPER_EMAILS = new Set(["zmmateus2@gmail.com"]);

export function isDeveloperEmail(email: string | null | undefined): boolean {
  return !!email && DEVELOPER_EMAILS.has(email.trim().toLowerCase());
}

async function getActivePlan(email: string): Promise<PlanTier> {
  if (isDeveloperEmail(email)) return "premium";
  try {
    const { getPlanOverride } =
      await import("@/lib/admin/plan-override.server");
    const override = await getPlanOverride(email);
    if (override) return planFromKey(override);
  } catch (e) {
    console.error("[getActivePlan] plan override lookup failed", e);
  }
  try {
    const Stripe = (await import("stripe")).default;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return "free";
    const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" as never });
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data[0]) return "free";
    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });
    if (!subs.data[0]) return "free";
    const productId = subs.data[0].items.data[0].price.product as string;
    const { PLANS } = await import("./stripe.functions");
    const entry = (
      Object.entries(PLANS) as [PlanTier, { productId: string }][]
    ).find(([, p]) => p.productId === productId);
    return planFromKey(entry?.[0]);
  } catch {
    return "free";
  }
}

class PlanError extends Error {
  constructor(
    public feature: string,
    public plan: PlanTier,
  ) {
    super(`PLAN_LIMIT:${feature}:${plan}`);
  }
}

/* ---------------- Locations ---------------- */

export const addLocation = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        name: z.string().trim().min(1).max(200),
        city: z.string().trim().min(1).max(200),
        category: z.string().trim().max(120).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    const { count } = await supabaseAdmin
      .from("locations")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", context.userId);
    if ((count ?? 0) >= PLAN_LIMITS[plan].locations)
      throw new PlanError("locations", plan);
    const { refreshMyLocationScore } = await import("./google-score.functions");
    return refreshMyLocationScore({ data });
  });

/* ---------------- Competitors ---------------- */

export const addCompetitor = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        name: z.string().trim().min(1).max(200),
        rating: z.number().min(0).max(5).nullable().optional(),
        review_count: z.number().int().min(0).nullable().optional(),
        location_id: z.string().uuid().nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    const { count } = await supabaseAdmin
      .from("competitors")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", context.userId);
    if ((count ?? 0) >= PLAN_LIMITS[plan].competitors)
      throw new PlanError("competitors", plan);
    const { error, data: row } = await supabaseAdmin
      .from("competitors")
      .insert({
        owner_id: context.userId,
        name: data.name,
        rating: data.rating ?? null,
        review_count: data.review_count ?? 0,
        location_id: data.location_id ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removeCompetitor = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("competitors")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    return { ok: true };
  });

/* ---------------- Reports ---------------- */

export const createReport = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        name: z.string().trim().min(1).max(200),
        period: z.string().trim().min(1).max(60),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    const sinceMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString();
    const { count } = await supabaseAdmin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", context.userId)
      .gte("created_at", sinceMonth);
    if ((count ?? 0) >= PLAN_LIMITS[plan].reports)
      throw new PlanError("reports", plan);

    // Snapshot KPI data at report creation time
    const [locsRes, revsRes, compsRes, insRes] = await Promise.all([
      supabaseAdmin
        .from("locations")
        .select("*")
        .eq("owner_id", context.userId),
      supabaseAdmin
        .from("reviews")
        .select("*")
        .eq("owner_id", context.userId)
        .gte("posted_at", sinceMonth)
        .limit(500),
      supabaseAdmin
        .from("competitors")
        .select("*")
        .eq("owner_id", context.userId),
      supabaseAdmin
        .from("insights")
        .select("*")
        .eq("owner_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    const locs = locsRes.data ?? [];
    const revs = revsRes.data ?? [];
    const comps = compsRes.data ?? [];
    const topInsights = (insRes.data ?? []).slice(0, 5);

    const scores = locs.map((l) => Number(l.score)).filter(Number.isFinite);
    const ratings = locs.map((l) => Number(l.rating)).filter(Number.isFinite);
    const avgScore = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    const avgRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
    const totalReviews = locs.reduce((s, l) => s + (l.review_count ?? 0), 0);
    const replied = revs.filter((r) => !!r.reply).length;
    const responseRate = revs.length
      ? Math.round((replied / revs.length) * 100)
      : 0;
    const compRatings = comps
      .map((c) => Number(c.rating))
      .filter(Number.isFinite);
    const benchmarkRating = compRatings.length
      ? Math.round(
          (compRatings.reduce((a, b) => a + b, 0) / compRatings.length) * 10,
        ) / 10
      : 4.5;
    const sentCounts = { positive: 0, neutral: 0, negative: 0 };
    for (const r of revs) {
      const s = (r.sentiment ?? "").toLowerCase() as keyof typeof sentCounts;
      if (s in sentCounts) sentCounts[s]++;
    }
    const sentTotal =
      sentCounts.positive + sentCounts.neutral + sentCounts.negative || 1;

    const content_json = {
      generatedAt: new Date().toISOString(),
      period: data.period,
      kpis: {
        avgScore: Math.round(avgScore * 10) / 10,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        responseRate,
        activeLocations: locs.length,
        benchmarkRating,
        ratingGap: Math.round((avgRating - benchmarkRating) * 10) / 10,
      },
      sentiment: {
        positive: Math.round((sentCounts.positive / sentTotal) * 100),
        neutral: Math.round((sentCounts.neutral / sentTotal) * 100),
        negative: Math.round((sentCounts.negative / sentTotal) * 100),
      },
      topLocations: locs
        .sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
        .slice(0, 5)
        .map((l) => ({
          name: l.name,
          city: l.city,
          score: l.score,
          rating: l.rating,
          reviewCount: l.review_count,
        })),
      competitors: comps.slice(0, 5).map((c) => ({
        name: c.name,
        rating: c.rating,
        reviewCount: c.review_count,
      })),
      topInsights: topInsights.map((i) => ({
        title: i.title,
        body: i.body,
        severity: i.severity,
        category: i.category,
      })),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error, data: row } = await (supabaseAdmin.from("reports") as any)
      .insert({
        owner_id: context.userId,
        name: data.name,
        period: data.period,
        status: "ready",
        content_json,
      })
      .select("*")
      .single();
    if (error) throw new Error((error as { message: string }).message);
    return row;
  });

/* ---------------- Manual reviews (TikTok, Pinterest, etc.) ---------------- */

export const addManualReview = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        source: z.enum(["TikTok", "Pinterest"]),
        author: z.string().trim().max(200).optional(),
        rating: z.number().min(1).max(5).nullable().optional(),
        comment: z.string().trim().max(2000).optional(),
        posted_at: z.string().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const rating = data.rating ?? null;
    const sentiment =
      rating === null
        ? "neutral"
        : rating >= 4
          ? "positive"
          : rating <= 2
            ? "negative"
            : "neutral";
    const { error, data: row } = await supabaseAdmin
      .from("reviews")
      .insert({
        owner_id: context.userId,
        author: data.author?.trim() || null,
        rating,
        comment: data.comment?.trim() || null,
        source: data.source,
        sentiment,
        posted_at: data.posted_at || new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/* ---------------- Reviews: capture + AI reply ---------------- */

export const captureReviewsForAll = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { refreshMyLocationScore } = await import("./google-score.functions");
    const { data: locs } = await supabaseAdmin
      .from("locations")
      .select("name,city,category")
      .eq("owner_id", context.userId);
    if (!locs || locs.length === 0) return { captured: 0 };
    let captured = 0;
    for (const l of locs) {
      try {
        await refreshMyLocationScore({
          data: {
            name: l.name,
            city: l.city ?? "",
            category: l.category ?? undefined,
          },
        });
        captured += 1;
      } catch (e) {
        console.error("[capture] failed", l.name, e);
      }
    }
    return { captured };
  });

export const generateReplyForReview = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    if (PLAN_LIMITS[plan].aiReplies <= 0)
      throw new PlanError("aiReplies", plan);

    const { data: review, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .single();
    if (error || !review) throw new Error("Review não encontrado");

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY ausente");

    const userPrompt = `Avaliação ${review.rating ?? "?"}★ por ${review.author ?? "cliente"}: "${review.comment ?? ""}". Escreva uma resposta breve (máx 3 frases), educada, profissional, em português do Brasil. Agradeça quando for positivo; reconheça e ofereça solução quando for negativo. Responda apenas com o texto da resposta.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system:
          "Você é um gerente cordial e objetivo respondendo avaliações públicas.",
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const json = (await res.json()) as {
      content?: { type: string; text: string }[];
    };
    const reply = (
      json.content?.find((c) => c.type === "text")?.text ?? ""
    ).trim();
    if (!reply) throw new Error("Resposta vazia");

    await supabaseAdmin
      .from("reviews")
      .update({ reply })
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    return { id: data.id, reply };
  });

export const generateRepliesForUnreplied = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    const budget = PLAN_LIMITS[plan].aiReplies;
    if (budget <= 0) throw new PlanError("aiReplies", plan);

    const { data: pending } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("owner_id", context.userId)
      .is("reply", null)
      .limit(Math.min(budget, 20));
    if (!pending || pending.length === 0) return { generated: 0 };

    let generated = 0;
    for (const r of pending) {
      try {
        await generateReplyForReview({ data: { id: r.id } });
        generated += 1;
      } catch (e) {
        console.error("[ai-reply] failed", r.id, e);
      }
    }
    return { generated };
  });

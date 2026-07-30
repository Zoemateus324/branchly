import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";

export const getDashboardData = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        days: z.union([z.literal(7), z.literal(15), z.literal(30)]).default(30),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const ownerId = context.userId;
    const days = data.days;
    const sinceISO = new Date(Date.now() - days * 86_400_000).toISOString();

    const [locsRes, revsRes, compsRes, insRes, repsRes] = await Promise.all([
      supabaseAdmin
        .from("locations")
        .select("*")
        .eq("owner_id", ownerId)
        .order("score", { ascending: false }),
      supabaseAdmin
        .from("reviews")
        .select("*")
        .eq("owner_id", ownerId)
        .gte("posted_at", sinceISO)
        .order("posted_at", { ascending: false })
        .limit(200),
      supabaseAdmin
        .from("competitors")
        .select("*")
        .eq("owner_id", ownerId)
        .order("rating", { ascending: false }),
      supabaseAdmin
        .from("insights")
        .select("*")
        .eq("owner_id", ownerId)
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("reports")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false }),
    ]);

    const locations = locsRes.data ?? [];
    const reviews = revsRes.data ?? [];
    const competitors = compsRes.data ?? [];
    const insights = insRes.data ?? [];
    const reports = repsRes.data ?? [];

    // KPIs
    const scores = locations
      .map((l) => Number(l.score))
      .filter((n) => Number.isFinite(n));
    const avgScore = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    const totalReviews = locations.reduce(
      (s, l) => s + (l.review_count ?? 0),
      0,
    );
    const ratings = locations
      .map((l) => Number(l.rating))
      .filter((n) => Number.isFinite(n));
    const avgRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
    const repliedCount = reviews.filter((r) => !!r.reply).length;
    const responseRate = reviews.length
      ? Math.round((repliedCount / reviews.length) * 100)
      : 0;

    // Benchmark: average competitor rating, or 4.5 as industry standard
    const compRatings = competitors
      .map((c) => Number(c.rating))
      .filter((n) => Number.isFinite(n) && n > 0);
    const benchmarkRating =
      compRatings.length
        ? Math.round((compRatings.reduce((a, b) => a + b, 0) / compRatings.length) * 10) / 10
        : 4.5;

    // Sentiment mix
    const sentCounts = { positive: 0, neutral: 0, negative: 0 };
    for (const r of reviews) {
      const s = (r.sentiment ?? "").toLowerCase();
      if (s === "positive" || s === "neutral" || s === "negative")
        sentCounts[s]++;
    }
    const sentTotal =
      sentCounts.positive + sentCounts.neutral + sentCounts.negative || 1;
    const sentiment = {
      positive: Math.round((sentCounts.positive / sentTotal) * 100),
      neutral: Math.round((sentCounts.neutral / sentTotal) * 100),
      negative: Math.round((sentCounts.negative / sentTotal) * 100),
    };

    // Rating distribution
    const dist = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.rating === stars).length,
    }));

    // Reviews by source
    const sourceMap = new Map<string, number>();
    for (const r of reviews) {
      const k = r.source ?? "Other";
      sourceMap.set(k, (sourceMap.get(k) ?? 0) + 1);
    }
    const sources = Array.from(sourceMap.entries())
      .map(([src, count]) => ({ src, count }))
      .sort((a, b) => b.count - a.count);

    // Daily trend: average rating per day across the window (0 if no reviews)
    const buckets = new Map<string, { sum: number; n: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000)
        .toISOString()
        .slice(0, 10);
      buckets.set(d, { sum: 0, n: 0 });
    }
    for (const r of reviews) {
      if (!r.posted_at || r.rating == null) continue;
      const d = new Date(r.posted_at).toISOString().slice(0, 10);
      const b = buckets.get(d);
      if (b) {
        b.sum += r.rating;
        b.n += 1;
      }
    }
    const trend = Array.from(buckets.entries()).map(([date, b]) => ({
      date,
      value: b.n ? Math.round((b.sum / b.n) * 20) : 0, // scale 1-5 -> 0-100
    }));

    return {
      days,
      locations,
      reviews,
      competitors,
      insights,
      reports,
      kpis: {
        avgScore: Math.round(avgScore * 10) / 10,
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        responseRate,
        activeLocations: locations.length,
        atRisk: locations.filter((l) => Number(l.score) < 75).length,
        benchmarkRating,
        ratingGap: Math.round((Math.round(avgRating * 10) / 10 - benchmarkRating) * 10) / 10,
      },
      sentiment,
      dist,
      sources,
      trend,
    };
  });

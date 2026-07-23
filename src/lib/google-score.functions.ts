import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import type { ScoreBreakdown } from "./score.server";

const lookupInput = z.object({
  name: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(200),
  category: z.string().trim().max(120).optional(),
});

export const lookupScore = createServerFn({ method: "POST" })
  .inputValidator((i) => lookupInput.parse(i))
  .handler(async ({ data }) => {
    const { scrapeGoogleBusiness } = await import("./firecrawl.server");
    const { calculateScore } = await import("./score.server");
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    // Cache: reuse a recent lookup for the same (name, city, category) within
    // 10 minutes to avoid abuse of the paid Firecrawl API and prevent flooding
    // the score_lookups table from this unauthenticated endpoint.
    const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    const cacheQuery = supabaseAdmin
      .from("score_lookups")
      .select(
        "name, city, category, rating, review_count, score, breakdown, source_url",
      )
      .ilike("name", data.name)
      .ilike("city", data.city)
      .gte("created_at", tenMinAgo)
      .order("created_at", { ascending: false })
      .limit(1);
    const { data: cached } = data.category
      ? await cacheQuery.eq("category", data.category)
      : await cacheQuery.is("category", null);
    if (cached && cached.length > 0) {
      const c = cached[0] as {
        name: string;
        city: string;
        category: string | null;
        rating: number | null;
        review_count: number | null;
        score: number | null;
        breakdown: unknown;
        source_url: string | null;
      };
      let benchmark: number | null = null;
      if (data.category) {
        const { data: bench } = await supabaseAdmin
          .from("score_lookups")
          .select("score")
          .eq("category", data.category)
          .limit(50);
        if (bench && bench.length > 1) {
          const vals = bench
            .map((b: { score: number | null }) => Number(b.score))
            .filter((n: number) => Number.isFinite(n));
          if (vals.length > 0)
            benchmark =
              Math.round(
                (vals.reduce((a: number, b: number) => a + b, 0) /
                  vals.length) *
                  10,
              ) / 10;
        }
      }
      return {
        score: Number(c.score) || 0,
        breakdown: c.breakdown as ScoreBreakdown,
        benchmark,
        name: c.name ?? data.name,
        rating: c.rating,
        reviewCount: c.review_count,
        address: null as string | null,
        sourceUrl: c.source_url ?? "",
      };
    }

    const scraped = await scrapeGoogleBusiness(data);
    const { findPlace } = await import("./google-places.server");
    const place = await findPlace(scraped.name || data.name, data.city);
    if (place) {
      if (scraped.rating == null && place.rating != null)
        scraped.rating = place.rating;
      if (!scraped.reviewCount && place.userRatingCount)
        scraped.reviewCount = place.userRatingCount;
      if (!scraped.address && place.formattedAddress)
        scraped.address = place.formattedAddress;
      if (!scraped.sourceUrl && place.googleMapsUri)
        scraped.sourceUrl = place.googleMapsUri;
    }
    const { score, breakdown } = calculateScore(scraped);

    await supabaseAdmin.from("score_lookups").insert({
      name: data.name,
      city: data.city,
      category: data.category ?? null,
      rating: scraped.rating,
      review_count: scraped.reviewCount,
      score,
      breakdown: breakdown as unknown as Json,
      source_url: scraped.sourceUrl,
    });

    let benchmark: number | null = null;
    if (data.category) {
      const { data: bench } = await supabaseAdmin
        .from("score_lookups")
        .select("score")
        .eq("category", data.category)
        .limit(50);
      if (bench && bench.length > 1) {
        const vals = bench
          .map((b: { score: number | null }) => Number(b.score))
          .filter((n: number) => Number.isFinite(n));
        if (vals.length > 0)
          benchmark =
            Math.round(
              (vals.reduce((a: number, b: number) => a + b, 0) / vals.length) *
                10,
            ) / 10;
      }
    }

    return {
      score,
      breakdown,
      benchmark,
      name: scraped.name,
      rating: scraped.rating,
      reviewCount: scraped.reviewCount,
      address: scraped.address,
      sourceUrl: scraped.sourceUrl,
    };
  });

export const refreshMyLocationScore = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) => lookupInput.parse(i))
  .handler(async ({ data, context }) => {
    const { scrapeGoogleBusiness } = await import("./firecrawl.server");
    const { calculateScore } = await import("./score.server");
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const scraped = await scrapeGoogleBusiness(data);
    const { findPlace } = await import("./google-places.server");
    const place = await findPlace(scraped.name || data.name, data.city);
    if (place) {
      if (scraped.rating == null && place.rating != null)
        scraped.rating = place.rating;
      if (!scraped.reviewCount && place.userRatingCount)
        scraped.reviewCount = place.userRatingCount;
      if (!scraped.address && place.formattedAddress)
        scraped.address = place.formattedAddress;
      if (!scraped.sourceUrl && place.googleMapsUri)
        scraped.sourceUrl = place.googleMapsUri;
    }
    const { score, breakdown } = calculateScore(scraped);

    const payload = {
      owner_id: context.userId,
      name: scraped.name || data.name,
      city: data.city,
      category: scraped.category || data.category || null,
      address: scraped.address,
      google_url: scraped.sourceUrl,
      rating: scraped.rating,
      review_count: scraped.reviewCount,
      score,
      score_breakdown: breakdown as unknown as Json,
      last_scraped_at: new Date().toISOString(),
    };

    const { data: existing } = await supabaseAdmin
      .from("locations")
      .select("id")
      .eq("owner_id", context.userId)
      .ilike("name", data.name)
      .ilike("city", data.city)
      .maybeSingle();

    let locationId: string;
    if (existing) {
      const { error } = await supabaseAdmin
        .from("locations")
        .update(payload)
        .eq("id", existing.id);
      if (error) {
        console.error("[locations.update]", error);
        throw new Error(
          "Não foi possível atualizar a localização. Tente novamente.",
        );
      }
      locationId = existing.id;
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from("locations")
        .insert(payload)
        .select("id")
        .single();
      if (error) {
        console.error("[locations.insert]", error);
        throw new Error(
          "Não foi possível salvar a localização. Tente novamente.",
        );
      }
      locationId = inserted!.id;
    }

    // Persist scraped reviews (replace previous batch for this location)
    if (scraped.recentReviews?.length) {
      await supabaseAdmin
        .from("reviews")
        .delete()
        .eq("location_id", locationId);
      const reviewRows = scraped.recentReviews.map((r) => {
        const rating =
          typeof r.rating === "number" ? Math.round(r.rating) : null;
        const sentiment =
          rating === null
            ? "neutral"
            : rating >= 4
              ? "positive"
              : rating <= 2
                ? "negative"
                : "neutral";
        return {
          owner_id: context.userId,
          location_id: locationId,
          author: r.author ?? null,
          rating,
          comment: r.text ?? null,
          source: "Google",
          sentiment,
          posted_at: parseTimeAgo(r.timeAgo),
        };
      });
      await supabaseAdmin.from("reviews").insert(reviewRows);
    }

    // Generate AI insights via Lovable AI Gateway (replace prior auto insights for this location)
    try {
      const insights = await generateInsights({
        name: payload.name,
        rating: scraped.rating,
        reviewCount: scraped.reviewCount,
        score,
        reviews: scraped.recentReviews,
      });
      const tag = `auto:${locationId}`;
      await supabaseAdmin
        .from("insights")
        .delete()
        .eq("owner_id", context.userId)
        .eq("category", tag);
      if (insights.length) {
        await supabaseAdmin.from("insights").insert(
          insights.map((i) => ({
            owner_id: context.userId,
            title: i.title,
            body: i.body,
            severity: i.severity,
            category: tag,
          })),
        );
      }
    } catch (e) {
      console.error("[insights] generation failed", e);
    }

    return { id: locationId, ...payload };
  });

function parseTimeAgo(s?: string): string {
  const now = Date.now();
  if (!s) return new Date(now).toISOString();
  const m = s.match(/(\d+)\s*(day|week|month|year|hour|minute)s?/i);
  if (!m) return new Date(now).toISOString();
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const mult: Record<string, number> = {
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 7 * 86_400_000,
    month: 30 * 86_400_000,
    year: 365 * 86_400_000,
  };
  return new Date(now - n * (mult[unit] ?? 86_400_000)).toISOString();
}

async function generateInsights(ctx: {
  name: string;
  rating: number | null;
  reviewCount: number | null;
  score: number;
  reviews: {
    author?: string;
    rating?: number;
    text?: string;
    timeAgo?: string;
  }[];
}): Promise<{ title: string; body: string; severity: string }[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return [];
  const reviewSnippets = ctx.reviews
    .slice(0, 10)
    .map((r) => `- (${r.rating ?? "?"}★) ${r.text ?? ""}`)
    .join("\n");
  const prompt = `Você é um analista de reputação de negócios locais. Negócio: "${ctx.name}". Score: ${ctx.score}. Rating médio: ${ctx.rating ?? "?"} com ${ctx.reviewCount ?? "?"} avaliações.\nReviews recentes:\n${reviewSnippets || "(nenhum)"}\n\nGere de 3 a 4 insights práticos em português do Brasil. Responda APENAS com JSON válido no formato: {"insights":[{"title":"...","body":"...","severity":"info|warning|critical","category":"opcional"}]}`;

  const res = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você responde apenas com JSON válido." },
          { role: "user", content: prompt },
        ],
      }),
    },
  );
  if (!res.ok) {
    console.error("[insights] gateway error", res.status, await res.text());
    return [];
  }
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content ?? "";
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as {
      insights?: { title: string; body: string; severity?: string }[];
    };
    return (parsed.insights ?? []).slice(0, 4).map((i) => ({
      title: i.title,
      body: i.body,
      severity: i.severity ?? "info",
    }));
  } catch {
    return [];
  }
}

export const listMyLocations = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("locations")
      .select("*")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[locations.list]", error);
      throw new Error(
        "Não foi possível carregar as localizações. Tente novamente.",
      );
    }
    return { locations: data ?? [] };
  });

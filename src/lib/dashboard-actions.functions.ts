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
    const { getPlanOverride } = await import("@/lib/admin/plan-override.server");
    const override = await getPlanOverride(email);
    if (override) return planFromKey(override);
  } catch {}
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
    const entry = (Object.entries(PLANS) as [PlanTier, { productId: string }][]).find(
      ([, p]) => p.productId === productId,
    );
    return planFromKey(entry?.[0]);
  } catch {
    return "free";
  }
}

class PlanError extends Error {
  constructor(public feature: string, public plan: PlanTier) {
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    const { count } = await supabaseAdmin
      .from("locations")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", context.userId);
    if ((count ?? 0) >= PLAN_LIMITS[plan].locations) throw new PlanError("locations", plan);
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    const { count } = await supabaseAdmin
      .from("competitors")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", context.userId);
    if ((count ?? 0) >= PLAN_LIMITS[plan].competitors) throw new PlanError("competitors", plan);
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("competitors").delete().eq("id", data.id).eq("owner_id", context.userId);
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    const sinceMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count } = await supabaseAdmin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", context.userId)
      .gte("created_at", sinceMonth);
    if ((count ?? 0) >= PLAN_LIMITS[plan].reports) throw new PlanError("reports", plan);
    const { error, data: row } = await supabaseAdmin
      .from("reports")
      .insert({
        owner_id: context.userId,
        name: data.name,
        period: data.period,
        status: "ready",
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
          data: { name: l.name, city: l.city ?? "", category: l.category ?? undefined },
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    if (PLAN_LIMITS[plan].aiReplies <= 0) throw new PlanError("aiReplies", plan);

    const { data: review, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .single();
    if (error || !review) throw new Error("Review não encontrado");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    const prompt = `Você é gerente respondendo a uma avaliação pública. Avaliação ${
      review.rating ?? "?"
    }★ por ${review.author ?? "cliente"}: "${review.comment ?? ""}". Escreva uma resposta breve (máx 3 frases), educada, profissional, em português do Brasil. Agradeça quando for positivo; reconheça e ofereça solução quando for negativo. Responda apenas com o texto da resposta.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um gerente cordial e objetivo." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI gateway ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = (json.choices?.[0]?.message?.content ?? "").trim();
    if (!reply) throw new Error("Resposta vazia");

    await supabaseAdmin.from("reviews").update({ reply }).eq("id", data.id).eq("owner_id", context.userId);
    return { id: data.id, reply };
  });

export const generateRepliesForUnreplied = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
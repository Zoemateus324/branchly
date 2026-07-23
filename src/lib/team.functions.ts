import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import { PLAN_MEMBER_LIMITS } from "./plans";
import { PLANS, type PlanKey } from "./stripe.functions";

async function getActivePlan(email: string): Promise<PlanKey | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" as never });
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return null;
  const subs = await stripe.subscriptions.list({
    customer: customers.data[0].id,
    status: "active",
    limit: 1,
  });
  if (subs.data.length === 0) return null;
  const productId = subs.data[0].items.data[0].price.product as string;
  const entry = (
    Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]
  ).find(([, p]) => p.productId === productId);
  return entry ? entry[0] : null;
}

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("memberships")
      .select("*")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[team.listMembers]", error);
      throw new Error("Não foi possível carregar os membros. Tente novamente.");
    }
    const plan = await getActivePlan(context.email);
    const limit = plan ? (PLAN_MEMBER_LIMITS[plan] ?? 0) : 0;
    return { members: data ?? [], plan, limit };
  });

export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        email: z.string().email().max(254),
        role: z.enum(["admin", "financial", "member"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const plan = await getActivePlan(context.email);
    if (!plan) {
      throw new Error(
        "Adicionar membros requer um plano pago. Faça upgrade para Starter, Pro ou Premium.",
      );
    }
    const limit = PLAN_MEMBER_LIMITS[plan] ?? 0;
    const { count } = await supabaseAdmin
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", context.userId)
      .neq("status", "removed");
    if ((count ?? 0) >= limit) {
      throw new Error(
        `Seu plano ${plan} permite até ${limit} membros. Faça upgrade para adicionar mais.`,
      );
    }
    const { data: row, error } = await supabaseAdmin
      .from("memberships")
      .insert({
        owner_id: context.userId,
        member_email: data.email.toLowerCase(),
        role: data.role,
        status: "pending",
      })
      .select()
      .single();
    if (error) {
      if ((error as { code?: string }).code === "23505")
        throw new Error("Este e-mail já foi convidado.");
      console.error("[team.inviteMember]", error);
      throw new Error("Não foi possível convidar o membro. Tente novamente.");
    }
    return { member: row };
  });

export const updateMemberRole = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        role: z.enum(["admin", "financial", "member"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("memberships")
      .update({ role: data.role })
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) {
      console.error("[team.updateMemberRole]", error);
      throw new Error("Não foi possível atualizar o cargo. Tente novamente.");
    }
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("memberships")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) {
      console.error("[team.removeMember]", error);
      throw new Error("Não foi possível remover o membro. Tente novamente.");
    }
    return { ok: true };
  });

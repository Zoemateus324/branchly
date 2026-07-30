import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireDeveloper, logAdminAction } from "@/lib/admin/admin.guards";

export const listAllUsers = createServerFn({ method: "POST" })
  .middleware([requireDeveloper])
  .inputValidator((i) =>
    z
      .object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        query: z.string().trim().max(200).optional(),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data: listData, error } = await supabaseAdmin.auth.admin.listUsers({
      page: Math.floor(data.offset / data.limit) + 1,
      perPage: data.limit,
    });
    if (error) throw new Error(error.message);

    const allUsers = listData.users.filter((u) => {
      if (!data.query) return true;
      const q = data.query.toLowerCase();
      return u.email?.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    });

    const users = allUsers.map((u) => ({
      id: u.id,
      email: u.email ?? null,
      firstName: null as string | null,
      lastName: null as string | null,
      imageUrl: null as string | null,
      createdAt: new Date(u.created_at).getTime(),
      lastSignInAt: u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : null,
      banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
    }));

    const ids = users.map((u) => u.id);
    const emails = users.map((u) => u.email).filter(Boolean) as string[];
    const [{ data: overrides }, { data: locs }] = await Promise.all([
      supabaseAdmin
        .from("plan_overrides")
        .select("user_email, plan")
        .in(
          "user_email",
          emails.map((e) => e.toLowerCase()),
        ),
      supabaseAdmin.from("locations").select("owner_id").in("owner_id", ids),
    ]);
    const overrideMap = new Map(
      (overrides ?? []).map((r) => [r.user_email, r.plan]),
    );
    const locCount = new Map<string, number>();
    for (const r of locs ?? [])
      locCount.set(r.owner_id, (locCount.get(r.owner_id) ?? 0) + 1);

    return {
      users: users.map((u) => ({
        ...u,
        planOverride: u.email
          ? (overrideMap.get(u.email.toLowerCase()) ?? null)
          : null,
        locationCount: locCount.get(u.id) ?? 0,
      })),
      totalCount: listData.total ?? allUsers.length,
    };
  });

export const setPlanOverride = createServerFn({ method: "POST" })
  .middleware([requireDeveloper])
  .inputValidator((i) =>
    z
      .object({
        email: z.string().email(),
        plan: z.enum(["free", "starter", "pro", "premium"]).nullable(),
        reason: z.string().trim().max(500).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();
    if (data.plan === null) {
      await supabaseAdmin
        .from("plan_overrides")
        .delete()
        .eq("user_email", email);
      await logAdminAction(context.email, "plan_override.remove", { email });
      return { ok: true, cleared: true };
    }
    await supabaseAdmin.from("plan_overrides").upsert({
      user_email: email,
      plan: data.plan,
      reason: data.reason ?? null,
      set_by: context.email,
    });
    await logAdminAction(context.email, "plan_override.set", {
      email,
      plan: data.plan,
    });
    return { ok: true };
  });

export const banUser = createServerFn({ method: "POST" })
  .middleware([requireDeveloper])
  .inputValidator((i) =>
    z.object({ userId: z.string().min(1), ban: z.boolean() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.ban ? "87600h" : "none",
    });
    if (error) throw new Error(error.message);
    await logAdminAction(context.email, data.ban ? "user.ban" : "user.unban", {
      userId: data.userId,
    });
    return { ok: true };
  });

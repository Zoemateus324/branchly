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
    const { createClerkClient } = await import("@clerk/backend");
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) throw new Error("CLERK_SECRET_KEY missing");
    const clerk = createClerkClient({ secretKey });
    const res = await clerk.users.getUserList({
      limit: data.limit,
      offset: data.offset,
      query: data.query || undefined,
      orderBy: "-created_at",
    });

    const users = res.data.map((u) => {
      const primary =
        u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId) ??
        u.emailAddresses[0];
      return {
        id: u.id,
        email: primary?.emailAddress ?? null,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
        createdAt: u.createdAt,
        lastSignInAt: u.lastSignInAt,
        banned: u.banned,
      };
    });

    // Augment with override + counts
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
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
      totalCount: res.totalCount,
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
    const { createClerkClient } = await import("@clerk/backend");
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    if (data.ban) await clerk.users.banUser(data.userId);
    else await clerk.users.unbanUser(data.userId);
    await logAdminAction(context.email, data.ban ? "user.ban" : "user.unban", {
      userId: data.userId,
    });
    return { ok: true };
  });

import { createMiddleware } from "@tanstack/react-start";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import { isDeveloperEmail } from "@/lib/dashboard-actions.functions";

export const requireDeveloper = createMiddleware({ type: "function" })
  .middleware([requireClerkAuth])
  .server(async ({ next, context }) => {
    if (!isDeveloperEmail(context.email)) {
      throw new Error("Forbidden: admin only");
    }
    return next({ context });
  });

export async function logAdminAction(
  actorEmail: string,
  action: string,
  payload?: unknown,
) {
  try {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_email: actorEmail,
      action,
      payload: (payload ?? null) as never,
    });
  } catch (e) {
    console.error("[admin.audit]", e);
  }
}

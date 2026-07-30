import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

// Server middleware: verify the Supabase JWT attached by attachSupabaseAuth
// and inject userId + email into the handler context.
// Exported as requireClerkAuth so no callers need to change their import.
export const requireClerkAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!token) throw new Error("Unauthorized: missing auth token");

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) throw new Error("Unauthorized: invalid token");

    const email = user.email;
    if (!email) throw new Error("Unauthorized: user has no email");

    return next({ context: { userId: user.id, email } });
  },
);

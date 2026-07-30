import { createMiddleware } from "@tanstack/react-start";

// No-op: Supabase Bearer token is already attached by attachSupabaseAuth.
// Kept so any code that imports attachClerkAuth continues to compile.
export const attachClerkAuth = createMiddleware({
  type: "function",
}).client(async ({ next }) => next({}));

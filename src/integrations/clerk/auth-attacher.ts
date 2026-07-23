import { createMiddleware } from "@tanstack/react-start";

// Client middleware: attach the current Clerk session token to outgoing
// serverFn RPCs so the server-side middleware can verify the caller.
export const attachClerkAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | null = null;
    try {
      const clerk = (
        globalThis as unknown as {
          Clerk?: { session?: { getToken: () => Promise<string | null> } };
        }
      ).Clerk;
      token = (await clerk?.session?.getToken()) ?? null;
    } catch {
      token = null;
    }
    return next({
      headers: token ? { "x-clerk-token": token } : {},
    });
  },
);

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define quais rotas exigem autenticação obrigatória
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)", "/api/feedback(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Padrão obrigatório do Clerk para Next.js 15
    '/((?!_next|[^?]*\\.[0-9a-z]+$).*)',
    '/',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)' // Auto-proxy path do Clerk
  ],
};
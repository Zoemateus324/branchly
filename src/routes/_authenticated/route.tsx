import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // ssr: false ensures this runs only in the browser, where Clerk is
    // initialised on window. Wait for it to load, then enforce auth before
    // the protected subtree mounts — this prevents the page shell from
    // flashing if Clerk hasn't hydrated yet and makes the guard explicit
    // rather than relying on the component-level useAuth() check alone.
    if (typeof window === "undefined") return {};
    const clerk = (
      window as unknown as {
        Clerk?: {
          loaded?: boolean;
          load?: () => Promise<void>;
          session?: unknown;
        };
      }
    ).Clerk;

    if (clerk && !clerk.loaded && clerk.load) {
      try {
        await clerk.load();
      } catch {
        // fall through — component-level guard will redirect
      }
    }

    if (clerk?.loaded && !clerk.session) {
      throw redirect({ to: "/sign-in/$", params: { _splat: "" } });
    }
    return {};
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading…
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    throw redirect({ to: "/sign-in/$", params: { _splat: "" } });
  }

  return <Outlet />;
}

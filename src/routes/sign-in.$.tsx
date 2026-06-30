import { createFileRoute, Navigate } from "@tanstack/react-router";
import { SignIn, useAuth } from "@clerk/clerk-react";
import { Header } from "@/components/site/Header";
import { Logo } from "@/components/site/Logo";
import { ClerkFrame, clerkAppearance } from "@/components/auth/clerk-ui";

export const Route = createFileRoute("/sign-in/$")({
  head: () => ({
    meta: [
      { title: "Sign in — Branchly" },
      { name: "description", content: "Sign in to your Branchly workspace to monitor reviews, benchmark locations and act on AI insights." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Sign in — Branchly" },
      { property: "og:url", content: "/sign-in" },
    ],
    links: [{ rel: "canonical", href: "/sign-in" }],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth();
  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your Branchly workspace.</p>
        </div>
        <ClerkFrame>
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
            appearance={clerkAppearance}
          />
        </ClerkFrame>
      </div>
    </div>
  );
}

import { createFileRoute, Navigate } from "@tanstack/react-router";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { Header } from "@/components/site/Header";
import { Logo } from "@/components/site/Logo";
import { ClerkFrame, clerkAppearance } from "@/components/auth/clerk-ui";

export const Route = createFileRoute("/sign-up/$")({
  head: () => ({
    meta: [
      { title: "Start free — Branchly reputation management software" },
      {
        name: "description",
        content:
          "Start a free Branchly account. Monitor Google reviews, benchmark locations against competitors and grow ratings with AI. 14-day Pro trial. No credit card.",
      },
      { property: "og:title", content: "Start free — Branchly" },
      {
        property: "og:description",
        content:
          "Free reputation management for local and multi-location businesses. 14-day Pro trial included.",
      },
      { property: "og:url", content: "/sign-up" },
    ],
    links: [{ rel: "canonical", href: "/sign-up" }],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth();
  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Start free
          </h1>
          <p className="text-sm text-muted-foreground">
            No credit card required. 14-day Pro trial included.
          </p>
        </div>
        <ClerkFrame>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/dashboard"
            signInForceRedirectUrl="/dashboard"
            appearance={clerkAppearance}
          />
        </ClerkFrame>
      </div>
    </div>
  );
}

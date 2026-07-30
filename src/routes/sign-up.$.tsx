import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Logo } from "@/components/site/Logo";

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
  const navigate = useNavigate();
  const [session, setSession] = useState<unknown>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyState, setVerifyState] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  if (session) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // If email confirmation is required, show verify state; otherwise go to dashboard
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      navigate({ to: "/dashboard" });
    } else {
      setVerifyState(true);
      setLoading(false);
    }
  }

  if (verifyState) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20 text-center">
          <Logo />
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account.
          </p>
          <a href="/sign-in" className="text-xs text-primary hover:underline">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

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

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="At least 8 characters"
            />
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create free account"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <a href="/sign-in" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

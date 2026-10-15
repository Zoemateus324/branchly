// "Continuar com Google" — Supabase-native OAuth sign-in/sign-up.
//
// Unlike the WhatsApp/Google Ads integrations, this does NOT go through a
// custom code-exchange callback route: supabase-js handles the OAuth
// redirect and session creation on its own (detectSessionInUrl). We just
// kick off signInWithOAuth() and let Supabase redirect back to `redirectTo`.
//
// Requires, on the Supabase side (Authentication → Providers → Google):
//   - Google provider enabled
//   - Client ID + Client Secret from a Google OAuth client whose
//     "Authorized redirect URIs" includes:
//       https://<project-ref>.supabase.co/auth/v1/callback
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function GoogleSignInButton({
  label = "Continuar com Google",
}: {
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    }
    // On success the browser navigates away to Google's consent screen —
    // nothing else to do here.
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "Redirecionando…" : label}
      </button>
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.6C40.9 36.9 44 31 44 24c0-1.3-.1-2.6-.4-3.5z"
      />
    </svg>
  );
}

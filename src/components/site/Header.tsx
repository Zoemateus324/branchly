import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, Sun, Globe, ChevronDown, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { useApp } from "@/lib/providers";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const { t, locale, setLocale, currency, setCurrency, theme, setTheme } =
    useApp();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const isSignedIn = !!user;
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" aria-label="Branchly home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <Link to="/features" className="transition hover:text-foreground">
              {t.nav.product}
            </Link>
            <Link to="/pricing" className="transition hover:text-foreground">
              {t.nav.pricing}
            </Link>
            <Link to="/customers" className="transition hover:text-foreground">
              {t.nav.customers}
            </Link>
            <Link to="/docs" className="transition hover:text-foreground">
              {t.nav.docs}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Globe className="h-3.5 w-3.5" />
              {locale.toUpperCase()} · {currency}
              <ChevronDown className="h-3 w-3" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-popover p-1 shadow-lg">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Language
                </div>
                {(["en", "pt"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLocale(l);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition hover:bg-muted ${locale === l ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {l === "en" ? "English" : "Português (BR)"}
                    {locale === l && <span className="text-accent">●</span>}
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Currency
                </div>
                {(["USD", "BRL"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition hover:bg-muted ${currency === c ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {c === "USD" ? "US Dollar" : "Real Brasileiro"}
                    {currency === c && <span className="text-accent">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {isSignedIn ? (
            <button
              onClick={handleSignOut}
              title={user?.email ?? "Sign out"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground transition hover:opacity-80"
            >
              {initials}
            </button>
          ) : (
            <>
              <Link
                to="/sign-in/$"
                className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:block"
              >
                {t.nav.signIn}
              </Link>
              <Link
                to="/sign-up/$"
                className="rounded-md bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                {t.nav.startFree}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

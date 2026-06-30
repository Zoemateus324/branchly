import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Locale, type Dict } from "./i18n/translations";

type Currency = "BRL" | "USD";
type Theme = "light" | "dark";

interface AppCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  format: (brl: number, usd: number) => string;
}

const Ctx = createContext<AppCtx | null>(null);

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("pt") ? "pt" : "en";
}

function detectCurrency(): Currency {
  if (typeof navigator === "undefined") return "USD";
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("pt") || lang.includes("br") ? "BRL" : "USD";
}

function detectTheme(): Theme {
  return (
    (localStorage.getItem("branchly:theme") as Theme | null) ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  // Initial state must match the server-rendered defaults (en / USD / dark) so the
  // first client render doesn't diverge from SSR output and trigger a hydration
  // mismatch. The real, persisted preferences are applied right after mount below.
  const [locale, setLocaleState] = useState<Locale>("en");
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setLocaleState((localStorage.getItem("branchly:locale") as Locale | null) ?? detectLocale());
    setCurrencyState((localStorage.getItem("branchly:currency") as Currency | null) ?? detectCurrency());
    setThemeState(detectTheme());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const value = useMemo<AppCtx>(
    () => ({
      locale,
      setLocale: (l) => {
        setLocaleState(l);
        localStorage.setItem("branchly:locale", l);
      },
      t: translations[locale],
      currency,
      setCurrency: (c) => {
        setCurrencyState(c);
        localStorage.setItem("branchly:currency", c);
      },
      theme,
      setTheme: (t) => {
        setThemeState(t);
        localStorage.setItem("branchly:theme", t);
      },
      format: (brl, usd) =>
        currency === "BRL"
          ? `R$${brl.toLocaleString("pt-BR", { minimumFractionDigits: brl % 1 ? 2 : 0 })}`
          : `US$${usd.toLocaleString("en-US", { minimumFractionDigits: usd % 1 ? 2 : 0 })}`,
    }),
    [locale, currency, theme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProviders");
  return ctx;
}
import { motion } from "motion/react";
import { useRef, useState } from "react";
import {
  Eye,
  GitCompareArrows,
  Wand2,
  TrendingUp,
  Star,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { lookupScore } from "@/lib/google-score.functions";
import { useApp } from "@/lib/providers";
import { DashboardPreview } from "./DashboardPreview";

export function Hero() {
  const { t } = useApp();
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid-bg absolute inset-0 pointer-events-none" />
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-12 md:pt-28 md:pb-20">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t.hero.badge}
          </div>
          <h1 className="font-display mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-gradient md:text-6xl lg:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#simulator"
              className="group inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-lg transition hover:opacity-90"
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#solution"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-muted"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{t.hero.trust}</p>
        </motion.div>

        <div className="mt-16 md:mt-20">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

export function Logos() {
  const { t } = useApp();
  const names = [
    "NORTHSTAR",
    "PARALLAX",
    "MERIDIAN",
    "AXIOM",
    "VERSO",
    "HELIO",
  ];
  return (
    <section className="border-b border-border py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
          {t.logos}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 opacity-60 sm:grid-cols-3 md:grid-cols-6">
          {names.map((n) => (
            <div
              key={n}
              className="text-center font-display text-sm font-semibold tracking-[0.2em] text-muted-foreground"
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stats() {
  const { t } = useApp();
  const items = [
    { v: "12.4M+", l: t.stats.reviews },
    { v: "8,200+", l: t.stats.locations },
    { v: "180k+", l: t.stats.reports },
    { v: "$420M", l: t.stats.opportunities },
  ];
  return (
    <section id="stats" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-display max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          {t.stats.title}
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {items.map((it, i) => (
            <motion.div
              key={it.l}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card p-8"
            >
              <div className="font-display text-4xl font-semibold tabular-nums tracking-tight md:text-5xl">
                {it.v}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{it.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Problems() {
  const { t } = useApp();
  return (
    <section className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-accent">
            {t.problems.eyebrow}
          </div>
          <h2 className="font-display mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {t.problems.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.problems.subtitle}</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {t.problems.items.map((p, i) => (
            <motion.div
              key={p.t}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-foreground/20"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">
                    {p.t}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.d}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const solutionIcons = [Eye, GitCompareArrows, Wand2, TrendingUp];

export function Solution() {
  const { t } = useApp();
  return (
    <section id="solution" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-accent">
            {t.solution.eyebrow}
          </div>
          <h2 className="font-display mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {t.solution.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.solution.subtitle}</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {t.solution.items.map((it, i) => {
            const Icon = solutionIcons[i];
            return (
              <motion.div
                key={it.t}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
                <div className="relative">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-display mt-5 text-lg font-semibold">
                    {it.t}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{it.d}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Simulator() {
  const { t } = useApp();
  const [form, setForm] = useState({
    name: "",
    city: "",
    category: t.simulator.categories[0],
  });
  const [result, setResult] = useState<{
    score: number;
    bench: number;
    rating: number | null;
    reviewCount: number | null;
    name: string;
    sourceUrl: string;
    lossEstimate: {
      monthlyLossBRL: number;
      avgTicketBRL: number;
      avgMonthlyCustomers: number;
      starGap: number;
      benchmarkRating: number;
    } | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lookup = useServerFn(lookupScore);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const calc = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!form.name || !form.city || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await lookup({
        data: { name: form.name, city: form.city, category: form.category },
      });
      if (res.rating === null && res.reviewCount === null) {
        setError(
          "Não encontramos esse negócio no Google Maps. Confira o nome e a cidade.",
        );
        return;
      }
      setResult({
        score: res.score,
        bench: res.benchmark ?? 75,
        rating: res.rating,
        reviewCount: res.reviewCount,
        name: res.name,
        sourceUrl: res.sourceUrl,
        lossEstimate: res.lossEstimate,
      });
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        50,
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Falha ao calcular o score";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="simulator" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-accent">
              {t.simulator.eyebrow}
            </div>
            <h2 className="font-display mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              {t.simulator.title}
            </h2>
            <p className="mt-4 text-muted-foreground">{t.simulator.subtitle}</p>
          </div>

          <div
            className="rounded-2xl border border-border bg-card p-6 md:p-8"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            {!result ? (
              <div
                className="space-y-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter") calc(e);
                }}
              >
                <Field label={t.simulator.business}>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </Field>
                <Field label={t.simulator.city}>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </Field>
                <Field label={t.simulator.category}>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    {t.simulator.categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                {error && (
                  <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
                    {error}
                  </div>
                )}
                <button
                  type="button"
                  onClick={calc}
                  disabled={!form.name || !form.city || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Analisando
                      Google…
                    </>
                  ) : (
                    t.simulator.cta
                  )}
                </button>
                <p className="text-[11px] text-muted-foreground">
                  Buscamos dados reais no Google Maps via IA e calculamos seu
                  score em segundos.
                </p>
              </div>
            ) : (
              <motion.div
                ref={resultRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t.simulator.resultTitle}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t.simulator.resultSub}{" "}
                  <span className="font-medium text-foreground">
                    {result.name || form.name}
                  </span>
                </div>
                <div className="flex items-end gap-4">
                  <div className="font-display text-6xl font-semibold tabular-nums">
                    {result.score}
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(result.score / 20) ? "fill-current" : ""}`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Reputation Score · 0–100
                    </div>
                  </div>
                </div>
                {result.lossEstimate &&
                  result.lossEstimate.monthlyLossBRL > 0 && (
                    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
                      <div className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        {t.simulator.lossLabel}
                      </div>
                      <div className="font-display mt-1 text-3xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                        {result.lossEstimate.monthlyLossBRL.toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          },
                        )}
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          {t.simulator.lossPerMonth}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t.simulator.lossExplain
                          .replace("{rating}", (result.rating ?? 0).toFixed(1))
                          .replace(
                            "{benchmark}",
                            result.lossEstimate.benchmarkRating.toFixed(1),
                          )}
                      </div>
                    </div>
                  )}
                {(result.rating !== null || result.reviewCount !== null) && (
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Rating Google</div>
                      <div className="font-mono text-sm text-foreground">
                        {result.rating !== null
                          ? result.rating.toFixed(1)
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avaliações</div>
                      <div className="font-mono text-sm text-foreground">
                        {result.reviewCount !== null
                          ? result.reviewCount.toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Bar
                    label={t.simulator.benchmark}
                    value={result.bench}
                    color="oklch(0.7 0.02 260)"
                  />
                  <Bar
                    label={result.name || form.name || "You"}
                    value={result.score}
                    color="oklch(0.6 0.18 265)"
                  />
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {t.simulator.gap}:
                  </span>{" "}
                  {result.score < result.bench
                    ? `−${(result.bench - result.score).toFixed(1)} pts`
                    : `+${(result.score - result.bench).toFixed(1)} pts`}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="w-full rounded-lg border border-border py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Calcular outro negócio
                </button>
                <Link
                  to="/sign-up/$"
                  className="block w-full rounded-lg bg-foreground py-2.5 text-center text-sm font-medium text-background transition hover:opacity-90"
                >
                  {t.simulator.claim}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Bar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

interface Plan {
  key: "free" | "starter" | "pro" | "premium";
  brl: number;
  usd: number;
  highlight?: boolean;
}

const plans: Plan[] = [
  { key: "free", brl: 0, usd: 0 },
  { key: "starter", brl: 89, usd: 19 },
  { key: "pro", brl: 149, usd: 29, highlight: true },
  { key: "premium", brl: 249, usd: 49 },
];

export function Pricing() {
  const { t, format } = useApp();
  return (
    <section id="pricing" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-wider text-accent">
            {t.pricing.eyebrow}
          </div>
          <h2 className="font-display mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {t.pricing.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.pricing.subtitle}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const plan = t.pricing.plans[p.key];
            const price = p.brl === 0 ? "0" : format(p.brl, p.usd);
            return (
              <div
                key={p.key}
                className={`relative rounded-2xl border bg-card p-6 transition ${
                  p.highlight
                    ? "border-foreground/40 shadow-xl"
                    : "border-border"
                }`}
                style={
                  p.highlight ? { boxShadow: "var(--shadow-glow)" } : undefined
                }
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-6 rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-background">
                    {t.pricing.mostPopular}
                  </div>
                )}
                <div className="font-display text-lg font-semibold">
                  {plan.name}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.desc}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold tabular-nums">
                    {price}
                  </span>
                  {p.brl > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {t.pricing.perMonth}
                    </span>
                  )}
                </div>
                <Link
                  to="/sign-up/$"
                  className={`mt-5 block w-full rounded-lg py-2 text-center text-sm font-medium transition ${
                    p.highlight
                      ? "bg-foreground text-background hover:opacity-90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {p.key === "pro" ? t.pricing.ctaPro : t.pricing.cta}
                </Link>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-5">
          <div>
            <div className="font-display text-sm font-semibold">
              {t.pricing.addonTitle}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.pricing.addonDesc}
            </p>
          </div>
          <div className="font-display text-xl font-semibold tabular-nums">
            {format(19.9, 4)}
            {t.pricing.perMonth}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  const { t } = useApp();
  return (
    <section className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/60 p-10 text-center md:p-16">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="relative">
            <h2 className="font-display mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              {t.cta.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/sign-up/$"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                {t.cta.primary} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:hello@branchly.com"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                {t.cta.secondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useApp();
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="font-display text-lg font-semibold">Branchly</div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {t.footer.tagline}
            </p>
          </div>
          <FooterCol
            title={t.footer.product}
            links={["Features", "Pricing", "Changelog", "Roadmap"]}
          />
          <FooterCol
            title={t.footer.company}
            links={["About", "Customers", "Careers", "Contact"]}
          />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} Branchly. {t.footer.rights}
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-foreground">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

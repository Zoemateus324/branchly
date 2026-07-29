import {
  useState,
  useEffect,
  type ReactNode,
  createContext,
  useContext,
} from "react";
import { Link } from "@tanstack/react-router";
import { useUser, UserButton } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Globe, ChevronDown, Moon, Sun } from "lucide-react";
import { useApp } from "@/lib/providers";
import {
  createCheckout,
  checkSubscription,
  customerPortal,
  PLANS,
  type PlanKey,
} from "@/lib/stripe.functions";
import {
  refreshMyLocationScore,
  listMyLocations,
} from "@/lib/google-score.functions";
import {
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from "@/lib/team.functions";
import { getDashboardData } from "@/lib/dashboard.functions";
import {
  ROLE_LABELS,
  PLAN_LIMITS,
  planFromKey,
  minPlanFor,
  type PlanTier,
  type PlanLimits,
} from "@/lib/plans";
import {
  addLocation,
  addCompetitor,
  removeCompetitor,
  createReport,
  captureReviewsForAll,
  generateReplyForReview,
  generateRepliesForUnreplied,
} from "@/lib/dashboard-actions.functions";
import {
  getFacebookAuthUrl,
  getFacebookConnection,
  captureFacebookReviews,
  captureInstagramComments,
  disconnectFacebook,
} from "@/lib/meta.functions";
import { UpgradeDialog } from "./UpgradeDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import {
  LayoutDashboard,
  Star,
  MapPin,
  Users,
  MessageSquare,
  Sparkles,
  FileBarChart,
  CreditCard,
  Search,
  Bell,
  Plus,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Facebook,
  Instagram,
  Unlink,
  Activity,
  Copy,
  CheckCheck,
  Globe,
  MousePointerClick,
  PhoneCall,
  MessageCircle,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import {
  createPixelSite,
  listPixelSites,
  deletePixelSite,
  getAttributionStats,
} from "@/lib/attribution/attribution.functions";

const act = (msg: string) => toast.success(msg);

type DaysFilter = 7 | 15 | 30;
const DashboardFilterContext = createContext<{
  days: DaysFilter;
  setDays: (d: DaysFilter) => void;
}>({
  days: 30,
  setDays: () => {},
});
const useDaysFilter = () => useContext(DashboardFilterContext);

/* -------- Plan + Upgrade context -------- */
type UpgradeRequest = { feature: keyof PlanLimits };
const PlanCtx = createContext<{
  plan: PlanTier;
  limits: PlanLimits;
  requireFeature: (feature: keyof PlanLimits, needed?: number) => boolean;
}>({ plan: "free", limits: PLAN_LIMITS.free, requireFeature: () => false });
const usePlan = () => useContext(PlanCtx);

function PlanProvider({ children }: { children: ReactNode }) {
  const checkSub = useServerFn(checkSubscription);
  const { data } = useQuery({
    queryKey: ["subscription-plan"],
    queryFn: () => checkSub(),
    refetchInterval: 60_000,
  });
  const plan = planFromKey(data?.plan ?? null);
  const limits = PLAN_LIMITS[plan];
  const [upgrade, setUpgrade] = useState<UpgradeRequest | null>(null);
  const requireFeature = (feature: keyof PlanLimits, needed = 1) => {
    if (limits[feature] >= needed) return true;
    setUpgrade({ feature });
    return false;
  };
  return (
    <PlanCtx.Provider value={{ plan, limits, requireFeature }}>
      {children}
      {upgrade && (
        <UpgradeDialog
          open
          onOpenChange={(v) => !v && setUpgrade(null)}
          feature={upgrade.feature}
          currentPlan={plan}
          suggestedPlan={minPlanFor(upgrade.feature)}
          onUpgrade={() => {
            setUpgrade(null);
            window.dispatchEvent(new CustomEvent("branchly:open-billing"));
          }}
        />
      )}
    </PlanCtx.Provider>
  );
}

function DaysFilterDropdown() {
  const { days, setDays } = useDaysFilter();
  return (
    <select
      value={days}
      onChange={(e) => setDays(Number(e.target.value) as DaysFilter)}
      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
    >
      <option value={7}>Últimos 7 dias</option>
      <option value={15}>Últimos 15 dias</option>
      <option value={30}>Últimos 30 dias</option>
    </select>
  );
}

type SectionId =
  | "overview"
  | "reputation"
  | "locations"
  | "competitors"
  | "reviews"
  | "insights"
  | "reports"
  | "team"
  | "billing"
  | "attribution";

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reputation", label: "Reputation", icon: Star },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "competitors", label: "Competitors", icon: Users },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "insights", label: "AI Insights", icon: Sparkles },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "team", label: "Equipe", icon: UserPlus },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "attribution", label: "Rastreamento", icon: Activity },
];

/* ---------------- language + theme toggles ---------------- */

function LanguageSelector() {
  const { locale, setLocale, currency, setCurrency } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = () => setOpen(false);
    window.addEventListener("click", handle);
    return () => window.removeEventListener("click", handle);
  }, []);

  return (
    <div
      className="relative hidden md:block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Globe className="h-3.5 w-3.5" />
        {locale.toUpperCase()}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-popover p-1 shadow-lg z-50">
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
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useApp();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="hidden md:block rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

export function DashboardShell() {
  const { user } = useUser();
  const [section, setSection] = useState<SectionId>("overview");
  const [days, setDays] = useState<DaysFilter>(30);
  const active = NAV.find((n) => n.id === section)!;

  useEffect(() => {
    const handler = () => setSection("billing");
    window.addEventListener("branchly:open-billing", handler);
    return () => window.removeEventListener("branchly:open-billing", handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<SectionId>).detail;
      if (id) setSection(id);
    };
    window.addEventListener("branchly:set-section", handler as EventListener);
    return () =>
      window.removeEventListener(
        "branchly:set-section",
        handler as EventListener,
      );
  }, []);

  return (
    <DashboardFilterContext.Provider value={{ days, setDays }}>
      <PlanProvider>
        <div className="min-h-screen w-full bg-background">
          <div className="flex w-full min-h-screen">
            {/* Sidebar */}
            <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-muted/20 md:flex md:flex-col">
              <div className="flex h-16 items-center border-b border-border px-5">
                <Link to="/" aria-label="Branchly home">
                  <Logo />
                </Link>
              </div>
              <nav className="flex-1 space-y-0.5 p-3">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                        isActive
                          ? "bg-background text-foreground font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-border p-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-accent" /> Pro trial
                  </div>
                  <div className="mt-1.5 text-xs text-foreground">
                    12 days remaining
                  </div>
                  <button
                    onClick={() => {
                      setSection("billing");
                      act("Opening billing…");
                    }}
                    className="mt-2.5 w-full rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
                  >
                    Upgrade plan
                  </button>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Topbar */}
              <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-base font-semibold tracking-tight md:text-lg">
                    {active.label}
                  </h1>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    · Welcome back,{" "}
                    {user?.firstName ||
                      user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
                      "there"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative hidden md:block">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search reviews, locations…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          act(
                            `Searching "${(e.target as HTMLInputElement).value}"…`,
                          );
                      }}
                      className="h-9 w-64 rounded-md border border-border bg-muted/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  <NotificationsBell
                    onOpenReviews={() => setSection("reviews")}
                  />
                  <LanguageSelector />
                  <ThemeToggle />
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: { avatarBox: "h-8 w-8 rounded-full" },
                    }}
                  />
                </div>
              </header>

              {/* Mobile section selector */}
              <div className="flex gap-1.5 overflow-x-auto border-b border-border bg-muted/20 px-4 py-2 md:hidden">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`shrink-0 rounded-md px-3 py-1.5 text-xs transition ${
                      section === item.id
                        ? "bg-background font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <main className="flex-1 p-4 md:p-6 lg:p-8">
                {section === "overview" && <OverviewSection />}
                {section === "reputation" && <ReputationSection />}
                {section === "locations" && <LocationsSection />}
                {section === "competitors" && <CompetitorsSection />}
                {section === "reviews" && <ReviewsSection />}
                {section === "insights" && <InsightsSection />}
                {section === "reports" && <ReportsSection />}
                {section === "team" && <TeamSection />}
                {section === "billing" && <BillingSection />}
                {section === "attribution" && <AttributionSection />}
              </main>
            </div>
          </div>
        </div>
      </PlanProvider>
    </DashboardFilterContext.Provider>
  );
}

/* ----------------------------- shared atoms ----------------------------- */

function KpiCard({
  label,
  value,
  delta,
  trend = "up",
  hint,
}: {
  label: string;
  value: string;
  delta: string;
  trend?: "up" | "down" | "neutral";
  hint?: string;
}) {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  const color =
    trend === "down"
      ? "text-rose-500"
      : trend === "neutral"
        ? "text-muted-foreground"
        : "text-emerald-500";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold tabular-nums">
          {value}
        </span>
        <span className={`flex items-center gap-0.5 text-xs ${color}`}>
          <TrendIcon className="h-3 w-3" />
          {delta}
        </span>
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-sm font-semibold text-foreground">
            {title}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Sparkline({
  data,
  color = "oklch(0.6 0.18 265)",
}: {
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 24;
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-6 w-20"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AreaChart({ data, compare }: { data: number[]; compare?: number[] }) {
  const max = 100;
  const w = 100;
  const h = 36;
  const toPath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = (i / (arr.length - 1)) * w;
        const y = h - (v / max) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  const area = `${toPath(data)} L${w},${h} L0,${h} Z`;
  return (
    <div className="relative h-48 w-full">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="ds-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.6 0.18 265)"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="oklch(0.6 0.18 265)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#ds-fill)" />
        {compare && (
          <path
            d={toPath(compare)}
            fill="none"
            stroke="oklch(0.7 0.02 260)"
            strokeWidth="0.6"
            strokeDasharray="1.5 1.5"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <path
          d={toPath(data)}
          fill="none"
          stroke="oklch(0.6 0.18 265)"
          strokeWidth="1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function Bars({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-32 items-end gap-1.5">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-gradient-to-t from-accent/60 to-accent"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function StarBar({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) {
  const pct = (count / total) * 100;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-8 text-muted-foreground">{stars}★</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/80"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

/* ------------------------------- Overview ------------------------------- */

function useDashboard() {
  const { days } = useDaysFilter();
  const fn = useServerFn(getDashboardData);
  return useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => fn({ data: { days } }),
  });
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <div className="text-sm font-medium text-foreground">{title}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function OverviewSection() {
  const { data, isLoading } = useDashboard();
  const { days } = useDaysFilter();
  const setSectionEvent = (id: SectionId) =>
    window.dispatchEvent(
      new CustomEvent("branchly:set-section", { detail: id }),
    );
  const k = data?.kpis;
  const locs = data?.locations ?? [];
  const ins = data?.insights ?? [];
  const trend = data?.trend ?? [];
  const trendData = trend.length
    ? trend.map((t) => t.value)
    : new Array(days).fill(0);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle={`Reputation pulse across all your locations, últimos ${days} dias.`}
        action={
          <div className="flex items-center gap-2">
            <DaysFilterDropdown />
            <button
              onClick={() => act("Export started — check your email")}
              className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Reputation Score"
          value={k ? k.avgScore.toFixed(1) : "—"}
          delta={isLoading ? "…" : `${k?.activeLocations ?? 0} loc.`}
          trend="neutral"
        />
        <KpiCard
          label="Total Reviews"
          value={k ? k.totalReviews.toLocaleString() : "—"}
          delta={`${data?.reviews.length ?? 0} captured`}
          trend="neutral"
        />
        <KpiCard
          label="Avg Rating"
          value={k ? k.avgRating.toFixed(1) : "—"}
          delta="Google"
          trend="neutral"
        />
        <KpiCard
          label="Response Rate"
          value={k ? `${k.responseRate}%` : "—"}
          delta={`${k?.atRisk ?? 0} at risk`}
          trend={k && k.atRisk > 0 ? "down" : "neutral"}
        />
      </div>

      <RealScoreWidget />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Reputation trend"
          subtitle={`Rating médio diário (escala 0-100) · ${days} dias`}
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "oklch(0.6 0.18 265)" }}
                />
                You
              </span>
            </div>
          }
        >
          {trendData.every((v) => v === 0) ? (
            <EmptyState
              title="Sem dados no período"
              hint="Calcule um score para começar a popular o gráfico."
            />
          ) : (
            <AreaChart data={trendData} />
          )}
        </SectionCard>

        <SectionCard
          title="Sentiment mix"
          subtitle={`Last ${data?.reviews.length ?? 0} reviews`}
        >
          <div className="space-y-3">
            <SentimentBar
              label="Positive"
              value={data?.sentiment.positive ?? 0}
              color="bg-emerald-500"
            />
            <SentimentBar
              label="Neutral"
              value={data?.sentiment.neutral ?? 0}
              color="bg-muted-foreground/40"
            />
            <SentimentBar
              label="Negative"
              value={data?.sentiment.negative ?? 0}
              color="bg-rose-500"
            />
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Top topics
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data?.sources.length ? (
                data.sources.slice(0, 7).map((s, i) => (
                  <span
                    key={s.src}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] ${i < 2 ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}
                  >
                    {s.src}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  Sem reviews ainda
                </span>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Top locations"
          subtitle="By reputation score"
          className="lg:col-span-2"
          action={
            <button
              onClick={() => act("Opening all locations…")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          }
        >
          {locs.length === 0 ? (
            <EmptyState
              title="Nenhuma localização cadastrada"
              hint="Adicione um negócio no widget de score acima."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">Location</th>
                  <th className="py-2 font-medium">Score</th>
                  <th className="py-2 font-medium">Reviews</th>
                  <th className="py-2 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {locs.slice(0, 5).map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {l.city ?? "—"}
                      </div>
                    </td>
                    <td className="py-3 font-mono tabular-nums">
                      {l.score !== null ? Number(l.score).toFixed(1) : "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {l.review_count ?? 0}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {l.rating !== null ? Number(l.rating).toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        <SectionCard
          title="AI Insights"
          subtitle="Motivações ranqueadas por impacto"
          action={
            <button
              onClick={() => setSectionEvent("insights")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Ver todas <ChevronRight className="h-3 w-3" />
            </button>
          }
        >
          {ins.length === 0 ? (
            <EmptyState
              title="Sem insights ainda"
              hint="Insights aparecerão conforme reviews forem analisados."
            />
          ) : (
            <div className="space-y-3">
              {ins.slice(0, 3).map((i) => (
                <div
                  key={i.id}
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-accent" />{" "}
                    {i.category ?? "Insight"}
                  </div>
                  <div className="mt-1 text-sm font-medium">{i.title}</div>
                  {i.severity && (
                    <div className="mt-1 text-xs text-emerald-500">
                      {i.severity}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function SentimentBar({
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
        <span className="font-mono tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------ Reputation ------------------------------ */

function ReputationSection() {
  const { data } = useDashboard();
  const dist = data?.dist ?? [];
  const total = dist.reduce((s, d) => s + d.count, 0);
  const score = data?.kpis.avgScore ?? 0;
  const sources = data?.sources ?? [];
  const sourceTotal = sources.reduce((s, x) => s + x.count, 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reputation"
        subtitle="Score breakdown, drivers and benchmark."
        action={
          <button
            onClick={() => act("Filter: all locations")}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <Filter className="h-3.5 w-3.5" /> All locations
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Reputation score"
          subtitle="Weighted across all sources"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-display text-5xl font-semibold tabular-nums">
              {score.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              {data?.kpis.activeLocations ?? 0} localizações
            </span>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <Bench label="Rating médio" value={data?.kpis.avgRating ?? 0} />
            <Bench
              label="Reviews totais"
              value={data?.kpis.totalReviews ?? 0}
            />
            <Bench label="Em risco" value={-(data?.kpis.atRisk ?? 0)} />
          </div>
        </SectionCard>

        <SectionCard
          title="Rating distribution"
          subtitle={`${total.toLocaleString()} reviews`}
          className="lg:col-span-2"
        >
          {total === 0 ? (
            <EmptyState title="Sem reviews capturados ainda" />
          ) : (
            <div className="space-y-2">
              {dist.map((d) => (
                <StarBar
                  key={d.stars}
                  stars={d.stars}
                  count={d.count}
                  total={total}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Insights recentes"
          subtitle="O que está movendo o score"
        >
          {(data?.insights.length ?? 0) === 0 ? (
            <EmptyState title="Sem insights ainda" />
          ) : (
            <ul className="space-y-3 text-sm">
              {data!.insights.slice(0, 5).map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
                >
                  <span>{d.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {d.category ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Reviews por fonte" subtitle="Últimos capturados">
          {sources.length === 0 ? (
            <EmptyState title="Sem reviews por fonte" />
          ) : (
            <div className="space-y-3">
              {sources.map((s) => (
                <div key={s.src}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{s.src}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {s.count}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(s.count / sourceTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function Bench({ label, value }: { label: string; value: number }) {
  const positive = value >= 0;
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-mono tabular-nums ${positive ? "text-emerald-500" : "text-rose-500"}`}
      >
        {positive ? "+" : ""}
        {value.toFixed(1)}
      </span>
    </div>
  );
}

/* ------------------------------- Locations ------------------------------ */

function statusForScore(score: number | null): string {
  if (score === null) return "attention";
  if (score >= 85) return "healthy";
  if (score >= 75) return "attention";
  return "risk";
}

function LocationsSection() {
  const { data } = useDashboard();
  const locs = data?.locations ?? [];
  const k = data?.kpis;
  const { requireFeature, limits } = usePlan();
  const [modalOpen, setModalOpen] = useState(false);
  const used = locs.length;
  const onAdd = () => {
    if (requireFeature("locations", used + 1)) setModalOpen(true);
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        subtitle={`Gerencie suas unidades · ${used}/${limits.locations === 9999 ? "∞" : limits.locations} usadas`}
        action={
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Add location
          </button>
        }
      />
      <AddLocationModal open={modalOpen} onOpenChange={setModalOpen} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Active"
          value={String(k?.activeLocations ?? 0)}
          delta="—"
          trend="neutral"
        />
        <KpiCard
          label="Avg score"
          value={k ? k.avgScore.toFixed(1) : "—"}
          delta="—"
          trend="neutral"
        />
        <KpiCard
          label="At risk"
          value={String(k?.atRisk ?? 0)}
          delta="score < 75"
          trend={k && k.atRisk > 0 ? "down" : "neutral"}
        />
        <KpiCard
          label="Total reviews"
          value={String(k?.totalReviews ?? 0)}
          delta="—"
          trend="neutral"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="font-display text-sm font-semibold">
            All locations
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => act("Filter applied")}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <Filter className="h-3 w-3" /> Filter
            </button>
            <button
              onClick={() => act("Export started")}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
        </div>
        {locs.length === 0 ? (
          <EmptyState
            title="Nenhuma localização"
            hint="Use o widget de Score real no Overview para adicionar."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Location</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Score</th>
                <th className="px-4 py-2.5 font-medium">Reviews</th>
                <th className="px-4 py-2.5 font-medium">Rating</th>
                <th className="px-4 py-2.5 font-medium text-right">
                  Atualizado
                </th>
                <th className="px-4 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {locs.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {l.city ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={statusForScore(
                        l.score !== null ? Number(l.score) : null,
                      )}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {l.score !== null ? Number(l.score).toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.review_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.rating !== null ? Number(l.rating).toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {l.last_scraped_at
                      ? new Date(l.last_scraped_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => act(`Opening ${l.name}…`)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ----------------------- Real Score (IA + Google) ---------------------- */

function RealScoreWidget() {
  const queryClient = useQueryClient();
  const refreshFn = useServerFn(refreshMyLocationScore);
  const listFn = useServerFn(listMyLocations);
  const { t } = useApp();
  const [form, setForm] = useState({
    name: "",
    city: "",
    category: t.simulator.categories[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["my-locations"],
    queryFn: () => listFn(),
  });
  const locations = data?.locations ?? [];
  const top = locations.find((l) => l.score !== null) ?? locations[0] ?? null;

  const submit = async () => {
    if (!form.name || !form.city || loading) return;
    setLoading(true);
    setError(null);
    try {
      await refreshFn({
        data: {
          name: form.name,
          city: form.city,
          category: form.category || undefined,
        },
      });
      toast.success("Score atualizado com dados reais do Google");
      setForm({ name: "", city: "", category: "" });
      queryClient.invalidateQueries({ queryKey: ["my-locations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao calcular score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard
      title="Score real (IA + Google)"
      subtitle="Buscamos avaliações reais no Google Maps via IA e calculamos o seu score em segundos."
    >
      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <input
            placeholder="Nome do negócio"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {t.simulator.categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}
          <button
            onClick={submit}
            disabled={!form.name || !form.city || loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analisando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Calcular score real
              </>
            )}
          </button>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          {top ? (
            <>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Último local analisado
              </div>
              <div className="mt-1 font-display text-base font-semibold">
                {top.name}
              </div>
              <div className="text-xs text-muted-foreground">{top.city}</div>
              <div className="mt-3 flex items-end gap-4">
                <div className="font-display text-4xl font-semibold tabular-nums">
                  {top.score !== null ? Number(top.score).toFixed(1) : "—"}
                </div>
                <div className="mb-1 text-xs text-muted-foreground">
                  <div>
                    Rating:{" "}
                    <span className="font-mono text-foreground">
                      {top.rating !== null
                        ? Number(top.rating).toFixed(1)
                        : "—"}
                    </span>
                  </div>
                  <div>
                    {top.review_count?.toLocaleString() ?? 0} avaliações
                  </div>
                </div>
              </div>
              {top.google_url && (
                <a
                  href={top.google_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver no Google <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">
              Nenhum local analisado ainda. Preencha ao lado para gerar seu
              primeiro score real.
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

/* ------------------------------- Team --------------------------------- */

function TeamSection() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listMembers);
  const inviteFn = useServerFn(inviteMember);
  const updateRoleFn = useServerFn(updateMemberRole);
  const removeFn = useServerFn(removeMember);
  const [form, setForm] = useState<{
    email: string;
    role: "admin" | "financial" | "member";
  }>({ email: "", role: "member" });
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => listFn(),
  });

  const members = data?.members ?? [];
  const plan = data?.plan ?? null;
  const limit = data?.limit ?? 0;
  const isPaid = !!plan;
  const seatsUsed = members.filter((m) => m.status !== "removed").length;

  const invite = async () => {
    if (!form.email || submitting) return;
    setSubmitting(true);
    try {
      await inviteFn({ data: { email: form.email, role: form.role } });
      toast.success("Convite criado");
      setForm({ email: "", role: "member" });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao convidar");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await removeFn({ data: { id } });
      toast.success("Membro removido");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao remover");
    }
  };

  const changeRole = async (
    id: string,
    role: "admin" | "financial" | "member",
  ) => {
    try {
      await updateRoleFn({ data: { id, role } });
      toast.success("Papel atualizado");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao atualizar");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe"
        subtitle="Convide gestores, administrativo e financeiro para colaborar na conta."
        action={
          isPaid && (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Plano {plan} · {seatsUsed}/{limit === 9999 ? "∞" : limit} membros
            </span>
          )
        }
      />

      {!isPaid && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <Crown className="mt-0.5 h-5 w-5 text-amber-500" />
            <div className="flex-1">
              <div className="font-display text-sm font-semibold">
                Equipe é um recurso dos planos pagos
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Convide administrativo, financeiro e membros nos planos Starter
                (até 2), Pro (até 5) ou Premium (ilimitado).
              </p>
              <button
                onClick={() =>
                  toast.message("Abra Billing para escolher um plano")
                }
                className="mt-3 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
              >
                Ver planos
              </button>
            </div>
          </div>
        </div>
      )}

      <SectionCard
        title="Convidar novo membro"
        subtitle="O convidado receberá acesso assim que se cadastrar com este e-mail."
      >
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            placeholder="email@empresa.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!isPaid}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
          />
          <select
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value as "admin" | "financial" | "member",
              })
            }
            disabled={!isPaid}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
          >
            <option value="admin">{ROLE_LABELS.admin}</option>
            <option value="financial">{ROLE_LABELS.financial}</option>
            <option value="member">{ROLE_LABELS.member}</option>
          </select>
          <button
            onClick={invite}
            disabled={!isPaid || !form.email || submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}{" "}
            Convidar
          </button>
        </div>
      </SectionCard>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4 font-display text-sm font-semibold">
          Membros
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum membro convidado ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">E-mail</th>
                <th className="px-4 py-2.5 font-medium">Papel</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{m.member_email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.role}
                      onChange={(e) =>
                        changeRole(
                          m.id,
                          e.target.value as "admin" | "financial" | "member",
                        )
                      }
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="admin">{ROLE_LABELS.admin}</option>
                      <option value="financial">{ROLE_LABELS.financial}</option>
                      <option value="member">{ROLE_LABELS.member}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${m.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}
                    >
                      {m.status === "active" ? "Ativo" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(m.id)}
                      className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition hover:text-rose-500"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; cls: string; Icon: typeof CheckCircle2 }
  > = {
    healthy: {
      label: "Healthy",
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      Icon: CheckCircle2,
    },
    attention: {
      label: "Attention",
      cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      Icon: Clock,
    },
    risk: {
      label: "At risk",
      cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      Icon: AlertTriangle,
    },
  };
  const s = map[status] ?? map.healthy;
  const Icon = s.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${s.cls}`}
    >
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  );
}

/* ----------------------------- Competitors ----------------------------- */

function CompetitorsSection() {
  const { data } = useDashboard();
  const comps = data?.competitors ?? [];
  const totalReviews =
    comps.reduce((s, c) => s + (c.review_count ?? 0), 0) || 1;
  const queryClient = useQueryClient();
  const removeFn = useServerFn(removeCompetitor);
  const { requireFeature, limits } = usePlan();
  const [modalOpen, setModalOpen] = useState(false);
  const onAdd = () => {
    if (requireFeature("competitors", comps.length + 1)) setModalOpen(true);
  };
  const onDelete = async (id: string) => {
    try {
      await removeFn({ data: { id } });
      toast.success("Concorrente removido");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitors"
        subtitle={`Compare-se com a categoria · ${comps.length}/${limits.competitors === 9999 ? "∞" : limits.competitors} rastreados`}
        action={
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Track competitor
          </button>
        }
      />
      <AddCompetitorModal open={modalOpen} onOpenChange={setModalOpen} />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4 font-display text-sm font-semibold">
          Tracked competitors
        </div>
        {comps.length === 0 ? (
          <EmptyState
            title="Sem concorrentes rastreados"
            hint="Adicione concorrentes para comparar seu rating."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Competitor</th>
                <th className="px-4 py-2.5 font-medium">Rating</th>
                <th className="px-4 py-2.5 font-medium">Reviews</th>
                <th className="px-4 py-2.5 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {comps.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {c.rating !== null ? Number(c.rating).toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(c.review_count ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/70"
                          style={{
                            width: `${((c.review_count ?? 0) / totalReviews) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {Math.round(
                          ((c.review_count ?? 0) / totalReviews) * 100,
                        )}
                        %
                      </span>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="ml-2 rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-rose-500"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Reviews ------------------------------- */

function FacebookConnectionCard() {
  const queryClient = useQueryClient();
  const getAuthUrl = useServerFn(getFacebookAuthUrl);
  const getConnection = useServerFn(getFacebookConnection);
  const captureFn = useServerFn(captureFacebookReviews);
  const captureIgFn = useServerFn(captureInstagramComments);
  const disconnectFn = useServerFn(disconnectFacebook);
  const [connecting, setConnecting] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [capturingIg, setCapturingIg] = useState(false);

  const { data } = useQuery({
    queryKey: ["facebook-connection"],
    queryFn: () => getConnection(),
  });
  const connection = data?.connection ?? null;

  const onConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await getAuthUrl();
      window.location.href = url;
    } catch (e) {
      toast.error((e as Error).message);
      setConnecting(false);
    }
  };

  const onCapture = async () => {
    setCapturing(true);
    try {
      const r = await captureFn();
      toast.success(`${r.captured} avaliações importadas do Facebook`);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["facebook-connection"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCapturing(false);
    }
  };

  const onCaptureInstagram = async () => {
    setCapturingIg(true);
    try {
      const r = await captureIgFn();
      toast.success(`${r.captured} comentários importados do Instagram`);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["facebook-connection"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCapturingIg(false);
    }
  };

  const onDisconnect = async () => {
    try {
      await disconnectFn();
      toast.success("Facebook desconectado");
      queryClient.invalidateQueries({ queryKey: ["facebook-connection"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2]">
          <Facebook className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">
            {connection ? connection.page_name : "Facebook"}
          </div>
          <div className="text-xs text-muted-foreground">
            {connection
              ? `Conectado · última sincronização: ${
                  connection.last_synced_at
                    ? new Date(connection.last_synced_at).toLocaleString(
                        "pt-BR",
                      )
                    : "nunca"
                }`
              : "Conecte uma Página para importar avaliações"}
            {connection?.instagram_username && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#E1306C]">
                <Instagram className="h-3 w-3" /> @
                {connection.instagram_username}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {connection ? (
          <>
            <button
              onClick={onCapture}
              disabled={capturing}
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              {capturing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}{" "}
              Importar avaliações
            </button>
            {connection.instagram_username && (
              <button
                onClick={onCaptureInstagram}
                disabled={capturingIg}
                title="Instagram não tem avaliações — isso importa comentários recentes e classifica o sentimento com IA"
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-50"
              >
                {capturingIg ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Instagram className="h-3.5 w-3.5" />
                )}{" "}
                Importar comentários
              </button>
            )}
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:text-rose-500"
              title="Desconectar"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="flex items-center gap-1.5 rounded-md bg-[#1877F2] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Facebook className="h-3.5 w-3.5" />
            )}{" "}
            Conectar Facebook
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewsSection() {
  const { data } = useDashboard();
  const all = data?.reviews ?? [];
  const [filter, setFilter] = useState<"all" | "unreplied" | "negative">("all");
  const queryClient = useQueryClient();
  const captureFn = useServerFn(captureReviewsForAll);
  const generateAllFn = useServerFn(generateRepliesForUnreplied);
  const generateOneFn = useServerFn(generateReplyForReview);
  const { requireFeature } = usePlan();
  const [capturing, setCapturing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [perRow, setPerRow] = useState<Record<string, boolean>>({});

  const onCapture = async () => {
    setCapturing(true);
    try {
      const r = await captureFn();
      toast.success(`${r.captured} localizações atualizadas`);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCapturing(false);
    }
  };
  const onGenerateAll = async () => {
    if (!requireFeature("aiReplies")) return;
    setGenerating(true);
    try {
      const r = await generateAllFn();
      toast.success(`${r.generated} respostas geradas`);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.startsWith("PLAN_LIMIT:")) {
        toast.error("Faça upgrade para usar respostas com IA");
        window.dispatchEvent(new CustomEvent("branchly:open-billing"));
      } else toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };
  const onGenerateOne = async (id: string) => {
    if (!requireFeature("aiReplies")) return;
    setPerRow((s) => ({ ...s, [id]: true }));
    try {
      await generateOneFn({ data: { id } });
      toast.success("Resposta gerada");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.startsWith("PLAN_LIMIT:")) {
        toast.error("Faça upgrade para usar respostas com IA");
        window.dispatchEvent(new CustomEvent("branchly:open-billing"));
      } else toast.error(msg);
    } finally {
      setPerRow((s) => ({ ...s, [id]: false }));
    }
  };
  const filtered = all.filter((r) =>
    filter === "unreplied"
      ? !r.reply
      : filter === "negative"
        ? (r.sentiment ?? "").toLowerCase() === "negative"
        : true,
  );
  const counts = {
    all: all.length,
    unreplied: all.filter((r) => !r.reply).length,
    negative: all.filter(
      (r) => (r.sentiment ?? "").toLowerCase() === "negative",
    ).length,
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        subtitle="Reply faster with AI-drafted responses, tuned to your brand voice."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={onCapture}
              disabled={capturing}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              {capturing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}{" "}
              Capturar reviews
            </button>
            <button
              onClick={onGenerateAll}
              disabled={generating || counts.unreplied === 0}
              className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}{" "}
              Gerar respostas IA
            </button>
          </div>
        }
      />

      <FacebookConnectionCard />

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: "all", label: "All reviews", count: counts.all },
            {
              id: "unreplied",
              label: "Awaiting reply",
              count: counts.unreplied,
            },
            { id: "negative", label: "Negative", count: counts.negative },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
              filter === f.id
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            <span
              className={`rounded-full px-1.5 py-px text-[10px] ${filter === f.id ? "bg-background/20" : "bg-muted"}`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum review encontrado"
          hint="Reviews aparecerão aqui assim que forem capturados do Google."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-medium text-sm">
                    {(r.author ?? "?")[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {r.author ?? "Anônimo"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.source ?? "—"} ·{" "}
                      {r.posted_at
                        ? new Date(r.posted_at).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s < (r.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <SentimentChip sentiment={r.sentiment ?? "neutral"} />
                </div>
              </div>
              <p className="mt-3 text-sm text-foreground/90">
                {r.comment ?? ""}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground">
                  {r.reply ? (
                    <span className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" /> Replied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-500">
                      <Clock className="h-3 w-3" /> Awaiting reply
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => act(`Opening review by ${r.author}…`)}
                    className="rounded-md border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    Open <ExternalLink className="ml-1 inline h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onGenerateOne(r.id)}
                    disabled={!!perRow[r.id]}
                    className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {perRow[r.id] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}{" "}
                    AI reply
                  </button>
                </div>
              </div>
              {r.reply && (
                <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-foreground/90">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Sua resposta
                  </div>
                  {r.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SentimentChip({ sentiment }: { sentiment: string }) {
  const map: Record<string, string> = {
    positive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    neutral: "bg-muted text-muted-foreground",
    negative: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${map[sentiment] ?? map.neutral}`}
    >
      {sentiment}
    </span>
  );
}

/* ------------------------------- Insights ------------------------------ */

function InsightsSection() {
  const { data } = useDashboard();
  const ins = data?.insights ?? [];
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Insights"
        subtitle="Patterns surfaced from thousands of reviews — ranked by revenue impact."
        action={
          <button
            onClick={() => act("Filter: all categories")}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <Filter className="h-3.5 w-3.5" /> All categories
          </button>
        }
      />

      {ins.length === 0 ? (
        <EmptyState
          title="Sem insights ainda"
          hint="Insights aparecerão conforme reviews forem analisados pela IA."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {ins.map((i) => (
            <div
              key={i.id}
              className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-accent" />{" "}
                  {i.category ?? "Insight"}
                </div>
                {i.severity && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {i.severity}
                  </span>
                )}
              </div>
              <div className="mt-3 font-display text-base font-semibold leading-snug">
                {i.title}
              </div>
              {i.body && (
                <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toast.message("Insight dismissed")}
                  className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                >
                  Dismiss
                </button>
                <button
                  onClick={() =>
                    act(`Action created: ${i.category ?? "insight"}`)
                  }
                  className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
                >
                  Create action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Reports ------------------------------ */

function ReportsSection() {
  const { data } = useDashboard();
  const reports = data?.reports ?? [];
  const { requireFeature, limits } = usePlan();
  const [modalOpen, setModalOpen] = useState(false);
  const onAdd = () => {
    if (requireFeature("reports", reports.length + 1)) setModalOpen(true);
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle={`Relatórios deste mês · ${reports.length}/${limits.reports === 9999 ? "∞" : limits.reports}`}
        action={
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> New report
          </button>
        }
      />
      <NewReportModal open={modalOpen} onOpenChange={setModalOpen} />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {reports.length === 0 ? (
          <EmptyState
            title="Sem relatórios"
            hint="Agende um novo relatório para começar."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Report</th>
                <th className="px-4 py-2.5 font-medium">Period</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.period ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.status ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => act(`Editing ${r.name}`)}
                        className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
                      >
                        Edit
                      </button>
                      {r.file_url && (
                        <a
                          href={r.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
                        >
                          <Download className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- Billing ------------------------------ */

function BillingSection() {
  const { user } = useUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";
  const queryClient = useQueryClient();
  const checkSub = useServerFn(checkSubscription);
  const createCheckoutFn = useServerFn(createCheckout);
  const portalFn = useServerFn(customerPortal);

  const { data: sub, isLoading } = useQuery({
    queryKey: ["subscription", email],
    queryFn: () => checkSub(),
    enabled: !!email,
    refetchInterval: 60_000,
  });

  const handleSubscribe = async (plan: PlanKey) => {
    if (!email) return toast.error("Sign in to subscribe");
    try {
      toast.loading("Opening Stripe checkout…", { id: "co" });
      const res = await createCheckoutFn({
        data: { plan, origin: window.location.origin },
      });
      toast.dismiss("co");
      if (res.url) window.open(res.url, "_blank");
    } catch (e) {
      toast.dismiss("co");
      toast.error((e as Error).message);
    }
  };

  const handlePortal = async () => {
    if (!email) return;
    try {
      toast.loading("Opening billing portal…", { id: "po" });
      const res = await portalFn({ data: { origin: window.location.origin } });
      toast.dismiss("po");
      if (res.url) window.open(res.url, "_blank");
    } catch (e) {
      toast.dismiss("po");
      toast.error((e as Error).message);
    }
  };

  const activePlan = sub?.plan ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        subtitle="Manage your plan, invoices and payment method."
        action={
          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["subscription", email],
              })
            }
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
          >
            Refresh status
          </button>
        }
      />

      <SectionCard
        title={
          isLoading
            ? "Checking subscription…"
            : sub?.subscribed
              ? `Current plan · ${PLANS[activePlan as PlanKey]?.name ?? "Active"}`
              : "No active subscription"
        }
        subtitle={
          sub?.subscribed && sub.currentPeriodEnd
            ? `Renews ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
            : "Choose a plan to get started"
        }
        action={
          sub?.subscribed ? (
            <button
              onClick={handlePortal}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
            >
              Manage subscription
            </button>
          ) : undefined
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
            ([key, plan]) => {
              const isActive = activePlan === key;
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-4 transition ${isActive ? "border-accent bg-accent/5" : "border-border bg-card"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display text-base font-semibold">
                      {plan.name}
                    </div>
                    {isActive && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-semibold">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / month
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      isActive ? handlePortal() : handleSubscribe(key)
                    }
                    disabled={isLoading}
                    className={`mt-4 w-full rounded-md px-3 py-2 text-xs font-medium transition ${
                      isActive
                        ? "border border-border bg-card text-muted-foreground hover:text-foreground"
                        : "bg-foreground text-background hover:opacity-90"
                    }`}
                  >
                    {isActive
                      ? "Manage"
                      : sub?.subscribed
                        ? "Switch plan"
                        : "Subscribe"}
                  </button>
                </div>
              );
            },
          )}
        </div>
      </SectionCard>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4 font-display text-sm font-semibold">
          Invoices
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Invoice</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                id: "INV-2026-005",
                date: "May 28, 2026",
                amount: "$149.00",
                status: "Paid",
              },
              {
                id: "INV-2026-004",
                date: "Apr 28, 2026",
                amount: "$149.00",
                status: "Paid",
              },
              {
                id: "INV-2026-003",
                date: "Mar 28, 2026",
                amount: "$149.00",
                status: "Paid",
              },
              {
                id: "INV-2026-002",
                date: "Feb 28, 2026",
                amount: "$149.00",
                status: "Paid",
              },
              {
                id: "INV-2026-001",
                date: "Jan 28, 2026",
                amount: "$99.00",
                status: "Paid",
              },
            ].map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {inv.amount}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => act(`Downloading ${inv.id}`)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
 * Notifications + Modals
 * ============================================================ */

function NotificationsBell({ onOpenReviews }: { onOpenReviews: () => void }) {
  const { data } = useDashboard();
  const reviews = (data?.reviews ?? []).slice(0, 6);
  const unreplied = reviews.filter((r) => !r.reply).length;
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {reviews.length > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        )}
      </button>
      {open && (
        <>
          <button
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notificações
              </span>
              <span className="text-[10px] text-muted-foreground">
                {unreplied} pendentes
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {reviews.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Nada por aqui ainda.
                </div>
              ) : (
                reviews.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setOpen(false);
                      onOpenReviews();
                    }}
                    className="block w-full border-b border-border/60 p-3 text-left last:border-0 hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{r.author ?? "Anônimo"}</span>
                      <span>{r.rating ?? "—"}★</span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-foreground/90">
                      {r.comment ?? "(sem texto)"}
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onOpenReviews();
              }}
              className="block w-full border-t border-border bg-muted/30 p-2 text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Ver todos os reviews
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ----- Add Location Modal ----- */
export function AddLocationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useApp();
  const queryClient = useQueryClient();
  const fn = useServerFn(addLocation);
  const [form, setForm] = useState({
    name: "",
    city: "",
    category: t.simulator.categories[0],
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.city || loading) return;
    setLoading(true);
    try {
      await fn({
        data: { name: form.name, city: form.city, category: form.category },
      });
      toast.success("Localização adicionada");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["my-locations"] });
      onOpenChange(false);
      setForm({ name: "", city: "", category: t.simulator.categories[0] });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.startsWith("PLAN_LIMIT:")) {
        toast.error("Limite do plano atingido. Faça upgrade.");
        window.dispatchEvent(new CustomEvent("branchly:open-billing"));
        onOpenChange(false);
      } else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar nova localização</DialogTitle>
          <DialogDescription>
            Buscamos os dados reais no Google Maps via IA.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            placeholder="Nome do negócio"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <input
            placeholder="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {t.simulator.categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border bg-card px-3 py-2 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!form.name || !form.city || loading}
            className="flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}{" "}
            Adicionar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----- Add Competitor Modal ----- */
export function AddCompetitorModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const fn = useServerFn(addCompetitor);
  const [form, setForm] = useState({ name: "", rating: "", review_count: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || loading) return;
    setLoading(true);
    try {
      await fn({
        data: {
          name: form.name,
          rating: form.rating ? Number(form.rating) : null,
          review_count: form.review_count ? Number(form.review_count) : null,
        },
      });
      toast.success("Concorrente adicionado");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
      setForm({ name: "", rating: "", review_count: "" });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.startsWith("PLAN_LIMIT:")) {
        toast.error("Limite do plano atingido. Faça upgrade.");
        window.dispatchEvent(new CustomEvent("branchly:open-billing"));
        onOpenChange(false);
      } else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar concorrente</DialogTitle>
          <DialogDescription>
            Rastreie a reputação de um concorrente local.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            placeholder="Nome do concorrente"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="Rating (0-5)"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <input
              type="number"
              min="0"
              placeholder="Nº avaliações"
              value={form.review_count}
              onChange={(e) =>
                setForm({ ...form, review_count: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border bg-card px-3 py-2 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!form.name || loading}
            className="flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}{" "}
            Rastrear
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----- New Report Modal ----- */
export function NewReportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const fn = useServerFn(createReport);
  const [form, setForm] = useState({ name: "", period: "Últimos 30 dias" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || loading) return;
    setLoading(true);
    try {
      await fn({ data: form });
      toast.success("Relatório criado");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
      setForm({ name: "", period: "Últimos 30 dias" });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.startsWith("PLAN_LIMIT:")) {
        toast.error("Limite mensal de relatórios atingido. Faça upgrade.");
        window.dispatchEvent(new CustomEvent("branchly:open-billing"));
        onOpenChange(false);
      } else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo relatório</DialogTitle>
          <DialogDescription>
            Crie um relatório para exportar ou compartilhar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            placeholder="Nome do relatório"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <select
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option>Últimos 7 dias</option>
            <option>Últimos 15 dias</option>
            <option>Últimos 30 dias</option>
            <option>Último trimestre</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border bg-card px-3 py-2 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!form.name || loading}
            className="flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}{" "}
            Criar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Attribution ─────────────────────────── */

type PixelSite = {
  id: string;
  name: string;
  domain: string;
  pixel_id: string;
  created_at: string;
};

type AttrStats = Awaited<ReturnType<typeof getAttributionStats>>;

function AttributionSection() {
  const listFn = useServerFn(listPixelSites);
  const createFn = useServerFn(createPixelSite);
  const deleteFn = useServerFn(deletePixelSite);
  const statsFn = useServerFn(getAttributionStats);
  const qc = useQueryClient();

  const { data: sitesData } = useQuery({
    queryKey: ["pixel-sites"],
    queryFn: () => listFn(),
  });
  const sites: PixelSite[] = (sitesData?.sites ?? []) as PixelSite[];

  const [selectedSite, setSelectedSite] = useState<PixelSite | null>(null);
  const [statsDays, setStatsDays] = useState<7 | 15 | 30>(7);
  const [stats, setStats] = useState<AttrStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSite) return;
    setLoadingStats(true);
    statsFn({ data: { siteId: selectedSite.id, days: statsDays } })
      .then((s) => setStats(s))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, [selectedSite, statsDays]);

  useEffect(() => {
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0]);
    }
  }, [sites]);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://branchly.com.br";

  function snippet(pixelId: string) {
    return `<script src="${baseUrl}/api/pixel/${pixelId}" async></script>`;
  }

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCreate() {
    if (!form.name || !form.domain) return;
    setCreating(true);
    try {
      await createFn({ data: { name: form.name, domain: form.domain } });
      qc.invalidateQueries({ queryKey: ["pixel-sites"] });
      setForm({ name: "", domain: "" });
      setShowCreate(false);
      act("Pixel criado com sucesso");
    } catch {
      toast.error("Não foi possível criar o pixel.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(siteId: string) {
    try {
      await deleteFn({ data: { siteId } });
      qc.invalidateQueries({ queryKey: ["pixel-sites"] });
      if (selectedSite?.id === siteId) setSelectedSite(null);
      act("Pixel removido");
    } catch {
      toast.error("Não foi possível remover.");
    }
  }

  const statCard = (
    label: string,
    value: number | undefined,
    icon: React.ReactNode,
  ) => (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums">
        {loadingStats ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          (value ?? 0).toLocaleString()
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Rastreamento</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pixel de atribuição · Sessions · Conversões por origem
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo site
        </button>
      </div>

      {/* Create form inline */}
      {showCreate && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Novo site rastreado</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Nome do site
              </label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-foreground"
                placeholder="ex: Landing Page Dezembro"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Domínio</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-foreground"
                placeholder="ex: meusite.com.br"
                value={form.domain}
                onChange={(e) =>
                  setForm((f) => ({ ...f, domain: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !form.name || !form.domain}
              className="flex items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {sites.length === 0 && !showCreate && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">
            Nenhum site rastreado ainda
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Adicione seu primeiro site para gerar o pixel e começar a capturar
            sessions, UTMs e eventos de conversão.
          </p>
        </div>
      )}

      {sites.length > 0 && (
        <div className="grid grid-cols-[220px_1fr] gap-4 items-start">
          {/* Site list */}
          <div className="space-y-1">
            {sites.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSite(s)}
                className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors ${
                  selectedSite?.id === s.id
                    ? "bg-accent/10 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {s.domain}
                </div>
              </button>
            ))}
          </div>

          {/* Site detail */}
          {selectedSite && (
            <div className="space-y-4 min-w-0">
              {/* Pixel snippet */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold">{selectedSite.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedSite.domain} · ID:{" "}
                      <span className="font-mono">{selectedSite.pixel_id}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedSite.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  Cole antes do{" "}
                  <code className="font-mono bg-muted px-1 rounded">
                    &lt;/head&gt;
                  </code>{" "}
                  do seu site:
                </p>

                <div className="relative rounded-md bg-muted font-mono text-xs p-3 pr-10 text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                  {snippet(selectedSite.pixel_id)}
                  <button
                    onClick={() =>
                      handleCopy(snippet(selectedSite.pixel_id), "snippet")
                    }
                    className="absolute right-2 top-2 rounded p-1 hover:bg-border"
                  >
                    {copied === "snippet" ? (
                      <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Pageview automático
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    UTMs persistentes
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    WhatsApp &amp; telefone
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Scroll depth
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Formulários
                  </span>
                </div>
              </div>

              {/* Period picker */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground mr-1">Período:</p>
                {([7, 15, 30] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setStatsDays(d)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      statsDays === d
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statCard(
                  "Sessions",
                  stats?.totalSessions,
                  <Globe className="h-3.5 w-3.5" />,
                )}
                {statCard(
                  "Visitantes únicos",
                  stats?.uniqueVisitors,
                  <Users className="h-3.5 w-3.5" />,
                )}
                {statCard(
                  "Pageviews",
                  stats?.totalPageviews,
                  <ExternalLink className="h-3.5 w-3.5" />,
                )}
                {statCard(
                  "WhatsApp",
                  stats?.whatsappClicks,
                  <MessageCircle className="h-3.5 w-3.5" />,
                )}
                {statCard(
                  "Ligações",
                  stats?.phoneClicks,
                  <PhoneCall className="h-3.5 w-3.5" />,
                )}
                {statCard(
                  "Formulários",
                  stats?.formSubmits,
                  <MousePointerClick className="h-3.5 w-3.5" />,
                )}
              </div>

              {/* Traffic by source */}
              {stats && stats.bySource.length > 0 && (
                <div className="rounded-lg border border-border bg-card">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold">Tráfego por origem</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                            Origem
                          </th>
                          <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2">
                            Sessions
                          </th>
                          <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2">
                            Pageviews
                          </th>
                          <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2">
                            WhatsApp
                          </th>
                          <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2">
                            Forms
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.bySource.map((row) => (
                          <tr
                            key={row.source}
                            className="border-b border-border last:border-0 hover:bg-muted/50"
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {row.source}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                              {row.sessions.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                              {row.pageviews.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                              {row.whatsapp > 0 ? (
                                <span className="text-green-500 font-medium">
                                  {row.whatsapp}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                              {row.forms > 0 ? (
                                <span className="text-blue-500 font-medium">
                                  {row.forms}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent sessions */}
              {stats && stats.recentSessions.length > 0 && (
                <div className="rounded-lg border border-border bg-card">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold">Sessions recentes</p>
                  </div>
                  <div className="divide-y divide-border">
                    {stats.recentSessions.map((s) => (
                      <div
                        key={s.id}
                        className="px-4 py-2.5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-medium bg-muted rounded px-1.5 py-0.5 shrink-0">
                            {s.source}
                          </span>
                          {s.campaign && (
                            <span className="text-xs text-muted-foreground truncate">
                              {s.campaign}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {s.device && (
                            <span className="text-xs text-muted-foreground capitalize">
                              {s.device}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(s.at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats &&
                stats.totalSessions === 0 &&
                !loadingStats && (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <Activity className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum dado ainda. Instale o pixel no seu site para
                      começar a capturar sessões.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { motion } from "motion/react";
import { TrendingUp, Star, MapPin, Sparkles, ArrowUpRight } from "lucide-react";

const locations = [
  { name: "Vila Madalena", score: 92, delta: "+3.2", reviews: 412 },
  { name: "Pinheiros", score: 87, delta: "+1.4", reviews: 318 },
  { name: "Itaim Bibi", score: 81, delta: "-0.6", reviews: 256 },
  { name: "Jardins", score: 76, delta: "+0.8", reviews: 198 },
];

const chart = [42, 48, 45, 52, 58, 56, 62, 68, 71, 74, 78, 82];
const compChart = [44, 46, 47, 49, 51, 52, 53, 55, 56, 57, 58, 60];

export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-accent/20 via-transparent to-transparent blur-2xl" />
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        {/* top bar */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">app.branchly.com/dashboard</div>
          <div className="w-12" />
        </div>

        <div className="grid grid-cols-12 gap-0">
          {/* sidebar */}
          <aside className="col-span-2 hidden border-r border-border bg-muted/20 p-3 md:block">
            <div className="space-y-1 text-[11px]">
              {["Dashboard", "Reputation", "Locations", "Competitors", "Reviews", "AI Insights", "Reports", "Billing"].map((it, i) => (
                <div key={it} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${i === 0 ? "bg-background text-foreground font-medium" : "text-muted-foreground"}`}>
                  <div className="h-1 w-1 rounded-full bg-current" />
                  {it}
                </div>
              ))}
            </div>
          </aside>

          {/* main */}
          <div className="col-span-12 p-4 md:col-span-10 md:p-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KPI icon={<Star className="h-3.5 w-3.5" />} label="Reputation Score" value="87.4" delta="+2.1" />
              <KPI icon={<TrendingUp className="h-3.5 w-3.5" />} label="Benchmark" value="+12.3%" delta="vs category" muted />
              <KPI icon={<MapPin className="h-3.5 w-3.5" />} label="Locations" value="4" delta="all active" muted />
              <KPI icon={<Sparkles className="h-3.5 w-3.5" />} label="AI Insights" value="12" delta="new" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* chart */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Reputation trend</div>
                    <div className="font-display text-lg font-semibold">Last 12 months</div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <Legend color="oklch(0.6 0.18 265)" label="You" />
                    <Legend color="oklch(0.7 0.02 260)" label="Category" />
                  </div>
                </div>
                <Chart data={chart} compare={compChart} />
              </div>

              {/* locations */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-display text-sm font-semibold">Top locations</div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  {locations.map((l, i) => (
                    <motion.div
                      key={l.name}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-foreground">{l.name}</div>
                        <div className="text-[10px] text-muted-foreground">{l.reviews} reviews</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold tabular-nums">{l.score}</span>
                        <span className={`text-[10px] ${l.delta.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}>{l.delta}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* insights */}
            <div className="mt-4 rounded-xl border border-border bg-gradient-to-br from-card to-muted/40 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3 text-accent" /> AI Insight · ranked by revenue impact
              </div>
              <div className="mt-2 font-display text-sm">
                <span className="font-semibold">"Slow service at lunch"</span> mentioned in 23% of negative reviews — concentrated in <span className="font-semibold">Itaim Bibi</span>. Estimated lift if resolved: <span className="font-semibold text-emerald-500">+1.8 score · +9% conversion</span>.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function KPI({ icon, label, value, delta, muted }: { icon: React.ReactNode; label: string; value: string; delta: string; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-xl font-semibold tabular-nums">{value}</span>
        <span className={`text-[10px] ${muted ? "text-muted-foreground" : "text-emerald-500"}`}>{delta}</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function Chart({ data, compare }: { data: number[]; compare: number[] }) {
  const max = 100;
  const w = 100;
  const h = 40;
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
    <div className="relative h-32 w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.18 265)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.6 0.18 265)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.path
          d={toPath(compare)}
          fill="none"
          stroke="oklch(0.7 0.02 260)"
          strokeWidth="0.6"
          strokeDasharray="1.5 1.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
        <motion.path
          d={toPath(data)}
          fill="none"
          stroke="oklch(0.6 0.18 265)"
          strokeWidth="1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
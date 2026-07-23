import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin/admin.metrics.functions";
import { getFinancialOverview } from "@/lib/admin/admin.financial.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MapPin,
  Star,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function Kpi({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function AdminOverview() {
  const overviewFn = useServerFn(getAdminOverview);
  const finFn = useServerFn(getFinancialOverview);
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn(),
  });
  const financial = useQuery({
    queryKey: ["admin-financial-mini"],
    queryFn: () => finFn(),
  });

  const o = overview.data;
  const f = financial.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visão Geral</h1>
        <p className="text-sm text-muted-foreground">
          Estatísticas globais do produto.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi
          label="Usuários ativos"
          value={o ? String(o.totals.activeOwners) : "…"}
          icon={Users}
        />
        <Kpi
          label="Locations"
          value={o ? String(o.totals.locations) : "…"}
          icon={MapPin}
          sub={o ? `+${o.growth.month} no mês` : undefined}
        />
        <Kpi
          label="Reviews"
          value={o ? String(o.totals.reviews) : "…"}
          icon={Star}
        />
        <Kpi
          label="Relatórios"
          value={o ? String(o.totals.reports) : "…"}
          icon={FileText}
        />
        <Kpi
          label="MRR"
          value={f ? `$${f.mrr.toLocaleString()}` : "…"}
          icon={DollarSign}
          sub={f ? `ARR $${f.arr.toLocaleString()}` : undefined}
        />
        <Kpi
          label="Churn (30d)"
          value={f ? `${f.churnRate}%` : "…"}
          icon={TrendingUp}
        />
        <Kpi
          label="Assinaturas ativas"
          value={f ? String(f.activeSubscriptions) : "…"}
          icon={Activity}
        />
        <Kpi
          label="Insights gerados"
          value={o ? String(o.totals.insights) : "…"}
          icon={Sparkles}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Novas locations (30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {o?.series && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={o.series}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Receita mensal (6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {f?.revenueSeries && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={f.revenueSeries}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projeção de faturamento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">
              Próximos 30 dias
            </div>
            <div className="text-xl font-bold">
              {f ? `$${f.projection30.toLocaleString()}` : "…"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Próximos 90 dias
            </div>
            <div className="text-xl font-bold">
              {f ? `$${f.projection90.toLocaleString()}` : "…"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">ARPU</div>
            <div className="text-xl font-bold">
              {f ? `$${f.arpu.toLocaleString()}` : "…"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground text-xs">Hoje</div>
            <div className="text-2xl font-bold">+{o?.growth.day ?? 0}</div>
            <div className="text-xs">novas locations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground text-xs">Esta semana</div>
            <div className="text-2xl font-bold">+{o?.growth.week ?? 0}</div>
            <div className="text-xs">novas locations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground text-xs">Este mês</div>
            <div className="text-2xl font-bold">+{o?.growth.month ?? 0}</div>
            <div className="text-xs">novas locations</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

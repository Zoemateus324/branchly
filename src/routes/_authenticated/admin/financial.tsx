import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFinancialOverview } from "@/lib/admin/admin.financial.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/financial")({
  component: AdminFinancial,
});

function AdminFinancial() {
  const fn = useServerFn(getFinancialOverview);
  const { data: f, isLoading } = useQuery({ queryKey: ["admin-financial"], queryFn: () => fn() });

  if (isLoading || !f) return <div className="text-sm text-muted-foreground">Carregando dados Stripe…</div>;

  const kpis = [
    { label: "MRR", value: `$${f.mrr.toLocaleString()}` },
    { label: "ARR", value: `$${f.arr.toLocaleString()}` },
    { label: "ARPU", value: `$${f.arpu.toLocaleString()}` },
    { label: "Churn 30d", value: `${f.churnRate}%` },
    { label: "Assinaturas ativas", value: String(f.activeSubscriptions) },
    { label: "Canceladas 30d", value: String(f.canceledLast30) },
    { label: "Falhas de pagamento 30d", value: String(f.failedLast30) },
    { label: "Projeção 90d", value: `$${f.projection90.toLocaleString()}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Dados ao vivo do Stripe.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Receita por mês</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={f.revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Faturas recentes</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Valor</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Data</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {f.recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="p-2">{inv.customer ?? "—"}</td>
                    <td className="p-2">${inv.amount.toFixed(2)} {inv.currency.toUpperCase()}</td>
                    <td className="p-2">
                      <Badge variant={inv.status === "paid" ? "default" : "outline"}>{inv.status}</Badge>
                    </td>
                    <td className="p-2">{new Date(inv.created * 1000).toLocaleDateString()}</td>
                    <td className="p-2">
                      {inv.hostedUrl && (
                        <a href={inv.hostedUrl} target="_blank" rel="noreferrer" className="text-primary underline text-xs">
                          Abrir
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Distribuição por produto</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(f.byProduct).map(([pid, p]) => (
            <div key={pid} className="flex justify-between text-sm border-b pb-2 last:border-0">
              <span className="font-mono text-xs">{pid}</span>
              <span>{p.count} assinaturas · ${p.mrr.toFixed(2)} MRR</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
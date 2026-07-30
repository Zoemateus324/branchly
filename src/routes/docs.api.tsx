import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";
import { Clock } from "lucide-react";

const content = {
  en: {
    eyebrow: "Documentation · API Reference",
    title: "API Reference",
    subtitle:
      "Programmatic access to your reputation data and AI insights via REST API.",
    statusTitle: "Current status: in development",
    statusBody:
      "A public REST API is part of the Premium plan and is under active development. It is not yet available for general use. This page describes the planned surface so you know what to expect — endpoints and payloads below are a preview and may change before release.",
    plannedTitle: "Planned endpoints",
    endpoints: [
      {
        method: "GET",
        path: "/v1/locations",
        desc: "List your locations with current score, rating and review count.",
      },
      {
        method: "GET",
        path: "/v1/locations/:id",
        desc: "Retrieve full detail for a single location, including score breakdown.",
      },
      {
        method: "GET",
        path: "/v1/reviews",
        desc: "List reviews with filters for source, sentiment and date range.",
      },
      {
        method: "GET",
        path: "/v1/insights",
        desc: "Retrieve AI-generated insights ranked by impact.",
      },
      {
        method: "GET",
        path: "/v1/reports",
        desc: "List generated reports and retrieve their KPI snapshots.",
      },
      {
        method: "POST",
        path: "/v1/reviews/:id/reply",
        desc: "Trigger an AI-drafted reply for a specific review.",
      },
    ],
    authTitle: "Planned authentication",
    authBody:
      "API access will use scoped API keys generated from Billing, sent as a Bearer token in the Authorization header. Keys will be revocable at any time and scoped to your account only.",
    wantEarly: "Want early access?",
    wantEarlyBody:
      "If your team needs programmatic access before general availability, reach out and we'll evaluate a private preview.",
    contact: "Contact us",
    next: "In the meantime",
    nextBody:
      "Everything the API will expose is already available inside the dashboard: Overview, Reputation, Locations, Reviews, Insights and Reports.",
    cta: "Back to docs",
  },
  pt: {
    eyebrow: "Documentação · Referência da API",
    title: "Referência da API",
    subtitle:
      "Acesso programático aos seus dados de reputação e insights de IA via API REST.",
    statusTitle: "Status atual: em desenvolvimento",
    statusBody:
      "Uma API REST pública faz parte do plano Premium e está em desenvolvimento ativo. Ainda não está disponível para uso geral. Esta página descreve a superfície planejada para que você saiba o que esperar — os endpoints e payloads abaixo são um preview e podem mudar antes do lançamento.",
    plannedTitle: "Endpoints planejados",
    endpoints: [
      {
        method: "GET",
        path: "/v1/locations",
        desc: "Lista suas unidades com score, rating e número de avaliações atuais.",
      },
      {
        method: "GET",
        path: "/v1/locations/:id",
        desc: "Detalhe completo de uma unidade, incluindo a composição do score.",
      },
      {
        method: "GET",
        path: "/v1/reviews",
        desc: "Lista avaliações com filtros por fonte, sentimento e período.",
      },
      {
        method: "GET",
        path: "/v1/insights",
        desc: "Insights gerados por IA, ordenados por impacto.",
      },
      {
        method: "GET",
        path: "/v1/reports",
        desc: "Lista relatórios gerados e recupera seus snapshots de KPI.",
      },
      {
        method: "POST",
        path: "/v1/reviews/:id/reply",
        desc: "Dispara uma resposta gerada por IA para uma avaliação específica.",
      },
    ],
    authTitle: "Autenticação planejada",
    authBody:
      "O acesso à API usará chaves com escopo geradas em Billing, enviadas como Bearer token no cabeçalho Authorization. As chaves poderão ser revogadas a qualquer momento e terão escopo limitado à sua conta.",
    wantEarly: "Quer acesso antecipado?",
    wantEarlyBody:
      "Se sua equipe precisa de acesso programático antes do lançamento geral, entre em contato e avaliaremos um preview privado.",
    contact: "Fale conosco",
    next: "Enquanto isso",
    nextBody:
      "Tudo o que a API vai expor já está disponível dentro do dashboard: Overview, Reputation, Locations, Reviews, Insights e Reports.",
    cta: "Voltar para as docs",
  },
};

export const Route = createFileRoute("/docs/api")({
  head: () => ({
    meta: [
      { title: "API Reference — Branchly Docs" },
      {
        name: "description",
        content:
          "Programmatic access to your reputation data and AI insights via REST API.",
      },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/docs/api" }],
  }),
  component: ApiDocsPage,
});

function ApiDocsPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="space-y-10">
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.statusTitle}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {c.statusBody}
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            {c.plannedTitle}
          </h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {c.endpoints.map((e) => (
              <div
                key={e.path}
                className="flex flex-col gap-1.5 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-2 shrink-0 sm:w-56">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${e.method === "GET" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}
                  >
                    {e.method}
                  </span>
                  <code className="text-xs font-mono text-foreground">
                    {e.path}
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            {c.authTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {c.authBody}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-2">
            {c.wantEarly}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            {c.wantEarlyBody}
          </p>
          <a
            href="mailto:contato@branchly.com.br"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            {c.contact}
          </a>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            {c.next}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-6">
            {c.nextBody}
          </p>
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted"
          >
            {c.cta}
          </Link>
        </section>
      </div>
    </StaticPage>
  );
}

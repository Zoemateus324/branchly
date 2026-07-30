import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const roadmapItems = {
  en: {
    eyebrow: "Roadmap",
    title: "Where Branchly is going.",
    subtitle: "Our public roadmap. Vote on what matters most.",
    shipped: "Shipped",
    inProgress: "In Progress",
    planned: "Planned",
    sections: {
      shipped: [
        "Google Business Profile integration",
        "Competitive benchmarking",
        "AI reply drafts (Claude Haiku)",
        "QR Code review collection",
        "PDF report export",
        "Facebook & Instagram integration",
        "Attribution pixel",
        "WhatsApp Business API messaging",
      ],
      inProgress: [
        "Automated weekly digest email",
        "Bulk QR code generation for multi-location",
        "Review response analytics",
        "Custom alert rules and notification channels",
        "Google Ads conversion import",
      ],
      planned: [
        "TripAdvisor and Yelp integration",
        "Automated review request campaigns",
        "Multi-language AI replies",
        "Enterprise SSO (SAML)",
        "Zapier & Make integration",
        "Mobile app (iOS & Android)",
        "Full white-label mode",
        "Franchise analytics dashboard",
      ],
    },
  },
  pt: {
    eyebrow: "Roadmap",
    title: "Para onde o Branchly está indo.",
    subtitle: "Nosso roadmap público. Vote no que importa mais para você.",
    shipped: "Lançado",
    inProgress: "Em Desenvolvimento",
    planned: "Planejado",
    sections: {
      shipped: [
        "Integração com Google Meu Negócio",
        "Benchmarking competitivo",
        "Respostas com IA (Claude Haiku)",
        "QR Code para coleta de avaliações",
        "Exportação de relatório PDF",
        "Integração com Facebook & Instagram",
        "Pixel de atribuição",
        "Mensagens via WhatsApp Business API",
      ],
      inProgress: [
        "E-mail de resumo semanal automatizado",
        "Geração de QR codes em massa para multi-unidade",
        "Análise de respostas a avaliações",
        "Regras de alerta customizáveis e canais de notificação",
        "Importação de conversões do Google Ads",
      ],
      planned: [
        "Integração com TripAdvisor e Yelp",
        "Campanhas automáticas de pedido de avaliação",
        "Respostas com IA em múltiplos idiomas",
        "SSO corporativo (SAML)",
        "Integração com Zapier & Make",
        "Aplicativo móvel (iOS e Android)",
        "White label completo",
        "Painel de analytics para franquias",
      ],
    },
  },
};

const STATUS_STYLES = {
  shipped: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  inProgress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  planned: "bg-muted text-muted-foreground border-border",
};

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Branchly" },
      { name: "description", content: "Branchly product roadmap: see what's shipped, in progress and planned." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/roadmap" }],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const { locale } = useApp();
  const c = roadmapItems[locale];

  const columns = [
    { key: "shipped" as const, label: c.shipped, style: STATUS_STYLES.shipped },
    { key: "inProgress" as const, label: c.inProgress, style: STATUS_STYLES.inProgress },
    { key: "planned" as const, label: c.planned, style: STATUS_STYLES.planned },
  ];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key}>
            <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${col.style}`}>
              {col.label}
            </div>
            <div className="space-y-2.5">
              {c.sections[col.key].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}

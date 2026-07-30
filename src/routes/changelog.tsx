import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const releases = [
  {
    version: "1.4.0",
    date: "2026-07-30",
    tag: "new",
    en: {
      title: "WhatsApp Business API integration",
      items: [
        "Send review-request messages via WhatsApp Business API",
        "Track delivery and read receipts via Meta webhook",
        "Message history dashboard",
        "Improved Instagram sentiment classification — now powered by Claude Haiku",
      ],
    },
    pt: {
      title: "Integração com WhatsApp Business API",
      items: [
        "Envie pedidos de avaliação via WhatsApp Business API",
        "Rastreie entrega e leitura via webhook da Meta",
        "Histórico de mensagens no painel",
        "Análise de sentimento do Instagram melhorada — agora com Claude Haiku",
      ],
    },
  },
  {
    version: "1.3.0",
    date: "2026-07-15",
    tag: "new",
    en: {
      title: "Attribution Platform",
      items: [
        "New attribution pixel for tracking which campaigns drive reviews",
        "Session and event analytics dashboard",
        "UTM tracking across all traffic sources",
        "Conversion attribution for WhatsApp clicks and form submits",
      ],
    },
    pt: {
      title: "Plataforma de Atribuição",
      items: [
        "Novo pixel de atribuição para rastrear quais campanhas geram avaliações",
        "Painel de sessões e eventos de análise",
        "Rastreamento UTM em todas as fontes de tráfego",
        "Atribuição de conversão para cliques no WhatsApp e envios de formulário",
      ],
    },
  },
  {
    version: "1.2.0",
    date: "2026-06-20",
    tag: "new",
    en: {
      title: "Facebook & Instagram integration",
      items: [
        "Connect Facebook Pages to import ratings and recommendations",
        "Instagram Business account linking for comment sentiment monitoring",
        "AI-powered sentiment classification for Instagram comments",
        "Unified review feed across Google, Facebook and Instagram",
      ],
    },
    pt: {
      title: "Integração com Facebook & Instagram",
      items: [
        "Conecte Páginas do Facebook para importar notas e recomendações",
        "Vinculação de conta profissional do Instagram para monitoramento de sentimento",
        "Classificação de sentimento por IA para comentários do Instagram",
        "Feed de avaliações unificado entre Google, Facebook e Instagram",
      ],
    },
  },
  {
    version: "1.1.0",
    date: "2026-05-10",
    tag: "improvement",
    en: {
      title: "AI reply drafts & PDF reports",
      items: [
        "One-click AI reply generation powered by Claude Haiku",
        "Bulk AI reply generation for all unanswered reviews",
        "PDF report export with your brand colors",
        "QR code generator for review collection",
      ],
    },
    pt: {
      title: "Respostas com IA e relatórios PDF",
      items: [
        "Geração de resposta com IA em um clique via Claude Haiku",
        "Geração em massa de respostas para todas as avaliações sem resposta",
        "Exportação de relatório PDF com suas cores de marca",
        "Gerador de QR code para coleta de avaliações",
      ],
    },
  },
  {
    version: "1.0.0",
    date: "2026-04-01",
    tag: "new",
    en: {
      title: "Branchly Launch",
      items: [
        "Google Business Profile integration",
        "Competitive benchmarking against category peers",
        "Reputation score and gap analysis",
        "Free reputation audit calculator",
        "Multi-location dashboard",
      ],
    },
    pt: {
      title: "Lançamento do Branchly",
      items: [
        "Integração com Google Meu Negócio",
        "Benchmarking competitivo com pares da categoria",
        "Score de reputação e análise de lacunas",
        "Calculadora gratuita de auditoria de reputação",
        "Painel multi-unidade",
      ],
    },
  },
];

const TAGS: Record<string, string> = {
  new: "bg-emerald-500/10 text-emerald-500",
  improvement: "bg-blue-500/10 text-blue-500",
  fix: "bg-amber-500/10 text-amber-500",
};

const content = {
  en: { eyebrow: "Changelog", title: "What's new in Branchly", subtitle: "Every release, documented." },
  pt: { eyebrow: "Changelog", title: "O que há de novo no Branchly", subtitle: "Cada lançamento, documentado." },
};

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Branchly" },
      { name: "description", content: "Branchly changelog: every new feature, improvement and fix." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/changelog" }],
  }),
  component: ChangelogPage,
});

function ChangelogPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="relative">
        <div className="absolute left-[7px] top-0 h-full w-px bg-border" />
        <div className="space-y-12 pl-8">
          {releases.map((r) => {
            const lc = locale === "pt" ? r.pt : r.en;
            return (
              <div key={r.version} className="relative">
                <div className="absolute -left-8 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-border bg-background ring-2 ring-background" />
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="font-display text-lg font-semibold text-foreground">
                    v{r.version}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TAGS[r.tag] ?? TAGS.fix}`}>
                    {r.tag}
                  </span>
                  <time className="text-xs text-muted-foreground">{r.date}</time>
                </div>
                <h3 className="font-medium text-foreground mb-3">{lc.title}</h3>
                <ul className="space-y-1.5">
                  {lc.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </StaticPage>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";
import { CheckCircle2, Clock } from "lucide-react";

const content = {
  en: {
    eyebrow: "Documentation · Integrations",
    title: "Integrations",
    subtitle:
      "Connect Google, Facebook, Instagram and WhatsApp to unify your review data.",
    intro:
      "Branchly pulls reviews and engagement signals from multiple channels into a single Reputation Score. Here's the current status of each integration.",
    integrations: [
      {
        name: "Google Business Profile",
        status: "live" as const,
        desc: "Fetches your rating, review count and recent reviews directly from Google Maps. This is the core data source for your Reputation Score and is available on every plan, including Free.",
        where: 'Set up in Overview → "Real score (AI + Google)".',
      },
      {
        name: "Facebook",
        status: "live" as const,
        desc: "Connect a Facebook Page via OAuth to import Page ratings as reviews. Available on Starter and above.",
        where: "Set up in Reviews → Facebook connection card.",
      },
      {
        name: "Instagram",
        status: "live" as const,
        desc: "When your connected Facebook Page has a linked Instagram professional account, Branchly imports comments and classifies their sentiment with AI. Available on Starter and above.",
        where:
          "Set up automatically after connecting Facebook, if an Instagram account is linked.",
      },
      {
        name: "TikTok",
        status: "manual" as const,
        desc: "Native OAuth integration for TikTok is on our roadmap. For now, you can manually log TikTok reviews and comments so they count toward your KPIs and sentiment analysis.",
        where: 'Set up in Reviews → TikTok connection card → "Add review".',
      },
      {
        name: "Pinterest",
        status: "manual" as const,
        desc: "Native OAuth integration for Pinterest is on our roadmap. For now, you can manually log Pinterest reviews and comments so they count toward your KPIs and sentiment analysis.",
        where: 'Set up in Reviews → Pinterest connection card → "Add review".',
      },
      {
        name: "WhatsApp Business API",
        status: "development" as const,
        desc: "Two-way WhatsApp messaging — automated review requests, reply notifications and conversation history synced with your reputation data — is currently in active development. It is not yet available in the dashboard.",
        where: "Coming soon.",
      },
    ],
    statusLabels: {
      live: "Live",
      manual: "Manual entry",
      development: "In development",
    },
    next: "What's next",
    nextBody:
      "Once your channels are connected, install the Attribution Pixel to see which of these channels actually drive reviews and conversions on your website.",
    cta: "Attribution Pixel docs",
  },
  pt: {
    eyebrow: "Documentação · Integrações",
    title: "Integrações",
    subtitle:
      "Conecte Google, Facebook, Instagram e WhatsApp para unificar seus dados de avaliações.",
    intro:
      "O Branchly reúne avaliações e sinais de engajamento de vários canais em um único Score de Reputação. Veja abaixo o status atual de cada integração.",
    integrations: [
      {
        name: "Google Meu Negócio",
        status: "live" as const,
        desc: "Busca sua nota, número de avaliações e reviews recentes diretamente do Google Maps. É a fonte de dados principal do seu Score de Reputação e está disponível em todos os planos, incluindo o Free.",
        where: 'Configure em Overview → "Score real (IA + Google)".',
      },
      {
        name: "Facebook",
        status: "live" as const,
        desc: "Conecte uma Página do Facebook via OAuth para importar as avaliações da Página. Disponível a partir do plano Starter.",
        where: "Configure em Reviews → card de conexão do Facebook.",
      },
      {
        name: "Instagram",
        status: "live" as const,
        desc: "Quando sua Página do Facebook conectada tem uma conta profissional do Instagram vinculada, o Branchly importa os comentários e classifica o sentimento com IA. Disponível a partir do plano Starter.",
        where:
          "Configurado automaticamente após conectar o Facebook, se houver conta do Instagram vinculada.",
      },
      {
        name: "TikTok",
        status: "manual" as const,
        desc: "A integração nativa via OAuth com o TikTok está no nosso roadmap. Por enquanto, você pode registrar manualmente avaliações e comentários do TikTok para que contem nos seus KPIs e na análise de sentimento.",
        where: 'Configure em Reviews → card do TikTok → "Adicionar".',
      },
      {
        name: "Pinterest",
        status: "manual" as const,
        desc: "A integração nativa via OAuth com o Pinterest está no nosso roadmap. Por enquanto, você pode registrar manualmente avaliações e comentários do Pinterest para que contem nos seus KPIs e na análise de sentimento.",
        where: 'Configure em Reviews → card do Pinterest → "Adicionar".',
      },
      {
        name: "WhatsApp Business API",
        status: "development" as const,
        desc: "A troca de mensagens via WhatsApp — solicitações automáticas de avaliação, notificações de resposta e histórico de conversas sincronizado com seus dados de reputação — está atualmente em desenvolvimento ativo. Ainda não está disponível no dashboard.",
        where: "Em breve.",
      },
    ],
    statusLabels: {
      live: "Ativo",
      manual: "Entrada manual",
      development: "Em desenvolvimento",
    },
    next: "Próximos passos",
    nextBody:
      "Depois de conectar seus canais, instale o Pixel de Atribuição para ver quais desses canais realmente geram avaliações e conversões no seu site.",
    cta: "Ver docs do Pixel de Atribuição",
  },
};

const STATUS_STYLE: Record<string, string> = {
  live: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  manual: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  development: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/docs/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrations — Branchly Docs" },
      {
        name: "description",
        content:
          "Connect Google, Facebook, Instagram, TikTok, Pinterest and WhatsApp to unify your review data.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://branchly.com.br/docs/integracoes" },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {c.intro}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {c.integrations.map((i) => (
          <div
            key={i.name}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-display font-semibold text-foreground">
                {i.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[i.status]}`}
              >
                {i.status === "live" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {c.statusLabels[i.status]}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              {i.desc}
            </p>
            <p className="text-xs text-muted-foreground/80">{i.where}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg font-semibold text-foreground mb-3">
        {c.next}
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground mb-6">
        {c.nextBody}
      </p>
      <Link
        to="/docs/pixel-atribuicao"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted"
      >
        {c.cta}
      </Link>
    </StaticPage>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";
import {
  ArrowRight,
  QrCode,
  Sparkles,
  FileBarChart,
  Users,
  Target,
} from "lucide-react";

const content = {
  en: {
    eyebrow: "Documentation · Guides",
    title: "Guides",
    subtitle:
      "Step-by-step guides for common workflows: QR codes, AI replies, PDF reports.",
    guides: [
      {
        icon: "qr",
        title: "Set up QR Code review capture",
        steps: [
          "Go to QR Captação in your dashboard sidebar.",
          "Each of your locations gets a unique QR code pointing to its Google review page.",
          "Download the PNG and print it for the counter, table tent or receipt.",
          "Ask customers to scan it right after a positive interaction — that's when conversion is highest.",
        ],
      },
      {
        icon: "ai",
        title: "Generate AI replies to reviews",
        steps: [
          'Go to Reviews and capture your latest reviews with "Capturar reviews".',
          'Click "Gerar respostas IA" to draft replies for every unanswered review at once, or generate one at a time from a single review card.',
          "Review the AI-drafted text — it's written in a polite, professional tone tuned to positive and negative reviews alike.",
          "Publish the reply on Google (or the source platform) directly, or edit it first.",
        ],
      },
      {
        icon: "reports",
        title: "Create and export monthly reports",
        steps: [
          'Go to Reports and click "New report".',
          "Name it and choose a period (7, 15, 30 days or a quarter).",
          "Branchly snapshots your KPIs, sentiment mix, top locations, competitors and top insights at that exact moment.",
          'Click "Ver KPIs" to review the snapshot in the dashboard, or "Baixar" to export a shareable HTML file.',
        ],
      },
      {
        icon: "team",
        title: "Invite your team",
        steps: [
          "Go to Equipe in your dashboard sidebar.",
          "Invite teammates by email and assign a role: Administrativo, Financeiro or Membro.",
          "Team size limits scale with your plan — check Billing for your current usage.",
        ],
      },
      {
        icon: "benchmark",
        title: "Track competitors and benchmark your rating",
        steps: [
          'Go to Competitors (Benchmarking) and click "Track competitor".',
          "Add a competitor's name, current rating and review count.",
          "Branchly compares your average rating against the competitor average (or a 4.5★ industry baseline when you have none tracked yet).",
          "When you're below benchmark, tailored tips appear to help close the gap.",
        ],
      },
    ],
    next: "Need something else?",
    nextBody:
      "Check the FAQ for quick answers, or browse the full documentation index.",
    cta: "Back to docs",
  },
  pt: {
    eyebrow: "Documentação · Guias",
    title: "Guias",
    subtitle:
      "Tutoriais passo a passo para fluxos comuns: QR codes, respostas com IA, relatórios PDF.",
    guides: [
      {
        icon: "qr",
        title: "Configurar o QR Code de captação de avaliações",
        steps: [
          "Acesse QR Captação no menu lateral do dashboard.",
          "Cada unidade cadastrada recebe um QR code único apontando para sua página de avaliação no Google.",
          "Baixe o PNG e imprima para o balcão, mesa ou recibo.",
          "Peça ao cliente para escanear logo após um atendimento positivo — é quando a conversão é maior.",
        ],
      },
      {
        icon: "ai",
        title: "Gerar respostas com IA para avaliações",
        steps: [
          'Acesse Reviews e capture suas avaliações mais recentes com "Capturar reviews".',
          'Clique em "Gerar respostas IA" para gerar respostas para todas as avaliações sem resposta de uma vez, ou gere uma por vez a partir de um card individual.',
          "Revise o texto gerado pela IA — ele é escrito em tom educado e profissional, ajustado tanto para avaliações positivas quanto negativas.",
          "Publique a resposta diretamente no Google (ou na plataforma de origem), ou edite antes de publicar.",
        ],
      },
      {
        icon: "reports",
        title: "Criar e exportar relatórios mensais",
        steps: [
          'Acesse Reports e clique em "New report".',
          "Dê um nome e escolha um período (7, 15, 30 dias ou um trimestre).",
          "O Branchly captura um snapshot dos seus KPIs, mix de sentimento, top unidades, concorrentes e principais insights naquele exato momento.",
          'Clique em "Ver KPIs" para revisar o snapshot no dashboard, ou em "Baixar" para exportar um arquivo HTML compartilhável.',
        ],
      },
      {
        icon: "team",
        title: "Convidar sua equipe",
        steps: [
          "Acesse Equipe no menu lateral do dashboard.",
          "Convide colegas por e-mail e defina um papel: Administrativo, Financeiro ou Membro.",
          "O limite de membros da equipe varia por plano — confira seu uso atual em Billing.",
        ],
      },
      {
        icon: "benchmark",
        title: "Rastrear concorrentes e comparar sua nota (benchmark)",
        steps: [
          'Acesse Competitors (Benchmarking) e clique em "Track competitor".',
          "Informe o nome do concorrente, a nota atual e o número de avaliações.",
          "O Branchly compara sua nota média com a média dos concorrentes (ou com o padrão de 4,5★ do setor, quando ainda não há concorrentes rastreados).",
          "Quando você estiver abaixo do benchmark, dicas personalizadas aparecem para ajudar a fechar a diferença.",
        ],
      },
    ],
    next: "Precisa de mais alguma coisa?",
    nextBody:
      "Confira o FAQ para respostas rápidas, ou navegue pelo índice completo da documentação.",
    cta: "Voltar para as docs",
  },
};

const ICONS: Record<string, typeof QrCode> = {
  qr: QrCode,
  ai: Sparkles,
  reports: FileBarChart,
  team: Users,
  benchmark: Target,
};

export const Route = createFileRoute("/docs/guias")({
  head: () => ({
    meta: [
      { title: "Guides — Branchly Docs" },
      {
        name: "description",
        content:
          "Step-by-step guides for QR codes, AI replies, reports, team management and benchmarking.",
      },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/docs/guias" }],
  }),
  component: GuidesPage,
});

function GuidesPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="space-y-6 mb-12">
        {c.guides.map((g) => {
          const Icon = ICONS[g.icon] ?? Sparkles;
          return (
            <div
              key={g.title}
              className="rounded-xl border border-border bg-card p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-display text-base font-semibold text-foreground">
                  {g.title}
                </h2>
              </div>
              <ol className="space-y-2.5">
                {g.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>

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
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </StaticPage>
  );
}

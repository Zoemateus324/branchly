import { createFileRoute } from "@tanstack/react-router";
import {
  Star, GitCompareArrows, Wand2, TrendingUp, BarChart3,
  QrCode, FileText, Plug, Bell, Globe, Shield, Zap,
} from "lucide-react";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const content = {
  en: {
    eyebrow: "Features",
    title: "Everything you need to lead locally.",
    subtitle: "One platform. Every discipline of local reputation intelligence, unified.",
    categories: [
      {
        title: "Review Intelligence",
        features: [
          { icon: "star", title: "Review Monitoring", desc: "Track Google, Facebook and Instagram reviews in real time — every star, every comment, every mention." },
          { icon: "bell", title: "Instant Alerts", desc: "Get notified the moment a negative review lands so you can respond before it does damage." },
          { icon: "wand", title: "AI Reply Drafts", desc: "Anthropic-powered AI drafts a professional response for every review in one click." },
        ],
      },
      {
        title: "Competitive Benchmarking",
        features: [
          { icon: "compare", title: "Competitor Tracking", desc: "Benchmark every location against your direct competitors and category peers automatically." },
          { icon: "chart", title: "Market Position", desc: "See exactly where you rank in your category for rating, volume and response rate." },
          { icon: "trend", title: "Gap Analysis", desc: "Quantify the revenue gap between your current rating and the category benchmark." },
        ],
      },
      {
        title: "AI Insights",
        features: [
          { icon: "wand", title: "AI Reports", desc: "Auto-generated reputation reports with the exact themes hurting your score, ranked by revenue impact." },
          { icon: "zap", title: "Growth Opportunities", desc: "AI surfaces the 3 highest-leverage actions you can take to lift your rating this month." },
          { icon: "trend", title: "Sentiment Analysis", desc: "Deep NLP analysis of review text across positive, neutral and negative themes." },
        ],
      },
      {
        title: "Multi-Location Management",
        features: [
          { icon: "globe", title: "Location Dashboard", desc: "See all your locations on one screen — ratings, trends, alerts and AI insights." },
          { icon: "chart", title: "Location Comparison", desc: "Rank your locations against each other to surface your best and worst performers." },
          { icon: "file", title: "PDF Reports", desc: "White-label-ready PDF reports for location managers, franchisees and board decks." },
        ],
      },
      {
        title: "Growth Tools",
        features: [
          { icon: "qr", title: "QR Code Reviews", desc: "Generate a QR code that sends happy customers straight to your Google review page." },
          { icon: "plug", title: "WhatsApp Outreach", desc: "Send review request messages via WhatsApp and track delivery and read receipts." },
          { icon: "shield", title: "Attribution Pixel", desc: "Track which campaigns, channels and ads are actually driving reviews and conversions." },
        ],
      },
    ],
  },
  pt: {
    eyebrow: "Funcionalidades",
    title: "Tudo que você precisa para liderar localmente.",
    subtitle: "Uma plataforma. Cada disciplina de inteligência de reputação local, unificada.",
    categories: [
      {
        title: "Inteligência de Avaliações",
        features: [
          { icon: "star", title: "Monitoramento de Reviews", desc: "Acompanhe avaliações do Google, Facebook e Instagram em tempo real — cada estrela, cada comentário, cada menção." },
          { icon: "bell", title: "Alertas Instantâneos", desc: "Seja notificado no momento em que uma avaliação negativa aparecer para responder antes que cause dano." },
          { icon: "wand", title: "Respostas com IA", desc: "IA da Anthropic gera uma resposta profissional para cada avaliação com um clique." },
        ],
      },
      {
        title: "Benchmarking Competitivo",
        features: [
          { icon: "compare", title: "Rastreamento de Concorrentes", desc: "Compare cada unidade com seus concorrentes diretos e pares da categoria automaticamente." },
          { icon: "chart", title: "Posição de Mercado", desc: "Veja exatamente onde você está na sua categoria em nota, volume e taxa de resposta." },
          { icon: "trend", title: "Análise de Lacunas", desc: "Quantifique a diferença de receita entre sua nota atual e o benchmark da categoria." },
        ],
      },
      {
        title: "Insights com IA",
        features: [
          { icon: "wand", title: "Relatórios de IA", desc: "Relatórios de reputação gerados automaticamente com os temas que mais derrubam seu score, ranqueados por impacto." },
          { icon: "zap", title: "Oportunidades de Crescimento", desc: "A IA mostra as 3 ações de maior alavancagem para elevar sua nota neste mês." },
          { icon: "trend", title: "Análise de Sentimento", desc: "Análise profunda de NLP do texto das avaliações entre temas positivos, neutros e negativos." },
        ],
      },
      {
        title: "Gestão Multi-Unidade",
        features: [
          { icon: "globe", title: "Painel de Unidades", desc: "Veja todas as suas unidades em uma tela — notas, tendências, alertas e insights de IA." },
          { icon: "chart", title: "Comparação entre Unidades", desc: "Ranqueie suas unidades entre si para destacar as melhores e piores." },
          { icon: "file", title: "Relatórios PDF", desc: "Relatórios PDF prontos para white label para gerentes, franqueados e diretoria." },
        ],
      },
      {
        title: "Ferramentas de Crescimento",
        features: [
          { icon: "qr", title: "QR Code de Avaliações", desc: "Gere um QR code que leva clientes satisfeitos diretamente para sua página de avaliações no Google." },
          { icon: "plug", title: "Outreach por WhatsApp", desc: "Envie pedidos de avaliação via WhatsApp e acompanhe entrega e leitura." },
          { icon: "shield", title: "Pixel de Atribuição", desc: "Rastreie quais campanhas, canais e anúncios estão gerando avaliações e conversões." },
        ],
      },
    ],
  },
};

const ICONS: Record<string, typeof Star> = {
  star: Star, compare: GitCompareArrows, wand: Wand2,
  trend: TrendingUp, chart: BarChart3, qr: QrCode,
  file: FileText, plug: Plug, bell: Bell,
  globe: Globe, shield: Shield, zap: Zap,
};

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Branchly" },
      { name: "description", content: "Review monitoring, competitive benchmarking, AI insights and multi-location management tools for local businesses." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/features" }],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="space-y-16">
        {c.categories.map((cat) => (
          <div key={cat.title}>
            <h2 className="font-display mb-6 text-xl font-semibold text-foreground">
              {cat.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.features.map((f) => {
                const Icon = ICONS[f.icon] ?? Star;
                return (
                  <div
                    key={f.title}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="font-medium text-foreground">{f.title}</div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}

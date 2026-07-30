import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";
import { CheckCircle2 } from "lucide-react";

const content = {
  en: {
    eyebrow: "Documentation · Quickstart",
    title: "Quickstart",
    subtitle:
      "Connect your Google Business Profile and get your first reputation score in under 5 minutes.",
    stepsTitle: "5 steps to your first score",
    steps: [
      {
        title: "1. Create your account",
        body: "Sign up with your work email. No credit card required for the Free plan — you'll get 1 location and a basic reputation score to try things out.",
      },
      {
        title: "2. Open the Overview tab",
        body: 'Inside the dashboard, go to Overview and find the "Real score (AI + Google)" widget. This is where Branchly fetches live data from Google Maps for your business.',
      },
      {
        title: "3. Enter your business name and city",
        body: 'Type the exact name as it appears on Google (e.g. "Café Aroma") and the city. Pick the closest category from the dropdown to improve matching accuracy.',
      },
      {
        title: "4. Calculate your real score",
        body: 'Click "Calculate real score." Branchly\'s AI locates your business on Google Maps, reads your current rating, review volume and recency, and computes a 0–100 Reputation Score in a few seconds.',
      },
      {
        title: "5. Explore your dashboard",
        body: "Your location now appears in Locations, Reputation and Overview with live KPIs. From here you can track competitors, generate AI replies, set up the QR Code for review capture, and schedule monthly reports.",
      },
    ],
    whatYouGet: "What you get in the first 5 minutes",
    whatYouGetItems: [
      "A real Reputation Score (0–100) computed from your live Google data",
      "Your current rating, review count and last-updated timestamp",
      "A baseline to track improvement over time",
      "Access to benchmarking once you add your first competitor",
    ],
    next: "What's next",
    nextBody:
      "Once your first location is live, connect additional channels in Integrations, install the Attribution Pixel on your website, and print a QR Code to start capturing more reviews at the point of service.",
    cta: "Explore other docs",
  },
  pt: {
    eyebrow: "Documentação · Início Rápido",
    title: "Início Rápido",
    subtitle:
      "Conecte seu Google Meu Negócio e receba seu primeiro score de reputação em menos de 5 minutos.",
    stepsTitle: "5 passos até o seu primeiro score",
    steps: [
      {
        title: "1. Crie sua conta",
        body: "Cadastre-se com seu e-mail. Não é necessário cartão de crédito no plano Free — você recebe 1 unidade e um score de reputação básico para testar.",
      },
      {
        title: "2. Abra a aba Overview",
        body: 'Dentro do dashboard, vá em Overview e encontre o widget "Score real (IA + Google)". É aqui que o Branchly busca dados ao vivo do Google Maps para o seu negócio.',
      },
      {
        title: "3. Informe o nome do negócio e a cidade",
        body: 'Digite o nome exatamente como aparece no Google (ex: "Café Aroma") e a cidade. Escolha a categoria mais próxima no seletor para melhorar a precisão da busca.',
      },
      {
        title: "4. Calcule seu score real",
        body: 'Clique em "Calcular score real". A IA do Branchly localiza seu negócio no Google Maps, lê a nota atual, o volume de avaliações e a recência, e calcula um Score de Reputação de 0 a 100 em poucos segundos.',
      },
      {
        title: "5. Explore seu dashboard",
        body: "Sua unidade agora aparece em Locations, Reputation e Overview com KPIs ao vivo. A partir daqui você pode rastrear concorrentes, gerar respostas com IA, configurar o QR Code de captação de avaliações e agendar relatórios mensais.",
      },
    ],
    whatYouGet: "O que você recebe nos primeiros 5 minutos",
    whatYouGetItems: [
      "Um Score de Reputação real (0–100) calculado a partir dos seus dados do Google ao vivo",
      "Sua nota atual, número de avaliações e data da última atualização",
      "Uma base para acompanhar a evolução ao longo do tempo",
      "Acesso ao benchmarking assim que você adicionar seu primeiro concorrente",
    ],
    next: "Próximos passos",
    nextBody:
      "Com sua primeira unidade ativa, conecte outros canais em Integrações, instale o Pixel de Atribuição no seu site e imprima um QR Code para capturar mais avaliações no ponto de atendimento.",
    cta: "Explorar outras docs",
  },
};

export const Route = createFileRoute("/docs/inicio-rapido")({
  head: () => ({
    meta: [
      { title: "Quickstart — Branchly Docs" },
      {
        name: "description",
        content:
          "Connect your Google Business Profile and get your first reputation score in under 5 minutes.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://branchly.com.br/docs/inicio-rapido" },
    ],
  }),
  component: QuickstartPage,
});

function QuickstartPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <h2 className="font-display mb-6 text-lg font-semibold text-foreground">
        {c.stepsTitle}
      </h2>
      <div className="rounded-xl border border-border bg-card divide-y divide-border mb-12">
        {c.steps.map((s) => (
          <div key={s.title} className="px-6 py-6 md:px-8">
            <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8 mb-12">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          {c.whatYouGet}
        </h2>
        <ul className="space-y-2.5">
          {c.whatYouGetItems.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
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
      </Link>
    </StaticPage>
  );
}

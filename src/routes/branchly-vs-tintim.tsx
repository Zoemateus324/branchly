import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Branchly vs Tintim: Qual a Melhor Plataforma de Reputação? (2026)";
const DESCRIPTION =
  "Comparação completa entre Branchly e Tintim: funcionalidades, preços, benchmark de concorrentes e IA. Descubra qual plataforma de gestão de reputação é ideal para o seu negócio.";
const URL = "https://branchly.com.br/branchly-vs-tintim";

export const Route = createFileRoute("/branchly-vs-tintim")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "branchly vs tintim, alternativa ao tintim, melhor software reputação google, gestão avaliações google, tintim alternativa, plataforma reputação online, software gestão reviews",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "article" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:locale:alternate", content: "en_US" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          inLanguage: "pt-BR",
          datePublished: "2026-01-15",
          dateModified: "2026-07-30",
          author: { "@type": "Organization", name: "Branchly" },
          publisher: {
            "@type": "Organization",
            name: "Branchly",
            logo: {
              "@type": "ImageObject",
              url: "https://branchly.com.br/favicon.ico",
            },
          },
          mainEntityOfPage: URL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: "pt-BR",
          mainEntity: [
            {
              "@type": "Question",
              name: "Qual a diferença entre Branchly e Tintim?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Branchly foca em negócios com múltiplas localizações e oferece benchmark automático de concorrentes por cidade e categoria, painel unificado para redes e franquias, e IA para respostas a avaliações em escala. Tintim atende principalmente negócios individuais sem ênfase em benchmarking competitivo ou análise multi-unidade.",
              },
            },
            {
              "@type": "Question",
              name: "Branchly é mais barato que o Tintim?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "O Branchly tem plano gratuito para 1 localização e planos pagos a partir de R$ 19/mês (Starter), incluindo benchmark de concorrentes. Compare com o Tintim e escolha com base no número de localizações e nas funcionalidades de análise competitiva que cada plano oferece.",
              },
            },
            {
              "@type": "Question",
              name: "O Branchly funciona para franquias e redes?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. O Branchly foi projetado para redes, franquias e operações multi-unidade. Você acompanha a reputação de cada unidade, compara com os concorrentes locais de cada região e recebe insights de IA específicos por localização — tudo em um único painel.",
              },
            },
            {
              "@type": "Question",
              name: "Quais recursos o Branchly tem que o Tintim não tem?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Branchly oferece: (1) benchmark automático de concorrentes por categoria e cidade em tempo real; (2) painel multi-localização para redes e franquias; (3) score de reputação local por unidade; (4) IA para geração de respostas em escala; (5) relatórios comparativos entre unidades da mesma rede.",
              },
            },
            {
              "@type": "Question",
              name: "Posso migrar do Tintim para o Branchly?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. A migração para o Branchly leva menos de 5 minutos: crie uma conta gratuita, conecte seu Google Business Profile e comece a monitorar avaliações e benchmarks imediatamente — sem necessidade de contrato ou período de aviso prévio.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: BranchlyVsTintim,
});

type Feature = {
  feature: string;
  branchly: string;
  tintim: string;
  branchlyWins: boolean;
};

const FEATURES: Feature[] = [
  {
    feature: "Monitoramento de avaliações Google",
    branchly: "✓ Tempo real",
    tintim: "✓ Tempo real",
    branchlyWins: false,
  },
  {
    feature: "Resposta a avaliações com IA",
    branchly: "✓ Ilimitado (Pro+)",
    tintim: "✓ Limitado",
    branchlyWins: true,
  },
  {
    feature: "Benchmark de concorrentes",
    branchly: "✓ Automático por cidade/categoria",
    tintim: "✗ Não disponível",
    branchlyWins: true,
  },
  {
    feature: "Suporte multi-localização",
    branchly: "✓ Nativo (redes e franquias)",
    tintim: "✗ Limitado",
    branchlyWins: true,
  },
  {
    feature: "Score de reputação por unidade",
    branchly: "✓ Score + ranking local",
    tintim: "✗ Não disponível",
    branchlyWins: true,
  },
  {
    feature: "Relatórios comparativos entre unidades",
    branchly: "✓ Por unidade e região",
    tintim: "✗ Não disponível",
    branchlyWins: true,
  },
  {
    feature: "Plano gratuito",
    branchly: "✓ 1 localização grátis",
    tintim: "✗ Apenas trial",
    branchlyWins: true,
  },
  {
    feature: "Integração Google Business Profile",
    branchly: "✓ Automática",
    tintim: "✓ Automática",
    branchlyWins: false,
  },
];

function BranchlyVsTintim() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Branchly
          </Link>
          <span className="mx-2">/</span>
          <span>Comparação</span>
        </nav>

        <header className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
            Comparativo 2026
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Branchly vs Tintim
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Qual plataforma de gestão de reputação online é a melhor escolha
            para o seu negócio? Comparamos funcionalidades, preços e diferenciais.
          </p>
        </header>

        <section className="space-y-10 text-base leading-relaxed">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Resumo rápido</h2>
            <p className="mt-3 text-muted-foreground">
              <strong className="text-foreground">Branchly</strong> é a melhor
              escolha para redes, franquias e negócios com múltiplas
              localizações que precisam de benchmark de concorrentes e visão
              consolidada da reputação. Oferece plano gratuito e benchmark
              automático de concorrentes por cidade.{" "}
              <strong className="text-foreground">Tintim</strong> atende bem
              negócios individuais com foco básico em gestão de avaliações.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Comparação de funcionalidades
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                      Funcionalidade
                    </th>
                    <th className="py-3 pr-4 text-left font-medium text-primary">
                      Branchly
                    </th>
                    <th className="py-3 text-left font-medium text-muted-foreground">
                      Tintim
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium">{row.feature}</td>
                      <td
                        className={`py-3 pr-4 ${row.branchlyWins ? "font-semibold text-primary" : ""}`}
                      >
                        {row.branchly}
                      </td>
                      <td className="py-3 text-muted-foreground">{row.tintim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Por que o Branchly é diferente?
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  1. Benchmark automático de concorrentes
                </h3>
                <p className="mt-2 text-muted-foreground">
                  O Branchly é a única plataforma que compara automaticamente
                  cada unidade do seu negócio com os concorrentes reais da
                  mesma categoria e cidade. Você sabe exatamente quem está na
                  sua frente e por quê — sem precisar pesquisar manualmente.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  2. Feito para redes e franquias
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Gerencie 1 ou 1.000 localizações em um único painel.
                  Identifique quais unidades têm desempenho abaixo da média,
                  compare regiões e tome decisões baseadas em dados reais de
                  cada localização.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  3. IA para respostas em escala
                </h3>
                <p className="mt-2 text-muted-foreground">
                  A IA do Branchly gera respostas profissionais e personalizadas
                  para cada avaliação em segundos, mantendo o tom da sua marca.
                  Para operações com dezenas de unidades, isso representa horas
                  economizadas por semana.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  4. Score de reputação local
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Cada localização recebe um score de reputação calculado com
                  base em nota média, volume de avaliações, recência e posição
                  frente aos concorrentes — um número objetivo para acompanhar
                  a evolução semana a semana.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Comparação de preços</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                      Plano
                    </th>
                    <th className="py-3 pr-4 text-left font-medium text-primary">
                      Branchly
                    </th>
                    <th className="py-3 text-left font-medium text-muted-foreground">
                      Tintim
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">Gratuito</td>
                    <td className="py-3 pr-4 font-semibold text-primary">
                      $0 — 1 localização
                    </td>
                    <td className="py-3 text-muted-foreground">Trial limitado</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">Básico</td>
                    <td className="py-3 pr-4 font-semibold text-primary">
                      $19/mês — 3 localizações
                    </td>
                    <td className="py-3 text-muted-foreground">Consulte o site</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">Profissional</td>
                    <td className="py-3 pr-4 font-semibold text-primary">
                      $29/mês — 10 localizações + benchmark
                    </td>
                    <td className="py-3 text-muted-foreground">Consulte o site</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Premium / Enterprise</td>
                    <td className="py-3 pr-4 font-semibold text-primary">
                      $49/mês — 50 localizações
                    </td>
                    <td className="py-3 text-muted-foreground">Consulte o site</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Perguntas frequentes</h2>
            <div className="space-y-4">
              <details className="rounded-lg border border-border p-4">
                <summary className="cursor-pointer font-medium">
                  Qual a diferença entre Branchly e Tintim?
                </summary>
                <p className="mt-3 text-muted-foreground">
                  Branchly foca em negócios com múltiplas localizações e oferece
                  benchmark automático de concorrentes por cidade e categoria,
                  painel unificado para redes e franquias, e IA para respostas em
                  escala. Tintim atende principalmente negócios individuais sem
                  ênfase em benchmarking competitivo ou análise multi-unidade.
                </p>
              </details>
              <details className="rounded-lg border border-border p-4">
                <summary className="cursor-pointer font-medium">
                  Branchly é mais barato que o Tintim?
                </summary>
                <p className="mt-3 text-muted-foreground">
                  O Branchly tem plano gratuito para 1 localização e planos pagos
                  a partir de $19/mês incluindo benchmark de concorrentes. Compare
                  com o Tintim e escolha com base no número de localizações e nas
                  funcionalidades de análise competitiva que cada plano oferece.
                </p>
              </details>
              <details className="rounded-lg border border-border p-4">
                <summary className="cursor-pointer font-medium">
                  Posso migrar do Tintim para o Branchly?
                </summary>
                <p className="mt-3 text-muted-foreground">
                  Sim. A migração leva menos de 5 minutos: crie uma conta gratuita,
                  conecte seu Google Business Profile e comece a monitorar avaliações
                  e benchmarks imediatamente — sem contrato ou período de aviso.
                </p>
              </details>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-semibold">
              Experimente o Branchly gratuitamente
            </h2>
            <p className="mt-2 text-muted-foreground">
              Plano gratuito para 1 localização. Benchmark de concorrentes e IA
              incluídos nos planos pagos. Sem cartão de crédito.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/sign-up/$"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Criar conta gratuita
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Ver funcionalidades
              </Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

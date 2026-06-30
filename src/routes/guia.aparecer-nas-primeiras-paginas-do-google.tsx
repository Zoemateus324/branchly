import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Como Aparecer nas Primeiras Páginas do Google | Branchly";
const DESCRIPTION =
  "Aprenda como aparecer nas primeiras páginas do Google com SEO local, gestão de avaliações e benchmark de concorrentes. Guia prático da Branchly para 2026.";
const URL = "https://branchly.com.br/guia/aparecer-nas-primeiras-paginas-do-google";

export const Route = createFileRoute("/guia/aparecer-nas-primeiras-paginas-do-google")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "como aparecer nas primeiras páginas do google, como fazer meu site aparecer no google, seo local, ranking google, aparecer no google maps, primeira página google",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "article" },
      { property: "og:locale", content: "pt_BR" },
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
          author: { "@type": "Organization", name: "Branchly" },
          publisher: {
            "@type": "Organization",
            name: "Branchly",
            logo: { "@type": "ImageObject", url: "https://branchly.com.br/favicon.ico" },
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
              name: "Como faço para aparecer nas primeiras páginas do Google?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Para aparecer nas primeiras páginas do Google você precisa de três pilares: (1) SEO técnico — site rápido, mobile e bem estruturado; (2) SEO de conteúdo — páginas que respondem exatamente o que o usuário pesquisa; (3) SEO local e autoridade — perfil otimizado no Google Meu Negócio, avaliações recentes com nota alta e links de outros sites confiáveis. A Branchly cuida do terceiro pilar, que é decisivo para negócios locais.",
              },
            },
            {
              "@type": "Question",
              name: "Avaliações no Google ajudam a ranquear melhor?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. Quantidade, recência e nota média das avaliações são fatores oficiais de ranqueamento do Google Maps e do pacote local. Negócios com 4,5+ estrelas e fluxo constante de reviews aparecem antes nos resultados.",
              },
            },
            {
              "@type": "Question",
              name: "Quanto tempo leva para aparecer na primeira página?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Para termos de baixa concorrência e SEO local, 60 a 120 dias com trabalho consistente. Para termos competitivos nacionais, 6 a 12 meses. Avaliações novas aceleram bastante o resultado local.",
              },
            },
            {
              "@type": "Question",
              name: "Como a Branchly ajuda meu site a aparecer no Google?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A Branchly monitora suas avaliações, gera respostas com IA, compara você com os concorrentes que aparecem na sua frente e mostra exatamente o que precisa melhorar para subir no ranking local do Google.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: GuideAparecerPrimeirasPaginas,
});

function GuideAparecerPrimeirasPaginas() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Branchly</Link>
          <span className="mx-2">/</span>
          <span>Guia</span>
        </nav>
        <header className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">SEO Local</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Como aparecer nas primeiras páginas do Google
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            O método em 5 passos que negócios locais usam para subir no pacote de mapas e dominar
            os resultados da sua cidade.
          </p>
        </header>

        <section className="prose prose-invert max-w-none space-y-6 text-base leading-relaxed">
          <p>
            Estar na primeira página do Google não é sorte — é o resultado de três pilares
            trabalhados em conjunto: <strong>autoridade</strong>, <strong>relevância</strong> e
            <strong> reputação</strong>. Para negócios locais, reputação é o pilar que mais pesa.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">1. Otimize o Google Meu Negócio</h2>
          <p>
            Perfil verificado, categoria principal correta, NAP (Nome, Endereço, Telefone)
            consistente em todos os diretórios, fotos atualizadas e posts semanais.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">2. Acumule avaliações reais e recentes</h2>
          <p>
            Avaliações são o combustível do ranking local. O Google prioriza negócios com fluxo
            constante de reviews e nota acima de 4,5. Cada review novo é um sinal de relevância.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">3. Responda todas as avaliações</h2>
          <p>
            Responder mostra atividade e melhora a percepção dos próximos visitantes. A IA da
            <Link to="/" className="text-primary underline"> Branchly</Link> faz isso em escala
            para todas as suas localizações.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">4. Analise os concorrentes que já ranqueiam</h2>
          <p>
            Quem está na sua frente tem 3 coisas em comum: mais reviews, nota maior e mais fotos.
            O benchmark da Branchly mostra exatamente a diferença e como fechá-la.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">5. Site rápido e conteúdo local</h2>
          <p>
            Páginas com nome da cidade no título, depoimentos reais, FAQ estruturada e tempo de
            carregamento abaixo de 2 segundos. Esses sinais técnicos completam o pacote.
          </p>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h3 className="text-2xl font-semibold">Veja quanto você está distante da 1ª página</h3>
            <p className="mt-2 text-muted-foreground">
              A Branchly mostra seu score local, compara com os concorrentes e indica os próximos passos.
            </p>
            <Link
              to="/sign-up"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Analisar meu negócio grátis
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
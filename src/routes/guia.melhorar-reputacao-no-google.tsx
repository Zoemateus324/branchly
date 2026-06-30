import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Como Melhorar a Reputação no Google em 2026 | Branchly";
const DESCRIPTION =
  "Guia completo para melhorar a reputação da sua empresa no Google: monitore avaliações, responda com IA, acompanhe concorrentes e suba o ranking local com a Branchly.";
const URL = "https://branchly.com.br/guia/melhorar-reputacao-no-google";

export const Route = createFileRoute("/guia/melhorar-reputacao-no-google")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "como melhorar reputação no google, melhorar reputação no google, reputação online, gestão de avaliações google, responder avaliações google, ranking google meu negócio",
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
              name: "Como melhorar a reputação da minha empresa no Google?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Para melhorar a reputação no Google: (1) reivindique seu perfil no Google Meu Negócio, (2) peça avaliações ativamente aos clientes satisfeitos, (3) responda 100% das avaliações em até 24 horas — inclusive as negativas, (4) monitore concorrentes da mesma categoria local e (5) acompanhe sua nota média semanalmente. A Branchly automatiza monitoramento, resposta com IA e benchmark competitivo em um único painel.",
              },
            },
            {
              "@type": "Question",
              name: "Quanto tempo leva para a reputação no Google melhorar?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Com uma rotina consistente de coleta e resposta de avaliações, é possível ver a nota média subir entre 30 e 90 dias. A velocidade depende do volume de reviews recebidos e da taxa de resposta.",
              },
            },
            {
              "@type": "Question",
              name: "Como responder avaliações negativas no Google?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Responda com empatia, peça desculpas pelo ocorrido, leve a conversa para um canal privado e mostre a solução adotada. A IA da Branchly gera respostas profissionais e personalizadas em segundos, mantendo o tom da sua marca.",
              },
            },
            {
              "@type": "Question",
              name: "A Branchly funciona para empresas com várias localizações?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. A Branchly foi feita para redes, franquias e operações multi-unidade — você acompanha a reputação de cada unidade, compara com os concorrentes locais e recebe insights de IA por localização.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: GuideMelhorarReputacao,
});

function GuideMelhorarReputacao() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Branchly</Link>
          <span className="mx-2">/</span>
          <span>Guia</span>
        </nav>
        <header className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">Guia completo</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Como melhorar a reputação no Google em 2026
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            O passo a passo que franquias e negócios locais usam para sair de 3,8 e chegar a 4,7
            estrelas — sem depender de sorte ou de pedidos manuais.
          </p>
        </header>

        <section className="prose prose-invert max-w-none space-y-6 text-base leading-relaxed">
          <p>
            A reputação no Google é hoje o principal fator de decisão de compra local. Mais de 87%
            dos consumidores pesquisam avaliações antes de visitar um estabelecimento. Subir de
            3,8 para 4,5 estrelas pode <strong>dobrar</strong> o número de cliques no seu perfil.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">1. Reivindique e otimize o Google Meu Negócio</h2>
          <p>
            Garanta que o perfil está verificado, com categoria correta, horário atualizado, fotos
            recentes e descrição com palavras-chave da sua cidade e serviço.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">2. Peça avaliações de forma sistemática</h2>
          <p>
            Crie uma rotina: cada cliente atendido recebe um link curto para avaliar. Quanto mais
            recente o review, mais peso ele tem no algoritmo do Google.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">3. Responda 100% das avaliações em 24h</h2>
          <p>
            Responder mostra ao Google que o perfil está ativo e ao cliente que você se importa.
            A IA da <Link to="/" className="text-primary underline">Branchly</Link> gera respostas
            profissionais em segundos, mantendo o tom da sua marca.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">4. Monitore seus concorrentes locais</h2>
          <p>
            Saber a nota média dos 5 concorrentes mais próximos é o que separa quem cresce de
            quem estagna. A Branchly faz benchmark automático por categoria e cidade.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">5. Acompanhe métricas semanalmente</h2>
          <p>
            Nota média, volume de novos reviews, taxa de resposta e sentimento. Esses 4 números
            contam toda a história da sua reputação.
          </p>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h3 className="text-2xl font-semibold">Comece de graça com a Branchly</h3>
            <p className="mt-2 text-muted-foreground">
              Monitore reviews, responda com IA e veja como você se compara aos concorrentes.
            </p>
            <Link
              to="/sign-up"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Criar conta gratuita
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
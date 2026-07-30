import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const content = {
  en: {
    eyebrow: "Documentation · Attribution Pixel",
    title: "Attribution Pixel",
    subtitle:
      "Track which channels drive reviews and conversions with the Branchly pixel.",
    howTitle: "How it works",
    howBody:
      "The Branchly pixel is a lightweight, first-party JavaScript snippet you add to your website. It tracks page views, scroll depth, WhatsApp clicks, phone clicks and form submissions — then ties them back to the UTM source, medium and campaign that brought the visitor in, so you can see which marketing channels actually generate reviews and business.",
    installTitle: "Installation",
    installBody:
      "Create a site in Rastreamento (Attribution) inside your dashboard, then copy the generated snippet and paste it before the closing </body> tag on every page you want to track:",
    snippet: `<script src="https://branchly.com.br/api/pixel/YOUR_PIXEL_ID" async defer></script>`,
    installNote:
      "The script loads asynchronously and never blocks page rendering. It sets a first-party cookie for a stable visitor ID and uses sessionStorage for session tracking — no third-party cookies, no fingerprinting.",
    eventsTitle: "Events tracked automatically",
    events: [
      {
        name: "pageview",
        desc: "Fired on every page load, with UTM parameters, referrer and device type.",
      },
      {
        name: "scroll",
        desc: "Fired at 10% scroll-depth increments, capped once per session.",
      },
      {
        name: "whatsapp_click",
        desc: 'Fired when a visitor clicks any link containing wa.me or "whatsapp".',
      },
      { name: "phone_click", desc: "Fired when a visitor clicks a tel: link." },
      {
        name: "form_submit",
        desc: "Fired on any form submission, capturing the form id or name.",
      },
      {
        name: "session_end",
        desc: "Fired when the tab becomes hidden, along with the maximum scroll depth reached.",
      },
    ],
    privacyTitle: "Privacy by design",
    privacyBody:
      "The pixel is LGPD-safe by default: no personally identifiable information is collected, no cross-site tracking, and no fingerprinting techniques. Data is stored under your account only and is never shared with third parties.",
    next: "What's next",
    nextBody:
      "Head to Rastreamento in your dashboard to see sessions, traffic by source, and how each channel correlates with review volume.",
    cta: "Back to docs",
  },
  pt: {
    eyebrow: "Documentação · Pixel de Atribuição",
    title: "Pixel de Atribuição",
    subtitle:
      "Rastreie quais canais geram avaliações e conversões com o pixel do Branchly.",
    howTitle: "Como funciona",
    howBody:
      "O pixel do Branchly é um script JavaScript leve e first-party que você adiciona ao seu site. Ele rastreia visualizações de página, profundidade de scroll, cliques no WhatsApp, cliques em telefone e envios de formulário — e relaciona tudo com a origem, mídia e campanha (UTM) que trouxe o visitante, para você ver quais canais de marketing realmente geram avaliações e negócio.",
    installTitle: "Instalação",
    installBody:
      "Crie um site em Rastreamento dentro do seu dashboard, copie o snippet gerado e cole antes do fechamento da tag </body> em todas as páginas que deseja rastrear:",
    snippet: `<script src="https://branchly.com.br/api/pixel/SEU_PIXEL_ID" async defer></script>`,
    installNote:
      "O script carrega de forma assíncrona e nunca bloqueia a renderização da página. Ele usa um cookie first-party para um ID de visitante estável e sessionStorage para rastreamento de sessão — sem cookies de terceiros, sem fingerprinting.",
    eventsTitle: "Eventos rastreados automaticamente",
    events: [
      {
        name: "pageview",
        desc: "Disparado a cada carregamento de página, com parâmetros UTM, referrer e tipo de dispositivo.",
      },
      {
        name: "scroll",
        desc: "Disparado a cada 10% de profundidade de rolagem, limitado a uma vez por sessão.",
      },
      {
        name: "whatsapp_click",
        desc: 'Disparado quando o visitante clica em um link contendo wa.me ou "whatsapp".',
      },
      {
        name: "phone_click",
        desc: "Disparado quando o visitante clica em um link tel:.",
      },
      {
        name: "form_submit",
        desc: "Disparado em qualquer envio de formulário, capturando o id ou nome do formulário.",
      },
      {
        name: "session_end",
        desc: "Disparado quando a aba fica oculta, junto com a profundidade máxima de rolagem alcançada.",
      },
    ],
    privacyTitle: "Privacidade por padrão",
    privacyBody:
      "O pixel é seguro para a LGPD por padrão: nenhuma informação pessoalmente identificável é coletada, sem rastreamento entre sites e sem técnicas de fingerprinting. Os dados ficam armazenados apenas na sua conta e nunca são compartilhados com terceiros.",
    next: "Próximos passos",
    nextBody:
      "Acesse Rastreamento no seu dashboard para ver sessões, tráfego por origem e como cada canal se correlaciona com o volume de avaliações.",
    cta: "Voltar para as docs",
  },
};

export const Route = createFileRoute("/docs/pixel-atribuicao")({
  head: () => ({
    meta: [
      { title: "Attribution Pixel — Branchly Docs" },
      {
        name: "description",
        content:
          "Track which channels drive reviews and conversions with the Branchly attribution pixel.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://branchly.com.br/docs/pixel-atribuicao",
      },
    ],
  }),
  component: PixelDocsPage,
});

function PixelDocsPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="space-y-10">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            {c.howTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {c.howBody}
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            {c.installTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            {c.installBody}
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs">
            <code className="text-foreground">{c.snippet}</code>
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">{c.installNote}</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            {c.eventsTitle}
          </h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {c.events.map((e) => (
              <div
                key={e.name}
                className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <code className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground sm:w-40">
                  {e.name}
                </code>
                <p className="text-sm text-muted-foreground">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-accent/30 bg-accent/5 p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-2">
            {c.privacyTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {c.privacyBody}
          </p>
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Zap, Plug, GitBranch, HelpCircle, ArrowRight } from "lucide-react";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const content = {
  en: {
    eyebrow: "Documentation",
    title: "Branchly Docs",
    subtitle: "Everything you need to monitor, benchmark and grow your local reputation.",
    search: "Search documentation…",
    gettingStarted: "Getting Started",
    sections: [
      {
        icon: "zap",
        title: "Quickstart",
        desc: "Connect your Google Business Profile and get your first reputation score in under 5 minutes.",
        href: "/docs",
      },
      {
        icon: "plug",
        title: "Integrations",
        desc: "Connect Google, Facebook, Instagram and WhatsApp to unify your review data.",
        href: "/docs",
      },
      {
        icon: "git",
        title: "Attribution Pixel",
        desc: "Track which channels drive reviews and conversions with the Branchly pixel.",
        href: "/docs",
      },
      {
        icon: "book",
        title: "API Reference",
        desc: "Programmatic access to your reputation data and AI insights via REST API.",
        href: "/docs",
      },
      {
        icon: "help",
        title: "Guides",
        desc: "Step-by-step guides for common workflows: QR codes, AI replies, PDF reports.",
        href: "/docs",
      },
      {
        icon: "help",
        title: "FAQ",
        desc: "Answers to the most common questions from Branchly users.",
        href: "/docs",
      },
    ],
    comingSoon: "Full documentation is coming soon. For now, reach us at",
  },
  pt: {
    eyebrow: "Documentação",
    title: "Docs do Branchly",
    subtitle: "Tudo que você precisa para monitorar, comparar e crescer sua reputação local.",
    search: "Buscar na documentação…",
    gettingStarted: "Primeiros Passos",
    sections: [
      {
        icon: "zap",
        title: "Início Rápido",
        desc: "Conecte seu Google Meu Negócio e receba seu primeiro score de reputação em menos de 5 minutos.",
        href: "/docs",
      },
      {
        icon: "plug",
        title: "Integrações",
        desc: "Conecte Google, Facebook, Instagram e WhatsApp para unificar seus dados de avaliações.",
        href: "/docs",
      },
      {
        icon: "git",
        title: "Pixel de Atribuição",
        desc: "Rastreie quais canais geram avaliações e conversões com o pixel do Branchly.",
        href: "/docs",
      },
      {
        icon: "book",
        title: "Referência da API",
        desc: "Acesso programático aos seus dados de reputação e insights de IA via API REST.",
        href: "/docs",
      },
      {
        icon: "help",
        title: "Guias",
        desc: "Tutoriais passo a passo para fluxos comuns: QR codes, respostas com IA, relatórios PDF.",
        href: "/docs",
      },
      {
        icon: "help",
        title: "Perguntas Frequentes",
        desc: "Respostas para as dúvidas mais comuns dos usuários do Branchly.",
        href: "/docs",
      },
    ],
    comingSoon: "A documentação completa está a caminho. Por enquanto, fale conosco em",
  },
};

const ICONS: Record<string, typeof BookOpen> = {
  book: BookOpen,
  zap: Zap,
  plug: Plug,
  git: GitBranch,
  help: HelpCircle,
};

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Branchly" },
      { name: "description", content: "Branchly documentation: quickstart, integrations, API reference and guides." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/docs" }],
  }),
  component: DocsPage,
});

function DocsPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="mb-10">
        <input
          type="search"
          placeholder={c.search}
          className="w-full max-w-lg rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <h2 className="font-display mb-6 text-lg font-semibold text-foreground">
        {c.gettingStarted}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.sections.map((s) => {
          const Icon = ICONS[s.icon] ?? HelpCircle;
          return (
            <Link
              key={s.title}
              to={s.href as "/docs"}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition hover:border-accent/50 hover:bg-muted/40"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-foreground">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-xs text-accent opacity-0 transition group-hover:opacity-100">
                {locale === "pt" ? "Ver mais" : "Read more"}
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        {c.comingSoon}{" "}
        <a href="mailto:contato@branchly.com.br" className="text-accent hover:underline">
          contato@branchly.com.br
        </a>
        .
      </p>
    </StaticPage>
  );
}

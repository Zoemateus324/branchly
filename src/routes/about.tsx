import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const content = {
  en: {
    eyebrow: "About",
    title: "We're building the reputation OS for local business.",
    subtitle: "Branchly was founded on one belief: local businesses deserve the same intelligence that large chains take for granted.",
    mission: {
      title: "Our Mission",
      body: "To give every local and multi-location business — from the independent restaurant to the 200-unit franchise — the tools to understand, protect and grow their reputation, at a price that makes sense.",
    },
    story: {
      title: "The Story",
      paras: [
        "We started Branchly after watching local business owners spend hours checking Google reviews manually, with no context about what their competitors were doing and no clear path to improving their ratings.",
        "Traditional review management tools told you what was happening. We built Branchly to tell you what to do about it — with real benchmarks, AI-driven insights and a clear revenue link for every action.",
        "Today Branchly is used by operators across Brazil, the US and beyond to turn reputation into a measurable growth lever.",
      ],
    },
    values: {
      title: "Values",
      items: [
        { title: "Clarity over noise", desc: "We surface the signal that matters, not every data point we can collect." },
        { title: "Revenue-first thinking", desc: "Every feature connects to a business outcome. Vanity metrics don't ship." },
        { title: "Built for operators", desc: "We design for the person running 5 locations, not a data scientist." },
        { title: "Honest AI", desc: "Our AI explains its reasoning. We never promise what the data doesn't support." },
      ],
    },
    cta: "Talk to us",
  },
  pt: {
    eyebrow: "Sobre",
    title: "Estamos construindo o sistema operacional de reputação para negócios locais.",
    subtitle: "O Branchly foi fundado com uma crença: negócios locais merecem a mesma inteligência que grandes redes têm por padrão.",
    mission: {
      title: "Nossa Missão",
      body: "Dar a cada negócio local e multi-unidade — do restaurante independente à franquia de 200 unidades — as ferramentas para entender, proteger e crescer sua reputação, com um preço que faça sentido.",
    },
    story: {
      title: "A História",
      paras: [
        "Criamos o Branchly depois de ver donos de negócios locais gastando horas verificando avaliações no Google manualmente, sem contexto sobre o que os concorrentes estavam fazendo e sem um caminho claro para melhorar suas notas.",
        "As ferramentas tradicionais de gestão de avaliações diziam o que estava acontecendo. Construímos o Branchly para dizer o que fazer — com benchmarks reais, insights de IA e uma ligação clara de receita para cada ação.",
        "Hoje o Branchly é usado por operadores no Brasil, nos EUA e em outros países para transformar reputação em alavanca de crescimento mensurável.",
      ],
    },
    values: {
      title: "Valores",
      items: [
        { title: "Clareza sobre ruído", desc: "Mostramos o sinal que importa, não cada dado que conseguimos coletar." },
        { title: "Foco em receita", desc: "Cada funcionalidade se conecta a um resultado de negócio. Métricas de vaidade não passam." },
        { title: "Feito para operadores", desc: "Desenvolvemos para quem gerencia 5 unidades, não para um cientista de dados." },
        { title: "IA honesta", desc: "Nossa IA explica seu raciocínio. Nunca prometemos o que os dados não sustentam." },
      ],
    },
    cta: "Fale conosco",
  },
};

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Branchly" },
      { name: "description", content: "Branchly is building the reputation operating system for local and multi-location businesses." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="grid gap-8 md:grid-cols-2 mb-16">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="font-display mb-3 text-xl font-semibold text-foreground">{c.mission.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{c.mission.body}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="font-display mb-4 text-xl font-semibold text-foreground">{c.story.title}</h2>
          <div className="space-y-3">
            {c.story.paras.map((p) => (
              <p key={p.slice(0, 20)} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </div>
        </div>
      </div>

      <h2 className="font-display mb-6 text-2xl font-semibold text-foreground">{c.values.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
        {c.values.items.map((v) => (
          <div key={v.title} className="rounded-xl border border-border bg-card p-6">
            <div className="font-medium text-foreground">{v.title}</div>
            <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 px-8 py-10 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {locale === "pt" ? "Quer conversar com a equipe?" : "Want to talk to the team?"}
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          {c.cta}
        </Link>
      </div>
    </StaticPage>
  );
}

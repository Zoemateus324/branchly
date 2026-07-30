import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const content = {
  en: {
    eyebrow: "Careers",
    title: "Build the reputation OS for local business.",
    subtitle: "We're a small, focused team shipping fast. If you're energized by hard problems and real customer impact, we'd love to meet you.",
    culture: {
      title: "Life at Branchly",
      items: [
        { title: "Remote-first", desc: "Work from anywhere. Our team is spread across Brazil and beyond." },
        { title: "Ship often", desc: "We deploy daily. You'll see your work in production the same week you write it." },
        { title: "Customer obsessed", desc: "Every decision starts with the customer. We talk to operators every week." },
        { title: "Equity included", desc: "Every full-time team member participates in the company's success." },
      ],
    },
    openings: {
      title: "Open Roles",
      none: "No open positions right now. We post new roles here as they open.",
      roles: [
        {
          title: "Senior Full-Stack Engineer",
          dept: "Engineering",
          type: "Full-time",
          location: "Remote (Brazil)",
          desc: "Own the core product experience — from SSR to database — and help us ship the next phase of the attribution and AI platform.",
        },
        {
          title: "Customer Success Manager",
          dept: "Customer Success",
          type: "Full-time",
          location: "Remote (Brazil)",
          desc: "Be the bridge between customers and product. Drive adoption, retention and expansion across our restaurant, retail and healthcare segments.",
        },
      ],
    },
    apply: "Apply",
    noMatch: "Don't see a role that fits? Send us a note at",
  },
  pt: {
    eyebrow: "Carreiras",
    title: "Construa o sistema operacional de reputação para negócios locais.",
    subtitle: "Somos um time pequeno e focado que entrega rápido. Se você se energiza com problemas difíceis e impacto real no cliente, adoraríamos te conhecer.",
    culture: {
      title: "Como é trabalhar no Branchly",
      items: [
        { title: "Remote-first", desc: "Trabalhe de onde quiser. Nosso time está espalhado pelo Brasil e além." },
        { title: "Entrega constante", desc: "Fazemos deploy diariamente. Você verá seu trabalho em produção na mesma semana em que escreveu." },
        { title: "Obcecados pelo cliente", desc: "Cada decisão começa pelo cliente. Conversamos com operadores toda semana." },
        { title: "Equity incluído", desc: "Todo membro fixo do time participa do sucesso da empresa." },
      ],
    },
    openings: {
      title: "Vagas Abertas",
      none: "Nenhuma vaga aberta no momento. Publicamos novas vagas aqui assim que surgem.",
      roles: [
        {
          title: "Engenheiro(a) Full-Stack Sênior",
          dept: "Engenharia",
          type: "CLT / PJ",
          location: "Remoto (Brasil)",
          desc: "Seja dono(a) da experiência do produto — de SSR ao banco de dados — e ajude a entregar a próxima fase da plataforma de atribuição e IA.",
        },
        {
          title: "Gerente de Sucesso do Cliente",
          dept: "Customer Success",
          type: "CLT / PJ",
          location: "Remoto (Brasil)",
          desc: "Seja a ponte entre clientes e produto. Impulsione adoção, retenção e expansão nos segmentos de restaurantes, varejo e saúde.",
        },
      ],
    },
    apply: "Candidatar",
    noMatch: "Não encontrou uma vaga que se encaixe? Mande um e-mail para",
  },
};

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Branchly" },
      { name: "description", content: "Join the Branchly team. Remote-first roles in engineering, product and customer success." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/careers" }],
  }),
  component: CareersPage,
});

function CareersPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <h2 className="font-display mb-6 text-xl font-semibold text-foreground">{c.culture.title}</h2>
      <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {c.culture.items.map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-6">
            <div className="font-medium text-foreground">{item.title}</div>
            <p className="mt-1.5 text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display mb-6 text-xl font-semibold text-foreground">{c.openings.title}</h2>
      <div className="space-y-4 mb-10">
        {c.openings.roles.map((role) => (
          <div key={role.title} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="font-medium text-foreground">{role.title}</div>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{role.dept}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{role.type}</span>
                <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />{role.location}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{role.desc}</p>
            </div>
            <a
              href="mailto:careers@branchly.com.br"
              className="shrink-0 self-start rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {c.apply}
            </a>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {c.noMatch}{" "}
        <a href="mailto:careers@branchly.com.br" className="text-accent hover:underline">
          careers@branchly.com.br
        </a>
        .
      </p>
    </StaticPage>
  );
}

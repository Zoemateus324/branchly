import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const plans = {
  en: [
    {
      key: "free",
      name: "Free",
      desc: "For owners testing the waters.",
      monthly: 0,
      yearly: 0,
      features: ["1 location", "1 AI report / month", "10 reviews analyzed", "Basic reputation score"],
    },
    {
      key: "starter",
      name: "Starter",
      desc: "For independents serious about reputation.",
      monthly: 19,
      yearly: 15,
      features: ["1 location", "Unlimited AI reports", "Benchmarking", "QR Code reviews", "6 months history"],
    },
    {
      key: "pro",
      name: "Pro",
      desc: "For growing multi-location brands.",
      monthly: 29,
      yearly: 23,
      popular: true,
      features: ["5 locations", "Advanced benchmarking", "Location comparison", "24 months history", "PDF reports"],
    },
    {
      key: "premium",
      name: "Premium",
      desc: "For chains and franchises at scale.",
      monthly: 49,
      yearly: 39,
      features: ["15 locations", "API access", "White label (partial)", "Team access", "Automated reports"],
    },
  ],
  pt: [
    {
      key: "free",
      name: "Free",
      desc: "Para quem está começando.",
      monthly: 0,
      yearly: 0,
      features: ["1 unidade", "1 relatório IA/mês", "10 avaliações analisadas", "Score básico"],
    },
    {
      key: "starter",
      name: "Starter",
      desc: "Para independentes que levam reputação a sério.",
      monthly: 19,
      yearly: 15,
      features: ["1 unidade", "Relatórios IA ilimitados", "Benchmarking", "QR Code de avaliações", "6 meses de histórico"],
    },
    {
      key: "pro",
      name: "Pro",
      desc: "Para marcas multi-unidade em crescimento.",
      monthly: 29,
      yearly: 23,
      popular: true,
      features: ["5 unidades", "Benchmarking avançado", "Comparação entre unidades", "24 meses de histórico", "Relatórios PDF"],
    },
    {
      key: "premium",
      name: "Premium",
      desc: "Para redes e franquias em escala.",
      monthly: 49,
      yearly: 39,
      features: ["15 unidades", "Acesso à API", "White label (parcial)", "Acesso para time", "Relatórios automáticos"],
    },
  ],
};

const content = {
  en: {
    eyebrow: "Pricing",
    title: "Simple plans. Serious leverage.",
    subtitle: "Start free. Upgrade when your locations grow.",
    monthly: "Monthly",
    yearly: "Yearly · save 20%",
    mostPopular: "Most popular",
    perMonth: "/mo",
    free: "Get started",
    paid: "Start 14-day trial",
    addon: "Additional location: US$4/location per month beyond the plan's included locations.",
    faq: [
      { q: "Can I change plans anytime?", a: "Yes. Upgrade or downgrade at any time. Prorated credits apply." },
      { q: "Is there a free trial for paid plans?", a: "Yes — Pro includes a 14-day trial with no credit card required." },
      { q: "What counts as a 'location'?", a: "A location is one Google Business Profile connected to Branchly." },
      { q: "Do you offer enterprise pricing?", a: "Yes. For 20+ locations, contact sales@branchly.com.br for a custom quote." },
    ],
  },
  pt: {
    eyebrow: "Planos",
    title: "Planos simples. Alavancagem séria.",
    subtitle: "Comece grátis. Faça upgrade quando suas unidades crescerem.",
    monthly: "Mensal",
    yearly: "Anual · 20% off",
    mostPopular: "Mais popular",
    perMonth: "/mês",
    free: "Começar",
    paid: "14 dias grátis",
    addon: "Unidade adicional: US$4/unidade por mês acima das unidades incluídas no plano.",
    faq: [
      { q: "Posso mudar de plano a qualquer momento?", a: "Sim. Faça upgrade ou downgrade quando quiser. Créditos proporcionais se aplicam." },
      { q: "Há período de teste para planos pagos?", a: "Sim — o Pro inclui 14 dias grátis sem cartão de crédito." },
      { q: "O que conta como 'unidade'?", a: "Uma unidade é um Perfil do Google Meu Negócio conectado ao Branchly." },
      { q: "Vocês têm preço especial para empresas?", a: "Sim. Para 20+ unidades, entre em contato em sales@branchly.com.br." },
    ],
  },
};

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Branchly" },
      { name: "description", content: "Branchly pricing: Free, Starter ($19), Pro ($29) and Premium ($49) plans for local reputation management." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/pricing" }],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { locale, format } = useApp();
  const c = content[locale];
  const localPlans = plans[locale];
  const [yearly, setYearly] = useState(false);

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="mb-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setYearly(false)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${!yearly ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          {c.monthly}
        </button>
        <button
          onClick={() => setYearly(true)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${yearly ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          {c.yearly}
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {localPlans.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.popular
                  ? "border-accent bg-accent/5 shadow-lg"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                  {c.mostPopular}
                </div>
              )}
              <div className="font-display text-base font-semibold text-foreground">
                {plan.name}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.desc}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-3xl font-bold text-foreground">
                  {price === 0 ? format(0, 0).replace("0", "0") : format(price * 5.7, price)}
                </span>
                <span className="mb-1 text-xs text-muted-foreground">{c.perMonth}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/sign-up/$"
                params={{ _splat: "" }}
                className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                  plan.popular
                    ? "bg-foreground text-background hover:opacity-90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {plan.key === "free" ? c.free : c.paid}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">{c.addon}</p>

      <div className="mt-16">
        <h2 className="font-display mb-8 text-2xl font-semibold text-foreground">FAQ</h2>
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {c.faq.map((item) => (
            <div key={item.q} className="px-6 py-5">
              <div className="font-medium text-foreground">{item.q}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </StaticPage>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const testimonials = [
  {
    name: "Mariana Costa",
    role: { en: "Operations Director, Café Network (14 units)", pt: "Diretora de Operações, Rede de Cafés (14 unidades)" },
    rating: 5,
    quote: {
      en: "Before Branchly we had no idea which of our 14 locations was struggling with reputation until it was too late. Now we catch problems in real time and have a clear action plan. Our average rating went from 3.8 to 4.4 in four months.",
      pt: "Antes do Branchly não tínhamos ideia de qual das 14 unidades estava com problema de reputação até que era tarde demais. Agora identificamos problemas em tempo real e temos um plano de ação claro. Nossa nota média subiu de 3,8 para 4,4 em quatro meses.",
    },
  },
  {
    name: "Rafael Mendes",
    role: { en: "Franchise Owner, 5-unit fast food chain", pt: "Franqueado, rede de fast food com 5 unidades" },
    rating: 5,
    quote: {
      en: "The competitive benchmarking alone is worth the subscription. I can see exactly how each of my units compares against competitors in the same neighborhood — and the AI tells me why one location has a 4.7 and another has a 4.1.",
      pt: "O benchmarking competitivo sozinho já vale a assinatura. Consigo ver exatamente como cada unidade minha se compara com concorrentes no mesmo bairro — e a IA me diz por que uma unidade tem 4,7 e outra tem 4,1.",
    },
  },
  {
    name: "Patrícia Oliveira",
    role: { en: "Owner, Dental Clinic Group (3 locations)", pt: "Proprietária, Grupo de Clínicas Odontológicas (3 unidades)" },
    rating: 5,
    quote: {
      en: "The AI-drafted replies save me at least 2 hours a week. They're professional, personalized and actually sound like my practice. The QR code review tool has helped us get 40% more reviews in two months.",
      pt: "As respostas com IA me economizam pelo menos 2 horas por semana. São profissionais, personalizadas e soam como minha clínica. O QR code para avaliações nos ajudou a receber 40% mais avaliações em dois meses.",
    },
  },
  {
    name: "Lucas Andrade",
    role: { en: "Marketing Manager, Retail Chain (8 units)", pt: "Gerente de Marketing, Rede de Varejo (8 unidades)" },
    rating: 5,
    quote: {
      en: "Branchly gave us the data we needed to convince operations to fix the two issues that were dragging down our rating. We now have monthly reports for every location manager with clear KPIs tied to reputation.",
      pt: "O Branchly nos deu os dados que precisávamos para convencer a operação a corrigir os dois problemas que derrubavam nossa nota. Agora temos relatórios mensais para cada gerente de unidade com KPIs claros ligados à reputação.",
    },
  },
];

const stats = {
  en: [
    { value: "4.6★", label: "Average rating improvement after 90 days" },
    { value: "3.2×", label: "More reviews collected with QR code tool" },
    { value: "2h", label: "Per week saved with AI reply drafts" },
    { value: "94%", label: "Of customers would recommend Branchly" },
  ],
  pt: [
    { value: "4,6★", label: "Nota média após 90 dias de uso" },
    { value: "3,2×", label: "Mais avaliações coletadas com QR code" },
    { value: "2h", label: "Por semana economizadas com respostas de IA" },
    { value: "94%", label: "Dos clientes recomendam o Branchly" },
  ],
};

const content = {
  en: {
    eyebrow: "Customers",
    title: "Trusted by reputation-led teams.",
    subtitle: "Operators across Brazil and beyond use Branchly to turn reviews into revenue.",
    cta: "Start free",
    ctaDesc: "Join hundreds of local businesses growing their ratings with Branchly.",
  },
  pt: {
    eyebrow: "Clientes",
    title: "Confiado por times orientados à reputação.",
    subtitle: "Operadores em todo o Brasil usam o Branchly para transformar avaliações em receita.",
    cta: "Comece grátis",
    ctaDesc: "Junte-se a centenas de negócios locais que crescem suas notas com o Branchly.",
  },
};

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Branchly" },
      { name: "description", content: "See how local businesses and multi-location brands use Branchly to improve their reputation and grow ratings." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/customers" }],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { locale } = useApp();
  const c = content[locale];
  const s = stats[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {s.map((st) => (
          <div key={st.label} className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="font-display text-3xl font-bold text-foreground">{st.value}</div>
            <p className="mt-2 text-xs text-muted-foreground">{st.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-14">
        {testimonials.map((t) => (
          <div key={t.name} className="flex flex-col rounded-xl border border-border bg-card p-6">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground italic">
              "{locale === "pt" ? t.quote.pt : t.quote.en}"
            </blockquote>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="font-medium text-sm text-foreground">{t.name}</div>
              <div className="text-xs text-muted-foreground">{locale === "pt" ? t.role.pt : t.role.en}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 px-8 py-10 text-center">
        <p className="mb-4 text-sm text-muted-foreground">{c.ctaDesc}</p>
        <Link
          to="/sign-up/$"
          params={{ _splat: "" }}
          className="inline-flex items-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          {c.cta}
        </Link>
      </div>
    </StaticPage>
  );
}

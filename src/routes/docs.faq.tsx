import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const content = {
  en: {
    eyebrow: "Documentation · FAQ",
    title: "Frequently Asked Questions",
    subtitle: "Answers to the most common questions from Branchly users.",
    faqs: [
      {
        q: "How is the Reputation Score calculated?",
        a: "Your Reputation Score is a 0–100 number combining three weighted factors: your average rating (50%, normalized from 0–5★), review volume on a logarithmic scale that saturates near 1,000 reviews (30%), and recency — how fresh your recent reviews are (20%). You can see the exact breakdown for any location by opening it in Locations.",
      },
      {
        q: "What is the benchmark rating and where does 4.5★ come from?",
        a: "Benchmark is the average rating of the competitors you're tracking. If you haven't added any competitors yet, Branchly uses 4.5★ as a general industry baseline so you always have a reference point to work against.",
      },
      {
        q: "How many locations, competitors and reports can I have?",
        a: "It depends on your plan: Free gives you 1 location and 1 report/month; Starter adds up to 3 competitors and 10 reports/month; Pro raises that to 5 locations, 10 competitors and unlimited reports; Premium unlocks 15 locations and unlimited everything. Full details are in Billing.",
      },
      {
        q: "Are AI-generated replies published automatically?",
        a: "No. Branchly drafts the reply for you to review first. You choose whether to publish it as-is, edit it, or discard it. Nothing is posted on your behalf without your action.",
      },
      {
        q: "Is the attribution pixel safe for LGPD/GDPR compliance?",
        a: "Yes. The pixel does not collect personally identifiable information, does not fingerprint devices, and does not track users across other websites. It only uses first-party cookies and sessionStorage on your own domain.",
      },
      {
        q: "Can I add reviews from platforms without a native integration, like TikTok or Pinterest?",
        a: "Yes. While native OAuth integrations for TikTok and Pinterest are in development, you can log those reviews manually from the Reviews section and they'll count toward your KPIs, sentiment mix and reports just like any other source.",
      },
      {
        q: "Why isn't WhatsApp integration available yet?",
        a: "Two-way WhatsApp Business API messaging is currently in active development. We're building it carefully to handle message templates, opt-in consent and delivery reliability correctly before releasing it.",
      },
      {
        q: "Can I cancel or change my plan at any time?",
        a: 'Yes. Go to Billing and click "Manage subscription" to open the Stripe customer portal, where you can upgrade, downgrade or cancel — changes take effect according to Stripe\'s standard proration rules.',
      },
      {
        q: "How do I remove a location or competitor?",
        a: "In Locations or Competitors, use the row actions to remove an entry. Removing a competitor only affects your benchmark comparison — it does not delete any review history.",
      },
    ],
    next: "Still have questions?",
    nextBody: "Reach out and our team will help directly.",
    cta: "Contact us",
    back: "Back to docs",
  },
  pt: {
    eyebrow: "Documentação · Perguntas Frequentes",
    title: "Perguntas Frequentes",
    subtitle: "Respostas para as dúvidas mais comuns dos usuários do Branchly.",
    faqs: [
      {
        q: "Como o Score de Reputação é calculado?",
        a: "Seu Score de Reputação é um número de 0 a 100 que combina três fatores com pesos diferentes: sua nota média (peso 50%, normalizada de 0–5★), volume de avaliações em escala logarítmica que satura perto de 1.000 avaliações (peso 30%) e recência — quão recentes são suas avaliações (peso 20%). Você pode ver a composição exata de qualquer unidade abrindo-a em Locations.",
      },
      {
        q: "O que é o benchmark e de onde vem o 4,5★?",
        a: "O benchmark é a média das notas dos concorrentes que você está rastreando. Se você ainda não adicionou nenhum concorrente, o Branchly usa 4,5★ como padrão geral do setor, para que você sempre tenha uma referência para comparação.",
      },
      {
        q: "Quantas unidades, concorrentes e relatórios posso ter?",
        a: "Depende do seu plano: o Free dá direito a 1 unidade e 1 relatório/mês; o Starter adiciona até 3 concorrentes e 10 relatórios/mês; o Pro aumenta para 5 unidades, 10 concorrentes e relatórios ilimitados; o Premium libera 15 unidades e tudo ilimitado. Os detalhes completos estão em Billing.",
      },
      {
        q: "As respostas geradas por IA são publicadas automaticamente?",
        a: "Não. O Branchly gera a resposta para você revisar primeiro. Você decide se publica como está, edita ou descarta. Nada é postado em seu nome sem sua ação.",
      },
      {
        q: "O pixel de atribuição é seguro para a LGPD/GDPR?",
        a: "Sim. O pixel não coleta informações pessoalmente identificáveis, não faz fingerprinting de dispositivos e não rastreia usuários em outros sites. Ele usa apenas cookies first-party e sessionStorage no seu próprio domínio.",
      },
      {
        q: "Posso adicionar avaliações de plataformas sem integração nativa, como TikTok ou Pinterest?",
        a: "Sim. Enquanto as integrações nativas via OAuth com TikTok e Pinterest estão em desenvolvimento, você pode registrar essas avaliações manualmente na seção Reviews e elas contam nos seus KPIs, no mix de sentimento e nos relatórios, assim como qualquer outra fonte.",
      },
      {
        q: "Por que a integração com WhatsApp ainda não está disponível?",
        a: "A troca de mensagens via WhatsApp Business API está atualmente em desenvolvimento ativo. Estamos construindo com cuidado para lidar corretamente com templates de mensagem, consentimento de opt-in e confiabilidade de entrega antes de lançar.",
      },
      {
        q: "Posso cancelar ou trocar de plano a qualquer momento?",
        a: 'Sim. Acesse Billing e clique em "Manage subscription" para abrir o portal do cliente da Stripe, onde você pode fazer upgrade, downgrade ou cancelar — as mudanças seguem as regras padrão de rateio (proration) da Stripe.',
      },
      {
        q: "Como remover uma unidade ou concorrente?",
        a: "Em Locations ou Competitors, use as ações da linha para remover um registro. Remover um concorrente afeta apenas sua comparação de benchmark — não apaga nenhum histórico de avaliações.",
      },
    ],
    next: "Ainda tem dúvidas?",
    nextBody: "Entre em contato e nossa equipe vai te ajudar diretamente.",
    cta: "Fale conosco",
    back: "Voltar para as docs",
  },
};

export const Route = createFileRoute("/docs/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Branchly Docs" },
      {
        name: "description",
        content: "Answers to the most common questions from Branchly users.",
      },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/docs/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="rounded-xl border border-border bg-card divide-y divide-border mb-12">
        {c.faqs.map((f) => (
          <div key={f.q} className="px-6 py-6 md:px-8">
            <h2 className="font-semibold text-foreground mb-2">{f.q}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">
            {c.next}
          </h2>
          <p className="text-sm text-muted-foreground">{c.nextBody}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/docs"
            className="rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted"
          >
            {c.back}
          </Link>
          <a
            href="mailto:contato@branchly.com.br"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            {c.cta}
          </a>
        </div>
      </div>
    </StaticPage>
  );
}

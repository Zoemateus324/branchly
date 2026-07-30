import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const UPDATED = "July 30, 2026";
const UPDATED_PT = "30 de julho de 2026";

const content = {
  en: {
    eyebrow: "Legal",
    title: "LGPD Compliance",
    subtitle: `Last updated: ${UPDATED}. Branchly's commitment to Brazil's General Data Protection Law.`,
    intro: "The Lei Geral de Proteção de Dados (LGPD — Law No. 13,709/2018) is Brazil's comprehensive data protection framework. As a Brazilian company operating in Brazil, Branchly Tecnologia Ltda. is subject to the LGPD and is committed to full compliance.",
    sections: [
      {
        title: "1. Data Controller",
        body: "Branchly Tecnologia Ltda. acts as the Data Controller (Controlador) for the personal data processed through the Branchly platform. Our DPO (Encarregado) can be reached at privacidade@branchly.com.br.",
      },
      {
        title: "2. Legal Bases for Processing",
        body: "We process personal data under the following LGPD legal bases (Art. 7): Consent (consentimento) for optional analytics and marketing communications; Contract performance (execução de contrato) to deliver our service; Legitimate interest (legítimo interesse) for fraud prevention and service improvement; Legal obligation (obrigação legal) for tax and compliance records.",
      },
      {
        title: "3. Your Rights Under LGPD",
        body: "Under Art. 18 of the LGPD, you have the right to: (i) confirm whether we process your data; (ii) access your data; (iii) correct incomplete, inaccurate, or outdated data; (iv) anonymize, block, or delete unnecessary or excessive data; (v) port your data to another provider; (vi) delete data processed with your consent; (vii) information about third parties we share your data with; (viii) information about the possibility of denying consent and the consequences; (ix) withdraw consent at any time.",
      },
      {
        title: "4. How to Exercise Your Rights",
        body: "Submit a request to privacidade@branchly.com.br with your full name, CPF (if applicable), email address on the account, and a description of the right you wish to exercise. We will respond within 15 days as required by the LGPD, and will request identity verification before disclosing or modifying data.",
      },
      {
        title: "5. Data Retention",
        body: "We retain personal data for as long as your account is active, plus any period required by Brazilian law (e.g., fiscal records under Lei 9.430/1996). Upon account deletion, personal data is anonymized or permanently deleted within 30 days, except where retention is legally required.",
      },
      {
        title: "6. International Data Transfers",
        body: "Our service uses infrastructure hosted in the United States (Vercel, Supabase, Cloudflare). These transfers are made under standard contractual clauses or to countries with an adequate level of protection as recognized by the ANPD, in accordance with Art. 33 of the LGPD.",
      },
      {
        title: "7. Data Security",
        body: "We implement technical and organizational measures appropriate to the risk, including TLS 1.2+ encryption in transit, encryption at rest, access controls, and regular security reviews. See our Security page for details.",
      },
      {
        title: "8. Incident Notification",
        body: "In the event of a security incident that may result in significant risk or harm to data subjects, we will notify the ANPD (Autoridade Nacional de Proteção de Dados) and affected users within the timeframes established by ANPD Resolution CD/ANPD No. 15/2024 (within 3 business days for ANPD notification of high-risk incidents).",
      },
      {
        title: "9. Consent Management",
        body: "Where consent is the legal basis for processing, you may withdraw it at any time without consequence to the continued use of core service features. Withdrawal of consent does not affect the lawfulness of processing carried out before withdrawal. To manage your consent preferences, contact privacidade@branchly.com.br.",
      },
      {
        title: "10. Children's Data",
        body: "Our service is not directed to individuals under 18 years of age. We do not knowingly collect personal data from children or adolescents. If we become aware of such collection, we will promptly delete the data and notify the responsible guardian.",
      },
      {
        title: "11. ANPD Complaints",
        body: "If you believe your rights have not been respected, you may file a complaint with the Autoridade Nacional de Proteção de Dados (ANPD) at www.gov.br/anpd. We encourage you to contact us first so we may resolve your concern directly.",
      },
      {
        title: "12. DPO Contact",
        body: "Data Protection Officer (Encarregado de Dados): privacidade@branchly.com.br | Branchly Tecnologia Ltda., Brazil.",
      },
    ],
    privacyNote: "This page supplements our full",
    privacyLink: "Privacy Policy",
  },
  pt: {
    eyebrow: "Legal",
    title: "Conformidade com a LGPD",
    subtitle: `Última atualização: ${UPDATED_PT}. O compromisso da Branchly com a Lei Geral de Proteção de Dados do Brasil.`,
    intro: "A Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) é o marco legal brasileiro de proteção de dados pessoais. Como empresa brasileira que opera no Brasil, a Branchly Tecnologia Ltda. está sujeita à LGPD e comprometida com a plena conformidade.",
    sections: [
      {
        title: "1. Controlador de Dados",
        body: "A Branchly Tecnologia Ltda. atua como Controladora dos dados pessoais tratados por meio da plataforma Branchly. Nosso Encarregado (DPO) pode ser contatado em privacidade@branchly.com.br.",
      },
      {
        title: "2. Bases Legais para o Tratamento",
        body: "Tratamos dados pessoais com base nas seguintes hipóteses legais da LGPD (Art. 7º): Consentimento para analytics opcionais e comunicações de marketing; Execução de contrato para a prestação do serviço; Legítimo interesse para prevenção de fraudes e melhoria do serviço; Obrigação legal para registros fiscais e de compliance.",
      },
      {
        title: "3. Seus Direitos pela LGPD",
        body: "Pelo Art. 18 da LGPD, você tem o direito de: (i) confirmar se tratamos seus dados; (ii) acessar seus dados; (iii) corrigir dados incompletos, inexatos ou desatualizados; (iv) anonimizar, bloquear ou eliminar dados desnecessários ou excessivos; (v) portar seus dados a outro fornecedor; (vi) eliminar dados tratados com seu consentimento; (vii) obter informações sobre terceiros com quem compartilhamos seus dados; (viii) informações sobre a possibilidade de negar o consentimento e as consequências; (ix) revogar o consentimento a qualquer momento.",
      },
      {
        title: "4. Como Exercer Seus Direitos",
        body: "Envie uma solicitação para privacidade@branchly.com.br com seu nome completo, CPF (se aplicável), e-mail da conta e descrição do direito que deseja exercer. Responderemos em até 15 dias conforme exigido pela LGPD e solicitaremos verificação de identidade antes de divulgar ou modificar dados.",
      },
      {
        title: "5. Retenção de Dados",
        body: "Retemos dados pessoais pelo tempo em que sua conta estiver ativa, mais o período exigido pela legislação brasileira (ex.: registros fiscais sob a Lei nº 9.430/1996). Após a exclusão da conta, os dados pessoais são anonimizados ou permanentemente excluídos em até 30 dias, salvo exigência legal de retenção.",
      },
      {
        title: "6. Transferências Internacionais de Dados",
        body: "Nosso serviço utiliza infraestrutura hospedada nos Estados Unidos (Vercel, Supabase, Cloudflare). Essas transferências são realizadas sob cláusulas contratuais padrão ou para países com nível adequado de proteção reconhecido pela ANPD, em conformidade com o Art. 33 da LGPD.",
      },
      {
        title: "7. Segurança dos Dados",
        body: "Implementamos medidas técnicas e organizacionais adequadas ao risco, incluindo criptografia TLS 1.2+ em trânsito, criptografia em repouso, controles de acesso e revisões regulares de segurança. Consulte nossa página de Segurança para mais detalhes.",
      },
      {
        title: "8. Notificação de Incidentes",
        body: "Em caso de incidente de segurança que possa resultar em risco ou dano relevante aos titulares, notificaremos a ANPD (Autoridade Nacional de Proteção de Dados) e os usuários afetados nos prazos estabelecidos pela Resolução CD/ANPD nº 15/2024 (em até 3 dias úteis para notificação à ANPD em incidentes de alto risco).",
      },
      {
        title: "9. Gestão do Consentimento",
        body: "Quando o consentimento for a base legal para o tratamento, você pode revogá-lo a qualquer momento sem prejuízo ao uso das funcionalidades essenciais do serviço. A revogação do consentimento não afeta a licitude do tratamento realizado antes dela. Para gerenciar suas preferências de consentimento, contate privacidade@branchly.com.br.",
      },
      {
        title: "10. Dados de Crianças e Adolescentes",
        body: "Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente dados pessoais de crianças ou adolescentes. Caso tomemos conhecimento de tal coleta, excluiremos prontamente os dados e notificaremos o responsável.",
      },
      {
        title: "11. Reclamação à ANPD",
        body: "Se acreditar que seus direitos não foram respeitados, você pode registrar uma reclamação junto à Autoridade Nacional de Proteção de Dados (ANPD) em www.gov.br/anpd. Encorajamos que entre em contato conosco primeiro para que possamos resolver sua preocupação diretamente.",
      },
      {
        title: "12. Contato do Encarregado",
        body: "Encarregado de Dados (DPO): privacidade@branchly.com.br | Branchly Tecnologia Ltda., Brasil.",
      },
    ],
    privacyNote: "Esta página complementa nossa",
    privacyLink: "Política de Privacidade",
  },
};

export const Route = createFileRoute("/lgpd")({
  head: () => ({
    meta: [
      { title: "LGPD — Branchly" },
      { name: "description", content: "Branchly LGPD compliance: your rights under Brazil's General Data Protection Law, how we process your data, and how to contact our DPO." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/lgpd" }],
  }),
  component: LgpdPage,
});

function LgpdPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">{c.intro}</p>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {c.sections.map((s) => (
          <div key={s.title} className="px-6 py-6 md:px-8">
            <h2 className="font-semibold text-foreground mb-2">{s.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        {c.privacyNote}{" "}
        <Link to="/privacy" className="text-accent hover:underline">
          {c.privacyLink}
        </Link>
        .
      </p>
    </StaticPage>
  );
}

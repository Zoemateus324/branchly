import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const UPDATED = "July 30, 2026";
const UPDATED_PT = "30 de julho de 2026";

const content = {
  en: {
    eyebrow: "Legal",
    title: "Terms of Service",
    subtitle: `Last updated: ${UPDATED}`,
    sections: [
      { title: "1. Acceptance", body: "By creating an account or using Branchly, you agree to these Terms. If you are using Branchly on behalf of a company, you represent that you have authority to bind that company to these Terms." },
      { title: "2. The Service", body: "Branchly provides a SaaS platform for reputation monitoring, competitive benchmarking, AI insights and related tools. We reserve the right to modify, suspend or discontinue any part of the service with reasonable notice." },
      { title: "3. Accounts", body: "You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You must notify us immediately of any unauthorized access. Accounts may not be transferred without our written consent." },
      { title: "4. Acceptable Use", body: "You agree not to use Branchly to violate any law, infringe intellectual property rights, upload malware, attempt unauthorized access, scrape our platform for competitive purposes, or submit false or misleading business data." },
      { title: "5. Subscriptions & Billing", body: "Paid plans are billed monthly or annually in advance. If you cancel, your access continues until the end of the current billing period with no refunds for the remaining time, unless required by applicable law. We may change pricing with 30 days' notice." },
      { title: "6. Data & Integrations", body: "By connecting third-party accounts (Google, Facebook, WhatsApp), you authorize Branchly to access and process data from those accounts in accordance with our Privacy Policy. You retain ownership of your data." },
      { title: "7. Intellectual Property", body: "Branchly and its content are owned by Branchly Tecnologia Ltda. and licensed to you for use during your subscription. You may not copy, reproduce or create derivative works without our written consent." },
      { title: "8. Disclaimers", body: 'The service is provided "as is" without warranties of any kind. AI-generated insights, ratings estimates and revenue projections are for informational purposes only — they are not guarantees of business outcomes.' },
      { title: "9. Limitation of Liability", body: "To the maximum extent permitted by law, Branchly shall not be liable for any indirect, incidental, special or consequential damages arising out of or related to your use of the service. Our total liability shall not exceed the fees paid in the twelve months preceding the claim." },
      { title: "10. Indemnification", body: "You agree to indemnify and hold harmless Branchly and its officers from any claim, loss or damage arising from your violation of these Terms or your use of the service." },
      { title: "11. Termination", body: "You may cancel your account at any time. We may suspend or terminate accounts that violate these Terms. Upon termination, your right to use the service ceases immediately." },
      { title: "12. Governing Law", body: "These Terms are governed by the laws of Brazil. Disputes shall be submitted to the courts of São Paulo, Brazil." },
      { title: "13. Contact", body: "Questions about these Terms: contato@branchly.com.br | Branchly Tecnologia Ltda., Brazil." },
    ],
  },
  pt: {
    eyebrow: "Legal",
    title: "Termos de Uso",
    subtitle: `Última atualização: ${UPDATED_PT}`,
    sections: [
      { title: "1. Aceitação", body: "Ao criar uma conta ou usar o Branchly, você concorda com estes Termos. Se estiver usando o Branchly em nome de uma empresa, você declara ter autoridade para vincular essa empresa a estes Termos." },
      { title: "2. O Serviço", body: "O Branchly fornece uma plataforma SaaS para monitoramento de reputação, benchmarking competitivo, insights com IA e ferramentas relacionadas. Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte do serviço com aviso razoável." },
      { title: "3. Contas", body: "Você é responsável pela confidencialidade de suas credenciais de login e por todas as atividades sob sua conta. Notifique-nos imediatamente sobre qualquer acesso não autorizado. Contas não podem ser transferidas sem nosso consentimento por escrito." },
      { title: "4. Uso Aceitável", body: "Você concorda em não usar o Branchly para violar leis, infringir direitos de propriedade intelectual, enviar malware, tentar acesso não autorizado, extrair dados de nossa plataforma para fins competitivos ou enviar dados de negócio falsos ou enganosos." },
      { title: "5. Assinaturas e Faturamento", body: "Planos pagos são cobrados mensalmente ou anualmente de forma antecipada. Ao cancelar, seu acesso continua até o fim do período de faturamento atual, sem reembolso pelo tempo restante, salvo exigência da lei. Podemos alterar preços com 30 dias de aviso." },
      { title: "6. Dados e Integrações", body: "Ao conectar contas de terceiros (Google, Facebook, WhatsApp), você autoriza o Branchly a acessar e processar dados dessas contas conforme nossa Política de Privacidade. Você mantém a propriedade dos seus dados." },
      { title: "7. Propriedade Intelectual", body: "O Branchly e seu conteúdo são de propriedade da Branchly Tecnologia Ltda. e licenciados para uso durante sua assinatura. Você não pode copiar, reproduzir ou criar obras derivadas sem nosso consentimento por escrito." },
      { title: "8. Isenções de Garantias", body: 'O serviço é fornecido "como está", sem garantias de qualquer natureza. Insights gerados por IA, estimativas de notas e projeções de receita são apenas para fins informativos — não são garantias de resultados de negócio.' },
      { title: "9. Limitação de Responsabilidade", body: "Na máxima extensão permitida por lei, o Branchly não será responsável por danos indiretos, incidentais, especiais ou consequentes decorrentes do uso do serviço. Nossa responsabilidade total não excederá as taxas pagas nos doze meses anteriores à reclamação." },
      { title: "10. Indenização", body: "Você concorda em indenizar e isentar o Branchly e seus dirigentes de qualquer reclamação, perda ou dano decorrente de sua violação destes Termos ou de seu uso do serviço." },
      { title: "11. Rescisão", body: "Você pode cancelar sua conta a qualquer momento. Podemos suspender ou encerrar contas que violem estes Termos. Após o encerramento, seu direito de usar o serviço cessa imediatamente." },
      { title: "12. Lei Aplicável", body: "Estes Termos são regidos pelas leis do Brasil. Disputas serão submetidas aos tribunais de São Paulo, Brasil." },
      { title: "13. Contato", body: "Dúvidas sobre estes Termos: contato@branchly.com.br | Branchly Tecnologia Ltda., Brasil." },
    ],
  },
};

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Branchly" },
      { name: "description", content: "Branchly terms of service: your rights and obligations when using the platform." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {c.sections.map((s) => (
          <div key={s.title} className="px-6 py-6 md:px-8">
            <h2 className="font-semibold text-foreground mb-2">{s.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}

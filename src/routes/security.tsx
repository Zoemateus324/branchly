import { createFileRoute } from "@tanstack/react-router";
import { Lock, Shield, Eye, RefreshCw, Server, AlertTriangle } from "lucide-react";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const content = {
  en: {
    eyebrow: "Security",
    title: "Security at Branchly.",
    subtitle: "How we protect your data and maintain the integrity of your reputation intelligence.",
    practices: [
      { icon: "lock", title: "Encryption", body: "All data is encrypted in transit using TLS 1.2+ and encrypted at rest. Secrets and API keys are stored in isolated environment stores and never logged." },
      { icon: "shield", title: "Authentication", body: "Branchly uses Supabase Auth with JWT token validation on every server request. Sessions expire automatically and tokens are never stored in localStorage." },
      { icon: "eye", title: "Access Controls", body: "Row-level security (RLS) is enforced at the database layer — every query is scoped to the authenticated user's data. Our team follows least-privilege access." },
      { icon: "server", title: "Infrastructure", body: "We run on Vercel Edge + Cloudflare with automatic DDoS protection, WAF rules and a globally distributed network with no single point of failure." },
      { icon: "refresh", title: "Monitoring & Patching", body: "We monitor dependencies for known CVEs and apply security patches within 48 hours of disclosure. Production is deployed from CI with automated checks." },
      { icon: "alert", title: "Incident Response", body: "We have a documented incident response plan. Affected customers are notified within 72 hours of a confirmed breach, as required by LGPD and GDPR." },
    ],
    integrations: {
      title: "Third-Party Integration Security",
      body: "When you connect Google, Facebook or WhatsApp accounts, Branchly requests only the minimum necessary permissions. Access tokens are stored encrypted and refreshed automatically. You can revoke access at any time from your dashboard or directly from the third-party platform.",
    },
    vuln: {
      title: "Responsible Disclosure",
      body: "Found a vulnerability? Please report it to security@branchly.com.br with a description of the issue and steps to reproduce. We aim to acknowledge reports within 24 hours and resolve critical issues within 7 days. We do not pursue legal action against good-faith security researchers.",
    },
    contact: "security@branchly.com.br",
  },
  pt: {
    eyebrow: "Segurança",
    title: "Segurança no Branchly.",
    subtitle: "Como protegemos seus dados e mantemos a integridade da sua inteligência de reputação.",
    practices: [
      { icon: "lock", title: "Criptografia", body: "Todos os dados são criptografados em trânsito via TLS 1.2+ e em repouso. Segredos e chaves de API são armazenados em stores de ambiente isolados e nunca são registrados em logs." },
      { icon: "shield", title: "Autenticação", body: "O Branchly usa Supabase Auth com validação de token JWT em cada requisição ao servidor. Sessões expiram automaticamente e tokens nunca são armazenados no localStorage." },
      { icon: "eye", title: "Controles de Acesso", body: "Segurança em nível de linha (RLS) é aplicada na camada do banco de dados — toda consulta é restrita aos dados do usuário autenticado. Nossa equipe segue o princípio do menor privilégio." },
      { icon: "server", title: "Infraestrutura", body: "Rodamos em Vercel Edge + Cloudflare com proteção automática contra DDoS, regras de WAF e rede globalmente distribuída sem ponto único de falha." },
      { icon: "refresh", title: "Monitoramento e Atualizações", body: "Monitoramos dependências em busca de CVEs conhecidos e aplicamos patches de segurança em até 48 horas após a divulgação. O ambiente de produção é implantado via CI com verificações automáticas." },
      { icon: "alert", title: "Resposta a Incidentes", body: "Temos um plano documentado de resposta a incidentes. Clientes afetados são notificados em até 72 horas após uma violação confirmada, conforme exigido pela LGPD e GDPR." },
    ],
    integrations: {
      title: "Segurança em Integrações de Terceiros",
      body: "Quando você conecta contas do Google, Facebook ou WhatsApp, o Branchly solicita apenas as permissões mínimas necessárias. Tokens de acesso são armazenados criptografados e atualizados automaticamente. Você pode revogar o acesso a qualquer momento pelo painel ou diretamente na plataforma de terceiros.",
    },
    vuln: {
      title: "Divulgação Responsável",
      body: "Encontrou uma vulnerabilidade? Reporte para security@branchly.com.br com uma descrição do problema e os passos para reproduzi-lo. Buscamos confirmar relatórios em até 24 horas e resolver problemas críticos em até 7 dias. Não iniciamos ações legais contra pesquisadores de segurança de boa-fé.",
    },
    contact: "security@branchly.com.br",
  },
};

const ICONS: Record<string, typeof Lock> = {
  lock: Lock, shield: Shield, eye: Eye,
  server: Server, refresh: RefreshCw, alert: AlertTriangle,
};

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security — Branchly" },
      { name: "description", content: "Branchly security practices: encryption, authentication, access controls and responsible disclosure." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/security" }],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const { locale } = useApp();
  const c = content[locale];

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.practices.map((p) => {
          const Icon = ICONS[p.icon] ?? Shield;
          return (
            <div key={p.title} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-medium text-foreground">{p.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display mb-3 text-lg font-semibold text-foreground">{c.integrations.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{c.integrations.body}</p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 md:p-8">
        <h2 className="font-display mb-3 text-lg font-semibold text-foreground">{c.vuln.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground mb-3">{c.vuln.body}</p>
        <a href={`mailto:${c.contact}`} className="text-sm text-accent hover:underline">{c.contact}</a>
      </div>
    </StaticPage>
  );
}

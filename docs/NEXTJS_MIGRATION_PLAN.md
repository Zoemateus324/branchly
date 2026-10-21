# Branchly — Migração incremental para SaaS horizontal

## Diagnóstico do código existente (2026-10-21)

A aplicação atual é **Node.js 24 com servidor HTTP nativo, frontend HTML/CSS/JavaScript, SQLite local e adaptador Supabase**, conforme `package.json`, `README.md` e `supabase/migrations/20261019_branchly.sql`. Já contém autenticação, propostas, contatos derivados, tarefas, relatórios, importação CSV, integração Efí, Resend e WhatsApp e alguns testes. **Não é ainda um aplicativo Next.js.**

### Princípios para a migração

1. Preservar a implementação existente até a substituição e testes de cada fluxo. Não editar ou apagar `src/`, `public/`, `api/` nem migrations atuais nesta etapa.
2. Criar um aplicativo Next.js em uma pasta isolada (`apps/web`), evitando conflito com a aplicação e o deploy legados.
3. Utilizar Supabase Auth e PostgreSQL como identidade e armazenamento compartilhados, após revisar a migração atual. O modelo atual vincula um perfil a uma única organização; a nova arquitetura exige uma tabela de memberships para multiempresa real.
4. Migrar dados existentes explicitamente antes de desligar SQLite/Efí. Não executar migrations destrutivas, não duplicar cobrança e não ativar Asaas sem teste em sandbox.
5. Separar dois escopos financeiros: assinatura da plataforma e cobranças dos clientes dos tenants. Usar webhooks autenticados, inbox persistente, idempotência e reconciliação.
6. Executar automações num worker separado com outbox, jobs persistentes, retries, dead-letter e limites por organização. O editor React Flow manipula fluxos JSON versionados; nunca executa código de usuários.
7. Preservar os testes atuais e acrescentar testes RLS, multiempresa, CRM, propostas, pagamentos e workflows. Fazer lançamento por feature flag e rollback claro.

## Ordem de implementação

| Marco | Entrega | Critério de aceite |
| --- | --- | --- |
| M0 | Auditoria, branch separada, compatibilidade e documentação | Legado intacto e plano aprovado no PR |
| M1 | Next.js, Tailwind, autenticação Supabase e shell de dashboard | Login, logout, onboarding e testes básicos |
| M2 | Organizações, memberships e políticas RLS | Nenhum acesso cruzado entre tenants |
| M3 | Contatos, empresas, pipelines, deals e importação CSV | CRUD, Kanban e importação idempotente |
| M4 | Propostas versionadas com aceite | Fluxo auditável da proposta |
| M5 | Asaas para billing Branchly e conexão de contas dos tenants | Webhooks autenticados, sandbox e conciliação |
| M6 | Motor nativo de automações e modelos prontos | Jobs resilientes sem duplicações |
| M7 | Dashboard de pagamentos e conversões | Métricas reconciliadas, sem dados fictícios em produção |
| M8 | Editor visual, integrações e IA opt-in | Versionamento, limites, auditoria e permissões |

## Mapa inicial dos componentes atuais

- `src/server.mjs`: servidor HTTP atual; substituir endpoints progressivamente.
- `src/store.mjs`: persistência legada SQLite; planejar exportação/importação.
- `api/supabase.mjs`: adaptador Supabase serverless; auditar contratos antes de alterar.
- `supabase/migrations/20261019_branchly.sql`: schema atual com `branchly_profiles.org_id` e `branchly_proposals`; **não sobrescrever**.
- `src/efi.mjs`: cobrança existente; substituir por Asaas apenas após conciliação de assinaturas ativas.
- `public/app.js`, `public/pages.js` e `public/styles.css`: interface e jornadas atuais; servir como referência funcional.
- `tests/`, `supabase/tests/`: testes de regressão existentes.

## Portões de segurança antes de produção

- Credenciais ficam apenas em variáveis de ambiente server-side; nenhuma chave Asaas ou service-role em JavaScript de navegador.
- Migrations aditivas, com scripts de rollback e backups testados.
- Não disparar WhatsApp ou e-mail comercial sem base legal e regras de opt-out.
- Billing e automações têm idempotência comprovada por testes.
- Conexões de integração são isoladas por tenant e segredos criptografados.

## Próximo incremento de código

Criar a aplicação Next.js isolada, com configuração de TypeScript, estrutura de layouts, design tokens e clientes Supabase SSR; não mudar o roteamento da Vercel até o novo fluxo estar validado.

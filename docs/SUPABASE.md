# Supabase — integração 0.3.0

Projeto: `prvcdlpxnmarpshcgyyp`. A URL e a chave publishable são identificadores públicos. Elas não autorizam criar tabelas, configurar Auth ou ignorar RLS. Nenhuma chave privilegiada é incluída no código.

## Aplicar a estrutura

Execute **somente** `supabase/migrations/20261019_branchly.sql` no SQL Editor do projeto correto ou pela integração autorizada de migrações. O script cria tabelas com prefixo `branchly_`, políticas RLS, permissões por coluna e funções de criação de workspace e limite de IA. Não migra registros de bancos SQLite existentes.

Os arquivos em `supabase/tests/` são uma fixture de PostgreSQL isolado para CI: **não execute bootstrap.sql em um projeto Supabase real**.

Após aplicar, verifique a criação das tabelas e as políticas. Os testes de CI conferem sintaxe, reaplicação e cenários de isolamento em PostgreSQL 16 com uma fixture mínima de Auth; não substituem a homologação do projeto real.

## Configuração de autenticação

No projeto Supabase, em Authentication > URL Configuration:

- Site URL: `https://branchly-wi6f.vercel.app` (ou o domínio final).
- Redirect URLs: `https://branchly-wi6f.vercel.app/confirmar-email` e `https://branchly-wi6f.vercel.app/redefinir-senha`.
- Se usar o outro projeto Vercel ou previews, cadastre explicitamente os endereços necessários. Evite curingas amplos para domínios de terceiros.

Mantenha confirmação de e-mail e configure SMTP para um lançamento comercial. O envio padrão do Supabase tem limites próprios. Confira também os modelos de e-mail e habilitação de cadastro por e-mail/senha.

## Vercel

Sem `BACKEND_ORIGIN`, a função proxy usa o adaptador Supabase. Os valores públicos fornecidos pelo usuário estão em `src/supabase-config.mjs`; podem ser substituídos por `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nas variáveis do projeto. Não é necessário publicar uma chave secreta para autenticação e CRUD.

`APP_URL` deve refletir a origem pública usada no cadastro e login. Sem ela, o adaptador usa a URL de produção informada pela Vercel ou o host validado da requisição. Links de confirmação e recuperação precisam estar na allowlist do Supabase.

As sessões usam cookies HttpOnly, Secure em HTTPS e SameSite=Lax. Tokens não são salvos no localStorage nem retornados no JSON de login. A confirmação por link troca os tokens do fragmento por cookies e limpa o fragmento da URL.

O banco valida os dados pela identidade do usuário (Bearer JWT e RLS). O usuário não pode modificar a empresa, o papel de acesso ou o período pago por um PATCH de perfil.

## Disponível no adaptador Supabase

Cadastro, confirmação de e-mail, login, refresh, logout, recuperação/troca de senha; workspace por usuário, perfil e nome da empresa; orçamentos, CSV, tarefas, contatos derivados, relatórios e histórico; sugestões OpenAI se a chave/modelo estiverem configurados.

O cadastro não cria uma conta Auth se as tabelas ainda estiverem ausentes. Usuários antigos do Supabase ganham workspace no primeiro acesso, com base no metadata de nome/empresa ou valores padrão.

## Integrações que ainda precisam de adaptação

No modo Supabase, envio WhatsApp/Resend comercial, convites de equipe, cobranças Efí, notificações de pagamento e n8n ainda retornam indisponibilidade explícita. Não usam o banco SQLite da outra implementação e não simulam sucesso.

O backend Node persistente continua disponível por `BACKEND_ORIGIN` para a implementação anterior. Não alterne ambientes/bancos sem uma estratégia de migração de dados e de sessões. Nenhuma cobrança real ou mensagem comercial foi criada nesta atualização.

## Estado da aplicação do SQL

A integração Supabase foi confirmada como instalada, mas as operações de SQL não foram expostas à sessão de execução durante esta preparação. Não se deve registrar a migração como aplicada até haver retorno confirmado da ferramenta ou do SQL Editor.

# Branchly

Implementação independente do SaaS de acompanhamento comercial com IA. Público inicial: empresas de serviços, com exemplos de climatização. O lançamento segue cadastro direto e demonstração interativa, sem depender de entrevistas.

## Executar

Requer Node.js 24. Não há dependências de terceiros em tempo de execução.

```bash
cp .env.example .env
npm start
```

Abra `http://localhost:3000`. Explore `/demo` sem conta ou crie uma conta em `/cadastro`. O cadastro cria uma empresa vazia e acesso inicial de sete dias. Os dados fictícios ficam exclusivamente na demonstração.

```bash
npm run check
npm test
```

## Atualização 0.2.0

- Ícones com dimensões intrínsecas de 20 px, limites por contexto de 16–28 px e ausência de SVGs com tamanho padrão de 300 × 150.
- Menu público mobile acessível e navegação da área privada com rolagem controlada.
- Páginas públicas: como funciona, integrações, climatização, central de ajuda com busca e caminhos de contato.
- Páginas privadas: primeiros passos, perfil, segurança, histórico, ajuda, detalhes de orçamento e cliente.
- Perfil com atualização real do nome e troca de senha com encerramento das outras sessões.
- 31 testes automatizados passaram. Inspeção visual em navegador permanece pendente.

## Entregue

- Home, produto, preços, segurança, minutas de privacidade/termos e demonstração pública interativa.
- Animações explicativas com pausa, transições e preferência por movimento reduzido.
- Cadastro, login, sessão de sete dias, confirmação de e-mail e recuperação de senha.
- Empresas isoladas no servidor, responsável e membros, convites de equipe com até três pessoas.
- Cadastro/edição/exclusão de orçamentos, cinco situações, contexto, consentimento e próximo contato.
- Tarefas, diretório de contatos derivados das propostas, relatórios e histórico operacional.
- CSV com importação atômica, exportação e neutralização de fórmulas de planilha.
- IA: adaptador da Responses API da OpenAI com limite diário por empresa e revisão humana.
- WhatsApp oficial: configuração criptografada por empresa, webhook assinado e envio de texto na janela de 24 horas.
- E-mail Resend: confirmação, recuperação, convites e mensagens comerciais explicitamente aprovadas.
- Efí: autorização OAuth, link avulso do piloto, link de assinatura mensal, consulta de notificações, reconciliação, cancelamento da recorrência e controle de acesso pelo período pago.
- n8n: apenas um webhook de teste autenticado. Não há fluxos automáticos de acompanhamento nesta versão.
- Contagens de abertura da demonstração/cadastro e eventos internos de ativação/pagamento, sem identificar visitantes anônimos.

## Estado real das integrações

Nenhum segredo real acompanha o projeto. As conexões dependem de configuração e homologação. Os testes usam respostas simuladas dos provedores e não enviam mensagens nem criam cobranças reais.

Leia [docs/INTEGRACOES.md](docs/INTEGRACOES.md) e [docs/DEPLOY.md](docs/DEPLOY.md). A UI distingue demonstração, configuração presente e ambiente de homologação. Configuração presente não comprova que o provedor foi homologado.

## Publicação na Vercel

As páginas públicas e a demonstração usam as rotas explícitas de `vercel.json`. Para login, cadastro e operações reais, configure `BACKEND_ORIGIN` na Vercel apontando para o servidor Node com volume persistente. Sem essa conexão, a API retorna uma mensagem de indisponibilidade; não existe autenticação simulada. Veja `docs/DEPLOY.md`.

## Arquitetura

Node.js 24, HTTP nativo, SQLite em WAL, CSS e JavaScript sem framework. O objetivo é executar a primeira versão sem instalação de pacotes ou serviços de banco pagos. É um projeto independente: não modifica nem depende do fork do Twenty encontrado no GitHub.

O processo da aplicação e o banco precisam de disco persistente. Não funciona como simples upload estático nem em funções serverless com disco efêmero. Para escalar horizontalmente será necessário migrar os dados e coordenação para uma infraestrutura compartilhada; os limites atuais são de uma instância.

## Limites antes do lançamento comercial

- Hospedagem, domínio HTTPS, novos segredos e homologação dos provedores ainda não configurados.
- Minutas legais exigem identificação do operador, contato de privacidade, suporte e condições comerciais finais.
- Revisão visual em navegador e testes móveis ainda pendentes; este ambiente não disponibilizou controle de navegador compatível.
- Não há GA4, Google Ads, Meta Ads, OAuth de redes sociais, integração Twenty/Supabase, templates de WhatsApp, calendário, MFA ou fluxos autônomos. Esses recursos não são simulados como ativos.
- Não há verificação independente de segurança ou teste de carga. Não presumir prontidão de produção apenas pelos testes automatizados.
- Gestão de exclusão completa de conta, remoção de membros, reembolsos e reconciliação de cobranças órfãs requerem operação administrativa nesta versão.
- Limites: 2.000 propostas/empresa, 100 linhas por importação, 1 MB por requisição, três usuários/empresa, 20 sugestões IA/dia por padrão.
- Transações aceitas pelo WhatsApp/Resend são registradas como aceitas, não como entrega confirmada. O recebimento de novas mensagens WhatsApp é usado para a janela de atendimento; ainda não há inbox de conversas.

## GitHub

Código preparado para `Zoemateus324/branchly`. A atualização 0.2.0 é enviada em `codex/complete-pages-fix-icons`, com revisão por pull request antes de integrar na `main`.

Não publique `.env`, banco de dados, backups, tokens ou credenciais. O pacote e o envio ao GitHub excluem esses itens. A configuração da implantação continua exigindo segredos próprios no servidor.

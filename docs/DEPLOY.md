# Implantação

## Hospedagem inicial

Um processo Node 24 com volume persistente, atrás de proxy HTTPS. Não há implantação realizada nem domínio alterado nesta entrega. A opção de uma instância é adequada ao piloto, sujeita a carga e recursos do servidor; não é uma promessa de capacidade.

```bash
npm run check
npm test
npm start
```

Configure `APP_URL` com a origem externa exata. Em produção, `NODE_ENV=production` exige HTTPS, Resend configurado e chave de criptografia. Use segredos próprios da hospedagem, sem valores em comandos, commits ou tickets.

## Docker

```bash
docker build -t branchly .
docker run --env-file .env -p 127.0.0.1:3000:3000 -v branchly-data:/app/data branchly
```

O container trabalha com usuário sem root. Confira acesso ao volume. O arquivo `.env` deve ter permissão restrita e não ser copiado para a imagem. Não use o banco em armazenamento efêmero.

Exemplo Caddy (`Caddyfile.example`): substitua o domínio e a porta conforme a hospedagem. Se usar `TRUST_PROXY=1`, o proxy precisa **sobrescrever** `X-Real-IP`; não exponha diretamente a porta da aplicação à internet. Sem isso o rate limiting enxerga o IP do proxy e pode limitar usuários distintos juntos.

## Efí e acesso

Banco exclusivo para cada ambiente Efí. Faça homologação com credenciais novas, callback HTTPS, plano mensal e domínios oficiais do checkout. Faça os testes de pagamento, notificação duplicada, falha, renovação, cancelamento e reembolso antes de abrir cobrança real. A API Pagamento de Contas não é necessária para receber assinaturas.

## Dados e recuperação

Faça backups consistentes com o utilitário SQLite usando `.backup`, ou snapshot consistente do volume. Não copie apenas o arquivo principal enquanto WAL estiver ativo. Proteja também a chave de criptografia separadamente. Teste uma restauração em ambiente isolado; defina retenção e responsáveis antes de cadastrar clientes reais.

A aplicação remove sessões/tokens/convites expirados a cada hora. Propostas, mensagens, logs e eventos não têm retenção automática nesta versão; defina a política e a exclusão administrativa conforme os documentos legais finais.

## Validação realizada

31 testes automatizados passaram na atualização 0.2.0, com banco SQLite em memória e HTTP local. Provedores externos foram simulados. Não houve cobrança real nem uso de credenciais de produção. Verificação de sintaxe dos módulos concluída.

Não foi possível realizar QA visual em navegador neste ambiente por ausência do controle de navegador compatível. A responsividade e o movimento reduzido estão implementados em CSS e precisam de inspeção em desktop/mobile antes da publicação.

## Operação comercial sem entrevistas

Publique a demonstração, leve o tráfego qualificado ao cadastro e acompanhe uso e contratação. Os eventos locais são contagens, não usuários únicos e não atribuem origem de mídia.

Consulta agregada para o operador:

```sql
SELECT event,COUNT(*) AS total FROM funnel_events GROUP BY event;
```

Use contas com primeira proposta, uso semanal e pagamentos confirmados como sinais principais. Sem clientes pagantes, não ampliar o gasto em anúncios. Taxa de fechamento ou meta de R$ 40 mil não é garantida pelo código.

## Pendências objetivas

1. Revisar e integrar o pull request de atualização no repositório `Zoemateus324/branchly`.
2. Credenciais Efí substituídas, remetente de e-mail, modelo/chave de IA e configuração Meta.
3. Hospedagem com volume, domínio, TLS, backup e alertas.
4. QA visual, homologação real e revisão independente das regras de acesso/pagamento.
5. Dados do fornecedor e documentos legais finalizados.

Google Ads/Meta Ads/GA4, Pix direto com certificado, Pix Automático, inbox WhatsApp e workflows n8n são escopos posteriores, ainda não implementados.

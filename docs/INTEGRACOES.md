# Integrações

## Efí Bank — provedor escolhido

As credenciais compartilhadas na conversa não foram utilizadas nem copiadas. Revogue os pares expostos e forneça novos valores no gerenciador de segredos da hospedagem. Use credenciais diferentes e bancos separados para homologação e produção.

Esta implementação usa **API Cobranças**, não a API Pagamento de Contas. A API Pix direta, que exige certificado e configuração própria, não foi implementada. Pix/Bolix pode aparecer no link do piloto conforme as opções efetivamente habilitadas na conta Efí. Não anunciar Pix Automático como implementado.

Variáveis:

- `EFI_ENV`: `sandbox` por padrão, `production` somente depois de homologar.
- `EFI_CLIENT_ID` e `EFI_CLIENT_SECRET`: credenciais novas do ambiente correspondente.
- `EFI_PLAN_ID`: plano mensal, intervalo 1, repetições indefinidas (`null`). Deve aparecer entre os primeiros 100 planos consultados. O checkout confere essas condições antes de criar a assinatura.
- `EFI_PAYMENT_HOSTS`: lista exata de domínios autorizados para o checkout. Padrão oficial documentado: `pagamento.gerencianet.com.br`. Se a homologação retornar outro domínio oficial, confira com a Efí antes de adicioná-lo.
- `APP_URL`: origem HTTPS pública, usada em `/api/webhooks/efi`.

Para preparar o plano no ambiente configurado, após fornecer credenciais novas:

```bash
node --env-file=.env scripts/create-efi-plan.mjs
```

A execução cria um plano real no ambiente selecionado; use primeiro `EFI_ENV=sandbox`. Não foi executada durante a entrega. Copie o ID retornado para `EFI_PLAN_ID` no ambiente correspondente.

Fluxo de contratação:

1. Responsável confirmado escolhe piloto (R$ 490,00 / 30 dias) ou assinatura (R$ 1.490,00 / mês).
2. O servidor define o valor em centavos, sem aceitar preço enviado pelo navegador.
3. Piloto: link avulso, modalidades disponíveis na conta. Assinatura: checkout de cartão, plano mensal de duração indefinida.
4. O cliente autoriza o pagamento na página da Efí. A Branchly não coleta dados de cartão.
5. A Efí envia o token de notificação via POST form-urlencoded. O servidor consulta esse token com OAuth e consulta a cobrança conhecida.
6. Só `paid`/`settled`, ID e valor correspondentes liberam acesso. Cada cobrança libera uma única vez. Recorrências futuras são associadas pela assinatura conhecida e consultadas na API.
7. `active` de assinatura, isoladamente, não significa pagamento. Acesso exige período pago ou teste válido.
8. Reembolso, contestação e chargeback retiram a elegibilidade daquela cobrança. Cancelar assinatura encerra futuras renovações e preserva o período já pago.

O banco deve separar os ambientes. Nunca aponte uma implantação de produção para um banco usado em sandbox. O webhook deve estar acessível por HTTPS e sem desafio interativo do proxy. A API Cobranças confirma a notificação por consulta autenticada; não se usa o esquema de assinatura do Stripe.

O botão “Atualizar situação” reconcilia até cinco cobranças locais recentes. Há risco operacional se a Efí aceitar um checkout e a aplicação cair antes de salvar a resposta: confira cobranças órfãs no painel Efí. Não há idempotência remota garantida pelo adaptador. O processo evita concorrência de checkout na mesma instância e reutiliza links recentes.

## OpenAI

Defina `OPENAI_API_KEY`, `OPENAI_MODEL` e opcionalmente `AI_DAILY_LIMIT`. O nome do modelo é configurável, sem suposição de disponibilidade. A requisição envia cliente, serviço, situação e notas; `store:false`. Não incluir dados sensíveis. Falhas não são transformadas em sugestões falsas; tentativas contam no limite de proteção de custo.

## WhatsApp oficial

No servidor: `ENCRYPTION_KEY` (32 bytes base64), `META_GRAPH_VERSION`, `META_APP_SECRET`, `META_VERIFY_TOKEN`. Confirme a versão suportada pela sua aplicação Meta.

No painel Integrações, o responsável informa ID do número e token com permissões de mensagens. O token é criptografado com AES-256-GCM. A chave de criptografia exige backup separado e protegido; perdê-la impede ler as conexões existentes.

Configure na Meta o callback HTTPS `/api/webhooks/whatsapp`; assine mensagens recebidas e valide o desafio de configuração. Uma mensagem inbound válida abre a janela de atendimento para o telefone correspondente. O sistema envia apenas texto, com consentimento e aprovação explícita. Fora de 24 horas, bloqueia o envio: templates ainda não implementados.

## Resend

Defina `RESEND_API_KEY` e `MAIL_FROM` com domínio/remetente verificado. Confirmação e reset expiram em uma hora; convites, em 24 horas. Em produção a integração exige e-mail confirmado.

## n8n

Defina um `N8N_WEBHOOK_URL` HTTPS fixo e `N8N_WEBHOOK_SECRET`. O botão de teste envia somente tipo, ID da empresa e horário, com bearer token. Não há disparo recorrente nem sincronização automática de propostas.

## Fontes técnicas consultadas

- https://dev.efipay.com.br/docs/api-cobrancas/credenciais/
- https://dev.efipay.com.br/docs/api-cobrancas/link-de-pagamento/
- https://dev.efipay.com.br/docs/api-cobrancas/assinatura/
- https://dev.efipay.com.br/docs/api-cobrancas/notificacoes/
- https://dev.efipay.com.br/docs/api-cobrancas/cartao/
- https://developers.openai.com/api/reference/resources/responses/methods/create
- https://www.postman.com/meta/whatsapp-business-platform/request/8gvd47s/send-text-message
- https://github.com/resend/resend-openapi

Todos os contratos precisam ser homologados no ambiente real antes do lançamento. As fontes fundamentam os adaptadores; não comprovam a configuração da conta do usuário.

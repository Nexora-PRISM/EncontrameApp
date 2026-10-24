@AGENTS.md

## Demanda futura — Premium e pets

Removidos do app em 17/10/2026. Não implementar agora: sem telas, menu, Configurações, Central de Ajuda, flags de ambiente nem serviços.

Quando os sócios pedirem de volta:

- Plano Premium, com preço de referência de R$ 9,90 por mês. Plano anual e teste grátis só entram junto com cobrança de verdade.
- Busca de pessoas desaparecidas e as funções de emergência continuam gratuitas. Nunca vão para o Premium.
- Pets desaparecidos fazem parte do Premium: qualquer pessoa vê e divulga; cadastrar exige conta. Foto, cidade e telefone. Sem endereço completo.
- Contrato previsto na API: `GET /Subscription/me` e `GET`/`POST /MissingPet`. Sem esses endpoints, o recurso não volta para produção.
- Não há compra dentro do app até existirem a cobrança pela loja (Google Play Billing) e a API de assinaturas.

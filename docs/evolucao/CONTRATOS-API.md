# Contratos de API propostos para o backend .NET

O backend fica em outro repositório (privado), consultado **só para leitura**: nada foi alterado lá. Os contratos abaixo são **propostas**: o app já está pronto para eles (repositório axios), mas cada recurso só deve
ser ligado em produção depois que a API existir e for testada. Até lá, a variável `EXPO_PUBLIC_ENABLE_*` correspondente fica desligada em produção.

Convenções seguidas, iguais às do app atual: JSON em camelCase, autenticação pelo token da sessão (header
`Authorization`), header `X-App-Key`, `Accept-Language` com o idioma da tela, datas em ISO 8601 (UTC).

## O que a API de hoje já tem (consulta somente leitura em 30/10/2026)

O backend foi consultado só para leitura, sem nenhuma alteração. Como esta branch fica num repositório público,
aqui entram só comportamentos que o próprio app já deixa ver, sem detalhes internos da API (o repositório da API é
privado). Pontos que afetam os contratos abaixo:

- Rotas no padrão `/<Recurso>` sob `/api` (o `EXPO_PUBLIC_API_URL` do app já termina em `/api`). Toda mudança no
  backend segue as regras do repositório da API, inclusive testes unitários e de integração.
- **Avistamento hoje:** `POST /MissingPerson/{id}/last-seen` vira na hora o último local do caso e gera aviso para
  quem acompanha o caso. **Não há análise antes.**
- O histórico de avistamentos devolve quando o registro foi feito, mas não quando a pessoa foi vista.
- Situações do caso: 1 Pendente, 2 Procurado, 3 Encontrado, 4 Alerta, 99 Cancelado. Só a equipe muda a situação,
  com transições permitidas. O histórico das mudanças já fica guardado no servidor, mas não há endpoint que o devolva.
- Denúncias aceitam mensagem do grupo, caso e aviso de segurança; ainda não há denúncia de relato.

---

## Etapa 1 — Relato de avistamento ("Eu vi essa pessoa")

Variável no app: `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS`. Código: `src/services/sightings/sightings.axios.repository.ts`.

### `POST /SightingReport` — enviar um relato

Exige conta conectada.

```json
{
  "missingPersonId": 123,
  "location": "Rua da Bahia, 1000 - Centro, Belo Horizonte",
  "city": null,
  "neighborhood": null,
  "latitude": -19.9227,
  "longitude": -43.9451,
  "locationSource": "gps",
  "referencePoint": "em frente à farmácia",
  "seenAt": "2026-10-30T16:30:00.000Z",
  "timeIsApproximate": true,
  "description": "Estava sentada no ponto de ônibus e parecia confusa.",
  "clothes": "casaco azul e calça jeans",
  "features": "cabelo preso, mochila vermelha",
  "direction": "a pé, em direção ao centro",
  "details": null,
  "photo": "<base64 JPG/PNG, até 2 MB, opcional>"
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `missingPersonId` | número | sim | Caso ativo; recusar caso encerrado ou inexistente (404/409) |
| `location` | texto | sim | Endereço ou "Localização atual" |
| `latitude`, `longitude` | número | sim | Ponto marcado (GPS, toque no mapa ou endereço) |
| `locationSource` | `gps` \| `map` \| `address` | sim | Como o ponto foi indicado |
| `seenAt` | ISO 8601 | sim | Não pode estar no futuro (tolerância de 5 min) |
| `timeIsApproximate` | booleano | sim | |
| `description` | texto 10–1000 | sim | |
| `clothes`, `features`, `direction`, `referencePoint` | texto até 300 | não | |
| `details` | texto até 1000 | não | |
| `photo` | base64 | não | Vai só para a análise. **Nunca publicar automaticamente.** |

Resposta `201`:

```json
{ "sightingReportId": 4567, "status": "received", "receivedAt": "2026-10-30T16:31:02.000Z" }
```

O app só mostra "Relato recebido" quando a resposta traz `sightingReportId` **e** `receivedAt`. Qualquer outra resposta
aparece como "não confirmado".

Regras que o servidor precisa garantir:

1. **O relato não muda o caso.** Não altera o último local, o mapa público nem o histórico público. Só uma decisão
   humana (moderação ou família autorizada) transforma um relato em informação do caso.
2. **Nada é publicado automaticamente**, em especial fotos e a localização exata do avistamento.
3. **Limite de envio** por conta e por caso (sugestão: 3 relatos a cada 10 minutos; resposta `429`). O app já tem
   um limite igual, só na memória do aparelho.
4. Registro de quem enviou (o uso não é anônimo) e de cada mudança de situação (quem, quando, situação anterior e nova).
5. Possibilidade de denúncia de abuso e de associação do relato ao caso correto pela moderação.

### `GET /SightingReport/mine` — relatos da conta logada

Resposta `200`:

```json
[
  {
    "sightingReportId": 4567,
    "missingPersonId": 123,
    "missingPersonName": "Maria",
    "status": "pending_review",
    "seenAt": "2026-10-30T16:30:00.000Z",
    "location": "Rua da Bahia, 1000 - Centro, Belo Horizonte",
    "receivedAt": "2026-10-30T16:31:02.000Z",
    "updatedAt": "2026-10-30T17:05:00.000Z",
    "hasPhoto": true
  }
]
```

Mais recentes primeiro. Só os relatos da própria conta.

### Situações (`status`)

| Valor | Na tela | Significado |
|---|---|---|
| `received` | Recebido | O servidor recebeu |
| `pending_review` | Aguardando análise | Na fila da equipe |
| `in_review` | Em análise | Uma pessoa está verificando |
| `relevant` | Considerado relevante | Útil para o caso. **Não** confirma que era a pessoa |
| `not_confirmed` | Não confirmado | Não foi possível confirmar |
| `closed` | Encerrado | Análise terminada |

O app também aceita os nomes em português, com ou sem acento. Valor desconhecido aparece como "Recebido".

### Como encaixar no backend (sugestão)

- Um registro novo de relato (quem enviou, caso, campos do relato, situação, data) e o histórico de cada mudança de
  situação (quem mudou, quando, situação anterior e nova, justificativa) para a auditoria.
- Endpoints autenticados seguindo a arquitetura e as regras de testes do repositório da API.
- Quando a equipe aprovar um relato como informação do caso, o servidor cria o registro de "visto por último" (com a
  data em que a pessoa foi vista) e só então avisa quem acompanha o caso. Assim o aviso deixa de sair para relatos
  não verificados.
- Permitir denunciar um relato (abuso), como já acontece com casos e avisos de segurança.

### Endpoints de moderação (para a etapa 4, ainda não usados pelo app)

Sugestão para o painel de análise: `GET /SightingReport?missingPersonId=&status=`, `PATCH /SightingReport/{id}/status`
(com justificativa obrigatória), `POST /SightingReport/{id}/link` (associar a outro caso) e registro de auditoria.

---

## Endpoints que o app atual já usa e continuam iguais

`POST /MissingPerson/{id}/last-seen` e `GET /MissingPerson/{id}/last-seen/history` continuam sendo usados quando
`EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` está desligada (comportamento de hoje, em produção).

---

## Etapa 2 — Linha do tempo do caso

Variável no app: `EXPO_PUBLIC_ENABLE_CASE_TIMELINE`. Código: `src/services/timeline/`.

**Sem a variável (funciona com a API de hoje):** o app monta a linha do tempo com `GET /MissingPerson/{id}` e
`GET /MissingPerson/{id}/last-seen/history`. O primeiro registro do histórico é o local informado no cadastro
("Informado no cadastro"); os seguintes são avistamentos da comunidade ("Não confirmado", porque hoje não passam por
análise). O app mostra só bairro, cidade e estado, nunca rua e número. A data do desaparecimento só aparece quando o
caso não tem avistamentos, porque a API devolve no `dtLastSeen` a data do registro mais recente.

### `GET /MissingPerson/{id}/timeline` — linha do tempo completa (proposta)

Pública para casos visíveis (mesmas regras do `GET /MissingPerson/{id}`). Só devolve o que pode ser público.

```json
[
  {
    "timelineEventId": "disappearance-123",
    "type": "disappearance",
    "occurredAt": "2026-09-30T21:00:00Z",
    "approximate": true,
    "classification": "informed",
    "place": "Savassi, Belo Horizonte, MG",
    "actorRole": "family"
  },
  {
    "timelineEventId": "status-88",
    "type": "status_change",
    "occurredAt": "2026-10-01T14:00:00Z",
    "classification": "confirmed",
    "statusFromId": 1,
    "statusToId": 2,
    "actorRole": "moderation"
  }
]
```

| Campo | Valores |
|---|---|
| `type` | `disappearance`, `case_registered`, `sighting`, `status_change`, `family_update`, `search_expanded`, `correction`, `closed` (tipo desconhecido é ignorado pelo app) |
| `classification` | `confirmed`, `informed`, `pending_review`, `not_confirmed`, `corrected` (desconhecido aparece como "Não confirmado") |
| `actorRole` | `family`, `community`, `moderation`, `system` (nunca nome de pessoa) |
| `place` | Bairro, cidade e estado. **Nunca** rua, número ou ponto exato de avistamento |
| `note` | Texto público (ex.: atualização da família aprovada). O app não traduz |

De onde vem cada tipo:

| Tipo | Fonte |
|---|---|
| `disappearance` | Registro de "visto por último" criado com o caso (data informada no cadastro) |
| `case_registered` | Data de cadastro do caso |
| `status_change`, `closed` | Histórico de mudanças de situação, que o servidor já guarda |
| `sighting` | Relato analisado (etapa 1) ou avistamentos posteriores, com a classificação da análise |
| `family_update`, `search_expanded`, `correction` | Registro novo de eventos do caso, com autor, data e evento corrigido (auditoria: nada some sem registro) |

Melhoria pequena e útil já agora: o histórico de avistamentos devolver também a data em que a pessoa foi vista
(`dtLastSeen`), e não só quando o registro foi feito.

---

## Etapas 4, 9 e 10 — Painel da equipe

**Já existem e o app usa:** `GET /Moderation/reports`, `POST /Moderation/reports/{id}/hide`,
`POST /Moderation/reports/{id}/dismiss`, `POST /Moderation/missing-person/{id}/status` (`{ statusId }`).

**O app já envia, a API ainda não guarda:** `justification` nas decisões acima. Proposta: gravar a justificativa,
quem decidiu e quando, em registro de auditoria que não pode ser apagado.

**Propostos (o app está pronto, desligados em produção):**

| Endpoint | Para quê |
|---|---|
| `GET /SightingReport?missingPersonId=&status=pending_review` | Fila de relatos de um caso (equipe) |
| `PATCH /SightingReport/{id}/status` `{ status, justification }` | Decisão sobre um relato |
| `GET /MissingPerson/{id}/search` | Acompanhamento: `level`, `radiusKm`, `paused`, `notificationsSent`, `notificationsDelivered` (ou null), `reportsReceived`, `activeRegions[]`, `lastUpdates[]`, `expansions[]`, `nodes[]`, `connections[]` |
| `POST /MissingPerson/{id}/search/expansions` `{ to, justification }` | Ampliar a busca (registrar nível anterior, novo, justificativa, quem, quando e alcance estimado) |
| `POST /MissingPerson/{id}/search/pause` `{ paused, justification }` | Pausar ou retomar os alertas do caso |
| `GET /MissingPerson/{id}/ai-suggestions` | Sugestões: `id`, `kind` (`related_reports`, `duplicate_case`, `conflict`, `new_region`), `score` 0–1, `reasons[]`, `reportIds[]`, `status` |
| `POST /AiSuggestion/{id}/decision` `{ accept, justification }` | Decisão humana sobre a sugestão |

Regras para o servidor: só conexão **validada por pessoa** gera nova divulgação; no máximo 3 alertas de casos por
pessoa a cada 24 h; nunca a mesma informação do mesmo caso duas vezes; nada sai com alertas pausados; alertas só
para quem autorizou e só dentro da área do caso. A IA não confirma identidade, não faz reconhecimento facial e não
muda nenhum caso.

---

## Etapas 5 a 7 — Colaboração da comunidade

| Endpoint | Para quê |
|---|---|
| `POST /Notification/device` (campo novo `nearbyRadiusKm`: 5, 10, 25 ou 50) | Distância escolhida para "Casos perto de mim" |
| `POST /MissingPerson/{id}/region-suggestions` `{ place, reason }` → `{ id, receivedAt }` | Sugestão de região para divulgar (a equipe decide) |
| `GET /Volunteer/me` (404 quando não é voluntário) · `PUT /Volunteer/me` `{ region, ways[], availability?, alerts }` → `{ id, receivedAt }` · `DELETE /Volunteer/me` | Voluntariado. `ways`: `share_posters`, `share_campaigns`, `report_sightings`, `regional_alerts`, `distribute_info`, `support_actions`, `suggest_connections` |

Regras para o servidor: voluntários nunca recebem dados privados de famílias ou de quem relatou; não existe ranking;
casos de crianças e adolescentes têm alerta prioritário na região, mas nunca com escola, endereço ou rotina; o
servidor também deve recusar esses dados em cadastros de menores (o app já bloqueia).

---

## Encontra-me Vision — rede de câmeras participantes

Nenhum destes endpoints existe. O app está pronto para eles (`src/services/vision/vision.axios.repository.ts`) e fica
desligado em produção (`EXPO_PUBLIC_ENABLE_VISION`). Detalhes do módulo em `VISION.md`.

**Acesso e habilitação**

| Endpoint | Para quê |
|---|---|
| `GET /Vision/access/me` → `{ role, verified, ownsCameras, userName, institution?, pendingRequest? }` | Função da conta: `community`, `owner`, `agent`, `coordinator`, `auditor`, `technical`. `verified` só é `true` depois da verificação institucional |
| `POST /Vision/access/requests` `{ institution, position, registration, institutionalEmail, reason }` → `{ id, receivedAt }` | Pedido de habilitação. **Nunca aprova sozinho**; a equipe confirma com a instituição |

**Comunidade e responsável por câmera**

| Endpoint | Para quê |
|---|---|
| `GET /Vision/coverage` → `{ areas: [{ region, city, level }] }` | Cobertura pública: `level` = `high` (6+ câmeras), `medium` (3 a 5) ou `low`. **Nada além disso** (sem posição, responsável, ângulo, horário ou contagem). Só câmeras `authorized` |
| `GET /Vision/cameras/mine` | Câmeras da conta (campos de `Camera` em `src/lib/vision-rules.ts`) |
| `POST /Vision/cameras` · `PUT /Vision/cameras/{id}` `{ name, source, region, city, coverage, equipment, latitude?, longitude?, hoursStart?, hoursEnd?, retentionDays (1–90), integration, sharing, consent: true }` → `{ id, receivedAt }` | Cadastro. O servidor deve recusar textos com senha, usuário, IP ou endereço de acesso (mesma regra de `containsSecret`). Câmera nova nasce `pending` |
| `POST /Vision/cameras/{id}/participation` `{ status: suspended \| revoked \| pending }` | O responsável pausa, encerra ou pede para voltar (voltar passa por nova verificação) |
| `GET /Vision/preservation-requests/received` | Pedidos para as câmeras da conta |

**Ambiente institucional** (só `agent`, `coordinator`, `auditor` com `verified = true`; o servidor decide, o app só esconde)

| Endpoint | Para quê |
|---|---|
| `GET /Vision/operations` | Lista: `id, caseId, caseLabel, lastKnownPlace, lastSeenAt, radiusKm, status, createdAt, createdByName, openRequests, matchesToReview` |
| `POST /Vision/operations` `{ caseId, latitude, longitude, lastKnownPlace, lastSeenAt, radiusKm, description, scope, justification }` → `{ id, receivedAt }` | Só `coordinator`. `radiusKm` ∈ {0,5; 1; 2; 3; 5; 10; 20} |
| `GET /Vision/operations/{id}` → `{ operation, cameras[], requests[], matches[], infos[] }` | Detalhe. `cameras` = participantes até 20 km (o app filtra pelo raio) |
| `PUT /Vision/operations/{id}/radius` `{ radiusKm, justification }` | Só `coordinator` |
| `POST /Vision/operations/{id}/preservation-requests` `{ cameraId, from, to, justification }` → `{ id, receivedAt }` | Cria o pedido como `draft`. Intervalo de no máximo 12 h, sem futuro |
| `POST /Vision/preservation-requests/{id}/status` `{ status, note }` | `sent`, `images_received`, `cancelled` (instituição); `accepted`, `declined` (só o responsável pela câmera); `expired` (servidor). Fluxo em `preservationNext` |
| `POST /Vision/matches/{id}/classification` `{ classification, note }` | Só `coordinator`. `confirmed` exige que a mesma pessoa tenha aberto o trecho antes |
| `POST /Vision/clips/{clipId}/access` `{ justification }` → `{ clipId, grantedAt, expiresAt, url }` | URL temporária (ex.: 10 min), por pessoa e justificativa; registrar sempre |
| `POST /Vision/infos/{id}/reliability` `{ reliability, note }` | `low`, `medium`, `high` |
| `GET /Vision/audit?operationId=` → `[{ id, at, actorId, actorName, role, action, target, justification?, result }]` | Só `coordinator` e `auditor`. Inclui as tentativas **negadas** |

Correspondência (`matches[]`): `id, cameraId, cameraName, region, latitude, longitude, seenAt, confidence (0–1),
features[{ kind, value }], reason, limitations[], clipId, classification, aiSuggestion, reviewedByName?, reviewedAt?,
reviewNote?`. `kind` ∈ `clothing_color, clothing_type, backpack, bag, accessory, direction, vehicle, other`.

Regras para o servidor:

- Toda ação institucional exige justificativa (15 a 500 caracteres) e gera registro de auditoria **só de inclusão**
  (sem UPDATE/DELETE), inclusive quando negada (403).
- A IA **nunca** grava `confirmed` nem `discarded`; só sugere `probable` (confiança ≥ 0,75) ou `inconclusive`
  (0,35 a 0,75). Abaixo de 0,35, não mostra.
- Nada biométrico: sem reconhecimento facial, íris, digital, modo de andar ou voz. Atributos com essas palavras são
  descartados.
- Nenhuma resposta deve dizer que a pessoa foi encontrada por causa de uma correspondência.
- Credenciais de câmeras nunca passam pela API do app; ficam em cofre, configuradas com o responsável.
- Gravações: criptografadas, acesso por URL temporária, marca d'água com quem abriu, retenção definida.

---

## Central de Inteligência (branch `evolucao-central`)

Nenhum destes endpoints existe. O app está pronto para eles (`src/services/central/central.axios.repository.ts`) e
fica desligado em produção (`EXPO_PUBLIC_ENABLE_CENTRAL`, `EXPO_PUBLIC_ENABLE_CONFIDENTIAL_TIPS`). Detalhes em
`CENTRAL.md`.

| Endpoint | Para quê |
|---|---|
| `POST /ConfidentialTip` `{ tip: { caseId?, text, when?, place?, hasIdentity }, identity: { name?, contactPreference, contact? } \| null }` → `{ id, receivedAt }` | Pista confidencial (com ou sem conta). **Guardar `identity` em tabela separada**, criptografada, sem ligação visível na pista |
| `GET /Central/access/me` → `{ role, verified, mfa, userName, institution? }` | `role`: `public`, `analyst`, `admin`, `auditor`, `technical`. `mfa` = segundo fator confirmado nesta sessão |
| `GET /Central/dossiers` · `GET /Central/dossiers/{id}` | Lista e dossiê (campos em `central.types.ts`) |
| `GET /Central/dossiers/{id}/files/{fileId}/original` | Bytes do original (nunca alterado) |
| `POST /Central/tips/{id}/review` `{ dossierId, status, note }` | `under_review`, `relevant`, `not_confirmed`, `duplicate` |
| `POST /Central/tips/{id}/identity` `{ dossierId, justification }` → `{ name?, contactPreference, contact? }` | Só `admin` com MFA; sempre registrado |
| `POST /Central/dossiers/{id}/preservation` `{ legalBasis, reference, scope, until, justification }` | Preservação |
| `POST /Central/dossiers/{id}/mobilization` `{ areaId, action: expand \| pause \| resume, justification }` | Áreas de mobilização |
| `POST /Central/dossiers/{id}/closure` `{ outcome: found \| cancelled, justification }` | Protocolo de encerramento (para notificações e mobilização na hora) |
| `POST /Central/dossiers/{id}/exports` `{ authorizedBy, recipient, purpose, legalBasis, manifestSha256, files, delivery, justification }` → `{ id, receivedAt }` | Registro da exportação (o pacote é gerado no aparelho; com dois autorizadores quando há sigilo) |
| `POST /Central/exports/{id}/links` `{ hours (1–168), justification }` · `POST /Central/exports/{id}/links/{linkId}/revoke` | Link seguro: pacote no servidor, acesso autenticado do destinatário, download registrado, revogável |
| `GET /Central/audit` → `[{ seq, at, actorName, role, action, target, justification?, result, prevHash, hash }]` | Auditoria encadeada: `hash = SHA-256(JSON([seq, at, actorName, role, action, target, justification, result, prevHash]))`, primeiro `prevHash` = 64 zeros. Tabela só de inclusão |
| `GET /Technical/status` | Saúde sem conteúdo de dossiês |
| `POST /Technical/exceptional-access` `{ target, justification }` → `{ id, receivedAt }` | Pedido; aprovação por quem responde pelos dados, prazo curto, registro |

Regras para o servidor: valores legais `legalBasis` = `authority_request`, `court_order`, `family_consent`,
`protection_of_life`; destinatário com e-mail de órgão público e confirmação por canal oficial; nunca enviar nada
sozinho a autoridades; não expor a identidade de quem enviou pistas em nenhuma resposta pública; MFA para as ações
marcadas em `MFA_ACTIONS`; alertas só com `notifyDecision` (consentimento, área ativa, 3 por dia, 6 h entre alertas do
caso, nada depois do encerramento).

---

## Nossos apoiadores (branch `evolucao-novidades`)

Variável no app: `EXPO_PUBLIC_ENABLE_SUPPORTERS`. Código: `src/services/supporters/supporters.axios.repository.ts`.
Estes endpoints já estão implementados na API em Node.js (branch `api-node-novidades` do repositório da API, com
testes); o backend .NET não os tem. Nada foi publicado.

| Método e rota | Quem | O que faz |
|---|---|---|
| `GET /Supporter` (`?home=true` opcional) | Público (`X-App-Key`) | Apoiadores publicados **e** com autorização confirmada, na ordem definida. `home=true`: só os marcados para o Início |
| `GET /Supporter/{id}/logo` | Público | O logotipo (PNG, JPEG ou WebP) de quem está publicado; os outros respondem 404. Cache público com `ETag` |
| `GET /Supporter/admin` | Equipe | Todos, com situação, autorização e ordem |
| `GET /Supporter/admin/{id}/logo` | Equipe | `{ "logo": "data:image/...;base64,..." }`, inclusive de quem ainda não foi publicado |
| `POST /Supporter` | Equipe | Cadastra |
| `PUT /Supporter/{id}` | Equipe | Edita. Mande nome, site e categoria sempre; `isActive`, `showOnHome` e `authorizationConfirmed` ausentes mantêm o valor; `logo` ausente mantém o logotipo |
| `PUT /Supporter/order` | Equipe | `{ "supporterIds": [3, 1, 2] }` com **todos** os ids, sem repetir |
| `DELETE /Supporter/{id}` | Equipe | Exclui (marca e logotipo) |

Contas que não são da equipe recebem 403 nas rotas da equipe.

Resposta pública (item):

```json
{
  "supporterId": 3,
  "name": "Empresa Exemplo",
  "websiteUrl": "https://www.exemplo.com.br/",
  "category": "parceiro",
  "logoUrl": "/api/Supporter/3/logo?v=4f1c2a9b0d3e",
  "logoWidth": 600,
  "logoHeight": 240
}
```

O app transforma `logoUrl` em endereço completo com `EXPO_PUBLIC_API_URL`. A visão da equipe acrescenta `isActive`,
`showOnHome`, `displayOrder`, `authorizationConfirmed`, `authorizationConfirmedAt`, `authorizationNote` e `hasLogo`.

Envio (`POST`/`PUT`):

```json
{
  "name": "Empresa Exemplo",
  "websiteUrl": "https://www.exemplo.com.br",
  "category": "apoiador | parceiro | patrocinador",
  "logo": "<base64 ou data URL>",
  "removeLogo": false,
  "isActive": true,
  "showOnHome": true,
  "authorizationConfirmed": true,
  "authorizationNote": "Contrato assinado em 10/10/2026"
}
```

Regras (as mesmas no app e na API):

- Nome de 2 a 80 caracteres; site opcional, só `https`; categoria entre as três.
- **Publicar (`isActive: true`) exige `authorizationConfirmed: true`**; sem isso, 400 com
  `{ "field": "authorizationConfirmed", "error": "required" }`. Mandar `authorizationConfirmed: false` revoga a
  autorização e tira a marca do ar. A data e quem confirmou ficam guardados.
- Logotipo: PNG, JPEG ou WebP, até 300 KB, de 32 a 4000 px por lado. O tipo é conferido pelo **conteúdo** do
  arquivo (não pelo nome); SVG e qualquer outro formato são recusados. O logotipo é servido com
  `X-Content-Type-Options: nosniff` e `Content-Security-Policy: sandbox`.
- Categorias não têm relação com valores e não há ordenação automática: a ordem é a que a equipe definir.

---

## Ponto no mapa no cadastro de caso (branch `evolucao-novidades`)

Sem endpoint novo. O `POST /MissingPerson` passa a mandar `latitude` e `longitude` quando a pessoa marca o ponto (os
dois juntos, ou nenhum). A API .NET e a Node já aceitam esses campos e gravam o ponto com o último local. O app manda o
ponto já arredondado para 3 casas decimais (~110 m).

Ficha de identificação, chegada segura e B.O. pela internet não usam a API.

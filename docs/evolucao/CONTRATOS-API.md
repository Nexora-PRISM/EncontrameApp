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

# Contratos de API propostos para o backend .NET

O backend fica em outro repositório (`Nexora-PRISM/EncontrameApi`), consultado **só para leitura**: nada foi alterado
lá. Os contratos abaixo são **propostas**: o app já está pronto para eles (repositório axios), mas cada recurso só deve
ser ligado em produção depois que a API existir e for testada. Até lá, a variável `EXPO_PUBLIC_ENABLE_*` correspondente fica desligada em produção.

Convenções seguidas, iguais às do app atual: JSON em camelCase, autenticação pelo token da sessão (header
`Authorization`), header `X-App-Key`, `Accept-Language` com o idioma da tela, datas em ISO 8601 (UTC).

## O que a API de hoje já tem (consulta somente leitura em 30/10/2026)

O repositório `Nexora-PRISM/EncontrameApi` (commit `56ac40d`) foi lido, sem nenhuma alteração. Pontos que afetam os
contratos abaixo:

- Rotas no padrão `api/[controller]` (o `EXPO_PUBLIC_API_URL` do app já termina em `/api`). Camadas:
  Controller → Service (`EcontrameApi.Application`) → I*Repository → Repository (Infrastructure) → `AppDbContext`.
  Toda mudança no backend precisa de testes unitários e de integração (regra do repositório da API).
- **Avistamento hoje:** `POST /MissingPerson/{id}/last-seen` grava direto um `PersonLastSeen` (que passa a ser o
  último local do caso) e avisa quem acompanha o caso (`NotificationTexts.SightingAdded`). **Não há análise antes.**
- `PersonLastSeen` já tem `UserId` e `DtLastSeen`, mas `PersonLastSeenDto` (o histórico) não devolve `DtLastSeen`.
- Situações do caso (`StatusIds`): 1 Pendente, 2 Procurado, 3 Encontrado, 4 Alerta, 99 Cancelado. Só a equipe
  (`Moderation:StaffUserIds`) muda a situação, por `POST /Moderation/missing-person/{id}/status`, com transições
  permitidas. Cada mudança vira uma linha em `MissingPersonStatus` (com data): o histórico já existe no banco, mas
  não há endpoint que o devolva.
- Denúncias (`ContentReport`) aceitam `GroupMessage`, `MissingPerson` e `SafetyNote`; não há alvo para relato.

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

### Como encaixar no backend atual (sugestão)

- Entidade nova `SightingReport` (com `UserId`, `MissingPersonId`, campos do relato, `Status`, `DtRegistration`) e
  `SightingReportStatusChange` (quem mudou, quando, situação anterior e nova, justificativa) para a auditoria.
- `ISightingReportRepository` + `SightingReportRepository`, `SightingReportService`, `SightingReportController`
  (`[Authorize]`), registro no `Program.cs`, migration e testes (unitários e de integração com `EncontrameApiFactory`).
- Quando a equipe considerar um relato relevante e aprová-lo como informação do caso, o serviço cria o
  `PersonLastSeen` (com `DtLastSeen = seenAt`) e só então chama `OnSightingAddedAsync`. Assim o aviso aos seguidores
  deixa de sair para relatos não verificados.
- Incluir `SightingReport` como alvo de `ContentReport` (denúncia de abuso no relato).

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

De onde tirar cada tipo no banco atual:

| Tipo | Fonte |
|---|---|
| `disappearance` | `PersonLastSeen` criado com o caso (`DtLastSeen`) |
| `case_registered` | `MissingPerson.DtRegistration` |
| `status_change`, `closed` | `MissingPersonStatus` (linha anterior e atual) |
| `sighting` | `SightingReport` analisado (etapa 1) ou `PersonLastSeen` posteriores, com a classificação da análise |
| `family_update`, `search_expanded`, `correction` | Tabela nova de eventos do caso, com autor, data e evento corrigido (auditoria: nada some sem registro) |

Melhoria pequena e útil já agora: devolver `dtLastSeen` em `PersonLastSeenDto`, para o histórico mostrar quando a
pessoa foi vista, e não só quando o registro foi feito.


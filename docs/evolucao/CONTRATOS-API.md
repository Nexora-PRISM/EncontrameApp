# Contratos de API propostos para o backend .NET

O backend fica em outro repositório e não foi acessado. Os contratos abaixo são **propostas**: o app já está pronto
para eles (repositório axios), mas cada recurso só deve ser ligado em produção depois que a API existir e for
testada. Até lá, a variável `EXPO_PUBLIC_ENABLE_*` correspondente fica desligada em produção.

Convenções seguidas, iguais às do app atual: JSON em camelCase, autenticação pelo token da sessão (header
`Authorization`), header `X-App-Key`, `Accept-Language` com o idioma da tela, datas em ISO 8601 (UTC).

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

### Endpoints de moderação (para a etapa 4, ainda não usados pelo app)

Sugestão para o painel de análise: `GET /SightingReport?missingPersonId=&status=`, `PATCH /SightingReport/{id}/status`
(com justificativa obrigatória), `POST /SightingReport/{id}/link` (associar a outro caso) e registro de auditoria.

---

## Endpoints que o app atual já usa e continuam iguais

`POST /MissingPerson/{id}/last-seen` e `GET /MissingPerson/{id}/last-seen/history` continuam sendo usados quando
`EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` está desligada (comportamento de hoje, em produção).

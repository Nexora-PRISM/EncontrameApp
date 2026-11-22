# 01 — Contestação de alertas e pedidos de proteção (API)

Hoje (`/protecao` no app) o pedido vira uma denúncia comum (`POST /Moderation/reports`) e um e-mail. Falta: estados,
foto privada para verificação, justificativa da decisão, acompanhamento pela pessoa e suspensão preventiva
registrada. Esta é a proposta.

## Tabelas (schema `encontra_me`)

```text
protection_request
  protection_request_id   serial PK
  kind                    varchar(16)   'contestation' | 'stalking'
  missing_person_id       int NULL FK   caso relacionado (pode não haver, em perseguição)
  requester_user_id       int NULL FK   conta de quem pediu (NULL = pedido sem conta)
  contact_email           varchar(160)  para responder quem não tem conta (cifrado em repouso)
  situations              varchar(32)[] estou-bem | uso-indevido | retirar | risco |
                                        localizar | alerta-falso | ameacas | dados | outro
  details                 varchar(1000)
  status                  varchar(24)   ver estados
  priority                varchar(8)    'high' | 'normal'  (alta: risco, perseguição, alerta falso)
  case_suspended_at       timestamptz NULL
  decision                varchar(16) NULL  'approved' | 'rejected'
  decision_reason         varchar(1000) NULL  obrigatório ao decidir
  decided_by_user_id      int NULL
  dt_registration, dt_updated  timestamptz

protection_request_file      (foto de verificação; nunca pública)
  protection_request_file_id serial PK
  protection_request_id      int FK
  content                    bytea          (ou chave no armazenamento privado atual)
  content_type               varchar(32)    image/jpeg | image/png
  sha256                     char(64)
  dt_registration            timestamptz
  delete_after               timestamptz    (retenção, ver 06)

protection_request_event     (histórico imutável)
  id, protection_request_id, actor_user_id NULL, action, note, dt_registration
```

## Estados

| Estado | Quando |
|---|---|
| `AguardandoAnalise` | Pedido criado sem risco declarado. |
| `EmAnalisePrioritaria` | Pedido com risco/perseguição/alerta falso (entra no topo da fila). |
| `AlertaSuspenso` | A equipe (ou a regra automática abaixo) tirou o caso do ar enquanto analisa. |
| `ContestacaoAprovada` | Equipe confirmou: caso encerrado/oculto definitivamente. |
| `ContestacaoRejeitada` | Equipe manteve o caso; justificativa obrigatória. |
| `AlertaEncerrado` | Caso encerrado por qualquer motivo depois da contestação. |

**Suspensão preventiva:** um pedido `stalking`, ou `contestation` com `risco`/`alerta-falso`, ligado a um caso, deixa o
caso **fora da listagem pública** (`HiddenAt` + motivo `protection_request`) até a decisão — sem avisar o criador
do motivo. Um pedido sem risco não suspende sozinho. **Nenhum pedido encerra o caso sozinho**: só a decisão humana.

## Endpoints

| Método e rota | Quem | Faz |
|---|---|---|
| `POST /Protection/requests` | qualquer um (`[RequireAppKey]`, com ou sem JWT); limite por IP/conta | Cria o pedido. Corpo: `{ kind, missingPersonId?, situations[], details?, contactEmail? }`. Responde `{ requestId, status, receivedAt, trackingCode }`. |
| `POST /Protection/requests/{id}/photo` | quem criou (JWT ou `trackingCode`) | Envia foto de verificação (máx. 5 MB, jpeg/png). Nunca aparece em nenhuma resposta pública. |
| `GET /Protection/requests/mine` | dono | Lista os pedidos da conta com estado (sem dados da equipe). |
| `GET /Protection/requests/{trackingCode}` | quem tem o código | Estado do pedido feito sem conta. |
| `GET /SecurityCenter/requests?status=&priority=` | equipe com papel `security` | Fila (ver 03). |
| `GET /SecurityCenter/requests/{id}` | equipe `security` | Detalhe + histórico; **registra acesso**. |
| `GET /SecurityCenter/requests/{id}/photo` | equipe `security` | Foto; **registra acesso**; resposta `Cache-Control: no-store`. |
| `POST /SecurityCenter/requests/{id}/suspend` | equipe `security` | Suspende o caso. |
| `POST /SecurityCenter/requests/{id}/decision` | equipe `security` | `{ decision, reason }`, `reason` obrigatório. |

Regras no servidor (não só na tela):
- **Nunca** devolver ao criador do caso: o pedido, a foto, o e-mail, a conta ou qualquer coordenada de quem contestou.
- `POST /Protection/requests` **não aceita** latitude/longitude (campo rejeitado com 400).
- O criador do caso só vê "Caso em análise pela equipe" quando suspenso — sem motivo.
- Respostas 404 iguais para "não existe" e "não é seu" (evita descobrir ids).

## Notificações (textos genéricos — tela bloqueada)

| Tipo (`data.type`) | Título | Corpo |
|---|---|---|
| `protection_received` | Pedido recebido | A equipe vai analisar seu pedido. |
| `protection_update` | Pedido atualizado | Toque para ver o andamento. |
| `protection_result` | Análise concluída | Toque para ver o resultado. |
| `case_suspended` (para o criador) | Caso em análise | Seu caso está temporariamente fora do ar. |

`data` leva só `{ type, requestId }` ou `{ type, personId }`. Sem nome, foto, motivo ou local.

## App (quando a API existir)

- `src/services/protection/` com `protection.types.ts`, repositório mock + axios e `useCreateProtectionRequest`,
  `useMyProtectionRequests`; flag `EXPO_PUBLIC_ENABLE_PROTECTION_API` (ligada em dev/mock, desligada em produção).
- `/protecao`: com a flag, o envio usa `POST /Protection/requests`; a tela mostra "Recebido" **só** com
  `requestId` + `receivedAt` na resposta; foto opcional com `expo-image-picker` (já instalado), enviada só para a API.
- Perfil › "Meus pedidos de proteção" com o estado.
- O e-mail continua como alternativa quando a API falhar.

## Testes (obrigatórios na API)

Unitários (`ProtectionServiceTests`): criação com/sem conta; prioridade alta para risco; suspensão preventiva só com
risco; rejeição de coordenadas; decisão sem justificativa → 400; criador do caso nunca recebe dados do pedido.
Integração: `POST` anônimo com AppKey → 201; sem AppKey → 401; foto por quem não é dono → 404; equipe sem papel
`security` → 403 na foto; decisão grava evento e libera/oculta o caso; listagem pública não mostra caso suspenso.

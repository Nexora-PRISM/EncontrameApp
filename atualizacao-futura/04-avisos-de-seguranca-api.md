# 04 — Avisos de segurança: reforços no servidor

O bug do app foi corrigido (ver `docs/atualizacoes/2026-11-22-protecao-identidade-e-avisos.md`). Estes reforços
fecham as mesmas portas no servidor, para não depender só da tela.

## 1. Coordenada válida no `POST /SafetyNote`

Rejeitar `(0, 0)`, `NaN` e valores fora da faixa (hoje a faixa já é validada; falta o `0,0`).

```csharp
if (dto.Latitude == 0 && dto.Longitude == 0)
    errors.Add("latitude", ValidationErrorCodes.InvalidFormat);
```

## 2. Duplicados no servidor

Antes de criar: aviso **ativo**, mesma `category`, a até **60 m** (mesma constante do app,
`SAFETY_NOTE_DUPLICATE_RADIUS_M`):
- do próprio autor → `409 Conflict` `{ code: "duplicate_mine", safetyNoteId }`;
- de outra pessoa → registrar como voto `confirm` do autor no aviso existente (renova o prazo) e responder
  `200` com o aviso existente e `merged: true`.

Teste: dois `POST` iguais a 20 m → um aviso só, `confirmations = 1`.

## 3. Estado de verificação na resposta

Adicionar `verification: "unverified" | "confirmed" | "disputed"` em `SafetyNoteResponseDto`, com a mesma regra do app
(`safetyNoteVerification`: confirmado com 2+ confirmações e maioria; divergente quando "não está mais assim" ≥
confirmações). O app passa a usar o valor da API quando vier.

## 4. Listagem

- Filtrar vencidos e derrubados **na consulta** (hoje carrega a caixa inteira e filtra em memória).
- Índice `(latitude, longitude)` ou coluna PostGIS `geography(Point)` (a extensão já é declarada no `AppDbContext`).
- `GET /SafetyNote/nearby` aceita `radiusKm` até 200; manter.

## 5. Abuso

- Limite atual: 5 avisos por conta por dia (mantém).
- Novo: no máximo 30 votos por conta por hora; conta com 3+ avisos ocultos pela equipe em 30 dias não publica por 7 dias.

## Testes (API)

Unitários em `SafetyNoteServiceTests`: 0,0 rejeitado; duplicado do autor → 409; duplicado de outro → merge com voto;
verificação calculada. Integração em `SafetyNoteEndpointsTests`: os mesmos pelo HTTP.

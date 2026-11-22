# 02 — Publicação responsável: vínculo, boletim de ocorrência e possível desaparecimento (API)

## O que o app já faz

- Vínculos (10): Pai ou mãe, Filho ou filha, Irmão ou irmã, Cônjuge ou companheiro(a), Responsável legal,
  Outro familiar (grupo **família**); Amigo ou conhecido, Vizinho (**conhecido**); Pessoa desconhecida
  (**desconhecido**); Instituição ou autoridade (**instituição**).
- Boletim obrigatório para menores de 18 e para todo grupo que não é família.
- A API ainda aceita só 6 valores (`CaseLegitimacy.Relationships`), então o app envia o equivalente
  (`src/lib/case-relationship.ts`, campo `api`). **Passo 1 abaixo remove essa tradução.**

## Passo 1 — vínculos novos na API (pequeno)

```csharp
// EcontrameApi.Application/Validation/CaseLegitimacy.cs
public static readonly string[] Relationships = {
  // novos
  "Pai ou mãe", "Filho ou filha", "Irmão ou irmã", "Cônjuge ou companheiro(a)", "Responsável legal",
  "Outro familiar", "Amigo ou conhecido", "Vizinho", "Pessoa desconhecida", "Instituição ou autoridade",
  // antigos (casos já gravados e apps antigos)
  "Mãe ou pai", "Amigo(a)", "Outro",
};
public static bool RequiresPoliceReport(int age, string relationship)
  => age < AdultAge || !FamilyRelationships.Contains(relationship);
```

`ValidateCreate` passa a usar `RequiresPoliceReport` (hoje exige o boletim só por idade). No app, trocar `api` por
`label` em `case-relationship.ts` depois que a API publicada aceitar os valores novos.

Testes: os 9 cenários do pedido (ver fim deste arquivo) como integração em `MissingPersonEndpointsTests`.

## Passo 2 — anexo do boletim e verificação

```text
case_document
  case_document_id   serial PK
  missing_person_id  int FK
  uploader_user_id   int FK
  kind               varchar(24)  'police_report' | 'relationship_proof' | 'institution_proof'
  content            bytea (ou chave no armazenamento privado)
  content_type       varchar(32)  application/pdf | image/jpeg | image/png  (máx. 8 MB)
  sha256             char(64)     índice — antifraude
  dt_registration    timestamptz
  delete_after       timestamptz
```

- `POST /MissingPerson/{id}/documents` (só o criador, caso **Pendente** ou em "Aguardando documentação").
- O documento **nunca** sai em resposta pública; download só por `GET /SecurityCenter/documents/{id}` (papel
  `security`), com registro de acesso.
- **Antifraude:** mesmo `sha256` já usado em outro caso de outro usuário → caso vai para "Em análise prioritária" com o
  alerta "documento reutilizado". Usuário com 2+ casos rejeitados em 90 dias → novos casos entram com prioridade e
  limite de 1 cadastro por dia.
- Instituições: `institution_proof` obrigatório; a equipe confirma por canal oficial (telefone/e-mail institucional
  público) antes de aprovar. Nenhuma conta vira "instituição verificada" sem essa decisão registrada.

### Estados do caso na análise

`AguardandoDocumentacao` → `AguardandoAnalise` → (`EmAnalisePrioritaria`) → `Aprovado` (vira Procurado/Alerta) |
`Rejeitado` (justificativa obrigatória) | `Suspenso`. Guardados num campo `review_status` ao lado do `StatusId`
atual (que continua sendo Pendente até a aprovação), com histórico em `case_review_event`.

## Passo 3 — fila prioritária de "possível desaparecimento"

Hoje `/possivel-desaparecimento` manda e-mail. Com a API:

- `POST /PossibleMissing` (sem login, `[RequireAppKey]`, limite por IP): `{ situation, place?, details?, latitude?,
  longitude?, calledEmergency }`. A coordenada aqui é **do lugar onde a pessoa encontrada está** (ajuda a equipe e a
  polícia) e fica visível só para a equipe.
- Entra direto em "Em análise prioritária"; push para a equipe (`Moderation:StaffUserIds`).
- **Nada é publicado** até a equipe validar; foto, se houver, só para a equipe.
- A equipe pode converter em caso (com autorização de autoridade/conselho tutelar) ou arquivar.

## Os 9 cenários de teste do pedido

| # | Cenário | Esperado |
|---|---|---|
| 1 | Familiar adulto cria alerta sem boletim | 201, Pendente; equipe pode pedir documentos. |
| 2 | Amigo cria com número de boletim (e anexo) | 201, Pendente/AguardandoAnalise. |
| 3 | Amigo sem boletim | 400 `policeReportNumber.required` (app já barra). |
| 4 | Desconhecido sem boletim | 400; app oferece "Encontrei alguém perdido". |
| 5 | Pessoa encontra criança perdida | `POST /PossibleMissing` → prioridade alta, nada público. |
| 6 | Pessoa encontra idoso desorientado | Idem, com SAMU sugerido. |
| 7 | Equipe aprova e rejeita documentos | Estado muda, justificativa obrigatória, evento gravado. |
| 8 | Pessoa procurada contesta | Ver `01`: prioridade e suspensão preventiva. |
| 9 | Acesso não autorizado ao documento | 403/404, acesso negado registrado. |

Os cenários 1–6 e 8 já têm testes das **regras do app** em `scripts/regras.test.js` (`npm run test:regras`).
Os cenários 7 e 9 só existem com a API.

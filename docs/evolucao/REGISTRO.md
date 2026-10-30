# Registro das etapas

Cada etapa tem commits próprios na branch `evolucao`. Para ver os commits de uma etapa:
`git log --oneline --grep "etapa 1"` (troque o número). Para desfazer: `git revert <commits>`.

---

## Etapa 0 — Ambiente independente (30/10/2026)

**O que foi feito**

- Cópia separada a partir da `main` do original, commit `7cc8304`, sem nenhum vínculo com o repositório original
  (sem remote apontando para ele).
- Branch `main` (base intocada) e branch `evolucao` (trabalho).
- Checagem automática do GitHub também na `evolucao`, com `npm test`. Nada nela publica o app.
- Testes de regras de negócio com o executor nativo do Node (`node --test`), sem dependência nova.
- Documentação em `docs/evolucao/` e aviso no `AGENTS.md`.

**Arquivos**

| Situação | Arquivo |
|---|---|
| Alterado | `.github/workflows/checagem.yml` (branch `evolucao`, passo de testes, flag do relato no build de demonstração) |
| Alterado | `package.json` (script `test`; nenhuma dependência nova) |
| Alterado | `AGENTS.md` (seção "Esta é a versão independente de evolução") |
| Criado | `docs/evolucao/README.md`, `docs/evolucao/PLANO.md` |

---

## Etapa 1 — Relato de avistamento "Eu vi essa pessoa" (30/10/2026)

**Objetivo.** Transformar o registro simples de avistamento (só o local) num relato completo, com número e
situação, sem que um relato não verificado vire informação do caso.

**Como funciona (com `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` ligada)**

1. Na página do caso, "Vi essa pessoa por perto" abre o relato. No topo: qual é o caso e o aviso "se a pessoa parece
   estar em perigo agora, ligue 190; não aborde nem siga a pessoa".
2. Local: endereço com sugestões, toque no mapa, pin arrastável ou "Usar minha localização" (como já era), mais
   ponto de referência. O app registra como o local foi indicado (GPS, mapa ou endereço).
3. Quando: data e horário (preenchidos com o momento atual) e "O horário é aproximado" (marcado por padrão).
4. O que viu (obrigatório), roupa, características visíveis, para onde a pessoa seguia, foto opcional (vai só para a
   análise) e informações complementares.
5. Ao enviar: com número e horário de recebimento na resposta, a tela mostra "Relato recebido · nº …" e a situação.
   Sem isso, "o envio não foi confirmado". No modo de demonstração, a tela avisa que nada foi enviado de verdade.
6. "Meus relatos" (Perfil › Atalhos, ou o botão depois do envio) lista os relatos da conta com a situação de cada um:
   Recebido, Aguardando análise, Em análise, Considerado relevante, Não confirmado, Encerrado.
7. Limite de 3 relatos por caso a cada 10 minutos no aparelho, contra toques repetidos.
8. O relato **não** muda o último local nem o mapa do caso. Isso fica para a análise humana, no servidor.

Com a variável desligada (produção hoje), nada muda: o app continua com o registro simples de avistamento.

**O que ficou de fora de propósito**

- O texto do botão continua "Vi essa pessoa por perto", porque o passo a passo inicial cita esse texto.
- Ferramentas de moderação (revisão, duplicidades, denúncia de abuso do relato) ficam para a etapa 4.

**Arquivos**

| Situação | Arquivo | Para quê |
|---|---|---|
| Criado | `src/lib/sighting-report-rules.ts` | Regras puras: situações, confirmação de recebimento, data e horário, textos, limite de envio |
| Criado | `src/lib/sighting-report.ts` | Rótulos e ícones das situações; limite por caso na memória |
| Criado | `src/services/sightings/*` (tipos, repositório, axios, mock, service) | Envio do relato e "Meus relatos" |
| Criado | `src/features/pessoa-detalhe/sighting-report-form.ts` | Estado e validação dos campos novos |
| Criado | `src/features/pessoa-detalhe/sections/pessoa-detalhe-sighting-report-fields.tsx` | Campos novos do formulário |
| Criado | `src/components/sighting-status-chip.tsx` | Selo da situação do relato |
| Criado | `src/pages/meus-relatos/index.tsx`, `src/features/meus-relatos/*` | Tela "Meus relatos" |
| Criado | `tests/sighting-report-rules.test.mjs` | 17 testes das regras |
| Criado | `docs/evolucao/CONTRATOS-API.md` | `POST /SightingReport` e `GET /SightingReport/mine` |
| Alterado | `src/features/pessoa-detalhe/pessoa-detalhe.controller.ts` | Envio do relato completo quando a flag está ligada |
| Alterado | `src/features/pessoa-detalhe/sections/pessoa-detalhe-sighting-section.tsx` | Mostra os campos novos com a flag |
| Alterado | `src/features/pessoa-detalhe/sections/pessoa-detalhe-thanks-section.tsx` | Número e situação do relato; "Ver meus relatos" |
| Alterado | `src/components/brand-field.tsx` | Opção `multiline` (compatível: sem ela, nada muda) |
| Alterado | `src/features/perfil/*` | Atalho "Meus relatos" com a flag |
| Alterado | `src/features/ajuda/help-content.ts` | Pergunta nova, visível só com a flag (`requires`) |
| Alterado | `src/lib/env.ts`, `.env.example`, `AGENTS.md` | Flags `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` e `EXPO_PUBLIC_MOCK_SIGHTING_FAIL` |
| Alterado | `src/translations/en.ts`, `es.ts` | 70 textos novos em inglês e espanhol |

**Depende de integração**: `POST /SightingReport` e `GET /SightingReport/mine` na API .NET (ver `CONTRATOS-API.md`).

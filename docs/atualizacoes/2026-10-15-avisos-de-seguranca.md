# 2026-10-15 — Avisos de segurança no mapa e refinamento do Início

- **Branch / PR**: `desenvolvimento` → `main` (PR #1, sem merge automático).
- **Pedido**: refinamento inspirado em apps como Instagram e Uber (inspiração, não cópia) e permitir que as pessoas
  deixem observações no mapa — "rua tal é perigosa, redobre a atenção", "não passe na rua tal em certo horário",
  "rua vazia", "rua que dá muito assalto" — de um jeito profissional.

## Avisos de segurança (relatos da comunidade)

### Como funciona para quem usa

1. No mapa do Início, losangos amarelos marcam avisos da comunidade. O grupo de controles à direita liga e desliga
   a camada (o número mostra quantos avisos há por perto).
2. Tocar num aviso abre um cartão com o tipo, o horário, a referência do lugar, a observação, há quanto tempo foi
   publicado e quantas pessoas confirmaram. Botões: **Continua assim**, **Não está mais assim** e **Denunciar**.
3. **Adicionar aviso** (no mapa ou no Menu › "Avisar sobre um lugar perigoso") abre `/aviso-seguranca`, em 4 passos:
   onde (toque no mapa ou "Usar minha localização"), o que acontece (tipo), em que horário e a referência do local.

### Regras que deixam o recurso profissional

| Regra | Por quê |
|---|---|
| Tipos fixos: Atenção redobrada, Assaltos frequentes, Rua deserta, Iluminação ruim, Evite neste horário, Outro cuidado | Relatos objetivos e comparáveis; nada de título livre. |
| Horário: qualquer, madrugada, manhã, tarde, noite | Atende "não passe na rua tal em certo horário". |
| O texto fala do lugar, nunca de pessoas; telefone, CPF, e-mail e @perfil são bloqueados | Evita acusação, exposição de terceiros e preconceito (LGPD). |
| Publicar exige conta e declaração de veracidade; não é anônimo, mas o autor não aparece | Responsabilidade sem expor quem avisou. |
| Validade de 30 dias, renovada a cada "Continua assim" | O mapa não acumula avisos velhos. |
| Some quando "Não está mais assim" passa as confirmações por 3 | A própria comunidade corrige o mapa. |
| Denúncia por e-mail ao suporte (com a identificação do aviso) | Ainda não existe API de moderação; a tela não diz que "foi registrado". |
| Cartão e formulário avisam: relato não verificado, não substitui a polícia; em perigo, "Pedir ajuda" | Honestidade da interface. |
| Cor âmbar própria (`safetyNote`), nunca o vermelho do "Pedir ajuda" | Atenção, não emergência. |

### Situação técnica

- **Não existe API ainda.** O recurso nasce com repositório mock (dados fictícios em Belo Horizonte) e repositório
  axios com o contrato proposto abaixo. A flag `EXPO_PUBLIC_ENABLE_SAFETY_NOTES` liga o recurso: vazia = ligado em
  desenvolvimento e **desligado em produção**. Com a flag desligada, o mapa, o Menu, o passo a passo e a rota
  `/aviso-seguranca` escondem o recurso.
- `/aviso-seguranca` é rota protegida (exige login).

### Contrato proposto para o backend (.NET)

```
GET  /SafetyNote/nearby?latitude=&longitude=&radiusKm=     → ApiSafetyNote[]          (público)
POST /SafetyNote                                             → ApiSafetyNote            (login)
     { category, period, reference, note?, latitude, longitude, declarationAcceptedAt }
POST /SafetyNote/{id}/vote   { vote: "confirm" | "outdated" } → ApiSafetyNote            (login)

ApiSafetyNote = { safetyNoteId, category, period, reference, note?, latitude, longitude,
                  dtCreated, dtExpires, confirmations, outdatedReports, myVote?, mine? }
category ∈ attention | robbery | deserted | lighting | avoid-time | other
period   ∈ any | dawn | morning | afternoon | night
```

O servidor deve: repetir a validação de dados pessoais; aceitar um voto por pessoa (trocar o voto desfaz o anterior);
limitar avisos por conta por dia; não devolver o autor; aplicar a validade e a regra de ocultação; guardar o histórico
para moderação; e, quando houver painel administrativo, permitir remover avisos denunciados.

## Refinamento do Início (inspiração, não cópia)

| Inspiração | Como entrou no Encontra-me |
|---|---|
| Apps de mobilidade (cartão sobre o mapa) | Tocar num pin abre um **cartão flutuante** com o resumo e as ações, em vez de trocar de tela; tocar no mapa fecha. O pin escolhido cresce e ganha borda laranja. |
| Controles de mapa agrupados | Satélite e avisos ficam numa **coluna única** à direita, com contador. |
| Destaque de conteúdo urgente em redes sociais | Fotos de casos em **Alerta** ganham anel em degradê creme → laranja → alerta (cores da marca, não as de outro app). |

## Arquivos

- Novos: `src/services/safety-notes/*` (tipos, repositório, mock, axios, service), `src/lib/safety-notes.ts`,
  `src/features/aviso-seguranca/*`, `src/pages/aviso-seguranca/index.tsx`,
  `src/features/inicio/sections/inicio-map-preview-section.tsx`, `src/components/photo-ring.tsx`.
- Alterados: controller e seções do Início, Menu, passo a passo (passo novo "Avisos de segurança", só com a flag
  ligada), mapas nativo e web (marcador de aviso), `env.ts`, `.env.example`, `.env.production`, `auth-guard.ts`,
  cores (`brand.ts`, `global.css`), Central de Ajuda, traduções en/es.

## Pendências

- Backend `/SafetyNote` e moderação (painel administrativo).
- Decisão dos sócios sobre limites (avisos por dia, raio, validade) antes de ligar em produção.
- No web de demonstração o mapa não aparece sem a chave do Google Maps, então os marcadores e o cartão flutuante só
  podem ser vistos no app com a chave configurada (Android ou Netlify).

# 2026-10-15 — Premium retirado do app (por agora)

> Superado em 17/10/2026: o código do Premium e dos pets foi removido do app (não fica mais atrás de flag). A demanda futura está no `CLAUDE.md`.



- **Pedido**: "Retire a versão Premium por agora."
- **Como foi feito**: nova flag `EXPO_PUBLIC_ENABLE_PREMIUM` (`env.premiumEnabled`), **desligada em todos os
  ambientes**. Nada foi apagado: para trazer o Premium de volta basta definir a variável como `true`.

## O que some do app

| Lugar | Antes | Agora |
|---|---|---|
| Menu | Item "Premium" | Não aparece |
| Configurações | Grupo "Premium" (Conhecer o Premium, Minha assinatura, Pets) | Não aparece; a assinatura nem é consultada |
| Rota `/premium` | Tela grátis × Premium | Volta para o Início |
| Central de Ajuda | Categoria "Premium e pagamentos" (3 perguntas) | Não aparece |
| Pets desaparecidos | Recurso do Premium (Menu, `/pets`, `/cadastrar-pet`) | Escondido junto com o Premium |
| Ajuda › Rotas e círculo familiar | "fará parte do plano Premium" | "é um recurso futuro" (sem citar plano) |

Busca de pessoas, alertas, avisos de segurança e emergência continuam gratuitos, como sempre.

## Arquivos

`src/lib/env.ts`, `.env.example`, `.env.production`, `src/features/inicio/sections/inicio-menu-drawer-section.tsx`,
`src/features/configuracoes/*`, `src/features/premium/premium.controller.ts`, `src/pages/premium/index.tsx`,
`src/features/ajuda/help-content.ts`, traduções en/es, `AGENTS.md`.

## Testes

`npm run check` e build web no GitHub Actions (ver PR #1).

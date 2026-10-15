# 2026-10-15 — Início novo, passo a passo e assinatura Nexora Prism

- **Branch / PR**: `desenvolvimento` → `main` (pull request aberto para revisão; sem merge automático).
- **Base**: versão original congelada em `versao-original` (commit `3dfedad`).

## Objetivo

Pedido dos sócios: visual inspirado na imagem de referência, com o mapa maior e a mesma organização; mais cor sem
perder a identidade (marinho, laranja e creme); app simples de usar, inclusive por pessoas idosas e leigas; passo a
passo com opção de pular; assinatura "Um produto da Nexora Prism" com logo, como os apps da Meta.

## O que mudou para quem usa

| Onde | Antes | Agora |
|---|---|---|
| Abertura | Splash nativa e um carregamento | Logo do Encontra-me no centro e "Um produto da NEXORA PRISM" no rodapé, some sozinha (~1 s) |
| Topo do Início | Nome do app e fotos redondas pequenas | Faixa marinho com botão "?", logo e lupa; saudação com acesso ao perfil (ou "Entre ou crie sua conta") |
| Alertas | Carrossel de fotos de 76 px | Cartões grandes: foto com anel colorido, nome, idade e cidade, faixa de idade e situação; "Ver todos" |
| Mapa | Painel que se arrastava para cima e para baixo | Mapa fixo e maior (mais da metade da tela), com filtros Todos / Crianças / Adultos / Idosos, botão de satélite e "minha localização" |
| Pins do mapa | Anel branco | Anel na cor da faixa de idade |
| Menu | Lista única | Grupos (Pessoas · Apoio · Sua conta), ícones coloridos, "Como usar o app" e a assinatura Nexora Prism no rodapé |
| Passo a passo | 3 telas, sem "Pular" | 7 telas curtas, texto grande, desenho do botão de verdade em cada passo, "Pular" sempre visível, "Voltar"/"Próximo"; abre pelo "?", pelo Menu e por Configurações |
| Sobre e Configurações | "Um produto da Nexora Prism." em texto | Assinatura com a logo |
| Barra inferior | Menu · Pedir ajuda · Cadastrar | Igual (já seguia a referência) |

A busca por nome e a lista completa com filtros (cidade, estado, bairro, idade, situação) continuam na tela
"Pessoas desaparecidas", aberta pela lupa ou por "Ver todos". Nenhuma funcionalidade foi removida.

## Correção de comportamento

"Ver a apresentação novamente" (Configurações) só funcionava depois de fechar e abrir o app, porque o Início só
conferia no primeiro carregamento. Agora ele confere sempre que a pessoa volta ao Início.

## Arquivos

- Novos: `src/components/brand-splash.tsx`, `src/components/nexora-signature.tsx`, `src/lib/person-category.ts`,
  `src/lib/splash-state.ts`, `src/features/inicio/tutorial-steps.ts`, `src/features/inicio/sections/inicio-header-section.tsx`,
  `inicio-alerts-section.tsx`, `tutorial-art.tsx`, `assets/images/encontrame-mark.png`, `assets/images/nexora-prism-mark.png`.
- Alterados: `src/pages/inicio/index.tsx`, `src/pages/_layout.tsx`, `src/features/inicio/inicio.controller.ts`,
  `sections/inicio-map-section.tsx`, `inicio-menu-drawer-section.tsx`, `inicio-onboarding-section.tsx`,
  `src/components/brand-map.tsx` e `.web.tsx` (satélite e cor do anel), `brand-button.tsx` (acessibilidade),
  `src/constants/brand.ts` e `src/global.css` (cores), Sobre, Configurações, Central de Ajuda, traduções (en, es),
  dados de demonstração (3 pessoas fictícias: criança, adolescente e idoso), `AGENTS.md`.
- Removidos (substituídos): `inicio-browse-section.tsx` (painel de arrastar) e `inicio-people-carousel-section.tsx`.

## Testes

| Checagem | Resultado |
|---|---|
| `npm run check` (TypeScript + ESLint + traduções) no GitHub Actions | Passou |
| `npx expo export --platform web` (build do Netlify) | Passou |
| Traduções em modo estrito (`check-i18n --strict`) | 996 textos, nada faltando e nada sobrando em en/es |
| Navegação no build web de demonstração (celular 412 px, claro e escuro; desktop 1280 px) | Abertura, 7 passos, "Pular", filtros, menu, Sobre, Configurações, lista, detalhe e "Pedir ajuda" conferidos por prints |
| Formatação Biome (`format:check`) | Falha, **igual na versão original** (informativo, não bloqueia) |
| App Android nativo (mapa nativo, satélite, barra de status) | **Não testado** — precisa de build EAS em um aparelho |

## Pendências e o que depende dos sócios

- **Logo da Nexora Prism**: o arquivo oficial não está no repositório. O prisma em `assets/images/nexora-prism-mark.png`
  foi redesenhado a partir da descrição da marca (pirâmide rosa com contorno branco). Substitua pelo arquivo oficial
  (PNG com fundo transparente, proporção ~9:8) mantendo o mesmo nome; o texto "NEXORA PRISM" é desenhado pelo app.
- **Filtro "Mulheres"**: depende de a API devolver o sexo da pessoa no cadastro e na busca.
- **Mapa no site**: no build de demonstração o mapa aparece vazio porque não há chave do Google Maps; no Netlify ele usa
  `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY`.
- **Satélite no Android** usa a mesma chave do Maps SDK já configurada; confirmar no aparelho.
- Testar no Android real antes de publicar na loja (gerar APK pelo EAS, ver `docs/instalacao/`).

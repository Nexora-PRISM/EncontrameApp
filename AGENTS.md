# EncontrameApp — Guia para agentes

> Fonte única de verdade para IA (Cursor lê `AGENTS.md`; Claude lê `CLAUDE.md`, que importa este arquivo via `@AGENTS.md`).
> Leia este arquivo inteiro **antes de qualquer implementação**.

## Esta é a versão independente de evolução (branch `evolucao`)

Esta branch é uma linha de desenvolvimento separada, criada em 30/10/2026 a partir do commit `7cc8304` da `main`.
Antes de qualquer coisa, leia `docs/evolucao/README.md`.

- Commits **só** na branch `evolucao`. Nunca em `main`, `versao-original`, `desenvolvimento` ou outras branches.
- Sem pull request, merge, rebase ou deploy: integrar e publicar ficam com o dono do app.
- O repositório é público: não coloque segredos nem detalhes internos da API (privada) nesta branch.
- **Nada é publicado daqui**: sem Google Play, App Store, EAS Update, deploy do site, backend ou notificações reais.
- Funcionalidade nova fica atrás de `EXPO_PUBLIC_ENABLE_*` (ligada em dev com mock, desligada em produção) até a API existir.
- Registre cada etapa em `docs/evolucao/REGISTRO.md` e `TESTES.md`; contratos de API em `CONTRATOS-API.md`.
- As seções "Branches e pull requests" e a regra 8 abaixo valem para o repositório original, não para esta cópia.

## Sobre o app

Aplicativo para **encontrar pessoas desaparecidas** — *"para que nenhuma história termine em silêncio"*.
O Encontra-me é um produto da **Nexora Prism** (dados institucionais em `src/lib/app-info.ts`). Funcionalidades:

- Chat com IA (a IA roda no backend; o app só troca mensagens)
- Localização / GPS (mapas, avistamentos)
- Câmeras de segurança (fase futura)

O backend/API já existe e é mantido separadamente — este repositório é apenas o **frontend mobile**.

## Stack

- **Expo (SDK 57)** + **React Native** + **TypeScript**
- **Expo Router** (navegação baseada em arquivos, raiz movida para `src/pages` via plugin `["expo-router", { "root": "./src/pages" }]` em `app.json`)
- **@tanstack/react-query** (estado assíncrono / dados da API)
- **axios** (cliente HTTP dos repositórios)
- **@expo/vector-icons** (ícones, use `MaterialCommunityIcons`)
- Estilo com `StyleSheet` do React Native (sem lib de UI externa)
- **Biome** apenas como formatador (o lint continua no ESLint)

> Expo muda muito entre versões. Consulte a doc exata em https://docs.expo.dev/versions/v57.0.0/ antes de usar APIs do Expo.

## Estrutura de pastas

```
src/
  pages/                       # RAIZ do Expo Router. Só arquivos de rota aqui!
    _layout.tsx                # Stack raiz + QueryClientProvider (headerShown: false)
    index.tsx                  # "/"  Home/boas-vindas (fundo navy + logo)
    login/index.tsx            # "/login"
    signup/index.tsx           # "/signup"           — cadastro etapa 1 (dados)
    signup-password/index.tsx  # "/signup-password"  — cadastro etapa 2 (senha)
    perfil/index.tsx           # "/perfil"           — perfil do usuário (exige login)
    configuracoes/index.tsx    # "/configuracoes"    — configurações do app
    ajuda/index.tsx            # "/ajuda"            — central de ajuda (?categoria=, ?assunto=)
    sobre/index.tsx            # "/sobre"            — sobre o app / Nexora Prism
    pedir-ajuda/index.tsx      # "/pedir-ajuda"      — ajuda em tela cheia (destino do atalho da tela inicial)
    regras/index.tsx           # "/regras"           — regras de uso e resumo de privacidade (sem login)
    aviso-seguranca/index.tsx          # "/aviso-seguranca"          — publicar aviso de segurança (login)
    alerta-emergencia/index.tsx        # "/alerta-emergencia"        — contagem de 10 s; depois abre o 190
    compartilhar-localizacao/index.tsx # "/compartilhar-localizacao" — localização por WhatsApp, SMS ou outro app
    contatos-confianca/index.tsx       # "/contatos-confianca"       — até 5 contatos, salvos só no aparelho
    +html.tsx                  # HTML da versão web (lang="pt-BR"); não é rota
  features/                    # lógica de UI por página (FORA do diretório de rotas)
    <pagina>/
      sections/                # pedaços da página (ex.: login-form-section.tsx)
      <pagina>.controller.ts   # hook useXController: estado + validação + handlers
  services/                    # camada de dados por API (padrão repository)
    <api>/
      <api>.types.ts           # tipos de payload/retorno
      <api>.repository.ts      # interface + getXRepository() (escolhe mock/axios por env)
      <api>.axios.repository.ts# implementação real (usa @/lib/axios)
      <api>.mock.repository.ts # implementação mockada (dados simulados)
      <api>.service.ts         # hooks React Query (useXMutation / useXQuery)
  lib/
    env.ts                     # lê EXPO_PUBLIC_* (useMocks, apiUrl, keys)
    axios.ts                   # instância única do axios (baseURL via env)
    query-client.ts            # QueryClient
  components/                  # componentes reutilizáveis (prefixo "brand-" p/ os da identidade)
    brand-button.tsx           # botão (variantes: orange | blue | outline)
    brand-field.tsx            # input com label
    screen-header.tsx          # cabeçalho com voltar + título
    bottom-bar.tsx             # barra inferior: Início · "Pedir ajuda" (centro) · Cadastrar; em tela larga, botão flutuante
    brand-splash.tsx           # abertura do app: logo no centro + "Um produto da Nexora Prism" no rodapé (estilo "from Meta")
    nexora-signature.tsx       # assinatura "Um produto da Nexora Prism" (abertura, menu, Sobre, Configurações)
    emergency-sheet.tsx        # folha "Pedir ajuda": 190/180/100/192/193 + comunicar desaparecimento / avistamento
    settings-list.tsx          # SettingsGroup / SettingsRow / SettingsSegmented / SettingsChoiceList (configurações, perfil, sobre)
  constants/
    brand.ts                   # Paletas light/dark + Radius — hex só aqui; UI usa useBrand()
  lib/
    brand-theme.tsx            # BrandThemeProvider + useBrand (preferência do sistema)
    i18n.tsx                   # idiomas (pt-BR, en, es): I18nProvider, useT(), tr()
    i18n-msg.ts                # msg(): marca textos de listas/constantes para tradução
    person-category.ts         # faixas de idade (crianças e adolescentes, adultos, idosos): filtros, rótulos, cores
    splash-state.ts            # se a abertura já saiu (o passo a passo só abre depois)
    safety-notes.ts            # avisos de segurança: tipos, horários, validade, bloqueio de dados pessoais, denúncia
    notifications.ts           # expo-notifications (só se o módulo nativo existir): permissão, token, canal, rota do toque
    notification-prefs.ts      # o que a pessoa escolheu receber (neste aparelho; tudo desligado por padrão)
    pending-reminder.ts        # lembrete diário local (19h) dos cadastros salvos no aparelho
    use-notifications-bootstrap.ts # boot no _layout: configura, reagenda o lembrete, registra o aparelho, trata o toque
  translations/                # dicionários en.ts e es.ts (a chave é o texto em português)
assets/images/                 # imagens (logo.png é a logo oficial)
locales/                       # textos das permissões do iOS por idioma (app.json → "locales")
scripts/check-i18n.js          # confere as traduções (npm run i18n:check)
modules/                       # módulos nativos LOCAIS do Expo (autolinking automático)
  emergency-shortcut/          # atalho "Pedir ajuda" na tela inicial do Android (Kotlin, ShortcutManager)
```

> `modules/emergency-shortcut` só funciona em build nativo (`npx expo run:android` / EAS). No Expo Go,
> no web e no iOS o módulo não existe e a tela de Configurações mostra o motivo.

## Arquitetura (siga ao criar novas telas)

Fluxo: **section → controller → service (React Query) → repository (mock | axios)**.

- **Página** (`src/pages/<pagina>/index.tsx`): é o componente core e a rota. Só compõe as
  sections e chama o controller uma vez, passando-o via prop `controller`. Sem regra de negócio.
- **Sections** (`src/features/<pagina>/sections/`): pedaços visuais da página. Recebem `controller`
  por prop e usam **named exports** (nunca ficam no diretório de rotas).
- **Controller** (`src/features/<pagina>/<pagina>.controller.ts`): hook `useXController()` que
  centraliza estado, validação e handlers, consumindo os hooks do service.
- **Service** (`src/services/<api>/<api>.service.ts`): expõe as chamadas da API como hooks do
  React Query; internamente resolve o repositório via `getXRepository()`.
- **Repository**: `getXRepository()` retorna o mock ou o axios conforme `env.useMocks`
  (`EXPO_PUBLIC_USE_MOCKS`). **Toda feature nasce com mock**, para não depender da API.

> O diretório de rotas (`src/pages`) NÃO aceita co-locar arquivos que não sejam rota — todo
> `.tsx` lá é tratado como rota. Sections/controllers/services ficam em `features/`, `services/`, `lib/`.
> A raiz customizada (`root: ./src/pages`) é frágil: se as rotas tipadas quebrarem, rode
> `npx expo start --clear` para regenerar `.expo/types/router.d.ts`.

## Convenções (siga sempre)

- **Cores e raios**: hex só em `@/constants/brand.ts` (paletas light/dark) e espelho CSS em `src/global.css`.
  Na UI use **`useBrand()`** de `@/lib/brand-theme` (e `Radius` de `@/constants/brand.ts`). Nunca escreva hex solto nas telas.
  - Preferência do sistema via `useColorScheme` (`BrandThemeProvider` no `_layout`).
  - `brand.navy` = marinho da marca; `brand.white` = fundo de tela; `brand.surface` = superfícies elevadas. A faixa acima do mapa no Início usa o tom fechado da cor da Sofia (`brand.orangeDark`) quando há paleta.
  - `brand.orange`, `brand.cream`, `brand.blue` = destaques/CTA; `brand.onPrimary` = texto/ícone sobre azul/laranja
- **Imports**: use o alias `@/` (mapeado para `src/`) e `@/assets/` para assets.
- **Nomes de arquivo**: `kebab-case` para componentes e sections (`brand-button.tsx`, `login-form-section.tsx`); cada pasta em `src/pages/<pagina>/index.tsx` define a URL.
- **Idioma da UI**: o texto-fonte é **português (pt-BR)**; o app também sai em **inglês e espanhol**
  (Configurações › Idioma ou menu do Início; sem escolha salva, fica em português).
  - Todo texto visível passa por `t('...')` (de `useT()`, na renderização) ou `tr('...')` (em ações:
    alertas, avisos e mensagens montadas ao tocar). Variáveis: `t('Ligar {number}', { number })`.
  - Listas e constantes fora de componentes: marque com `msg('...')` (`@/lib/i18n-msg`) e traduza ao
    mostrar (`t(opcao.label)`). Valores enviados à API (opções de seleção, status) continuam em português.
  - Criou ou mudou um texto? Acrescente a tradução em `src/translations/en.ts` e `es.ts` e rode
    `npm run i18n:check` (faz parte do `npm run check`; `--strict` exige tudo traduzido).
  - **Não traduza a marca**: "Encontra-me", o slogan e "Um produto da Nexora Prism." (`AppInfo`).
  - O que as pessoas escrevem (casos, mensagens) e as respostas da Sofia não são traduzidos.
- **Componentes novos**: reaproveite `BrandButton`/`BrandField`/`ScreenHeader` antes de criar do zero.
- **Regra de negócio nas telas**: NÃO coloque regra na página. Estado/validação/handlers vão no controller.
- **Integração com API**: crie um service por API em `src/services/<api>/` com o par de repositórios
  (`*.axios.repository.ts` + `*.mock.repository.ts`) e o mock ligado por padrão (`EXPO_PUBLIC_USE_MOCKS=true`).

## Início (celular) e passo a passo

- Ordem da tela: faixa na cor do tema (avatar da conta, logo e busca) → "Alertas recentes" (botões foto/cartão;
  arrastar o mapa para baixo abre a lista rolável) → mapa grande com filtros por faixa de idade, satélite e
  "minha localização" → barra inferior. Seções em `features/inicio/sections/`.
- Filtros só por idade (`lib/person-category.ts`), porque a API não informa o sexo. Não crie filtro "Mulheres" antes
  de a API devolver esse dado.
- Passo a passo: conteúdo em `features/inicio/tutorial-steps.ts`, desenhos em `sections/tutorial-art.tsx`. "Pular"
  sempre visível, texto grande, um assunto por passo. Mudou um botão citado lá? Atualize o passo e o desenho.
- Cores das faixas de idade: tokens `category*` em `constants/brand.ts` (nunca vermelho). Os filtros do mapa
  usam a cor primária (`brand.orange`, que acompanha a paleta da Sofia): borda nessa cor e fundo neutro;
  o selecionado preenche o botão.
- **Web em tela larga**: o header (marca, que volta ao Início, e busca à esquerda; filtros e "Pedir ajuda" à direita) e a lista "Pessoas próximas" ficam
 fixos em todas as páginas (`features/web-shell/web-shell-frame.tsx`, no `_layout`). Busca, filtro, menu e passo a
 passo ficam em `features/inicio/home-shared-state.ts`, para o quadro e o mapa enxergarem o mesmo estado. Não
 recrie header nem lista dentro das páginas; no celular e no app nativo nada disso aparece.
- Quem está em "Procurando" ganha ondas na foto (`components/status-ripple.tsx`) no mapa, na lista lateral e no carrossel.
- Tocar num pin abre o cartão flutuante (`sections/inicio-map-preview-section.tsx`); os cartões de alerta continuam
  abrindo o detalhe direto.
- **Avisos de segurança** (`lib/safety-notes.ts`, `services/safety-notes/`): falam do lugar, nunca de pessoas
  (telefone/CPF/e-mail/@perfil bloqueados); publicar e votar exigem conta; validade de 30 dias renovada por
  confirmação; denúncia por e-mail. Cor âmbar `safetyNote`. Sempre visíveis no mapa
  (contrato em `safety-notes.axios.repository.ts`).

## Regras de produto (honestidade da interface)

- **Nada de botão decorativo.** Recurso que ainda não existe aparece com `SettingsRow unavailable`
  (selo "Em breve", não tocável) — nunca como botão que não faz nada.
- **Nunca confirmar envio que não aconteceu.** O suporte hoje abre o app de e-mail (`lib/support.ts`);
  a tela diz que a mensagem só chega quando a pessoa envia. Não há número de protocolo até existir API.
- **Central de Ajuda** (`features/ajuda/help-content.ts`) descreve só o que o app faz hoje. Ao lançar
  ou mudar uma funcionalidade, atualize a resposta correspondente.
- **Vermelho (`brand.emergency`) é exclusivo do "Pedir ajuda".** Não use em outros botões.
- O app não avisa autoridades automaticamente: textos e telas nunca podem sugerir o contrário.
- **Nunca prometa anonimato.** O uso não é anônimo (dados de identificação podem ir às autoridades com ordem judicial).
- **Dados pessoais nunca em parâmetro de rota** (no web a URL fica no histórico). O cadastro de conta usa
  `lib/signup-draft.ts` (memória) entre as etapas. O CPF não aparece em nenhuma tela.
- **Cadastro de pessoa** (`features/cadastrar-pessoa/legitimacy.ts`): idade, vínculo com a pessoa e declaração de
  veracidade obrigatórios; boletim de ocorrência obrigatório para menores de 18. Não afrouxe sem decisão dos sócios.
- **Cadastro feito sem conta nunca é enviado sozinho.** Só pelo "Revisar e enviar"
  (`/cadastrar-pessoa?rascunho=<id local>`), com a pessoa logada aceitando a declaração de novo.
- Correção e denúncia de caso ("Algo errado neste cadastro?") vão por e-mail ao suporte com o id do caso,
  sem login. Não há API de moderação: nunca diga que o pedido "foi registrado".
- Avisos/confirmações: use `showAlert` / `confirmAction` de `@/lib/dialog` (o `Alert` do RN não aparece no web).
- **Alerta de emergência** (`/alerta-emergencia`): contagem de 10 s com "Cancelar" sempre visível (pausa enquanto o
  sistema pergunta da localização); ao fim abre o discador com o 190 — o app não liga sozinho. O envio ao servidor
  (`POST /EmergencyAlert`) só existe com `EXPO_PUBLIC_ENABLE_EMERGENCY_ALERT` e conta conectada, e a tela só diz
  "recebido" com `alertId` + `receivedAt` na resposta. Sem isso: "não confirmado — ligue 190".
- **Relato de avistamento** (evolução, `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS`; `lib/sighting-report*.ts`,
  `services/sightings/`, `/meus-relatos`): data, horário, descrição obrigatória, roupa, características, direção,
  referência e foto opcional. O relato **não** muda o último local do caso nem é publicado: só a análise humana, no
  servidor, pode fazer isso. A tela só diz "recebido" com número + horário na resposta; sem isso, "não confirmado".
  Limite de 3 relatos por caso a cada 10 minutos no aparelho (o servidor precisa ter o seu). O botão continua
  "Vi essa pessoa por perto" (o passo a passo cita esse texto).
- **Linha do tempo do caso** (evolução; `lib/case-timeline*.ts`, `services/timeline/`, `/pessoa/[id]/linha-do-tempo`):
  cada item tem classificação (Confirmado, Informado no cadastro, Aguardando análise, Não confirmado, Informação
  corrigida). "Confirmado" só para o que a equipe verificou ou fatos do sistema; o que a família declarou é
  "Informado no cadastro"; avistamento sem análise é "Não confirmado". Local só com bairro, cidade e estado
  (`coarseLocation`), nunca rua e número. Classificação desconhecida vira "Não confirmado".
- **Painel da equipe** (evolução; `/equipe`, `services/team/`): só para a equipe (a API responde 403 aos outros).
  Toda decisão pede justificativa. A IA só sugere, com motivo e "indicação" (nunca "confirmado"); quem decide é uma
  pessoa. Alerta enviado não é pessoa mobilizada. Só conexão validada por pessoa gera nova divulgação.
- **Crianças e adolescentes** (evolução; `lib/child-protection.ts`): cadastro de menor não pode citar escola, endereço
  de casa, condomínio, rotina nem rua com número; a página do caso mostra a faixa de prioridade.
- **Voluntários** (evolução; `/quero-ajudar`): orientações de segurança antes de tudo; nada de busca sozinho,
  abordagem ou confronto; sem ranking; voluntário não recebe dados das famílias.
- **Encontra-me Vision** (evolução; `/vision*`, `lib/vision-rules.ts`, `services/vision/`, `docs/evolucao/VISION.md`):
  três ambientes. A comunidade vê só região + nível de cobertura (nunca posição, responsável, ângulo, horário ou
  contagem). O cadastro de câmera nunca aceita senha, usuário, IP ou endereço de acesso, e câmera nova começa
  "Aguardando verificação". O ambiente institucional exige habilitação verificada (`verified`); dizer que é autoridade
  não libera nada. Ações sensíveis pedem justificativa e vão para a auditoria, inclusive as negadas. A IA só sugere
  "provável" ou "inconclusiva"; confirmar exige pessoa que abriu o trecho. Nada biométrico
  (`BIOMETRIC_ANALYSIS_ENABLED = false`). Semelhança nunca vira "pessoa encontrada". Sem evidência, sem trajeto.
  Câmera indisponível não prova ausência. O app nunca envia pedido de preservação sozinho. Dados de demonstração
  sempre marcados como fictícios.
- **Localização para contatos**: WhatsApp, SMS ou compartilhamento abrem com a mensagem pronta; a tela nunca diz que
  a mensagem foi entregue. Contatos de confiança (até 5) ficam só no aparelho (`lib/trusted-contacts.ts`).
- **Notificações** (`lib/notifications.ts`, `services/notifications/`, Configurações › Notificações): tudo desligado
 até a pessoa ligar; a permissão só é pedida ao ligar uma opção ou tocar em "Acompanhar este caso". Título e corpo
 nunca trazem nome, idade ou foto (tela bloqueada); `data` leva só `{ type, personId }`. O lembrete de cadastros
 salvos é local e funciona sempre no celular. Casos perto, novos cadastros da região e "Acompanhar" dependem da API
 (`POST`/`DELETE /Notification/device`, `GET`/`POST`/`DELETE /MissingPerson/{id}/follow`) e só aparecem com
 `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS`; sem ela, "Em breve" e botão oculto. Push remoto exige build nativo
 (não funciona no Expo Go do Android nem no web) e `google-services.json` (Firebase) no Android.
- **Premium e pets são demanda futura** (removidos em 17/10/2026). Não recriar telas, menu, ajuda, flags nem
  serviços até os sócios pedirem. O que já vale para quando voltar: busca de pessoas e emergência continuam
  gratuitas; pets desaparecidos entram junto com o Premium; não há cobrança no app sem a loja e a API de
  assinaturas. O registro completo está no `CLAUDE.md`.

## Comandos

```bash
npm run check       # typecheck + lint + traduções — RODAR ANTES DE FINALIZAR QUALQUER TAREFA
npm run i18n:check  # só as traduções (textos sem tradução, variáveis {nome} trocadas)
npm run typecheck   # só tipos (tsc --noEmit)
npm run lint        # só ESLint
npm run lint:fix    # ESLint com correção automática
npm run format      # Biome: formata e escreve os arquivos
npm run format:check# Biome: só verifica a formatação
npm start           # inicia o Metro (Expo Go via QR Code)
```

### Variáveis de ambiente (prefixo `EXPO_PUBLIC_`)

O Expo injeta `process.env.EXPO_PUBLIC_*` no bundle em `expo start` / `expo export`.
Precedência: **env da máquina (Windows / Netlify) > `.env.local` > `.env.production` / `.env.development`**.

| Arquivo | Git | Uso |
|---------|-----|-----|
| `.env.example` | sim | Template — copiar para `.env.local` |
| `.env.local` | não | Valores reais de desenvolvimento |
| `.env.production` | sim | Chaves vazias (como `appsettings.json`). Valores reais no Netlify / máquina |

- `EXPO_PUBLIC_USE_MOCKS` — `true` usa os repositórios mockados; `false` usa a API real. Vazio: mock em dev, API real em build de produção.
- `EXPO_PUBLIC_API_URL` — URL base da API (já inclui `/api`).
- `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` — Maps JavaScript API (web).
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — OAuth Google (client ID web).
- `EXPO_PUBLIC_APP_KEY` — header `X-App-Key` (igual a `AppKey__Value` da API).
- `GOOGLE_MAPS_API_KEY` — só build nativo Android; não vai no Netlify.
- `EXPO_PUBLIC_ENABLE_EMERGENCY_ALERT` — envio do alerta de emergência à API. Vazio: ligado em dev (mock), desligado em produção.
- `EXPO_PUBLIC_MOCK_EMERGENCY_FAIL` — só no mock: `true` simula falha no envio do alerta (para testar a tela "não confirmado").
- `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS` — notificações vindas do servidor (casos perto, novos cadastros da região, "Acompanhar"). Vazio: ligado em dev (mock), desligado em produção (opções "Em breve", botão "Acompanhar" oculto).
- `GOOGLE_SERVICES_JSON` — só build nativo Android (variável de arquivo no EAS); sem ela, usa `google-services.json` da raiz, se existir.
- `EXPO_PUBLIC_WEB_URL` — endereço público do app web (sem barra no fim); entra no texto de "Divulgar este caso".
- `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` — (evolução) relato completo de avistamento e "Meus relatos". Vazio: ligado em dev (mock), desligado em produção; desligado, vale o registro simples de avistamento.
- `EXPO_PUBLIC_MOCK_SIGHTING_FAIL` — só no mock: `true` simula falha no envio do relato (mensagem "não confirmado").
- `EXPO_PUBLIC_ENABLE_SEARCH_NETWORK` — (evolução) rede de busca: raio, sugestão de região, ampliação e teia. Vazio: ligada em dev (mock), desligada em produção.
- `EXPO_PUBLIC_ENABLE_AI_ASSIST` — (evolução) sugestões da IA no Painel da equipe. Vazio: ligada em dev (mock), desligada em produção.
- `EXPO_PUBLIC_ENABLE_VOLUNTEERS` — (evolução) cadastro de voluntário em "Quero ajudar". Vazio: ligado em dev (mock), desligado em produção.
- `EXPO_PUBLIC_ENABLE_VISION` — (evolução) Encontra-me Vision (rede de câmeras participantes). Vazio: ligado em dev (dados fictícios), desligado em produção. Só ligar com a API `/Vision/*`, convênios e avaliação jurídica.
- `EXPO_PUBLIC_ENABLE_CASE_TIMELINE` — (evolução) linha do tempo completa vinda da API. Vazio: ligada em dev (mock), desligada em produção; desligada, a linha do tempo é montada com o cadastro e o histórico de avistamentos.

No Netlify: Site configuration → Environment variables (disponíveis no **build**), depois um novo deploy. `netlify.toml` usa `npx expo export --platform web` e publica `dist`.

## Branches e pull requests

A branch depende do modo do Cursor em que o pedido foi feito:

- **Modo Agent ou Debug**: faça a implementação na **branch atual**. Não crie branch nova.
- **Modo Planejamento (Plan)**: ao implementar o plano, crie uma branch nova a partir da `main` atualizada
 (`git fetch`, `git checkout main`, `git pull`, depois `git checkout -b feature/<descricao-curta>` em kebab-case),
 **antes** de editar código, e faça nela todas as alterações.

Para levar uma branch `feature/...` à `main`:

1. Abra um pull request da branch para `main`. Sem merge local na `main`.
2. Assim que o PR existir, copie a URL para a área de transferência e envie o mesmo link no chat, para quem precisar encaminhar a outra pessoa aprovar. No PowerShell: `Set-Clipboard -Value "<url>"`. Confirme no chat que o link já está copiado.

## Regras de trabalho para o agente

1. **Sempre rode `npm run check` antes de concluir** e só finalize com saída limpa (exit 0).
2. Neste ambiente (Windows), a instalação de pacotes exige contornar SSL:
   defina `NODE_OPTIONS=--use-system-ca` antes de `npm install` / `npx expo install`.
   No PowerShell: `$env:NODE_OPTIONS="--use-system-ca"`.
3. Prefira `npx expo install <pkg>` (garante versão compatível com o SDK) em vez de `npm install`.
4. Não introduza libs de UI/estilo novas sem necessidade — manter o padrão atual.
5. Respeite a arquitetura pages/features/services: nada de regra de negócio na página nem de
   co-locar não-rotas dentro de `src/pages`.
6. Feature nova sempre com repositório mock além do axios; o service escolhe por env.
7. Se as rotas tipadas quebrarem (`.expo/types/router.d.ts` com caminhos estranhos), rode
   `npx expo start --clear` para regenerar antes do `npm run check`.
8. Modo Agent ou Debug: implemente na branch atual. Modo Planejamento: branch `feature/...` nova a partir
   da `main`, subida à `main` por pull request. Ao abrir o PR, copie a URL para a área de transferência
   e mande o link no chat (veja **Branches e pull requests**).

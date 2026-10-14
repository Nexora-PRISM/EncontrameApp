# EncontrameApp — Guia para agentes

> Fonte única de verdade para IA (Cursor lê `AGENTS.md`; Claude lê `CLAUDE.md`, que importa este arquivo via `@AGENTS.md`).
> Leia este arquivo inteiro **antes de qualquer implementação**.

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
    pets/index.tsx             # "/pets"             — pets desaparecidos (flag EXPO_PUBLIC_ENABLE_PETS)
    cadastrar-pet/index.tsx    # "/cadastrar-pet"    — cadastro de pet (login + Premium, chave em lib/premium-plan.ts)
    premium/index.tsx          # "/premium"          — grátis × Premium, preço de referência e situação da assinatura (sem login)
    regras/index.tsx           # "/regras"           — regras de uso e resumo de privacidade (sem login)
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
    emergency-sheet.tsx        # folha "Pedir ajuda": 190/180/100/192/193 + comunicar desaparecimento / avistamento
    settings-list.tsx          # SettingsGroup / SettingsRow / SettingsSegmented / SettingsChoiceList (configurações, perfil, sobre)
  constants/
    brand.ts                   # Paletas light/dark + Radius — hex só aqui; UI usa useBrand()
  lib/
    brand-theme.tsx            # BrandThemeProvider + useBrand (preferência do sistema)
    i18n.tsx                   # idiomas (pt-BR, en, es): I18nProvider, useT(), tr()
    i18n-msg.ts                # msg(): marca textos de listas/constantes para tradução
    premium-plan.ts            # preço (R$ 9,90/mês), plano anual/teste, grátis × Premium e texto da situação da assinatura
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
  - `brand.navy` = fundo da marca (home); `brand.white` = fundo de tela; `brand.surface` = superfícies elevadas
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
- **Localização para contatos**: WhatsApp, SMS ou compartilhamento abrem com a mensagem pronta; a tela nunca diz que
  a mensagem foi entregue. Contatos de confiança (até 5) ficam só no aparelho (`lib/trusted-contacts.ts`).
- **Premium** (`lib/premium-plan.ts`): preço, desconto anual, teste grátis, `onSale` e a lista grátis × Premium ficam
  só nesse arquivo. Busca de pessoas e emergência **nunca** vão para o Premium. Não há compra no app: só ligue `onSale`
  junto com a cobrança pela loja (Google Play Billing) e a API de assinaturas. Recurso Premium planejado aparece como
  "Em breve". A situação da assinatura vem de `GET /Subscription/me` (sem o endpoint, 404 = plano gratuito).

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
- `EXPO_PUBLIC_ENABLE_PETS` — pets desaparecidos (Premium). Vazio: ligado em dev, desligado em produção.
- `EXPO_PUBLIC_MOCK_PREMIUM` — só no mock: vazio = Premium ativo; `false` = sem assinatura; `trial`, `grace` (pagamento recusado), `cancelled` ou `expired` simulam cada situação.
- `EXPO_PUBLIC_ENABLE_EMERGENCY_ALERT` — envio do alerta de emergência à API. Vazio: ligado em dev (mock), desligado em produção.
- `EXPO_PUBLIC_MOCK_EMERGENCY_FAIL` — só no mock: `true` simula falha no envio do alerta (para testar a tela "não confirmado").
- `EXPO_PUBLIC_WEB_URL` — endereço público do app web (sem barra no fim); entra no texto de "Divulgar este caso".

No Netlify: Site configuration → Environment variables (disponíveis no **build**), depois um novo deploy. `netlify.toml` usa `npx expo export --platform web` e publica `dist`.

## Branches e pull requests

Quando a pessoa pedir uma **feature** para a IA implementar:

1. Crie uma branch nova a partir da `main` atualizada (`git fetch`, `git checkout main`, `git pull`, depois `git checkout -b feature/<descricao-curta>` em kebab-case), **antes** de editar código.
2. Faça todas as alterações dessa feature nessa branch. Não commite nem faça push direto na `main`.
3. Para subir o trabalho à `main`, abra um pull request da branch `feature/...` para `main`. Esse é o único caminho: sem merge local na `main` e sem push direto na `main`.
4. Assim que o PR existir, copie a URL para a área de transferência e envie o mesmo link no chat, para quem precisar encaminhar a outra pessoa aprovar. No PowerShell: `Set-Clipboard -Value "<url>"`. Confirme no chat que o link já está copiado.

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
8. Feature pedida à IA: branch `feature/...` a partir da `main`, e subida à `main` só por pull request.
   Ao abrir o PR, copie a URL para a área de transferência e mande o link no chat
   (veja **Branches e pull requests**).

# Instalação, execução e publicação

Resumo prático. O `README.md` da raiz tem o passo a passo de acesso ao repositório e de Git.

## Requisitos

- Node.js **22.22.1 ou mais novo** (com npm) e Git.
- Para Android nativo: Android Studio (emulador) ou um celular com depuração USB; conta Expo para o EAS.

## Rodar no computador

```bash
npm install
cp .env.example .env.local      # no Windows: Copy-Item .env.example .env.local
npm start                       # Expo: QR Code para o Expo Go, "w" abre no navegador
```

Com `EXPO_PUBLIC_USE_MOCKS=true` o app funciona sem a API, com pessoas fictícias (bom para testar o visual).

Antes de qualquer pull request:

```bash
npm run check                         # tipos + lint + traduções
npx expo export --platform web        # mesmo build do Netlify
```

## Variáveis de ambiente

Lista completa e explicada em `.env.example`. Em produção (Netlify) o mínimo é:

| Variável | Valor |
|---|---|
| `EXPO_PUBLIC_USE_MOCKS` | `false` |
| `EXPO_PUBLIC_API_URL` | URL da API com `/api` |
| `EXPO_PUBLIC_APP_KEY` | igual a `AppKey__Value` da API |
| `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` | chave da Maps JavaScript API, restrita ao domínio |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | login com Google |
| `EXPO_PUBLIC_WEB_URL` | `https://encontrame.nexoraprism.com.br` |

Nunca coloque valores reais em arquivos do Git (`.env.production` fica com as chaves vazias de propósito).

## Netlify (site)

`netlify.toml` já define: comando `npx expo export --platform web`, pasta `dist` e o redirecionamento das rotas para
`index.html` (com exceção de `/privacidade`).

**Situação (confirmada em 15/10/2026):** o Netlify está ligado ao repositório (projeto `encontrame`) e gera um
**Deploy Preview para cada pull request**, no endereço `https://deploy-preview-<número do PR>--encontrame.netlify.app`.
Exemplo: o PR #1 está em https://deploy-preview-1--encontrame.netlify.app/inicio. O preview é refeito a cada envio
para a branch do PR, e o robô do Netlify comenta o link no próprio PR.

- O preview usa as variáveis de ambiente do Netlify (API real e chave do Google Maps), então é o melhor lugar para
  conferir o mapa, os pins e o cartão flutuante antes do merge.
- Recursos com flag desligada em produção (avisos de segurança) também ficam desligados no preview. Para
  testar os avisos no preview sem a API, dá para criar, só no contexto **Deploy Previews**, as variáveis
  `EXPO_PUBLIC_USE_MOCKS=true` e `EXPO_PUBLIC_ENABLE_SAFETY_NOTES=true` (o preview passa a usar dados fictícios).

Para conferir a configuração: app.netlify.com → projeto `encontrame` → **Site configuration → Build & deploy**
(branch de produção: `main`) e **Environment variables** (as da tabela acima; depois de mudar, faça um novo deploy).

## Android (APK / AAB)

O site e o app Android são publicados separadamente.

- Teste rápido no celular (APK): `npx eas build --platform android --profile preview` (crie o perfil `preview` com
  `"android": { "buildType": "apk" }` em `eas.json`, se ainda não existir).
- Loja (AAB): `npx eas build --platform android --profile production` e depois
  `npx eas submit --platform android --profile production`.
- O mapa nativo precisa de `GOOGLE_MAPS_API_KEY` configurada como *secret* no EAS.
- O atalho "Pedir ajuda" na tela inicial do Android (`modules/emergency-shortcut`) só existe no build nativo.

Pendência conhecida (ver `docs/AUDITORIA-2026-10.md`): decidir o nome definitivo do pacote Android antes da primeira
publicação na loja, porque ele não pode ser trocado depois.

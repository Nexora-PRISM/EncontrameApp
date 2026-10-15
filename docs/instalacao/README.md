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

Para conferir ou ligar:

1. app.netlify.com → o site do Encontra-me → **Site configuration → Build & deploy → Continuous deployment**.
2. Repositório: `Nexora-PRISM/EncontrameApp`. **Production branch: `main`.**
3. Recomendado: em **Deploy Previews**, ligar "Any pull request" — cada PR ganha um link de teste antes do merge.
4. **Environment variables**: as da tabela acima. Depois de mudar uma variável, faça um novo deploy.

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

# Estado inicial do repositório — 15/10/2026

Registro feito **antes** de qualquer alteração no código.

## Acesso

- Repositório: `Nexora-PRISM/EncontrameApp` (público no GitHub), permissão de leitura e escrita confirmada.
- Branch principal: `main`, sem regra de proteção configurada.
- Branches existentes antes do trabalho: só `main`. Nenhum pull request aberto ou fechado. Nenhuma release.
- Último commit da `main`: `3dfedad` — "chore: criado readme para devs, e nova regra de implementação para IA"
  (14/10/2026). 73 commits no histórico, todos do mesmo autor. Nenhuma alteração pendente de outras pessoas.

## O "ZIP original"

- **Não há arquivo ZIP no repositório**: nem na `main`, nem em nenhum commit do histórico, nem em releases.
- O repositório contém o **código-fonte completo** do app (Expo SDK 57 + React Native + TypeScript), que é a versão
  publicada em encontrame.nexoraprism.com.br. Esse código foi tratado como o original.
- Proteção aplicada:
  - branch `versao-original` criada no commit `3dfedad` (cópia congelada; ninguém deve mexer nela);
  - ZIP permanente desse estado: https://github.com/Nexora-PRISM/EncontrameApp/archive/3dfedad8c3e3a8c3ff10bd7215cdf2522ebbf0d7.zip
  - a tag `original-2026-10-15` **não pôde ser enviada** (o ambiente da IA bloqueia envio de tags). Um administrador
    pode criá-la em *Releases* (ver `docs/atualizacoes/README.md`).
- A `main` não foi alterada.

## Tecnologia (identificada, não presumida)

| Item | Situação |
|---|---|
| App | Expo SDK 57, React Native 0.86, React 19.2, TypeScript 6, Expo Router (raiz `src/pages`) |
| Dados | React Query + axios, padrão repository (mock ou API real por `EXPO_PUBLIC_USE_MOCKS`) |
| Backend | API .NET em outro repositório (não auditado aqui) |
| Mapas | `react-native-maps` (Android) e Google Maps JavaScript API (web) |
| Web | Netlify (`netlify.toml`) e Vercel (`vercel.json`) configurados para `expo export --platform web` |
| Android | EAS Build (`eas.json`, AAB de produção) |
| Testes automatizados | Não existem (só `npm run check`: tipos, lint e traduções) |
| CI | Não existia (nenhuma pasta `.github`) |

## Checagens na versão original

- **No ambiente da IA**: o registro do npm está bloqueado pela rede, então `npm ci`, typecheck, lint e build
  **não puderam rodar aqui**. A checagem de traduções rodou: 964 textos, nada faltando em inglês e espanhol.
- **No GitHub**: foi criada a checagem automática (`.github/workflows/checagem.yml`). O primeiro envio da branch
  `desenvolvimento` contém só documentação e essa checagem, sem mudar o código do app — o resultado dessa
  execução é a linha de base da versão original (ver a aba *Actions*).

## Auditoria anterior

A auditoria funcional detalhada (o que funciona, o que é simulado, riscos e plano por fases) está em
`docs/AUDITORIA-2026-10.md` e continua válida para a versão original.

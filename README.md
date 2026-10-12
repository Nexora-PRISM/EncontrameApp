# Encontra-me

*"para que nenhuma história termine em silêncio"*

Aplicativo de mobilização social para ajudar a encontrar pessoas desaparecidas.
**Um produto da Nexora Prism** — [nexoraprism.com.br](https://nexoraprism.com.br) · contato@nexoraprism.com.br

Este repositório contém o **app** (Expo + React Native, Android prioritário, também roda na web).
A API é mantida em outro repositório.

## Rodando

Requisitos: **Node.js 22.22.1 ou mais novo** (com npm). O projeto usa Expo/Metro — não usa Vite.

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm start                    # Expo
npm run check                # typecheck + lint + traduções (obrigatório antes de abrir PR)
```

## Documentação

- `AGENTS.md` — arquitetura, convenções e regras de trabalho (leia antes de mudar código).
- `docs/AUDITORIA-2026-10.md` — auditoria, riscos e plano por fases.

## Idiomas

O app está em **português** (padrão), **inglês** e **espanhol**: Configurações › Idioma ou o menu da tela
inicial ("Auto" segue o idioma do celular). O texto em português é a chave de cada tradução
(`src/translations/en.ts` e `es.ts`); `npm run i18n:check` mostra o que falta traduzir. Nome, slogan e
assinatura da marca não são traduzidos. Detalhes em `AGENTS.md` (Convenções › Idioma da UI).

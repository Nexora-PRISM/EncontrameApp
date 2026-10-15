# Fluxo de atualizações do Encontra-me

Este documento explica como o app evolui sem perder a versão original. Vale para pessoas e para a IA.

## Onde fica cada versão

| Branch | Para que serve | Quem mexe |
|---|---|---|
| `versao-original` | Cópia congelada do app como estava em 15/10/2026 (commit `3dfedad`). **Nunca recebe commits.** | Ninguém |
| `main` | Versão oficial, a que vai para o Netlify e para a Play Store. Só recebe código por pull request aprovado. | Só via PR |
| `desenvolvimento` | Área de trabalho contínua: cada melhoria entra aqui primeiro. | Equipe e IA |
| `feature/...` ou `fix/...` | Opcional, para uma melhoria grande ou arriscada. Nasce da `desenvolvimento` e volta para ela por PR. | Equipe e IA |

O repositório **não tem arquivo ZIP**: o original é o código da branch `versao-original`. Para baixar essa versão em ZIP a
qualquer momento, use o link fixo do commit (não muda nunca):

https://github.com/Nexora-PRISM/EncontrameApp/archive/3dfedad8c3e3a8c3ff10bd7215cdf2522ebbf0d7.zip

> Recomendado (feito por um administrador no site do GitHub, porque a sessão da IA não pode criar tags):
> 1. **Releases → Draft a new release**, tag `original-2026-10-15`, alvo `versao-original`. Isso cria um ZIP oficial que não muda.
> 2. **Settings → Branches → Add rule** para `main` e `versao-original`: exigir pull request e bloquear exclusão/push forçado.

## Passo a passo de cada atualização

1. Partir da `desenvolvimento` atualizada (`git checkout desenvolvimento && git pull`).
2. Ler `AGENTS.md` (regras de arquitetura, honestidade da interface e traduções).
3. Fazer as mudanças sem recriar o app: aproveitar telas, componentes e serviços existentes.
4. Rodar `npm run check` (tipos, lint e traduções) e `npx expo export --platform web` (build do Netlify).
5. Registrar a atualização em um arquivo novo nesta pasta: `AAAA-MM-DD-assunto.md`, com data, objetivo,
   arquivos modificados, testes, resultados e pendências (use o modelo abaixo).
6. Commit com mensagem que diga **por que** a mudança existe e `git push` para a `desenvolvimento`.
7. Abrir (ou atualizar) o pull request **`desenvolvimento` → `main`**. A checagem automática roda no GitHub.
8. Abrir o **Deploy Preview do Netlify** (link comentado no PR, `https://deploy-preview-<nº>--encontrame.netlify.app`)
   e conferir no celular. Os prints da checagem também ficam na aba *Actions* → execução → *Artifacts*.
9. Um sócio aprova e faz o merge. **Nada entra na `main` sem essa aprovação.**

## Checagem automática (GitHub Actions)

Arquivo: `.github/workflows/checagem.yml`. Roda a cada envio para `desenvolvimento`, `feature/**`, `fix/**` e em todo PR:

- `npm ci` e `npm run check` (TypeScript, ESLint e traduções);
- `npx expo export --platform web` (o mesmo comando do Netlify);
- um build de demonstração com dados fictícios e prints das telas no tamanho de celular, claro e escuro.

Se a checagem ficar vermelha, o PR não deve ser aprovado até ser corrigido.

## Versões

- `app.json → expo.version` é a versão que aparece em **Sobre**. Suba o número quando uma leva de mudanças
  for para a loja (ex.: 1.0.0 → 1.1.0 para recursos novos, 1.0.1 para correções).
- O número interno do Android (versionCode) é controlado pelo EAS (`eas.json` → `appVersionSource: remote`).

## Publicação

- **Site (Netlify)**: publica a `main` com `npx expo export --platform web` e pasta `dist` (`netlify.toml`).
  O Netlify está ligado ao repositório: o merge na `main` publica o site e cada PR ganha um Deploy Preview.
  Detalhes em `docs/instalacao/`.
- **Android**: o deploy do site **não** atualiza o app instalado. É preciso gerar um novo AAB pelo EAS e enviar à
  Play Store (passo a passo em `docs/instalacao/README.md`).

## Modelo de registro

```markdown
# AAAA-MM-DD — assunto

- **Branch / PR**:
- **Objetivo**:
- **Arquivos modificados**:
- **Testes executados e resultado**:
- **O que mudou para quem usa**:
- **Pendências e o que depende dos sócios**:
```

## Como pedir uma nova atualização à IA

Basta descrever o que você quer (ex.: "adicionar filtro por cidade no mapa"). A IA deve:
consultar o código atual da `desenvolvimento`, ver o que já existe, mexer só nessa branch, rodar a checagem,
atualizar estes documentos, enviar para o GitHub e responder com o link do PR e o que ainda falta.
Ela não gera ZIP novo nem duplica o projeto, a menos que você peça.

# Encontra-me

*"para que nenhuma história termine em silêncio"*

Aplicativo de mobilização social para ajudar a encontrar pessoas desaparecidas.
**Um produto da Nexora Prism** — [nexoraprism.com.br](https://nexoraprism.com.br) · contato@nexoraprism.com.br

Este repositório contém o **app** (Expo + React Native, Android prioritário, também roda na web).
A API é mantida em outro repositório.

Repositório: [github.com/Nexora-PRISM/EncontrameApp](https://github.com/Nexora-PRISM/EncontrameApp) (privado).

## Acesso ao repositório privado

O GitHub esconde um repositório privado de quem não está autorizado. Sem o convite aceito, o clone e o envio falham com **Repository not found** ou **403**, mesmo com a URL certa.

1. Peça para um administrador da organização **Nexora-PRISM** convidar o seu usuário do GitHub para este repositório, com permissão de escrita.
2. Abra o e-mail do GitHub e aceite o convite. Sem esse aceite, a conta ainda não enxerga o repositório.
3. Entre em [github.com](https://github.com) no navegador com **essa mesma conta**. Outra conta pessoal, mesmo que a senha esteja correta, não tem acesso.

No Windows, o Git abre o navegador na primeira vez que fala com o GitHub (Git Credential Manager). Confirme que o login é a conta convidada. O terminal não pede a senha do GitHub: se aparecer um pedido de senha no prompt, cancele e deixe o navegador concluir o login.

## Baixar o projeto

Requisito: [Git](https://git-scm.com/downloads) instalado.

```powershell
git clone https://github.com/Nexora-PRISM/EncontrameApp.git
cd EncontrameApp
```

Se o clone disser que o repositório não existe, volte à seção de acesso: convite aceito e login na conta certa.

## Instalar dependências

Requisito: **Node.js 22.22.1 ou mais novo**, com npm. O projeto usa Expo/Metro — não usa Vite.

Na pasta do projeto:

```powershell
npm install
Copy-Item .env.example .env.local
```

Abra o `.env.local` e preencha as chaves. Esse arquivo não vai para o Git. Quem já trabalha no app pode passar os valores por um canal privado; não cole segredo em issue, pull request ou chat público.

Se o `npm install` falhar com erro de certificado (SSL) no Windows:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install
```

O `npm install` também ativa o Git hook de pre-commit (Husky). Por isso o Git precisa estar instalado antes.

## Rodar

```powershell
npm start
```

O Expo abre o app no celular (Expo Go, pelo QR Code) ou no navegador. Para checar tipos, lint e traduções:

```powershell
npm run check
```

Esse comando é obrigatório antes de abrir um pull request.

## Subir alterações

A `main` recebe código só por pull request. Não faça commit direto nela e não dê push nela.

Cada leva de mudança nasce numa branch nova, a partir da `main` atualizada.

```powershell
git checkout main
git pull
git checkout -b feat/descricao-curta
```

Troque `feat/descricao-curta` por um nome curto do que você fez (`fix/login-android`, `feat/mapa-filtros`). Use uma branch por assunto. Não reaproveite a branch de outro trabalho.

Edite os arquivos. Não inclua `.env.local`, `credentials/` nem chave de API.

```powershell
npm run check
git add .
git status
git commit -m "Descreva por que a mudança existe."
git push -u origin HEAD
```

O `git status` antes do commit serve para ver se entrou arquivo que não deveria. Se o commit for recusado, leia a mensagem do hook: ele roda a checagem de tipos e o lint nos arquivos alterados. Corrija o que ele apontar e crie um commit novo. Não use `--no-verify`.

Com a branch no GitHub, abra o pull request **para a `main`**:

1. Abra o repositório no GitHub. O site mostra o botão **Compare & pull request** logo depois do push.
2. Confira a base: **main**. A comparação é a sua branch.
3. Escreva o que mudou e como testar.
4. Crie o pull request e avise quem revisa.

Pelo GitHub CLI, se o `gh` estiver instalado e autenticado na mesma conta:

```powershell
gh pr create --base main --fill
```

Espere a revisão. Ajuste pedido na mesma branch (`git add`, `git commit`, `git push`). Não abra outra branch para uma correção do mesmo pull request.

Quando o pull request for aceito e entrar na `main`, atualize a sua cópia antes do próximo trabalho:

```powershell
git checkout main
git pull
```

## Documentação

- `AGENTS.md` — arquitetura, convenções e regras de trabalho (leia antes de mudar código).
- `docs/AUDITORIA-2026-10.md` — auditoria, riscos e plano por fases.

## Idiomas

O app está em **português** (padrão), **inglês** e **espanhol**: Configurações › Idioma ou o menu da tela
inicial ("Auto" segue o idioma do celular). O texto em português é a chave de cada tradução
(`src/translations/en.ts` e `es.ts`); `npm run i18n:check` mostra o que falta traduzir. Nome, slogan e
assinatura da marca não são traduzidos. Detalhes em `AGENTS.md` (Convenções › Idioma da UI).

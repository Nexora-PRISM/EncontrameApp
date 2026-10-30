# Encontra-me — versão independente de evolução

Este repositório é uma **cópia separada** do Encontra-me, feita para desenvolver as novas funcionalidades sem tocar no
aplicativo que já está no ar. Ele não publica nada.

## Regras desta cópia

| Pode | Não pode |
|---|---|
| Criar telas, componentes, serviços, testes e documentação | Mexer no repositório original `Nexora-PRISM/EncontrameApp` (nenhum commit, branch, merge ou PR lá) |
| Alterar arquivos copiados do original, **só aqui** | Publicar na Google Play ou na App Store |
| Rodar a checagem automática (tipos, lint, traduções, testes, build web) | Fazer atualização OTA (EAS Update) ou deploy do site |
| Gerar builds de validação, quando autorizados | Mexer no backend, em bancos ou em notificações reais |

- Autorização para **desenvolver** não é autorização para **integrar** no original.
- Autorização para **integrar** não é autorização para **publicar**. Cada uma é pedida separadamente aos sócios.
- Não há sincronização automática com o original.

## De onde esta cópia partiu

- Repositório original: `https://github.com/Nexora-PRISM/EncontrameApp` (consultado só para leitura em 30/10/2026).
- Base: branch `main` do original, commit `7cc8304` ("feat: adicionado google-services.json").
- Neste repositório, a branch `main` guarda essa base **sem alteração** (serve de comparação na hora de integrar).

## Branches

| Branch | Para que serve |
|---|---|
| `main` | Cópia fiel do original em `7cc8304`. Não recebe commits. |
| `evolucao` | Onde as etapas são desenvolvidas, uma por vez, cada uma em commits identificáveis. |
| `feature/...` | Opcional, para uma etapa grande. Volta para `evolucao` por pull request. |

Para ver tudo o que mudou em relação ao original: `git diff main..evolucao --stat`.
Para desfazer uma etapa: `git revert` dos commits dela (listados em `REGISTRO.md`).

## Como retomar o trabalho

1. Ler `AGENTS.md` (arquitetura, honestidade da interface, traduções) e este README.
2. Ver em `PLANO.md` qual é a próxima etapa e em `REGISTRO.md` o que já foi feito.
3. Ver em `PROBLEMAS-CONHECIDOS.md` o que está pendente ou bloqueado.
4. Desenvolver na `evolucao`. Toda funcionalidade nova:
   - nasce com repositório **mock** e repositório **axios**, como o resto do app;
   - fica atrás de uma variável `EXPO_PUBLIC_ENABLE_*`: ligada em desenvolvimento (mock), **desligada em produção** até a
     API existir;
   - tem os textos traduzidos em inglês e espanhol;
   - tem o contrato de API descrito em `CONTRATOS-API.md`.
5. Validar: `npm run check` e `npm test` (a checagem automática do GitHub roda os dois e o build web a cada envio).
6. Registrar a etapa em `REGISTRO.md` e o resultado dos testes em `TESTES.md`.

## Documentos desta pasta

| Arquivo | Conteúdo |
|---|---|
| `PLANO.md` | Etapas planejadas, ordem e situação de cada uma |
| `REGISTRO.md` | O que cada etapa mudou, com os arquivos criados e alterados |
| `CONTRATOS-API.md` | Endpoints e formatos que o backend .NET precisa implementar |
| `TESTES.md` | O que foi testado em cada etapa e o resultado |
| `PROBLEMAS-CONHECIDOS.md` | Bloqueios, riscos e itens experimentais |

## Quando os sócios decidirem atualizar o app original

Nada é levado ao original sem autorização expressa. Nesse momento, o roteiro é:

1. Comparar `main` com `evolucao` e listar as melhorias.
2. Explicar cada funcionalidade e dizer o que está pronto e o que depende da API.
3. Listar os arquivos do original que mudariam e os possíveis conflitos.
4. Os sócios escolhem o que entra.
5. Preparar backup, plano de integração e plano de reversão.
6. Só então, com autorização, abrir o pull request no original. Publicar é outra autorização.

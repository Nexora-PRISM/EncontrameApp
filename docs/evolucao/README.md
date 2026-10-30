# Encontra-me — versão independente de evolução

Esta é a **branch `evolucao`** do repositório `Nexora-PRISM/EncontrameApp`: uma linha de desenvolvimento separada,
para criar as novas funcionalidades sem tocar no aplicativo que já está no ar. Ela não publica nada.

> **Integrar e publicar ficam com o dono do app.** Esta branch não tem pull request, merge nem deploy. Quem decide
> se, quando e o que entra no app oficial é o dono do app.

## Regras desta branch

| Pode | Não pode |
|---|---|
| Criar telas, componentes, serviços, testes e documentação | Mexer em `main`, `versao-original`, `desenvolvimento` ou qualquer outra branch existente |
| Alterar arquivos do app, **só nesta branch** | Abrir pull request, fazer merge ou rebase em outra branch |
| Enviar commits para a branch `evolucao` | Publicar na Google Play ou na App Store |
| Rodar a checagem automática (tipos, lint, traduções, testes, build web) | Fazer atualização OTA (EAS Update) ou deploy do site |
| Gerar builds de validação, quando autorizados | Mexer no backend, em bancos ou em notificações reais |

- Autorização para **desenvolver** não é autorização para **integrar** na `main`.
- Autorização para **integrar** não é autorização para **publicar**. Cada uma é pedida separadamente aos sócios.
- Não há sincronização automática com o original.

## De onde esta branch partiu

- Repositório: `https://github.com/Nexora-PRISM/EncontrameApp`.
- Base: branch `main`, commit `7cc8304` ("feat: adicionado google-services.json"), de 30/10/2026.
- O repositório é **público**: esta branch fica visível para qualquer pessoa. Por isso a documentação não traz
  detalhes internos da API (que é privada).

## Branches

| Branch | Para que serve |
|---|---|
| `main` | Versão oficial. **Não é tocada** por este trabalho. |
| `versao-original` | Cópia congelada de 15/10/2026. **Não é tocada.** |
| `evolucao` | Onde as etapas são desenvolvidas, uma por vez, cada uma em commits identificáveis. |

Para ver tudo o que mudou em relação à base: `git diff 7cc8304..evolucao --stat`.
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

## Quando o dono do app decidir atualizar o app oficial

Nada é levado à `main` sem autorização expressa, e a integração é feita pelo dono do app. Roteiro sugerido:

1. Comparar `main` com `evolucao` e listar as melhorias.
2. Explicar cada funcionalidade e dizer o que está pronto e o que depende da API.
3. Listar os arquivos do original que mudariam e os possíveis conflitos.
4. Os sócios escolhem o que entra.
5. Preparar backup, plano de integração e plano de reversão.
6. O dono do app faz a integração. Publicar é outra decisão, também dele.

# Problemas conhecidos, bloqueios e itens experimentais

Atualizado em 30/10/2026.

## Bloqueios

| Item | Impacto | O que destrava |
|---|---|---|
| Repositório privado `EncontrameApp-Evolucao` ainda não existe no GitHub | A cópia fica só no ambiente de trabalho da IA, que é temporário; a checagem automática não roda | Um administrador cria o repositório vazio e privado; a IA envia `main` e `evolucao` |
| Ambiente da IA sem acesso ao registro do npm | Não dá para instalar dependências nem rodar `npm run check` localmente. A validação completa (tipos, lint, build web) acontece na checagem automática do GitHub | Usar a checagem do GitHub, ou rodar na máquina da equipe |
| Bibliotecas novas não podem ser adicionadas daqui | O `package-lock.json` não pode ser atualizado sem o registro do npm. Afeta a etapa 3 (QR Code e geração de imagem do cartaz) | Alguém da equipe roda `npx expo install <pacote>` e envia o lock atualizado, ou a etapa usa só o que já está instalado |
| Backend .NET em outro repositório, sem acesso | Toda funcionalidade nova fica só com mock até a API implementar os contratos | Implementar os endpoints de `CONTRATOS-API.md` |
| Prompt mestre recebido incompleto (termina no item 13.1) | Funcionalidades depois da Central de Apoio seguem o documento institucional | Enviar o restante do prompt |

## Itens experimentais (desligados em produção)

| Recurso | Variável | Situação |
|---|---|---|
| Relato completo de avistamento e "Meus relatos" | `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` | Pronto no app, só com mock. Falta a API |

## Riscos e observações

- O limite de 3 relatos por caso a cada 10 minutos fica só na memória do aparelho (some ao fechar o app). O limite
  de verdade precisa estar no servidor.
- A verificação de tipos feita durante o desenvolvimento usou declarações simplificadas das bibliotecas. Só a
  checagem automática com as dependências reais confirma tipos e lint.
- Não houve teste em aparelho físico nem no Expo Go nesta etapa.

# Problemas conhecidos, bloqueios e itens experimentais

Atualizado em 30/10/2026.

## Bloqueios

| Item | Impacto | O que destrava |
|---|---|---|
| Ambiente da IA sem acesso ao registro do npm | Não dá para instalar dependências nem rodar `npm run check` localmente. A validação completa (tipos, lint, build web) acontece na checagem automática do GitHub | Usar a checagem do GitHub, ou rodar na máquina da equipe |
| Bibliotecas novas não podem ser adicionadas daqui | O `package-lock.json` não pode ser atualizado sem o registro do npm. O QR Code foi feito sem biblioteca; falta "Salvar como imagem" do cartaz (precisa de `react-native-view-shot` e `expo-sharing` ou `expo-media-library`) | Alguém da equipe roda `npx expo install <pacote>` e envia o lock atualizado |
| Backend .NET (`EncontrameApi`) com acesso só de leitura | Toda funcionalidade nova que precisa de endpoint novo fica só com mock até a API implementar os contratos. A IA não altera o backend | Implementar os endpoints de `CONTRATOS-API.md` (com os testes exigidos no repositório da API) |
| Prompt mestre recebido incompleto (termina no item 13.1) | Funcionalidades depois da Central de Apoio seguem o documento institucional | Enviar o restante do prompt |

## Itens experimentais (desligados em produção)

| Recurso | Variável | Situação |
|---|---|---|
| Relato completo de avistamento e "Meus relatos" | `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` | Pronto no app, só com mock. Falta a API |
| Linha do tempo completa (mudanças de situação, atualizações, correções) | `EXPO_PUBLIC_ENABLE_CASE_TIMELINE` | Pronto no app, só com mock. Sem a variável, a versão básica já funciona com a API de hoje |

## Decisões que cabem aos sócios

- **Avistamentos sem análise.** Na API de hoje, um avistamento enviado pelo app vira na hora o último local do caso,
  aparece no mapa com o ponto exato (em "Histórico de avistamentos") e avisa quem acompanha o caso. O prompt mestre
  pede que relatos não confirmados não sejam publicados com a localização exata. A etapa 1 já prepara o caminho certo
  (relato → análise → só então vira informação do caso), mas mudar o comportamento atual do histórico depende de
  decisão e da API nova. Esta cópia não alterou o histórico de avistamentos existente.

## Riscos e observações

- O limite de 3 relatos por caso a cada 10 minutos fica só na memória do aparelho (some ao fechar o app). O limite
  de verdade precisa estar no servidor.
- A verificação de tipos feita durante o desenvolvimento usou declarações simplificadas das bibliotecas. Só a
  checagem automática com as dependências reais confirma tipos e lint.
- Não houve teste em aparelho físico nem no Expo Go nesta etapa.

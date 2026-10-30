# Plano de evolução — etapas

Ordem pensada para que cada etapa se apoie na anterior: primeiro dados confiáveis (relatos com status), depois
alcance (alertas e voluntários), depois inteligência (IA e teia), por fim integrações institucionais.

Referências: "Prompt mestre definitivo" (funcionalidades 1 a 9; o arquivo recebido terminou no item 13.1) e o
documento institucional "Encontra-me — Evolução da plataforma" (outubro de 2026), para as funcionalidades 10 a 15.

Legenda: **Feita** (código pronto e validado na checagem) · **Em andamento** · **Planejada** · **Bloqueada** (depende de algo fora desta cópia).

| Etapa | Funcionalidade | O que entra | Depende do backend | Situação |
|---|---|---|---|---|
| 0 | Ambiente independente | Branch `evolucao` separada, checagem automática, testes com `node --test`, documentação | Não | Feita (branch no GitHub) |
| 1 | "Eu vi essa pessoa" (F2) | Relato completo: data, horário, descrição, roupa, características, direção, foto opcional, referência; correção do local; número e status do relato; "Meus relatos"; limite contra envios repetidos | Sim: `POST /SightingReport`, `GET /SightingReport/mine` | Código pronto; falta a checagem completa no GitHub e a API |
| 2 | Linha do tempo (F4) | Eventos do caso com classificação (confirmado, informado no cadastro, aguardando análise, não confirmado, corrigido); local só com bairro e cidade | Só a versão completa (`GET /MissingPerson/{id}/timeline`); a versão básica usa a API de hoje | Código pronto; falta a checagem completa no GitHub |
| 3 | Cartaz digital com QR Code (F6) | Cartaz vertical, quadrado e para impressão; link público; QR Code que segue o status do caso | Não (usa a API de hoje e `EXPO_PUBLIC_WEB_URL`) | Código pronto; falta a checagem completa no GitHub. "Salvar como imagem" depende de biblioteca nova |
| 4 | Proteção contra fraudes (F7) | Painel da equipe: denúncias (ocultar/manter), situação do caso, relatos para análise, justificativa obrigatória; classificação da informação na linha do tempo (etapa 2); limite de envio (etapa 1) | Em parte (denúncias e situação já existem na API) | Código pronto |
| 5 | Rede inteligente de busca (F1, itens 5.1 a 5.7) | Região inicial, raio, alertas regionais com limite de frequência, expansão registrada (região anterior, nova, justificativa, responsável), controle da teia | Sim | Planejada |
| 6 | Modo voluntário "Quero ajudar" (F5) | Cadastro mínimo, formas de colaborar, orientações de segurança, sem ranking | Sim | Planejada |
| 7 | Modo crianças (F8) | Fluxo prioritário, proteção reforçada, nada de endereço, escola ou rotina | Sim | Planejada |
| 8 | Central de apoio às famílias (F9) | Orientações (o que fazer, boletim de ocorrência, quais informações organizar…) | Pouco (conteúdo pode ficar no app) | Planejada; aguarda o restante do prompt (item 13 em diante) |
| 9 | IA de apoio (F3) | Sugestões no Painel da equipe com motivo e indicação (nunca "confirmado"), decisão humana; sem reconhecimento facial | Sim | Código pronto (mock); falta a API |
| 10 | Painel da teia e acompanhamento da busca (F1, itens 5.8 e 5.9) | Teia no mapa, números da busca (sem confundir alcance com pessoas mobilizadas), ampliação e pausa dos alertas | Sim | Código pronto (mock); falta a API |
| 11+ | Trajeto monitorado, modo offline, busca internacional, mapa de áreas, cofre do caso, painel para autoridades | Conforme o documento institucional | Sim | Planejada; aguarda o restante do prompt |

## Regras que valem para todas as etapas

- Nada é apresentado como integrado se depende de API que ainda não existe. A funcionalidade fica atrás de
  `EXPO_PUBLIC_ENABLE_*`: ligada em desenvolvimento com mock, desligada em produção.
- A tela só diz "recebido" quando o servidor devolve número e horário do recebimento.
- Hipótese nunca vira fato: relato, sugestão da IA ou conexão da teia não muda o caso sem análise humana.
- Sem acusação pública, sem incentivo a abordagem ou perseguição, sem localização exata de avistamento para todos.
- Vermelho só no "Pedir ajuda". Textos em português, inglês e espanhol.
- Cada etapa termina com `npm run check`, `npm test` e build web passando na checagem automática, e com o registro
  em `REGISTRO.md` e `TESTES.md`.

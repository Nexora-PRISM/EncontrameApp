# Compartilhar meu trajeto e Sinal de Alerta

Branch `evolucao-trajeto` (a partir da `evolucao-novidades`), com o backend na branch `api-node-trajeto` do repositório
da API (Node.js). Nada foi publicado: sem Google Play, App Store, EAS Update, deploy do site, backend de produção,
migração em banco de produção nem notificação real. Atrás de `EXPO_PUBLIC_ENABLE_TRIP_SHARING` (ligado em
desenvolvimento com dados fictícios, desligado em produção).

## O que mudou na regra "o Encontra-me não é app de rastreamento"

Continua valendo para tudo o que já existia. O compartilhamento de trajeto é uma exceção **com consentimento**:

- só a própria pessoa inicia, escolhe quem acompanha (até 5) e pode encerrar a qualquer momento;
- cada contato precisa ter aceitado antes um convite, com a conta dele (consentimento dos dois lados);
- contato não inicia nada, não vê trajeto em que não foi escolhido e perde o acesso na hora se o vínculo for desfeito;
- a localização nunca vai para o público nem para o mapa do app;
- com a tela desligada, só se o build permitir **e** a pessoa der a permissão "o tempo todo", com aviso fixo na tela;
- nenhum texto diz que a pessoa desapareceu: atraso e falta de sinal aparecem como o que são.

A "Chegada segura" de antes continua igual no modo "Só me lembrar" (lembrete local, sem enviar nada).

## Como funciona

1. **Convite** (`/trajeto/contatos`): a pessoa cria um convite e manda por WhatsApp ou SMS. O código tem 12
   caracteres, vale 48 h e é de uso único (o servidor guarda só o hash). Com `EXPO_PUBLIC_WEB_URL`, a mensagem leva o
   link `/trajeto/convite/<código>`; sem ele, leva o código para digitar em "Recebeu um código?".
2. **Aceite** (`/trajeto/convite/[code]`): quem recebeu vê de quem é, o que aceitar significa, e aceita ou não.
3. **Início** (`/trajeto/novo` ou Chegada segura › Compartilhar com contatos): origem (texto ou localização atual),
   destino (texto; ponto no mapa opcional), previsão (15 min a 2 h), tolerância (5 a 60 min), contatos e o
   consentimento com o resumo de quem vê, por quanto tempo e por quanto tempo os dados ficam guardados.
4. **Durante** (`/trajeto/[id]`, dono): mapa com o caminho, quem acompanha, "Sim, cheguei em segurança", "Ainda estou
   em deslocamento (+15 min)", "Mudar destino ou horário" e "Encerrar compartilhamento". A tela diz se este aparelho
   está enviando a localização e como (com a tela desligada, só com o app aberto ou sem permissão).
5. **Quem acompanha** (`/trajeto` e `/trajeto/[id]`): "Pessoas compartilhando comigo" e "Alertas de não chegada"
   (atrasado, prazo vencido, sem sinal ou com alerta aberto); última localização com o horário real ("há 12 min, às
   22:41"), aviso de falta de sinal sem estimar nada, e "Abrir a última localização no mapa".
6. **Atraso**: no horário, o servidor pergunta à pessoa se chegou; passada a tolerância sem confirmação, os contatos
   recebem o aviso de atraso.
7. **Sinal de Alerta** (`/trajeto/[id]/alerta`): só aparece com motivo (atraso, sinal perdido há 10 min ou prazo de
   12 h vencido, até 24 h depois). Exige marcar "Tentei falar com a pessoa" e contar como e quando (10 a 500 letras).
   A tela só diz "recebido" com número e horário vindos do servidor. Um alerta aberto por trajeto: outro contato que
   aciona soma a informação. Limite de 3 por dia por pessoa (servidor).
8. **Depois do alerta**: a pessoa pode tocar em "Estou bem"; um contato pode informar "A pessoa foi localizada"; a
   equipe decide em `/equipe/trajetos` (em acompanhamento, localizada ou sem fundamento, sempre com justificativa).
   Se a família decidir, "Comunicar desaparecimento" abre o cadastro normal já com o nome da conta, a data e o último
   ponto (arredondado ~110 m) e liga o caso ao alerta depois de enviado. O caso passa pela moderação como qualquer
   outro.

## Envio das posições

| Situação | O que acontece |
|---|---|
| App aberto, permissão "com o app aberto" | `watchPositionAsync` em qualquer tela (`useTripTrackingBootstrap` no `_layout`), a cada 15 s ou 25 m |
| Tela desligada, build com `TRIP_BACKGROUND_LOCATION=true` e permissão "o tempo todo" | Tarefa do sistema (`expo-task-manager` + `startLocationUpdatesAsync`), a cada 30 s ou 30 m, com aviso fixo "Compartilhando seu trajeto" |
| Tela desligada sem isso | Nada é enviado; o contato vê "sem atualização recente" depois de 10 min (honesto, sem estimativa) |
| Sem internet | Fila no aparelho: uma posição por minuto, as 30 mais recentes; vão juntas quando a conexão volta (o servidor aceita até 50 por vez) |
| Chegou, encerrou, prazo vencido ou o servidor recusou | Para na hora e apaga a fila |
| Saiu da conta | Para de enviar deste aparelho |

Sem servidor de tempo real: as telas consultam a cada 30 s (sem custo extra de infraestrutura).

## Notificações

Textos genéricos na tela bloqueada (sem nome, destino ou endereço); `data` leva só `{ type, tripId }` e o toque abre
`/trajeto/<id>` (a equipe vai para `/equipe/trajetos`). Ligam sozinhas ao começar a compartilhar ou aceitar um convite
(com a permissão do sistema) e podem ser desligadas em Configurações › Notificações › "Trajetos compartilhados".
Dependem de `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS`, build nativo e Firebase no Android, como as outras.

## Guarda dos dados (proposta técnica, a aprovar com o jurídico)

Posições de trajeto encerrado sem alerta: 24 h. Trajeto sem alerta: 30 dias. Com Sinal de Alerta: 90 dias depois de o
alerta fechar. A fila do aparelho é apagada ao terminar. Os prazos são configuráveis no servidor (`Trip__*`).

## Permissões

| Onde | Permissão | Quando é pedida |
|---|---|---|
| Android e iOS | Localização com o app aberto (já existia) | Ao começar a compartilhar |
| Android 10+ | `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION` | Só em build com `TRIP_BACKGROUND_LOCATION=true`, depois de a tela explicar, ao tocar em "Permitir" |
| iOS | "Sempre" (`NSLocationAlwaysAndWhenInUseUsageDescription`) e modo de fundo `location` | Idem |
| Android 13+ e iOS | Notificações (já existia) | Ao começar a compartilhar ou aceitar um convite |

Sem `TRIP_BACKGROUND_LOCATION`, o build declara exatamente as mesmas permissões de hoje.

## Serviços externos e custos

| Serviço | Para quê | Custo |
|---|---|---|
| Backend Node.js (branch `api-node-trajeto`) + Postgres | Trajetos, convites, alertas, verificador a cada minuto | Já previsto na hospedagem da API; tabelas novas pequenas (posições apagadas em 24 h) |
| Expo Push | Avisos | Gratuito |
| Firebase Cloud Messaging (Android) | Entrega do push | Gratuito |
| Google Maps (já usado) | Mapa do trajeto e "Mostrar o destino no mapa" | Dentro da cota que o app já usa |
| Google Play / App Store | Declaração de localização em segundo plano | Sem custo, mas exige formulário, vídeo e revisão |

Nada pago foi adicionado. Tempo real por WebSocket ficou de fora de propósito (custo e complexidade); a consulta a
cada 30 s atende o caso.

## Arquivos

Criados: `src/lib/trip-rules.ts`, `trip-labels.ts`, `trip-tracking.ts`, `use-trip-tracking-bootstrap.ts`;
`src/services/trips/*` (types, errors, repository, axios, mock, service); `src/features/trajeto/*` (5 controllers,
`use-trip-format.ts` e as sections); `src/features/equipe/trip-alerts.controller.ts` e
`sections/trip-alerts-section.tsx`; páginas `src/pages/trajeto/index.tsx`, `novo`, `[id]`, `[id]/alerta`, `contatos`,
`convite/[code]` e `src/pages/equipe/trajetos/index.tsx`; `tests/trip-rules.test.mjs`; este documento.

Alterados: `app.config.js` (segundo plano opcional), `package.json`/`package-lock.json` (`expo-task-manager`),
`src/lib/env.ts`, `auth-guard.ts`, `notifications.ts`, `notification-prefs.ts`, `sign-out.ts`,
`src/services/notifications/notifications.service.ts`, `src/pages/_layout.tsx`, Chegada segura (dois modos),
cadastro de pessoa (`?trajeto=`), Configurações, menu do Início, Painel da equipe, Central de Ajuda, traduções,
`.github/scripts/smoke-routes.js`, `preview-screenshots.js` e a checagem.

## O que depende de configuração ou autorização

1. Publicar a API Node.js com a migração `20261106-001-trip.sql` (só tabelas novas) e `ExpoPush__Enabled=true`.
2. Aprovação dos sócios e do jurídico: texto do consentimento, prazos de guarda e o fluxo do Sinal de Alerta com a
   equipe (quem atende, em quanto tempo, o que fazer com um alerta).
3. `EXPO_PUBLIC_ENABLE_TRIP_SHARING=true` (e `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true`) no build.
4. Segundo plano: build com `TRIP_BACKGROUND_LOCATION=true`, declaração no Google Play Console (formulário + vídeo) e
   justificativa na App Store. Sem isso, funciona só com o app aberto.
5. `EXPO_PUBLIC_WEB_URL` para o convite sair com link (sem ele, sai com código).
6. Testes em celular físico (Android e iPhone): permissões, aviso fixo, tela desligada, sem internet, bateria,
   notificações reais e leitor de tela. **Nada disso foi testado em aparelho real.**

## Casos especiais

| Caso | Comportamento |
|---|---|
| Sem sinal | Contato vê "sem atualização recente" e o horário da última posição; depois de 10 min recebe aviso e pode acionar o alerta |
| Atraso | "Ainda estou em deslocamento" (+15 min, até 12 h) ou mudar o horário; contatos veem a nova previsão |
| Mudança de destino | "Mudar destino ou horário"; contatos são avisados e veem o novo destino |
| A pessoa não consegue responder | Passada a tolerância, os contatos são avisados e podem acionar o alerta; a equipe analisa |
| Pessoa localizada | "A pessoa foi localizada" (contato), "Estou bem" (a pessoa) ou decisão da equipe; todos veem |
| Prazo de 12 h | O servidor encerra como "prazo encerrado sem confirmação"; contatos ainda veem o último registro por 24 h |
| Vínculo desfeito | Acesso cortado na hora, inclusive no trajeto em andamento |

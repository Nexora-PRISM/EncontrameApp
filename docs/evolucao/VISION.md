# Encontra-me Vision — rede de câmeras participantes

Módulo novo, desenvolvido **só na branch `evolucao`**, em **modo de demonstração**. Nenhuma câmera real foi
conectada, nenhum vídeo real foi usado e nenhum endpoint existe ainda na API. Tudo o que aparece nas telas com dados
vem de um conjunto fictício, marcado com a faixa "Dados de demonstração" e com nomes como "Câmera de demonstração 01",
"Região Central (fictícia)" e "OP-TESTE-0001".

> **O que está pronto** é a interface, as regras (com testes) e o contrato da API. **O que não está pronto** é tudo o
> que depende de servidor, convênio, autorização ou avaliação jurídica: cadastro real de câmeras, recebimento de
> gravações, análise de vídeo por IA, verificação de autoridades e auditoria inviolável.

Variável: `EXPO_PUBLIC_ENABLE_VISION` — ligada em desenvolvimento (com dados fictícios), **desligada em produção**.
Sem ela, o item "Rede de câmeras" não aparece no menu e as rotas `/vision*` mostram "ainda não está disponível".

---

## 1. O que foi finalizado do desenvolvimento anterior

Antes do Vision, as etapas 1 a 10 foram concluídas e validadas na checagem automática do GitHub (tipos, lint,
traduções, testes, build web e build de demonstração): relato "Eu vi essa pessoa" e "Meus relatos", linha do tempo do
caso, cartaz com QR Code, Painel da equipe (denúncias, situação do caso, relatos, IA de apoio, teia e
acompanhamento), rede de busca do lado da pessoa, "Quero ajudar", proteção de crianças e Central de Apoio às Famílias.
Detalhes em `REGISTRO.md` e `TESTES.md`.

Correções feitas nessa verificação: o tipo da opção `QUIET` do axios (erro de tipos) e um `setState` dentro de efeito
na tela "Quero ajudar" (erro de lint). A checagem automática passou a separar tipos, lint e traduções em passos
próprios, com anotações por arquivo e linha.

## 2. O que foi desenvolvido no Encontra-me Vision

### Três ambientes de acesso

| Ambiente | Rota | Quem | O que faz |
|---|---|---|---|
| **Comunidade** | `/vision` (menu › Pessoas › "Rede de câmeras") | Qualquer pessoa, sem conta | Vê só **regiões** com maior, média ou pouca cobertura. Sem posição, nome, responsável, ângulo, horário, contagem exata ou dado técnico. Caminhos para avisar pelo caso, cadastrar câmera e ambiente institucional |
| **Responsável por câmera** | `/vision/minhas-cameras`, `/vision/minhas-cameras/[id]`, `/vision/pedidos` | Qualquer conta | Cadastra câmeras (sem senha, IP ou endereço de acesso — o app bloqueia), informa horário de gravação, prazo de guarda, forma de entrega e condição de compartilhamento; pausa, encerra ou pede para voltar; recebe pedidos de preservação, lê o texto formal e aceita ou recusa; vê o histórico |
| **Institucional** | `/vision/institucional`, `/nova-operacao`, `/operacao/[id]`, `/auditoria` | Autoridades com habilitação verificada | Operações de busca, câmeras no raio por prioridade de prazo, pedidos de preservação, correspondências, trajeto, outras fontes, histórico e auditoria |

- Quem não tem habilitação vê a explicação e um formulário de **pedido de habilitação** (instituição, cargo,
  matrícula, e-mail institucional, motivo). O pedido fica "em análise"; **nunca é aprovado sozinho**.
- A **equipe técnica** (Nexora Prism) vê que não tem acesso a operações nem gravações.
- No modo de demonstração, uma faixa "ver o Vision como" troca entre os perfis fictícios para testar os ambientes.

### Funções e permissões (`can()` em `src/lib/vision-rules.ts`)

| Ação | Comunidade / Responsável | Agente | Coordenação | Auditoria | Técnica |
|---|---|---|---|---|---|
| Ver cobertura por região | Sim | Sim | Sim | Sim | Sim |
| Cadastrar as próprias câmeras e responder pedidos | Sim | — | — | — | — |
| Ver operações | — | Sim | Sim | Sim (leitura) | — |
| Abrir operação, mudar raio, confirmar/descartar correspondência | — | — | Sim | — | — |
| Pedir preservação, assistir a trecho, avaliar informação | — | Sim | Sim | — | — |
| Ver auditoria | — | — | Sim | Sim | — |
| Ver saúde técnica | — | — | — | — | Sim |

Conta institucional **sem habilitação verificada** vale como conta comum. Ações sensíveis exigem **justificativa**
(mínimo de 15 letras), que vai para a auditoria. **Tentativas negadas também são registradas.**

### Operação de busca audiovisual (`/vision/institucional/operacao/[id]`)

Abas grandes, todas visíveis: Resumo · Câmeras · Preservação · Correspondências · Trajeto · Outras fontes · Histórico.

1. **Resumo**: caso, último local conhecido, data e horário, descrição visual informada, escopo, justificativa,
   responsáveis; raio com "Reduzir" e "Ampliar" um passo por vez (0,5 a 20 km), com justificativa; aviso de que
   câmera indisponível **não prova** que a pessoa não passou.
2. **Câmeras**: mapa esquemático (sem serviço externo) com o raio e as câmeras participantes; lista em ordem de
   prioridade — primeiro as gravações que serão apagadas antes, depois as mais perto. Cada câmera mostra a situação da
   gravação para o horário procurado: dentro do prazo, prazo acabando (menos de 24 h), pode já ter sido apagada, não
   grava nesse horário ou não guarda gravações; responsável, o que mostra, forma de entrega e condição de
   compartilhamento; botão "Preparar pedido de preservação".
3. **Preservação** (Pedido de Preservação de Imagens): cada pedido tem situação (preparado, enviado, aceito,
   recusado, imagens recebidas, prazo vencido, cancelado), urgência pelo prazo de guarda do equipamento, intervalo,
   histórico e o **texto formal** pronto para compartilhar. O app **não envia nada sozinho**: a equipe envia por e-mail
   ou ofício e registra. Aceitar e recusar são do responsável pela câmera.
4. **Correspondências**: horário, câmera, região, classificação (confirmada por pessoa, provável, inconclusiva,
   descartada), confiança, características **não biométricas**, motivo, limitações, sugestão inicial da IA e revisão.
   "Ver o trecho" exige justificativa, libera por 10 minutos, registra na auditoria e mostra marca d'água de quem
   abriu. No modo de demonstração, o trecho é um **quadro sintético desenhado** (sem pessoa real). **Confirmar exige
   ter aberto o trecho.** A IA só sugere "provável" ou "inconclusiva"; confirmar e descartar são decisões humanas.
5. **Trajeto**: só com o último local conhecido (fato informado) e correspondências confirmadas (fato verificado) ou
   prováveis (hipótese, linha tracejada). Inconclusivas e registros anteriores ao último local ficam "fora do trajeto".
   Distância, tempo, direção de cada trecho e direção geral; trecho com velocidade impossível aparece como
   "deslocamento improvável — revisar". **Sem correspondência confirmada ou provável, não há trajeto** ("Evidências
   insuficientes"). Sugestão de próximas câmeras a consultar, priorizando as que estão na direção do deslocamento.
6. **Outras fontes**: informações de moradores, comerciantes, voluntários e instituições, com origem (restrita),
   horário, confiabilidade e histórico de avaliação; mudar a confiabilidade exige justificativa.
7. **Histórico**: histórico da operação e auditoria dela (para coordenação e auditoria).

### Limites que o código garante

- Semelhança visual nunca vira "pessoa encontrada" (o texto do pedido e as telas não usam essa expressão; testado).
- `BIOMETRIC_ANALYSIS_ENABLED = false`; características que falam de rosto, íris, digital, modo de andar, voz,
  tatuagem ou cicatriz são descartadas antes de chegar à tela (testado).
- A cobertura pública nunca leva posição, responsável, ângulo, horário nem número exato de câmeras (testado; o
  repositório real também reduz a resposta a região + nível, como defesa extra).
- Cadastro de câmera recusa senha, usuário, IP e endereços `rtsp://`, `http://` etc. (testado).
- Câmera nova começa "Aguardando verificação": cadastrar não é participar.

## 3. Arquivos criados e modificados

**Criados**

| Arquivo | Para quê |
|---|---|
| `src/lib/vision-rules.ts` | Regras puras: geografia, câmeras, cobertura pública, funções, justificativa, auditoria, raio, situação das gravações, preservação, texto formal, análise visual sem biometria, classificação, trajeto, próximas câmeras, confiabilidade |
| `src/lib/vision-labels.ts` | Textos e cores de cada código (traduzidos na tela) |
| `src/services/vision/vision.types.ts` | Tipos do contrato |
| `src/services/vision/vision.repository.ts` | Interface + escolha mock/axios |
| `src/services/vision/vision.axios.repository.ts` | Implementação real (endpoints propostos) |
| `src/services/vision/vision.mock.repository.ts` | Demonstração: dados fictícios, perfis, permissões e auditoria em memória |
| `src/services/vision/vision.derive.ts` | Cálculos que dependem do relógio (feitos ao buscar os dados) |
| `src/services/vision/vision.service.ts` | Hooks do React Query |
| `src/services/vision/vision.errors.ts` | Erro de recusa (demonstração) |
| `src/features/vision/*.controller.ts` | Controllers: entrada, minhas câmeras, formulário, pedidos, institucional, nova operação, operação, auditoria |
| `src/features/vision/vision-format.ts` | Datas, distâncias e mensagens de erro |
| `src/features/vision/sections/*` | Seções das telas, mapa esquemático e quadro sintético |
| `src/pages/vision/**` | 8 rotas |
| `tests/vision-rules.test.mjs` | 19 testes |
| `.github/scripts/smoke-routes.js` | Teste de fumaça das telas no build de demonstração |
| `docs/evolucao/VISION.md` | Este documento |

**Alterados**: `src/lib/env.ts` (variável), `src/lib/auth-guard.ts` (rotas que exigem conta),
`src/features/inicio/home-shell.controller.ts` e `sections/inicio-menu-drawer-section.tsx` (item do menu),
`src/features/ajuda/help-content.ts` (pergunta nova, só com a variável ligada), `src/translations/en.ts` e `es.ts`
(383 textos), `.github/workflows/checagem.yml` (variáveis do build de demonstração e teste de fumaça), `AGENTS.md` e
documentos desta pasta.

## 4. Arquitetura implementada

```
Página (src/pages/vision/...)            só compõe as seções
  └─ Controller (src/features/vision)     estado, validação, justificativa, confirmações
       └─ Service (React Query)           cache + cálculo de prazos/trajeto ao buscar (vision.derive)
            └─ Repository                 env.useMocks ? mock : axios
                 ├─ mock                  dados fictícios + permissões + auditoria em memória
                 └─ axios                 /Vision/* (CONTRATOS-API.md)
Regras puras: src/lib/vision-rules.ts     (sem dependências; testadas com node --test)
```

Como o servidor deve ficar (proposta):

```
App ──HTTPS──> API .NET (/Vision/*) ──> Banco (câmeras, operações, pedidos, correspondências, auditoria)
                    │                      └─ auditoria só de inclusão (sem UPDATE/DELETE)
                    ├─> Fila de análise ──> Serviço de IA visual (atributos não biométricos)
                    ├─> Armazenamento de gravações (criptografado, URL temporária assinada)
                    └─> Conectores por tipo: envio manual · gravador local · API de videomonitoramento · RTSP (quando permitido)
```

- **Conectores**: cada câmera tem a sua forma de entrega (`manual_upload`, `ip_rtsp`, `monitoring_api`,
  `cloud_storage`, `local_recorder`). Nenhuma é presumida. Credenciais nunca passam pelo app: ficam num cofre do
  servidor, configuradas com o responsável.
- **Trechos de vídeo**: o servidor libera um endereço temporário (ex.: 10 minutos) por pessoa e por justificativa, e
  registra. O app abre o endereço; um player embutido exigiria `expo-video` (não instalado).

## 5. Testes executados e resultados

| Verificação | Como | Resultado |
|---|---|---|
| Regras do Vision (19 testes) | `npm test` | 19 de 19; total do projeto 95 de 95 |
| Três ambientes e permissões | Testes de `can`/`decideAccess` (comunidade, agente sem habilitação, agente, coordenação, auditoria, técnica) | Passou |
| Cadastro de câmeras | Validação, bloqueio de credenciais, horários que atravessam a meia-noite, participação controlada pelo responsável | Passou |
| Pedidos de preservação | Fluxo de situações, quem registra cada passo, intervalo máximo de 12 h, prazo e urgência, texto formal | Passou |
| Análise de vídeos simulados | Sem biometria; IA nunca sugere "confirmada" ou "descartada"; confirmar exige trecho aberto e justificativa | Passou |
| Reconstrução de trajeto | Ordem, certeza de cada ponto, descartados fora, inconclusivos soltos, velocidade impossível, sem evidência = sem trajeto | Passou |
| Auditoria | Registro de permitidas e negadas, justificativa guardada | Passou |
| Segurança da cobertura pública | Só região + nível; câmeras não autorizadas fora | Passou |
| Tipos, lint, traduções e build web | Checagem automática do GitHub | Ver `TESTES.md` (resultado do envio) |
| Telas no navegador (responsividade, abas, perfis) | Teste de fumaça no build de demonstração (`smoke-routes.js`) | Ver `TESTES.md` |
| Compatibilidade com o que já existe | Checagem completa + nenhuma tela antiga alterada além do menu, da ajuda e do guarda de rotas | Ver `TESTES.md` |
| Aparelho físico e leitores de tela | Manual | **Pendente** |

## 6. Dependências externas

Nenhuma biblioteca nova foi instalada. O mapa é esquemático (desenhado com componentes do próprio React Native) e o
QR/texto do pedido não usam serviço externo. Para a versão real:

| Dependência | Para quê | Situação |
|---|---|---|
| Endpoints `/Vision/*` na API .NET | Tudo o que é real | Não existe |
| Armazenamento de vídeo com criptografia e URL temporária | Gravações recebidas | A contratar |
| Serviço de análise visual (atributos de pessoa: cor e tipo de roupa, mochila, bolsa; sem rosto) | Correspondências | A escolher (código aberto em servidor próprio ou serviço gerenciado) |
| Fila de processamento | Análise em segundo plano | A definir |
| `expo-video` | Player embutido | Opcional |
| Mapa com ruas (já existe no app: `react-native-maps` / Google Maps no web) | Trocar o mapa esquemático | Opcional |

## 7. Funcionalidades ainda simuladas

Todas as que dependem de dados: câmeras, responsáveis, regiões, operações, pedidos, respostas, correspondências,
"trechos" (quadro desenhado), informações de outras fontes, auditoria e perfis. Ficam só na memória do aparelho e
voltam ao início quando o app recarrega. O **pedido de habilitação** em demonstração fica "em análise" para sempre.

## 8. Integrações que dependem de convênio ou autorização

- Câmeras municipais, de trânsito e públicas oficiais: convênio com o órgão responsável.
- Câmeras de comércios, condomínios, casas e empresas de segurança: autorização do responsável (termo de adesão) e,
  para cada gravação, a decisão dele ou procedimento legal.
- Sistemas de videomonitoramento e de órgãos públicos: convênio + avaliação técnica.
- Habilitação de autoridades: processo de verificação com a instituição (canal oficial).
- Qualquer análise biométrica (reconhecimento facial etc.): **desligada**; só com avaliação jurídica específica, base
  legal, governança, controle de acesso e autorização institucional.

## 9. Riscos técnicos e jurídicos

| Risco | Cuidado no código / recomendação |
|---|---|
| LGPD: imagens de terceiros são dados pessoais | Finalidade única (busca), mínimo necessário (intervalo curto), acesso por função com justificativa, retenção definida, relatório de impacto (RIPD) antes de ativar |
| Uso indevido para vigilância | Sem consulta livre: toda visualização é ligada a uma operação, com justificativa e registro; auditoria visível para coordenação e auditoria |
| Falso positivo (pessoa errada) | IA sugere, pessoa decide; confirmar exige assistir ao trecho; nada vira "encontrada"; limitações sempre visíveis |
| Viés e reconhecimento facial | Desligado; só atributos não biométricos |
| Câmera acessível pela internet ≠ autorização | O app nunca pede endereço, IP ou senha; integração só com o responsável |
| Exposição de dados na comunidade | Só região + nível; sem contagem exata (evita mapear pontos cegos) |
| Responsável pressionado a entregar imagens | Textos deixam claro que o pedido não obriga; ordem judicial é outro canal |
| Vazamento de gravações | Criptografia, URL temporária, marca d'água com quem abriu, sem download livre |
| Prazo de guarda curto | Prioridade por prazo e urgência visível; pedido formal pronto para enviar |
| Responsabilidade civil da plataforma | Termo de adesão do responsável, política de uso para autoridades, revisão jurídica antes de ativar |

## 10. Estimativa de infraestrutura

Ordem de grandeza para planejar (valores de mercado mudam; pedir orçamento antes de decidir):

- **Vídeo**: 1080p em H.264 costuma ficar entre 1 e 4 Mbit/s, ou seja, cerca de 0,5 a 1,8 GB por hora de gravação.
  Um pedido típico (2 horas de uma câmera) fica entre 1 e 4 GB. Com 50 pedidos por mês, algo como 50 a 200 GB/mês, que
  podem ser apagados ao fim do prazo de retenção definido pelos sócios e pela lei.
- **Análise visual**: detecção de pessoas e de atributos (roupa, mochila) roda bem em GPU; em CPU funciona, mas é
  várias vezes mais lenta. Para começar, processamento em lote sob demanda (só quando há pedido), sem câmeras ao
  vivo, evita custo fixo alto.
- **Banco e API**: o volume de metadados é pequeno; a API atual (.NET + PostgreSQL) comporta, com tabelas novas.
- **Transferência**: o envio de arquivos grandes pede upload em partes e retomada.
- **Fase de desenvolvimento**: nada pago é necessário — o módulo funciona inteiro em demonstração.

## 11. Instruções para ativação futura

1. Decisão dos sócios sobre o escopo e avaliação jurídica (LGPD, termos de adesão, política de acesso de autoridades).
2. Backend: implementar os endpoints de `CONTRATOS-API.md` (seção "Encontra-me Vision"), com a auditoria só de
   inclusão, testes unitários e de integração, como pede o repositório da API.
3. Processo de habilitação institucional (quem verifica, como, por quanto tempo vale).
4. Armazenamento e análise de vídeo escolhidos e testados com material de teste, nunca com câmeras reais sem
   autorização.
5. Teste em ambiente de homologação com `EXPO_PUBLIC_USE_MOCKS=false` e `EXPO_PUBLIC_ENABLE_VISION=true`.
6. Só então ligar `EXPO_PUBLIC_ENABLE_VISION=true` em produção (no Netlify e no build do app), por decisão do dono do
   app.

## 12. Procedimento para integrar ao projeto oficial (quando autorizado)

A integração e a publicação são feitas **pelo dono do app**. Esta branch não abre pull request nem faz merge.

1. Revisar `git diff 7cc8304..evolucao` (ou só os commits do Vision, listados em `REGISTRO.md`).
2. Escolher o que entra. O Vision é isolado: pode entrar sem as outras etapas, levando `src/lib/vision-*`,
   `src/services/vision`, `src/features/vision`, `src/pages/vision`, o teste, as traduções da seção "Encontra-me
   Vision" e as poucas linhas de `env.ts`, `auth-guard.ts`, menu e ajuda.
3. Fazer backup da `main` e combinar o plano de reversão (`git revert` dos commits).
4. Integrar com `EXPO_PUBLIC_ENABLE_VISION` **desligada**: o app oficial continua igual para os usuários.
5. Rodar `npm run check`, `npm test` e o build web.
6. Ligar a variável só depois do item 11.

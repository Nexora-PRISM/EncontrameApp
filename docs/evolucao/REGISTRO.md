# Registro das etapas

Cada etapa tem commits próprios na branch `evolucao`. Para ver os commits de uma etapa:
`git log --oneline --grep "etapa 1"` (troque o número). Para desfazer: `git revert <commits>`.

---

## Novidades — Nossos apoiadores (31/10/2026, branch `evolucao-novidades`)

Área institucional "Nossos apoiadores": seção no fim da lista do Início e no Sobre, página `/apoiadores`, item no
menu e cadastro pelo Painel da equipe, com autorização de uso da marca obrigatória para publicar. Detalhes, regras e
arquivos em `docs/evolucao/NOVIDADES.md`; contrato da API em `CONTRATOS-API.md`.

---

## Etapa 0 — Ambiente independente (30/10/2026)

**O que foi feito**

- Linha de desenvolvimento separada a partir da `main`, commit `7cc8304`, na branch `evolucao` (enviada ao GitHub
  em 30/10/2026, a pedido; sem pull request, merge ou deploy). `main` e as outras branches não foram tocadas.
- Checagem automática do GitHub também na `evolucao`, com `npm test`. Nada nela publica o app.
- Testes de regras de negócio com o executor nativo do Node (`node --test`), sem dependência nova.
- Documentação em `docs/evolucao/` e aviso no `AGENTS.md`.

**Arquivos**

| Situação | Arquivo |
|---|---|
| Alterado | `.github/workflows/checagem.yml` (branch `evolucao`, passo de testes, flag do relato no build de demonstração) |
| Alterado | `package.json` (script `test`; nenhuma dependência nova) |
| Alterado | `AGENTS.md` (seção "Esta é a versão independente de evolução") |
| Criado | `docs/evolucao/README.md`, `docs/evolucao/PLANO.md` |

---

## Etapa 1 — Relato de avistamento "Eu vi essa pessoa" (30/10/2026)

**Objetivo.** Transformar o registro simples de avistamento (só o local) num relato completo, com número e
situação, sem que um relato não verificado vire informação do caso.

**Como funciona (com `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` ligada)**

1. Na página do caso, "Vi essa pessoa por perto" abre o relato. No topo: qual é o caso e o aviso "se a pessoa parece
   estar em perigo agora, ligue 190; não aborde nem siga a pessoa".
2. Local: endereço com sugestões, toque no mapa, pin arrastável ou "Usar minha localização" (como já era), mais
   ponto de referência. O app registra como o local foi indicado (GPS, mapa ou endereço).
3. Quando: data e horário (preenchidos com o momento atual) e "O horário é aproximado" (marcado por padrão).
4. O que viu (obrigatório), roupa, características visíveis, para onde a pessoa seguia, foto opcional (vai só para a
   análise) e informações complementares.
5. Ao enviar: com número e horário de recebimento na resposta, a tela mostra "Relato recebido · nº …" e a situação.
   Sem isso, "o envio não foi confirmado". No modo de demonstração, a tela avisa que nada foi enviado de verdade.
6. "Meus relatos" (Perfil › Atalhos, ou o botão depois do envio) lista os relatos da conta com a situação de cada um:
   Recebido, Aguardando análise, Em análise, Considerado relevante, Não confirmado, Encerrado.
7. Limite de 3 relatos por caso a cada 10 minutos no aparelho, contra toques repetidos.
8. O relato **não** muda o último local nem o mapa do caso. Isso fica para a análise humana, no servidor.

Com a variável desligada (produção hoje), nada muda: o app continua com o registro simples de avistamento.

**O que ficou de fora de propósito**

- O texto do botão continua "Vi essa pessoa por perto", porque o passo a passo inicial cita esse texto.
- Ferramentas de moderação (revisão, duplicidades, denúncia de abuso do relato) ficam para a etapa 4.

**Arquivos**

| Situação | Arquivo | Para quê |
|---|---|---|
| Criado | `src/lib/sighting-report-rules.ts` | Regras puras: situações, confirmação de recebimento, data e horário, textos, limite de envio |
| Criado | `src/lib/sighting-report.ts` | Rótulos e ícones das situações; limite por caso na memória |
| Criado | `src/services/sightings/*` (tipos, repositório, axios, mock, service) | Envio do relato e "Meus relatos" |
| Criado | `src/features/pessoa-detalhe/sighting-report-form.ts` | Estado e validação dos campos novos |
| Criado | `src/features/pessoa-detalhe/sections/pessoa-detalhe-sighting-report-fields.tsx` | Campos novos do formulário |
| Criado | `src/components/sighting-status-chip.tsx` | Selo da situação do relato |
| Criado | `src/pages/meus-relatos/index.tsx`, `src/features/meus-relatos/*` | Tela "Meus relatos" |
| Criado | `tests/sighting-report-rules.test.mjs` | 17 testes das regras |
| Criado | `docs/evolucao/CONTRATOS-API.md` | `POST /SightingReport` e `GET /SightingReport/mine` |
| Alterado | `src/features/pessoa-detalhe/pessoa-detalhe.controller.ts` | Envio do relato completo quando a flag está ligada |
| Alterado | `src/features/pessoa-detalhe/sections/pessoa-detalhe-sighting-section.tsx` | Mostra os campos novos com a flag |
| Alterado | `src/features/pessoa-detalhe/sections/pessoa-detalhe-thanks-section.tsx` | Número e situação do relato; "Ver meus relatos" |
| Alterado | `src/components/brand-field.tsx` | Opção `multiline` (compatível: sem ela, nada muda) |
| Alterado | `src/features/perfil/*` | Atalho "Meus relatos" com a flag |
| Alterado | `src/features/ajuda/help-content.ts` | Pergunta nova, visível só com a flag (`requires`) |
| Alterado | `src/lib/env.ts`, `.env.example`, `AGENTS.md` | Flags `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS` e `EXPO_PUBLIC_MOCK_SIGHTING_FAIL` |
| Alterado | `src/translations/en.ts`, `es.ts` | 70 textos novos em inglês e espanhol |

**Depende de integração**: `POST /SightingReport` e `GET /SightingReport/mine` na API .NET (ver `CONTRATOS-API.md`).

---

## Etapa 2 — Linha do tempo do caso (30/10/2026)

**Objetivo.** Mostrar, em ordem, o que se sabe de um caso, deixando claro o peso de cada informação.

**Como funciona**

1. Na página do caso, o botão "Linha do tempo do caso" abre `/pessoa/{id}/linha-do-tempo` (não exige login; rascunho
   salvo só no aparelho não tem linha do tempo).
2. Cada acontecimento mostra data e horário (com "aproximadamente" quando for o caso), tipo, classificação, local
   resumido, mudança de situação ("De Pendente para Procurado"), observação e quem fez (Família, Comunidade, Equipe do
   Encontra-me, Sistema — nunca nomes).
3. Classificações: Confirmado, Informado no cadastro, Aguardando análise, Não confirmado, Informação corrigida. O topo
   da tela explica as que aparecem no caso e de onde vieram os dados.
4. **Sem a variável `EXPO_PUBLIC_ENABLE_CASE_TIMELINE` (funciona com a API de hoje):** a linha do tempo é montada com
   o cadastro e o histórico de avistamentos. Avistamentos aparecem como "Não confirmado", porque hoje não passam por
   análise. A data do desaparecimento só aparece quando não há avistamentos (limite da API atual).
5. **Com a variável:** vem de `GET /MissingPerson/{id}/timeline` (contrato em `CONTRATOS-API.md`), com mudanças de
   situação, atualizações da família, buscas ampliadas e correções.
6. Os locais aparecem só com bairro, cidade e estado. Rua, número e CEP são retirados.

**Consulta ao backend.** O repositório da API foi lido (somente leitura, nenhuma alteração) para alinhar os contratos
com o que já existe: o histórico de situações já guardado no servidor, a data em que a pessoa foi vista e o envio
direto de avistamentos, hoje sem análise. Detalhes em `CONTRATOS-API.md`.

**Arquivos**

| Situação | Arquivo | Para quê |
|---|---|---|
| Criado | `src/lib/case-timeline-rules.ts` | Regras puras: tipos, classificações, local resumido, linha do tempo montada no app, ordem |
| Criado | `src/lib/case-timeline.ts` | Rótulos, ícones e cores das classificações; nomes das situações |
| Criado | `src/services/timeline/*` (tipos, repositório, axios, mock, service) | Linha do tempo da API ou montada com os dados de hoje |
| Criado | `src/features/linha-do-tempo/*` (controller e sections) | Tela da linha do tempo |
| Criado | `src/pages/pessoa/[id]/linha-do-tempo/index.tsx` | Rota |
| Criado | `tests/case-timeline-rules.test.mjs` | 14 testes das regras |
| Alterado | `src/features/pessoa-detalhe/pessoa-detalhe.controller.ts`, `sections/pessoa-detalhe-info-section.tsx` | Botão "Linha do tempo do caso" |
| Alterado | `src/services/people/people.types.ts`, `people.axios.repository.ts` | Campo `dtRegistration` (data do cadastro), que a API já devolvia |
| Alterado | `src/features/ajuda/help-content.ts` | Pergunta "O que é a linha do tempo do caso?" |
| Alterado | `src/lib/env.ts`, `.env.example`, `AGENTS.md` | Variável `EXPO_PUBLIC_ENABLE_CASE_TIMELINE` e regra da linha do tempo |
| Alterado | `src/translations/en.ts`, `es.ts` | 36 textos novos |
| Alterado | `docs/evolucao/CONTRATOS-API.md` | O que a API já tem; contrato de `GET /MissingPerson/{id}/timeline` |

**Depende de integração (só para a versão completa)**: `GET /MissingPerson/{id}/timeline`. A versão montada com os
dados de hoje não depende de nada novo.

---

## Revisão das etapas 1 e 2 (30/10/2026)

Revisão do código antes de seguir, conforme o prompt "Evolução do Encontra-me + Encontra-me Vision" (parte 1).

| Problema encontrado | Correção | Arquivo |
|---|---|---|
| Depois de entrar na conta pela tela "Meus relatos", o app não voltava para ela: a rota não estava na lista de destinos permitidos do login | `/meus-relatos` passou a ser rota protegida (como `/perfil`): sem conta, o app leva ao login e volta depois | `src/lib/auth-guard.ts` |
| Toque duplo em "Enviar relato" podia mandar o mesmo relato duas vezes (a busca do endereço acontece antes do envio, com o botão ainda livre) | Trava de envio em andamento no relato completo | `src/features/pessoa-detalhe/pessoa-detalhe.controller.ts` |

Também conferido: variáveis e imports sem uso (nenhum), rotas novas e proteção de login, traduções (completas) e
os 31 testes das regras (todos passando).

---

## Etapa 3 — Cartaz digital com QR Code (30/10/2026)

**Objetivo.** Um cartaz pronto para divulgar, com QR Code que leva sempre à página atualizada do caso.

**Como funciona**

1. Na página do caso, "Cartaz com QR Code" abre `/pessoa/{id}/cartaz` (não exige login).
2. A prévia vem primeiro, depois as ações e por último os ajustes, para quem só quer o cartaz pronto.
3. Formatos: vertical (proporção A4, para imprimir) e quadrado (redes sociais). Dá para esconder idade, data e
   características. Telefone, endereço e documentos nunca aparecem (só o que já é público na página do caso; local
   só com bairro e cidade).
4. O QR Code aponta para a página do caso. Como a página mostra a situação atual, o QR "acompanha" o caso.
   Caso encerrado (Encontrado ou Cancelado) ou ainda pendente de aprovação não gera cartaz.
5. No computador: "Imprimir ou salvar em PDF" (imprime só o cartaz). No celular: mostrar na tela ou tirar print.
   "Salvar como imagem" aparece como "Em breve" (precisa de biblioteca nova; ver problemas conhecidos).
6. Sem `EXPO_PUBLIC_WEB_URL` configurada, o cartaz sai sem QR Code e com o aviso para procurar o caso no app.
7. Vermelho não é usado no cartaz (é exclusivo do "Pedir ajuda"): faixa azul-marinho, destaque laranja e rodapé creme.

**QR Code sem biblioteca nova.** Como este ambiente não instala pacotes, o gerador foi escrito em
`src/lib/qr-code.ts` (padrão ISO/IEC 18004, nível M, versões 1 a 10, estrutura da implementação de referência de
Project Nayuki). Foi validado decodificando os QR Codes gerados com o OpenCV (ver `TESTES.md`). Pode ser trocado por
uma biblioteca mantida sem mudar quem usa `encodeQr`.

**Organização da página do caso** (pedido de 30/10: "bem organizadinho, fácil de manusear, algo que até um idoso
consiga usar"): os botões passaram a ficar em dois grupos com título — "Saiba mais sobre o caso" (linha do tempo,
histórico de avistamentos) e "Ajude a divulgar" (divulgar, cartaz, acompanhar) — e o botão laranja "Vi essa pessoa
por perto" continua por último, logo acima do formulário que ele abre. Os botões ganharam ícones.

**Arquivos**

| Situação | Arquivo | Para quê |
|---|---|---|
| Criado | `src/lib/qr-code.ts` | Gerador de QR Code sem dependências |
| Criado | `src/lib/case-poster-rules.ts` | Quando o cartaz pode ser gerado, link do caso, conteúdo do cartaz |
| Criado | `src/lib/print-poster.ts` | Impressão só do cartaz na versão web |
| Criado | `src/components/qr-code-view.tsx` | Desenho do QR Code (um retângulo por trecho escuro, leve) |
| Criado | `src/features/cartaz/*` (controller e 3 sections) | Tela do cartaz |
| Criado | `src/pages/pessoa/[id]/cartaz/index.tsx` | Rota |
| Criado | `tests/qr-code.test.mjs`, `tests/case-poster-rules.test.mjs` | 22 testes novos |
| Alterado | `src/features/pessoa-detalhe/sections/pessoa-detalhe-info-section.tsx` | Botões em grupos, com ícones; botão do cartaz |
| Alterado | `src/features/pessoa-detalhe/pessoa-detalhe.controller.ts` | `openPoster` |
| Alterado | `src/features/ajuda/help-content.ts` | Pergunta "Como faço um cartaz com QR Code?" |
| Alterado | `src/translations/en.ts`, `es.ts` | 31 textos novos |

**Depende de integração**: nada novo no backend. Usa `GET /MissingPerson/{id}` e o endereço público do app web.

---

## Etapas 4, 9 e 10 — Painel da equipe: moderação, IA de apoio, teia e acompanhamento (30/10/2026)

**Objetivo.** Dar à equipe um lugar para moderar, analisar relatos, ampliar a busca e revisar sugestões da IA, com
justificativa em toda decisão e sem que nada mude um caso sozinho.

**Como funciona**

1. `/equipe` é rota protegida (login). Quem não é da equipe vê "Esta área é só para a equipe". A verificação usa um
   endpoint que **já existe** (`GET /Moderation/reports` responde 403 para quem não é da equipe), sem aviso de erro na
   tela. O atalho "Painel da equipe" no Perfil só aparece para a equipe.
2. **Denúncias abertas** (já existe na API): lista com golpes e informação falsa primeiro, "Ocultar" e "Manter".
3. **Caso** (`/equipe/caso/{número}`), com um campo de justificativa que vale para a próxima decisão:
   - Situação do caso (já existe na API), só com as mudanças permitidas pelo servidor. A justificativa vai junto, mas a
     API ainda não a guarda (contrato).
   - Relatos para análise (com `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS`): Em análise, Relevante, Não confirmado, Encerrado.
   - Acompanhamento da busca (com `EXPO_PUBLIC_ENABLE_SEARCH_NETWORK`): alcance, alertas enviados e entregues ("não
     informado" quando o serviço não diz), relatos recebidos, regiões mais ativas, últimas atualizações; **teia** no mapa
     (ponto inicial, regiões, informações; linha contínua = validada por pessoa, tracejada = sugerida/aguardando);
     ampliação da busca por níveis (bairro → cidade → vizinhas → estado → país → exterior) e pausa dos alertas.
     O texto deixa claro que alerta enviado não é pessoa mobilizada.
   - Sugestões da IA (com `EXPO_PUBLIC_ENABLE_AI_ASSIST`): tipo, indicação fraca/moderada/forte (nunca "confirmado"),
     motivos e relatos envolvidos; "Aceitar para análise" ou "Descartar". Sem reconhecimento facial.
4. Regras testadas: transições de situação iguais às do servidor, justificativa obrigatória, ordem da fila de
   denúncias, níveis de ampliação, limite de alertas (no máximo 3 por pessoa a cada 24 h, nunca a mesma informação do
   mesmo caso duas vezes, nada com alertas pausados), só conexão validada gera nova divulgação, leitura da pontuação
   da IA e distância entre pontos.
5. `lib/axios.ts` ganhou a opção `QUIET` (não vai ao servidor) para a tela tratar a falha sem o aviso global de erro.
   Sem ela, nada muda.

**Arquivos**: `src/lib/team-rules.ts`, `src/lib/search-network-rules.ts`, `src/lib/team-labels.ts`,
`src/services/team/*`, `src/features/equipe/*`, `src/pages/equipe/**`, `tests/team-rules.test.mjs` (criados);
`src/lib/axios.ts`, `src/lib/auth-guard.ts`, `src/lib/env.ts`, `src/features/perfil/*`, `src/translations/*` (alterados).

---

## Etapas 5 a 8 — Rede de busca (lado da pessoa), "Quero ajudar", proteção de crianças e Central de Apoio (30/10/2026)

**Etapa 5 — Rede inteligente de busca (pessoa comum)**, com `EXPO_PUBLIC_ENABLE_SEARCH_NETWORK`:
- Configurações › Notificações › "Casos perto de mim": escolha da distância (5, 10, 25 ou 50 km). Vai junto com o
  registro do aparelho (`nearbyRadiusKm`, proposta; a API ainda não usa). Sem a variável, nada muda.
- Página do caso › "Ajude a divulgar" › "Sugerir onde divulgar" (`/pessoa/{id}/sugerir-regiao`): cidade ou bairro e o
  motivo. "Recebida" só com número e horário do servidor. A equipe decide se amplia.
- A ampliação, a pausa, o limite de alertas e a teia ficam no Painel da equipe (etapas 4, 9 e 10).

**Etapa 6 — "Quero ajudar"** (`/quero-ajudar`, menu › Pessoas), com `EXPO_PUBLIC_ENABLE_VOLUNTEERS`:
- Orientações de segurança sempre visíveis, antes de tudo (nada de busca sozinho, abordagem, confronto ou dados das
  famílias; sem ranking).
- Cadastro mínimo: cidade ou bairro, formas de ajudar, disponibilidade (opcional), avisos da região e aceite das
  orientações. O nome vem da conta. Dá para sair do voluntariado. Sem a variável, o cadastro aparece como "Em breve".

**Etapa 7 — Crianças e adolescentes** (sem variável: não depende da API):
- Cadastro de menor de 18: aviso de proteção reforçada e bloqueio do envio quando algum texto cita escola, endereço
  de casa, condomínio, rotina ou rua com número (`lib/child-protection.ts`). A tela diz quais campos revisar.
- Página do caso: faixa "Criança ou adolescente: prioridade" com a orientação de ligar 190.
- Alertas prioritários para menores dependem do servidor (contrato).

**Etapa 8 — Central de Apoio às Famílias** (`/central-de-apoio`, menu › Apoio; sem login, sem API):
- Primeiras horas, boletim de ocorrência, lista do que reunir (marcação salva só no aparelho), golpes, quando a
  pessoa for encontrada e "Cuide de você" (Sofia, grupo de apoio, CVV 188).
- Duas perguntas novas na Central de Ajuda.

**Arquivos**: `src/lib/collaboration-rules.ts`, `src/lib/child-protection.ts`, `src/services/collaboration/*`,
`src/features/quero-ajudar/*`, `src/features/sugerir-regiao/*`, `src/features/central-apoio/*`,
`src/pages/quero-ajudar/`, `src/pages/central-de-apoio/`, `src/pages/pessoa/[id]/sugerir-regiao/`,
`tests/collaboration-rules.test.mjs` (criados); `src/lib/notification-prefs.ts`, `src/lib/env.ts`,
`src/services/notifications/*`, `src/features/configuracoes/*`, `src/features/inicio/*` (menu),
`src/features/pessoa-detalhe/*`, `src/features/cadastrar-pessoa/*`, `src/features/ajuda/help-content.ts`,
`src/translations/*` (alterados).

## Verificação das etapas anteriores na checagem do GitHub (30/10/2026)

- `c55f62a` — opção `QUIET` do axios declarada nos tipos (a checagem acusava erro de tipo no Painel da equipe).
- `a903c11` — checagem automática em passos separados (tipos, lint, traduções, testes), com anotações por arquivo e
  linha, inclusive erros do ESLint sem nome de regra.
- `b4a443e` — "Quero ajudar" preenche o formulário sem `setState` dentro de efeito (regra do React Compiler no lint).
- Resultado: checagem completa verde (tipos, lint, traduções, 76 testes, build web, build de demonstração e prints).

## Encontra-me Vision — rede de câmeras participantes (30/10/2026)

Commit `eb97072` (mais os de documentação e ajustes listados abaixo). Documento completo: `VISION.md`.

- Três ambientes: comunidade (`/vision`, sem conta: só região + nível de cobertura), responsável por câmera
  (`/vision/minhas-cameras`, `/vision/pedidos`) e institucional (`/vision/institucional`, operações, auditoria).
- Regras puras em `src/lib/vision-rules.ts` com 19 testes: funções e habilitação, justificativa, auditoria (inclusive
  negadas), raio em passos, situação das gravações pelo prazo de guarda, pedido de preservação (fluxo, intervalo,
  urgência, texto formal), análise visual sem biometria, classificação com decisão humana, trajeto só com evidência,
  próximas câmeras, confiabilidade de outras fontes.
- Demonstração completa em memória (`vision.mock.repository.ts`): 17 câmeras fictícias, 2 operações, 7 pedidos,
  5 correspondências, 3 informações de outras fontes, perfis para testar cada ambiente.
- Mapa esquemático próprio (sem serviço externo) e quadro sintético no lugar de vídeo.
- Variável `EXPO_PUBLIC_ENABLE_VISION` (desligada em produção); item no menu e pergunta na Central de Ajuda só com ela.
- Checagem: build de demonstração com todas as variáveis da evolução ligadas e teste de fumaça das telas novas
  (`.github/scripts/smoke-routes.js`).

## Central de Inteligência — branch `evolucao-central` (30 e 31/10/2026)

Branch criada a partir da `evolucao` (commit `961ab54`), exclusiva para esta revisão. Documento completo: `CENTRAL.md`.

- Ambiente público: informação confidencial (`/pista-confidencial`, também na página do caso e no menu), com a
  identidade separada da pista e explicação correta dos limites da confidencialidade; verificação de integridade de
  pacotes (`/verificar-integridade`, sem conta).
- Ambiente institucional (`/institucional`): dossiês com 8 abas, natureza de cada informação, central de pistas com
  organização automática, arquivos com SHA-256 e custódia, preservação, mobilização, protocolo de encerramento,
  histórico, exportação segura para autoridades (revisão, ocultação, segunda aprovação, ZIP com relatórios e
  manifesto, pacote criptografado AES-256-GCM, PDF) e auditoria encadeada com verificação.
- Ambiente técnico (`/central-tecnica`): saúde do sistema sem conteúdo dos casos e pedido de acesso excepcional.
- Bibliotecas próprias, sem dependência nova: SHA-256, gerador de ZIP, pacote criptografado com Web Crypto.
- 17 testes novos (total 112). Teste de fumaça ampliado com a exportação de ponta a ponta no navegador.

## Revisão e consolidação — branch `evolucao-revisao-auditoria` (31/10/2026)

Branch criada a partir da `evolucao-central` (commit `fb05935`). Documento completo: `REVISAO-AUDITORIA.md`.

- Removido o código sem uso de `src/features/home` (substituído por `/inicio`) e as traduções que só ele usava.
- "Último local" sem trechos repetidos (`src/lib/address-text.ts`, com teste).
- Inventário dos módulos pedidos (existe, demonstração, parcial ou não existe) e pendências que dependem de decisão
  ou do backend.


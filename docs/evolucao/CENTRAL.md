# Central de Inteligência — dossiês, pistas, proteção de denunciantes e exportação segura

Desenvolvida na branch **`evolucao-central`**, criada a partir da `evolucao` (que já tem as etapas 1 a 10 e o Vision).
Nada foi publicado, integrado à `main` ou enviado a autoridades. Tudo o que tem dados roda em **modo de
demonstração** (fictício e marcado). Nenhum endpoint existe ainda na API.

Variáveis (desligadas em produção, ligadas em desenvolvimento):

| Variável | O que liga |
|---|---|
| `EXPO_PUBLIC_ENABLE_CONFIDENTIAL_TIPS` | Envio de informação confidencial (ambiente público) |
| `EXPO_PUBLIC_ENABLE_CENTRAL` | Central de Inteligência (ambiente institucional) e Central técnica |

## Os três ambientes

| Ambiente | Onde | Quem | O que tem |
|---|---|---|---|
| **Público** | Menu › "Enviar informação confidencial"; página do caso › "Informação sensível"; `/verificar-integridade` | Qualquer pessoa (sem conta) | Pista confidencial com identidade separada; verificação de integridade de pacotes; casos, avistamentos e mobilização que o app já tinha |
| **Institucional** | Perfil › "Central de Inteligência" (`/institucional`) | Analistas e administração com habilitação verificada; auditoria | Dossiês, central de pistas, preservação, mobilização, encerramento, exportação segura, auditoria encadeada |
| **Técnico** | `/central-tecnica` | Equipe técnica da Nexora Prism | Disponibilidade, alertas de segurança, registros técnicos sem conteúdo dos casos, integrações, pedido de acesso excepcional |

Funções (`centralCan` em `src/lib/central-rules.ts`):

| Ação | Público | Analista | Administração | Auditoria | Técnica |
|---|---|---|---|---|---|
| Consultar dossiês, analisar pistas, ajustar mobilização | — | Sim | Sim | — | — |
| Abrir identidade de quem enviou pista* | — | — | Sim | — | — |
| Preservar registros, encerrar caso* | — | — | Sim | — | — |
| Exportar e autorizar exportação, links seguros* | — | — | Sim | — | — |
| Ver auditoria | — | — | Sim | Sim | — |
| Saúde técnica; pedir acesso excepcional* | — | — | — | — | Sim |

\* Exige **segundo fator** confirmado na sessão e **justificativa** (15 a 500 caracteres). Habilitação institucional
não verificada não libera nada. Toda tentativa — permitida ou negada — entra na auditoria.

## O que foi implementado (funciona no app, com dados fictícios)

1. **Dossiê digital** (`/institucional/dossie/[id]`), em abas grandes: Resumo (identificação pertinente,
   características, último local, data, ligações com Vision e relatos), Cronologia (filtro por natureza), Pistas,
   Arquivos, Preservação, Mobilização, Encerramento, Histórico (providências e exportações).
2. **Natureza de cada informação**: fato documentado, relato não verificado ou hipótese — sempre separados e com cor
   própria. Pista "relevante" continua sendo relato.
3. **Central de pistas com organização automática** (regras do app): pistas possivelmente ligadas (até 1 km e 2 h),
   repetidas (texto ≥ 60% parecido) e divergentes (mais de 5 km em até 30 min), e hipótese de sequência de
   deslocamento. Tudo para análise humana; não identifica suspeitos nem confirma identidade.
4. **Proteção de quem envia pistas**: a identidade fica num registro separado (`splitTip`); a pista nunca carrega
   nome ou contato. Abrir a identidade exige administração, segundo fator, justificativa, e fica registrado. A tela
   pública explica a confidencialidade **sem prometer anonimato absoluto** (dados técnicos de acesso exigidos por lei;
   a Justiça pode pedi-los) e avisa quando a pessoa escreve telefone, e-mail ou documento no texto.
5. **Arquivos originais intocados**: cada arquivo tem SHA-256, origem, data de recebimento, versões e histórico de
   custódia; a exportação usa cópias controladas.
6. **Preservação de informações**: registro com fundamento legal, referência do pedido, escopo e prazo; preservação
   ativa vira "guarda legal" e vence o prazo de retenção.
7. **EXPORTAR DOSSIÊ PARA AUTORIDADES** (`/institucional/dossie/[id]/exportar`):
   - Tela de revisão: escolha item a item; começa pela opção mais protetora (identidade de testemunhas e sigilosos
     fora; CPF, CNPJ, telefone, e-mail, CEP e placa ocultados nos textos, em cópia controlada).
   - Finalidade, fundamento, destinatário com **e-mail institucional** (.gov.br, .jus.br, .mp.br, .def.br, .leg.br,
     .mil.br) e confirmação por canal oficial; quem autorizou; **segunda pessoa** obrigatória quando entra identidade
     de testemunha ou documento sigiloso.
   - Pacote ZIP com: `00-LEIA-ME`, `01-relatorio-institucional.html` (pronto para imprimir em PDF, com identificação do
     caso, data, identificação institucional do Encontra-me, resumo, linha do tempo, pistas, anexos, origem dos
     registros e observações sobre o que não foi verificado), `02-relatorio-cronologico.csv`,
     `03-relatorio-pistas.csv`, `04-relatorio-geografico.geojson`, anexos originais ou cópias controladas, `05-indice`
     e **manifesto de integridade** (JSON e texto) com SHA-256 de cada arquivo.
   - Entrega: **pacote criptografado** (página `.html` com AES-256-GCM e senha mostrada uma vez, para ir por outro
     canal), ZIP sem senha ou relatório em PDF. **A exportação é registrada antes de entregar**; sem registro
     confirmado, nada é baixado. Nada é enviado automaticamente.
   - Aviso em todo lugar: o hash mostra se o arquivo mudou, **não certifica autenticidade**.
8. **Verificação de integridade** (`/verificar-integridade`, sem conta): escolhe o manifesto e os arquivos; o
   SHA-256 é calculado no próprio computador; mostra "confere", "mudou" ou "não está no manifesto".
9. **Mobilização geográfica**: áreas com raio em passos (2 a 100 km), pausa e retomada justificadas; regras de alerta
   (só quem autorizou, dentro de área ativa, 3 por dia, 6 h entre alertas do mesmo caso, nunca depois do
   encerramento) — `notifyDecision`, para o servidor aplicar. Ninguém é rastreado.
10. **Protocolo de encerramento**: situação, notificações, mobilização, canais públicos, alertas antigos, preservação,
    proteção da identidade, histórico e encerramento administrativo de uma vez; na área pública fica só
    "Pessoa localizada" (sem foto, último local, endereço, destino ou condição).
11. **Auditoria encadeada** (`/institucional/auditoria`): cada registro guarda o hash do anterior; a tela confere a
    corrente inteira e mostra onde quebrou. Há um teste ("simular alteração") que prova a detecção sem mexer nos dados.
12. **Central técnica** (`/central-tecnica`): disponibilidade, alertas, registros técnicos sem dados pessoais,
    integrações (todas "não conectado") e pedido de acesso excepcional, que nunca é liberado sozinho.

## O que foi preparado (contrato pronto, depende de servidor)

Link seguro com prazo, autenticação, registro de downloads e revogação; autenticação em dois fatores; sessões ativas;
permissões individuais; política de retenção e descarte; resposta a incidentes; envio real das pistas; cofre de
identidades; auditoria só de inclusão no banco; monitoramento real. Contratos em `CONTRATOS-API.md` (seção "Central de
Inteligência"). Na demonstração, o link seguro aparece marcado "simulado: não funciona sem a API".

## O que depende de autorização externa

- Integração com sistemas policiais, do Judiciário ou do Ministério Público: convênio e documentação de cada órgão.
- Verificação de autoridades (habilitação): processo com as instituições.
- Política de retenção, base legal de cada tratamento e relatório de impacto (LGPD): jurídico e sócios.
- Integração com câmeras: ver `VISION.md`.

## Arquivos

**Criados**: `src/lib/central-rules.ts`, `central-labels.ts`, `sha256.ts`, `zip-writer.ts`, `encrypted-package.ts`,
`web-file.ts`, `demo-profile.ts` (na `evolucao`); `src/services/central/*`; `src/features/central/*` (controllers,
`export-package.ts`, seções); páginas `src/pages/pista-confidencial`, `verificar-integridade`, `institucional/*`,
`central-tecnica`; `tests/central-rules.test.mjs` e `tests/integrity.test.mjs`.

**Alterados**: `src/lib/env.ts`, `src/lib/auth-guard.ts`, menu do Início, página do caso, perfil, Central de Ajuda,
traduções (295 textos), `.github/workflows/checagem.yml` (branch e variáveis), `.github/scripts/smoke-routes.js`,
`AGENTS.md`, `.env.example` e documentos desta pasta.

## Como revisar e, quando autorizado, integrar

1. Ver as diferenças: `git diff evolucao..evolucao-central` (só a Central) ou `git diff 7cc8304..evolucao-central`
   (tudo desde a base).
2. Rodar `npm run check` e `npm test`; abrir o app em desenvolvimento e usar a faixa "Demonstração: ver a Central
   como" para testar cada função.
3. A integração na `main` e a publicação são do dono do app, com as variáveis desligadas até a API existir.

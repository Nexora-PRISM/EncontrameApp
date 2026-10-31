# Novidades (branch `evolucao-novidades`)

Linha separada, criada em 31/10/2026 a partir da `evolucao-revisao-auditoria` (commit `7f92be8`). Nada daqui foi
publicado: sem pull request, merge, deploy, loja ou EAS Update. Integrar e publicar ficam com o dono do app.

O backend correspondente está na API em Node.js, branch `api-node-novidades` do repositório da API (privado).

---

## 1. Nossos apoiadores

Área institucional para reconhecer empresas e organizações que apoiam o projeto. Variável:
`EXPO_PUBLIC_ENABLE_SUPPORTERS` (vazia: ligada em dev com empresas **fictícias**, desligada em produção).

**Onde aparece**

- **Fim da lista do Início**: ao abrir a lista de alertas (arrastar o mapa para baixo), depois das pessoas. No
  computador, no fim da lista lateral "Pessoas próximas". Nunca acima dos casos.
- **Sobre o app**, depois dos documentos.
- **Menu › Apoio › Nossos apoiadores** e a página **`/apoiadores`**, com todos os publicados agrupados em
  Patrocinadores, Parceiros e Apoiadores, nome e domínio do site, e "Quer apoiar o Encontra-me?" (abre o e-mail
  com a mensagem pronta; nada é enviado sozinho).
- A seção some sozinha quando a variável está desligada, quando a API não responde ou quando não há marca publicada.

**Visual.** Título discreto "NOSSOS APOIADORES" entre filetes, o texto de apresentação pedido, grade de logotipos em
quadros claros (2 colunas no celular, 3 a 4 no tablet, 5 no computador), logotipo inteiro com `contain` (sem
distorção), sem logotipo aparece o nome. Entrada suave em fade, que o sistema desliga com "reduzir movimento". No
tema escuro o quadro continua claro, para a marca aparecer com as cores originais.

**Links externos.** Só `https`. Antes de abrir, o app pergunta "Abrir o site de …?" e mostra o domínio.

**Administração (Painel da equipe › Institucional › Nossos apoiadores)** — não é um painel novo; usa o acesso da
equipe que já existe (contas comuns veem "Esta área é só para a equipe").

- Lista com logotipo, categoria, domínio, situação ("Publicado", "No Início") e a autorização ("Autorização
  confirmada em …" ou "Sem autorização da marca").
- Atalhos: Editar, Publicar / Tirar do ar, Mostrar no Início / Tirar do Início, subir e descer na ordem.
- Formulário: nome, site oficial, categoria (com explicação; nenhuma depende de valor), logotipo (escolher, trocar,
  remover, com pré-visualização), **Autorização confirmada** + "Onde está a autorização", Publicar no app, Mostrar
  no Início e no Sobre, Excluir (com confirmação).
- **Publicar exige a autorização confirmada**, no app e na API. Desmarcar a autorização tira a marca do ar.
- Logotipo: PNG, JPG ou WebP, até 300 KB, tipo conferido pelo conteúdo do arquivo no app e de novo na API; sem SVG.
  No celular vem da galeria, sem recorte nem recompressão, para preservar transparência e proporção.

**Dados de demonstração.** Só nomes fictícios ("Empresa Exemplo A", "Instituto Exemplo B"…), sem logotipo de marca
real, e a tela avisa que são fictícios. Nenhuma das empresas citadas como exemplo no pedido foi cadastrada.

**Arquivos**

| Situação | Arquivo |
|---|---|
| Criado | `src/lib/supporter-rules.ts` (regras sem dependências) e `tests/supporter-rules.test.mjs` |
| Criado | `src/lib/supporter-labels.ts` (categorias e texto de apresentação) |
| Criado | `src/services/supporters/` (tipos, repositório, mock fictício, axios, hooks) |
| Criado | `src/components/supporters-grid.tsx` (grade responsiva reutilizada em todas as telas) |
| Criado | `src/features/apoiadores/` (seção resumida, página, abertura de site) e `src/pages/apoiadores/index.tsx` |
| Criado | `src/features/equipe/apoiadores-admin.controller.ts`, `apoiador-form.controller.ts` e as duas seções |
| Criado | `src/pages/equipe/apoiadores/index.tsx` e `src/pages/equipe/apoiadores/[id]/index.tsx` (`novo` cadastra) |
| Alterado | `src/lib/env.ts` (`supportersEnabled`), `.env.example` |
| Alterado | `src/constants/brand.ts` e `src/global.css` (tokens `logoTile` e `onLogoTile`) |
| Alterado | `src/lib/use-photo-picker.ts` (modo logotipo opcional; aviso em KB quando o limite é menor que 1 MB) |
| Alterado | Início: `inicio-alerts-section.tsx` e `inicio-people-sidebar-section.tsx` (rodapé da lista), menu e `home-shell.controller.ts` |
| Alterado | `src/pages/sobre/index.tsx`, `src/pages/equipe/index.tsx`, `src/features/equipe/equipe.controller.ts` |
| Alterado | `src/features/ajuda/help-content.ts` (pergunta "Quem são os apoiadores", só com o recurso ligado) |
| Alterado | Traduções `en.ts` e `es.ts`; `AGENTS.md`; `CONTRATOS-API.md`; checagem do GitHub (flag no build de demonstração, fumaça e prints) |

---

## 2. Ponto no mapa no cadastro de caso

Antes, o cadastro mandava só o texto do "Localidade": o caso não tinha coordenadas, não aparecia no mapa nem na busca
por perto até alguém registrar um avistamento. Agora, logo abaixo do "Localidade", há **Ponto no mapa (opcional)**:

- **Marcar o local digitado**: procura no mapa o texto do "Localidade".
- **Estou nesse local agora**: usa a localização de quem cadastra (com aviso para conferir se é mesmo onde a pessoa
  foi vista).
- Com o ponto marcado, um mapa pequeno permite tocar ou arrastar o pin; "Tirar o ponto do mapa" desfaz.
- Aviso fixo: marcar onde a pessoa foi vista, **nunca o endereço de casa**. O ponto é **arredondado para cerca de
  110 m** (3 casas decimais) antes de guardar ou enviar.
- Vai para a API como `latitude`/`longitude` no `POST /MissingPerson` (campos que a API .NET e a Node já aceitam). Os
  rascunhos feitos sem conta guardam o ponto e voltam com ele na revisão.

Arquivos: `src/lib/case-location-rules.ts` (+ teste), `src/features/cadastrar-pessoa/case-location.ts`,
`sections/cadastrar-pessoa-location-section.tsx`; alterados o controller e a seção básica do cadastro, `draft-review.ts`,
`people.types.ts`, `people.axios.repository.ts`, `people.mock.repository.ts`, `people.local.shared.ts`.

## 3. Ficha de identificação (`/ficha`)

A família prepara **antes** a ficha de quem precisa de mais cuidado (criança, idoso, pessoa com Alzheimer ou autismo).

- Foto do rosto (aviso para atualizar foto de criança com mais de 6 meses), nome, apelido, data de nascimento (idade
  calculada na hora), altura, porte, cor/etnia, cabelo, olhos, sinais particulares, **saúde e comunicação** e telefone
  de quem cuida.
- **Foto do dia** (roupa de hoje, antes de um passeio): vale 24 horas e é apagada do aparelho na leitura seguinte.
- **Fica só no aparelho** (SQLite no celular, IndexedDB no navegador), até 10 fichas. Nada vai para a API.
- **Mostrar para a polícia**: a ficha em tela cheia, com "Ligar 190" e, na web, "Imprimir ou salvar em PDF". Rodapé
  "Não é documento oficial".
- **Comunicar desaparecimento**: abre o cadastro (`/cadastrar-pessoa?ficha=<id local>`) já preenchido para conferir.
  **Saúde e comunicação nunca entram no cadastro público** (há teste para isso). A rota leva só o id local.
- Entradas: menu › Pessoas › Ficha de identificação e a Central de Ajuda.

Arquivos: `src/lib/id-sheet-rules.ts` (+ teste), `src/lib/id-sheet-store.ts` e `.web.ts`, `src/features/ficha/`,
`src/pages/ficha/` (`index`, `[id]`, `[id]/mostrar`).

## 4. Chegada segura (`/chegada-segura`) — a ideia "Me acompanhe até eu chegar"

O nome mudou de propósito: o Encontra-me **não é app de rastreamento**, e "me acompanhe" sugeria acompanhamento pelo
mapa. Como funciona:

- A pessoa diz para onde vai (opcional) e em quanto tempo espera chegar (15 a 90 min).
- No horário, uma **notificação local** pergunta "Você chegou bem?" (texto genérico na tela bloqueada). A permissão de
  notificação só é pedida ao tocar em "Começar". Sem notificação (web ou permissão negada), a tela avisa para voltar ao
  app no horário.
- "Cheguei bem" encerra; "Preciso de mais 15 minutos" prorroga (até 12 h no total); "Pedir ajuda" abre a tela de ajuda.
- Se o horário passar sem confirmação, a tela mostra "Ligar 190" e **só então** lê a posição, oferecendo a mensagem
  pronta ("Ainda não confirmei que cheguei bem…") para os contatos de confiança por WhatsApp, SMS ou outro app.
- **Nenhuma posição é lida durante o trajeto e nada é enviado sozinho.** A tela diz isso no topo.
- Entradas: menu › Apoio, Configurações › Emergência e a Central de Ajuda.

Arquivos: `src/lib/arrival-check-rules.ts` (+ teste), `src/lib/arrival-check.ts`, `src/features/chegada-segura/`,
`src/pages/chegada-segura/index.tsx`; alterados `lib/notifications.ts` (tipo `arrival-check` → `/chegada-segura`) e
`lib/location-share.ts` (modo `arrival`).

## 5. B.O. pela internet e direitos (Central de Apoio)

- **Boletim de ocorrência pela internet**: a pessoa escolhe o estado e vê se a delegacia on-line aceita desaparecimento,
  com botão para o site oficial (pergunta antes de sair do app). Só entram links **conferidos em fonte oficial em
  31/10/2026**, e o teste exige `https` e domínio `gov.br`:

  | UF | Situação | Fonte oficial |
  |---|---|---|
  | SP | Aceita (Delegacia Eletrônica) | Prefeitura de São Paulo, orientações a famílias de desaparecidos, com o link da Delegacia Eletrônica da Polícia Civil |
  | MG | Aceita (familiar maior de 18 anos com CPF; pode ser preciso ir à unidade) | mg.gov.br, serviço "Solicitar registro de ocorrência de desaparecimento de pessoa" |
  | PR | Aceita a partir de 12 anos; menores de 12, na delegacia | parana.pr.gov.br, "Registrar Boletim de Ocorrência de pessoa desaparecida" |
  | GO | Aceita | goias.gov.br/policiacivil, página da Delegacia Virtual |
  | DF | Começa pela Delegacia Eletrônica e termina na delegacia (sem link: o endereço direto não foi confirmado) | Agência Brasília (governo do DF) |
  | BA | Há Delegacia Virtual; a página não diz se aceita desaparecimento | ba.gov.br/policiacivil, página da Delegacia Virtual |

  Os outros 21 estados mostram a orientação geral (delegacia mais próxima; delegacia virtual só no site oficial
  `.gov.br`), **sem link adivinhado**. Ampliar a lista é um item pendente.
- **Seus direitos**, cada um com a lei: busca é prioridade urgente, sem prazo de 24 h (Lei 13.812/2019, art. 3º); a
  polícia adota as providências e o caso entra imediatamente no Cadastro Nacional (art. 8º); investigação até localizar
  (art. 9º); crianças e adolescentes, investigação imediata com aviso a portos, aeroportos, Polícia Rodoviária e
  transportes (ECA, art. 208, § 2º, incluído pela Lei 11.259/2005). Com "Informação geral, não substitui orientação
  jurídica" e a indicação de Defensoria Pública ou Ministério Público se a delegacia se recusar.

Arquivos: `src/lib/police-report-states.ts` (+ teste de dados), `src/features/central-apoio/rights-content.ts`,
`src/features/central-apoio/sections/central-apoio-police-section.tsx`; alterados o controller e a página da Central.

---

## 6. Avaliação (não implementada): "Encontrei alguém que pode estar perdido"

Pedido: avaliar, **sem implementar**, uma seção para quem encontra uma criança desacompanhada, uma pessoa com Alzheimer,
um idoso desorientado ou alguém que possa estar desaparecido. O cidadão é ponto de apoio e proteção, não investigador.

**Onde encaixar (proposta)**

- Um item novo na folha **Pedir ajuda** ("Encontrei alguém que pode estar perdido"), no atalho de emergência do Android
  e um artigo na Central de Ajuda, abrindo uma rota própria (`/encontrei-alguem`), sem login.

**Fluxo proposto (três passos, texto grande, um assunto por tela)**

1. **Há risco médico agora?** (ferida, desmaio, confusão forte, frio ou calor extremos) → botão **Ligar 192 (SAMU)**.
   Se não → **Ligar 190**. Os dois números sempre visíveis.
2. **Enquanto a ajuda chega**: fique por perto em lugar seguro e visível; fale com calma; ofereça água; avise um
   funcionário ou segurança do local. **Não**: levar a pessoa para casa ou para o carro, interrogar, fotografar ou
   publicar nas redes, procurar a família por conta própria, entregar a pessoa a quem diz ser parente sem a polícia.
3. **O que dizer na ligação** (roteiro): onde vocês estão, como a pessoa está, idade aproximada, roupas e o que ela
   disse. Botão "Mostrar onde estou" (localização atual, só na tela, para ler ao atendente).

**De propósito, fica de fora**: comparar a pessoa com os casos cadastrados, mostrar fotos de casos, contatar família,
enviar dados à equipe ou ao servidor. Tudo isso transformaria o cidadão em investigador e poderia expor a pessoa
encontrada a quem não deveria.

**Custo**: baixo — só telas e textos, sem API nova. Pode reaproveitar a folha "Pedir ajuda", o discador e o
`use-location-share`. Ideia futura, separada: pulseira com QR que abre só a orientação, o 190 e observações de saúde
(nunca nome ou endereço).

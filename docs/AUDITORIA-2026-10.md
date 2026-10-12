# Encontra-me — Auditoria inicial (outubro/2026)

Base auditada: `Nexora-PRISM/EncontrameApp`, commit `4ad5152` ("fix: ajustes visuais desktop").
Escopo: só o **frontend** (este repositório). O backend .NET (`encontrameapi.onrender.com`) é mantido em outro repositório e **não foi auditado** — vários itens abaixo dependem dele.

> Limitação desta rodada: o ambiente de auditoria não conseguiu baixar pacotes do npm (bloqueio de rede), então **typecheck, lint e build não foram executados**. Tudo abaixo vem de leitura do código. Rode `npm run check` e `npx expo export --platform web` antes de aceitar as mudanças.

## 1. Stack e estrutura

| Item | Situação |
|---|---|
| Framework | Expo SDK 57, React Native 0.86, React 19.2, TypeScript 6 (strict), Expo Router com raiz em `src/pages` |
| Dados | React Query + axios; padrão repository (mock / axios por `EXPO_PUBLIC_USE_MOCKS`) |
| Armazenamento local | SecureStore (tokens), SQLite (nativo) / IndexedDB (web) para cadastros offline |
| Mapas | `react-native-maps` (Android, exige `GOOGLE_MAPS_API_KEY`) e Google Maps JS no web |
| Auth | E-mail/CPF + senha, Google OAuth, JWT com refresh, desbloqueio biométrico |
| IA | Chat "Sofia" (apoio emocional) — a IA roda no backend (`/IAChat/messages`) |
| Capacitor | Não existe. O app é Expo; Android sai via `expo run:android` / EAS |
| Notificações push | **Não existem** (nenhum `expo-notifications` / FCM) |
| Testes automatizados | **Não existem** (sem Jest/Detox) |
| Deploy web | Netlify e Vercel configurados (`expo export --platform web`) |

Telas: `/` (boas-vindas), `/login`, `/signup`, `/signup-password`, `/inicio` (mapa + carrossel + apresentação da Sofia), `/pessoas-desaparecidas` (lista com filtros), `/pessoas-proximas`, `/pessoa/[id]` (detalhe, avistamento, histórico no mapa), `/cadastrar-pessoa`, `/chat` (Sofia), `/grupo-chat` (grupo de apoio), `/exercises` (respiração, gratidão, grounding), `/sofia-welcome`, `/sofia-theme`, `/sofia-perfil`.

## 2. Inventário

### 2.1 Funciona (pelo código; sem teste executado)
- Fluxo de login/cadastro/refresh/logout contra a API, com renovação de token compartilhada e proteção contra open redirect no `returnTo`.
- Busca paginada e "próximos" com filtros (status, idade, cidade/estado/bairro, origem vs. último avistamento).
- Detalhe da pessoa, registro de avistamento com geolocalização/autocomplete e histórico no mapa.
- Cadastro de pessoa com foto (limite 2 MB, PNG/JPG), modo offline para visitante e sincronização ao entrar.
- Chat com a Sofia e grupo de apoio, com aviso claro de que a IA não substitui profissional e com números 188/192/193/190.
- Tratamento global de erro da API em modal (funciona no web).

### 2.2 Existe só visualmente / parcial
- **Botão "buscar localização" no cadastro**: `handleLocationSearch` é um `TODO` vazio.
- **Busca de CEP no cadastro de usuário**: `TODO` (ViaCEP não integrado).
- **Telefone de contato no cadastro de pessoa**: é obrigatório no formulário, mas **não é enviado à API** (`people.axios.repository.ts → create` não manda `phone`). O dado só fica no aparelho.
- **Apresentação inicial** (`inicio-onboarding-section`): existem 3 passos da Sofia. Não cobre emergência, rotas nem privacidade, e não pode ser revista nas configurações (não há tela de configurações).
- **Data/hora do desaparecimento**: não há campo de data; "último local visto" é texto livre.

### 2.3 Quebrado ou arriscado
- **Mock ligado por padrão em produção** (corrigido nesta rodada, ver §4). `env.useMocks` era `true` sempre que a variável estivesse vazia — e `.env.production` deixa ela vazia. Se o Netlify não tiver `EXPO_PUBLIC_USE_MOCKS=false`, o site publicado mostra pessoas fictícias e o login aceita **qualquer** senha. **Confirmar no painel do Netlify.**
- **Avisos invisíveis no web** (corrigido nesta rodada): `Alert.alert` do react-native-web não exibe nada, então erros de foto e "Cadastro concluído" eram silenciosos no navegador.
- **Ligação para o 190 com um toque** (corrigido nesta rodada): sem confirmação, sujeito a ligação acidental.
- **Avistamento vira "último local" automaticamente**: o mock (e, pelo nome do endpoint, provavelmente a API) atualiza `lastSeen` com o relato sem revisão — contraria a regra de não tratar relato como verdade. Precisa de status "não verificado" no backend.
- **Sincronização de cadastros offline**: qualquer conta que fizer login no aparelho publica os cadastros pendentes feitos por visitantes antes dela. Em aparelho compartilhado, uma pessoa publica o cadastro de outra.
- **Identificação Android**: `com.anonymous.EncontrameApp`. Precisa virar algo como `br.com.nexoraprism.encontrame` **antes** da primeira publicação na Play Store (não dá para trocar depois). Exige refazer a restrição da chave do Maps e o SHA-1 do OAuth.
- **Foto em base64 dentro do JSON**: até ~2,7 MB por requisição, sem compressão/redimensionamento; pesado em rede móvel e no banco.
- Arquivos de template do Expo ainda no repositório (`README.md` padrão, `scripts/reset-project.js`, imagens `react-logo*`, `expo-*`).

### 2.4 Não existe (precisa ser desenvolvido)
Notificações/alertas regionais (FCM), botão de emergência com contatos de confiança, monitoramento de rotas, círculo familiar, painel administrativo e moderação, denúncia/bloqueio de usuários, comentários por caso, encerramento de caso pelo responsável, histórico de alterações do caso, tela de configurações/privacidade, exclusão de conta, política de privacidade e termos no app, testes automatizados, pipeline de build Android (EAS).

### 2.5 Depende de terceiros, credenciais ou decisão dos sócios
- Acesso ao **repositório do backend** e ao banco (para validação no servidor, status de relatos, auditoria, exclusão de dados).
- Projeto **Firebase** (FCM) para push; conta **Google Play** e **EAS/Expo**.
- Chaves do Google Maps (Android e web) e Client ID OAuth.
- Decisão jurídica sobre **CPF obrigatório** no cadastro (hoje é enviado como `document`), base legal LGPD para dados de menores e fotos, e se haverá **reconhecimento facial** (recomendação: manter fora do escopo até haver parecer jurídico).

## 3. Riscos principais (ordem de gravidade)

1. Produção possivelmente rodando com dados e login fictícios (verificar o Netlify hoje).
2. Relatos não verificados alterando a localização oficial de uma pessoa desaparecida.
3. Coleta de CPF obrigatório e de dados de menores sem consentimento/termo explícito no app (LGPD).
4. Nome de pacote Android provisório — bloqueia a publicação.
5. Ausência total de testes: qualquer mudança grande (emergência, rotas) sem rede de segurança.

## 4. Mudanças feitas nesta rodada (branch `fix/auditoria-inicial`)

| Arquivo | Mudança |
|---|---|
| `src/lib/env.ts` | Em build de produção, mock só se `EXPO_PUBLIC_USE_MOCKS=true` explícito. Em dev o comportamento antigo continua. |
| `src/lib/dialog.ts` (novo) | `showAlert` e `confirmAction` que funcionam no Android e no web. |
| `src/components/bottom-bar.tsx` | Confirmação antes de ligar para o 190. |
| `src/features/cadastrar-pessoa/cadastrar-pessoa.controller.ts` | Avisos de foto e de cadastro concluído agora aparecem no web. |
| `app.json` | Nome exibido "EncontrameApp" → "Encontra-me" (o `slug` e o pacote não mudaram). |
| `.env.example`, `AGENTS.md` | Documentam o novo comportamento da variável de mock. |

## 5. Plano de execução proposto

**Fase 0 — destravar (dias)**
Confirmar variáveis no Netlify; decidir o pacote Android; dar acesso ao repositório do backend; instalar Jest + testes dos controllers críticos; configurar EAS Build.

**Fase 1 — núcleo de casos confiável (2–3 semanas)**
Campos de data/hora, BO opcional e consentimento do responsável; enviar o telefone (ou decidir não coletar); relatos com status "não verificado" separado do "último local confirmado"; encerramento do caso pelo responsável; denúncia de conteúdo; foto via upload multipart com redimensionamento.

**Fase 2 — segurança pessoal (3–4 semanas)**
Contatos de confiança; botão de emergência que envia localização aos contatos com status de entrega (sem prometer integração com polícia); orientação para 190/192/193.

**Fase 3 — alertas e moderação (3–4 semanas)**
FCM com preferência de região, limite de frequência e expiração; painel administrativo com papéis e trilha de auditoria (provavelmente web, junto da API).

**Fase 4 — rotas e círculo familiar**
Monitoramento de trajeto com localização em segundo plano (exige permissão especial e justificativa na Play Store), consentimento explícito e retenção limitada.

**Fase 5 — lançamento**
Política de privacidade e termos, exclusão de conta no app (exigência da Play Store), testes em aparelhos reais, beta fechado.

Reconhecimento facial fica fora até haver parecer jurídico sobre dados biométricos.

## 6. Rodada 2 — Ajuda, Configurações, Perfil e identidade Nexora Prism

Novas rotas: `/perfil` (exige login), `/configuracoes`, `/ajuda`, `/sobre`. Acesso pelo menu lateral do Início ("Meu perfil", "Configurações", "Ajuda e suporte"). O item "Configurações" do menu antes abria o tema da Sofia; o tema da Sofia continua acessível pelo perfil da Sofia.

| Item pedido | Situação | Observação |
|---|---|---|
| Central de ajuda com busca e categorias | Feito | 10 categorias, 27 perguntas; busca sem acento. Texto descreve só o que existe hoje. |
| Relatar problema / formulário de contato | Feito (via e-mail) | Abre o app de e-mail com a mensagem pronta para contato@nexoraprism.com.br. A tela diz que só é enviado quando a pessoa confirmar. **Sem protocolo**: depende de API de chamados. |
| Configurações › Minha conta | Parcial | Sair (real, com confirmação) e pedido de exclusão por e-mail (real). Editar perfil/foto e alterar/recuperar senha: "Em breve" — **dependem de endpoints na API**. |
| Configurações › Notificações | Não existe | Exibido como "Em breve": o app não tem push (FCM). |
| Configurações › Privacidade e localização | Parcial | Estado real da permissão de localização, atalho para os ajustes do aparelho, contagem e exclusão dos cadastros salvos no aparelho. Contatos de confiança e política de privacidade: "Em breve". |
| Configurações › Segurança | Parcial | Biometria liga/desliga de verdade (pede confirmação biométrica). Dicas contra golpes (Ajuda). Sessões ativas: depende da API. |
| Aparência e acessibilidade | Feito | Tema Sistema/Claro/Escuro salvo no aparelho, sem mexer na paleta da Sofia. Rever apresentação. Fonte segue o tamanho do sistema. |
| Premium | Informativo | Mostra "Não disponível". Nenhum preço ou plano inventado. |
| Sobre | Feito | Nome, slogan, "Um produto da Nexora Prism.", versão (de `app.json`), e-mail e site. Termos/política: "Em breve". |
| Perfil redesenhado | Parcial | Cabeçalho com iniciais, nome e e-mail; atalhos; acesso a Ajuda/Configurações. Única estatística real disponível: cadastros aguardando envio. **Alertas publicados e avistamentos enviados dependem de endpoint "meus casos" na API.** Foto do usuário depende de upload na API. |
| Botão de emergência visível | Mantido | A barra inferior (190) aparece também em Perfil, Configurações, Ajuda e Sobre. |
| Logo da Nexora Prism | Não usada | A logo da Nexora Prism não está no repositório; foi usada só a identificação em texto. Adicione o arquivo em `assets/images/` para exibi-la no "Sobre". Splash não foi alterada. |

Verificação desta rodada: checagem de sintaxe (bun) e uma checagem de tipos parcial (tsc sem as dependências instaladas, então os tipos do React Native/Expo não foram validados) — encontrou e corrigiu um erro (`submitContact` não exportado). **Não foi executado** `npm run check`, build, nem teste em aparelho.

## 7. Rodada 3 — revisão final, botão de ajuda e foco em crianças e mulheres

### Botão "Pedir ajuda"
- **Onde:** centro da barra inferior (alcance do polegar), vermelho, 56 px de altura, com texto. Aparece em Início, lista de casos, detalhe de uma pessoa, cadastro, perfil, configurações, ajuda e sobre. Em telas largas (tablet/web) vira um botão flutuante no rodapé — antes, nessas telas, não havia acesso ao 190.
- **Fluxo:** 1º toque abre a folha; 2º toque escolhe o número. Isso evita ligação acidental sem confirmação extra. Vibração curta ao escolher.
- **Separação clara:** "Perigo agora — ligar" (190 Polícia, 180 Central da Mulher, 100 Direitos Humanos/crianças, 192, 193) × "Comunicar um desaparecimento" (cadastro) × "Vi uma pessoa desaparecida" (lista de casos).
- **Honestidade:** a folha diz que a ligação é feita pelo celular e que o app não avisa autoridades nem contatos. Se o telefone não abrir, mostra o número para discar manualmente. Nenhum "alerta enviado" é exibido porque não existe servidor de alertas.

### Crianças e mulheres
- Apresentação inicial cita crianças e mulheres e aponta o botão "Pedir ajuda"; o botão "Avistei uma pessoa" da apresentação agora leva à lista de casos (antes só fechava a apresentação).
- Lista de casos: atalho "Crianças e adolescentes" (até 17 anos), usando o filtro de idade que a API já suporta. **Filtro por gênero não existe**: a API não tem esse campo.
- Cadastro: aviso "Proteja quem você procura" (não publicar endereço, escola, rotina, documentos; não esperar 24 horas para o B.O.).
- Ajuda: nova categoria "Crianças e mulheres" (6 perguntas) e números 180/100 nas respostas de emergência. Sobre: frase de missão com a prioridade, aberta a toda a sociedade.

### Erros corrigidos
- Data do desaparecimento: era digitada sem máscara, não era validada e **não era enviada à API**; ainda aparecia como se fosse um local na lista. Agora tem máscara dd/mm/aaaa, validação (data real e não futura) e é enviada como `dtLastSeen`. **Confirmar no backend que o `POST /MissingPerson` aceita esse campo.**
- Campo "Claúsula" no cadastro de usuário (escrita errada, sem explicação e não enviado à API) removido da tela.
- Ícones de busca sem ação nos campos "Localidade" (cadastro de pessoa) e "CEP" (cadastro de usuário) removidos.
- "Localidade" passou a "Cidade onde desapareceu", com exemplo que não induz a informar endereço residencial. "Última aparição" passou a "Data em que foi vista pela última vez".
- "Grupo do apoio" → "Grupo de apoio"; "Confirmar Senha" → "Confirmar senha"; "Nome Completo" → "Nome completo".

### O que ainda depende de fora (não foi simulado)
- **Telefone de contato** do cadastro de pessoa continua sem ser enviado: a API não tem campo para ele. Decidir no backend.
- Pedido de ajuda para contatos de confiança, alertas regionais e push: exigem backend + Firebase.
- Moderação, denúncia de casos e avistamentos "não verificados": exigem backend e painel administrativo (não existe painel neste repositório).
- Recuperação de senha, edição de perfil, exclusão de conta pelo app: endpoints da API.
- Política de privacidade e termos: jurídico.

### Verificação
- Sintaxe de todos os arquivos alterados: ok (bun).
- Checagem de tipos parcial (tsc sem dependências): sem erros novos nos arquivos alterados; os erros restantes vêm da falta dos tipos do React Native/Expo e já existiam.
- Testes de lógica (bun test, fora do repositório): 4 testes / 60 verificações passando — busca da ajuda, máscara e validação de data, rotas protegidas e redirecionamento seguro.
- **Não executado:** `npm run check`, `expo export`, build Android, testes em aparelho e fluxos com a API real. O npm está bloqueado neste ambiente.

## 8. Rodada 4 — preservar o visual atual

O site publicado (encontrame.nexoraprism.com.br) é um app JavaScript e não pôde ser renderizado neste ambiente; a referência visual foi o código da `main` (`4ad5152`), que é o que o site publica.

O que foi mantido de propósito: paleta (marinho, laranja, azul, creme), logo, tipografia do sistema, `ScreenHeader`, `BrandButton`, `BrandField`, menu lateral, mapa e carrossel do Início, formulários e fluxo da Sofia. As telas novas (Perfil, Configurações, Ajuda, Sobre) usam esses mesmos componentes e cores.

Mudança visível mais relevante: a barra inferior. Antes: três ícones sem texto (telefone 190 · início · cadastrar). Agora: os mesmos três lugares, com texto embaixo, e o telefone virou o botão vermelho "Pedir ajuda" no centro (alcance do polegar). Se a equipe preferir a ordem original (ajuda à esquerda), é uma troca de duas linhas em `bottom-bar.tsx`.

Ajustes desta rodada:
- Texto laranja "Sair" / "Solicitar exclusão" (menu e Configurações) usava `orangeDark` (#E06F1E) sobre branco, com contraste ~3:1. Novo token `orangeText` (#B4570F no claro, #F08A3E no escuro), contraste ≥ 4.5:1. Ícones continuam no laranja original.
- O item "Configurações" do menu antes abria as cores do chat da Sofia. Essa opção não sumiu: está em Configurações › Aparência e acessibilidade › "Cores do chat da Sofia".

## 9. Rodada 5 — carrossel Stories, atalho de emergência e pets (Premium)

### 9.1 Carrossel do Início (estilo Stories)
- Avatares redondos com anel na cor da situação do caso (mesmas cores de status de antes) e o nome curto (apelido ou primeiro nome) no mesmo selo branco de antes, para continuar legível sobre o mapa.
- Mostra ~4 por vez e o próximo aparece cortado na borda da tela, indicando que dá para deslizar. Ao soltar, o carrossel encaixa no próximo avatar.
- **Mais de duas pessoas:** antes o carrossel mostrava só quem estava no raio de 50 km — se havia dois casos perto, apareciam dois. Agora ele mostra primeiro quem está perto e completa com os casos mais recentes (até 20 no total), sem repetir e sem casos "Encontrado"/"Cancelado". Com busca ativa, mostra só o resultado da busca, como antes. Mapa e lista lateral (tela larga) não mudaram.

### 9.2 Emergência fora do app (Android)
- Novo módulo nativo local `modules/emergency-shortcut` (Kotlin, só APIs do Android — `ShortcutManager`), ligado pelo autolinking do Expo.
- **Ativação:** Configurações › Emergência › "Atalho na tela inicial". Exige conta conectada e, se o celular tiver digital/rosto cadastrados, confirmação biométrica. Depois o app oferece "Adicionar à tela inicial": o Android mostra a janela de confirmação e coloca o ícone vermelho "Pedir ajuda" ao lado dos apps (Android 8+). Também aparece ao tocar e segurar o ícone do Encontra-me (Android 7.1+).
- **Uso:** o ícone abre direto a tela `/pedir-ajuda` (deep link `encontrameapp://pedir-ajuda`), com os mesmos números da folha do botão vermelho. Nada é ligado ou enviado sem um toque no número.
- **Proteções:** ativar exige conta + biometria; desativar pede confirmação e desliga também o ícone já fixado (o Android mostra uma mensagem se ele for tocado). O atalho não mostra dados pessoais.
- **Decisão de segurança:** usar o atalho **não** exige login. Ligar para 190/180/100 é livre até com o celular bloqueado; exigir senha numa emergência pode custar tempo. Sair da conta também não desativa o atalho, para que uma sessão expirada nunca bloqueie um pedido de socorro.
- **Widget** (bloco na tela inicial) não foi feito: exigiria uma tela nativa própria (layout + AppWidgetProvider). O atalho fixado resolve o "um toque sem abrir o app" com bem menos risco. Pode ser uma próxima etapa.
- **Sem notificar contatos:** o pedido de ajuda para contatos de confiança continua dependendo do backend.

### 9.3 Pets desaparecidos (Premium)
- Telas `/pets` (lista com "Divulgar" pelo compartilhamento do celular e "Ligar para o tutor") e `/cadastrar-pet` (foto, espécie, raça, cor, porte, sinais, cidade, bairro, data, telefone do tutor). Ver e divulgar: qualquer pessoa. Cadastrar: conta conectada + Premium.
- **Desligado em produção** até existir backend: aparece só com `EXPO_PUBLIC_ENABLE_PETS=true` (em desenvolvimento fica ligado com dados de exemplo do mock). Em produção, Configurações › Premium mostra "Pets desaparecidos — Em breve".
- **Não há cobrança:** nenhuma assinatura, preço ou pagamento foi criado. O app consulta a situação Premium em `GET /Subscription/me`; sem resposta `active: true`, a conta não é Premium.
- **Contrato proposto para a API** (a criar no backend .NET):
  - `GET /MissingPet?page=1&pageSize=30` → `{ items: MissingPet[] }`
  - `POST /MissingPet` (autenticado, Premium) ← `{ name, species, breed, color, size, marks, city, neighborhood, dtLastSeen (ISO), contactPhone (só dígitos), photo (base64) }` → `MissingPet`
  - `MissingPet = { missingPetId, name, species, breed, color, size, marks, city, neighborhood, dtLastSeen, photo, contactPhone, statusId (1 perdido, 3 encontrado) }`
  - `GET /Subscription/me` (autenticado) → `{ active: boolean }`
  - O backend precisa validar o Premium no `POST` — a checagem do app é só de interface.

### 9.4 Como testar num Android real
1. `npm install`, depois `npx expo prebuild --clean` e `npx expo run:android` (ou build EAS). **Expo Go não serve**: o atalho usa código nativo.
2. Entrar na conta → Configurações › Emergência → ligar "Atalho na tela inicial" → confirmar a digital → "Adicionar".
3. Fechar o app, tocar no ícone "Pedir ajuda" da tela inicial → deve abrir direto a tela de ajuda.
4. Desligar o atalho → tocar no ícone fixado → o Android deve mostrar "Atalho desativado…".
5. Início: deslizar o carrossel para o lado e conferir o encaixe e os casos além dos próximos.

### 9.5 Verificação desta rodada
- Sintaxe de todos os arquivos TS/TSX alterados: ok (bun). XML e JSON do módulo nativo: bem formados.
- Checagem de tipos parcial: sem erros novos (os restantes vêm da falta das dependências instaladas).
- 19 testes de lógica passando (carrossel, texto de divulgação de pets, lógica JS do atalho com o módulo nativo simulado, central de ajuda, datas, rotas protegidas).
- O código Kotlin foi escrito seguindo o modelo oficial de módulo do Expo SDK 57 (`expo-module-template`, conferido no GitHub do Expo) e usa só APIs do Android, mas **não foi compilado aqui**: não há Android SDK nem npm neste ambiente. Rode o passo 9.4 antes de publicar.

## 10. Rodada 6 — últimos ajustes: cadastro seguro, responsabilização e carrossel

### 10.1 Tecnologia (conferida; nada foi trocado)
- O projeto é um app **Expo (React Native) com TypeScript**, executado com **Node.js** (npm, Metro e Expo CLI). **Não usa Vite**: o site sai de `npx expo export --platform web`.
- `package.json`, `package-lock.json`, `app.config.js`, `tsconfig.json`, ESLint, Biome, `netlify.toml` e `vercel.json` estão **iguais ao commit base `4ad5152`** — mesmas dependências, versões e scripts. A única mudança de configuração em todas as rodadas foi o nome exibido em `app.json` ("EncontrameApp" → "Encontra-me").
- Versão de Node recomendada: **22.22.1 ou mais nova** (o `lint-staged` 17 exige ≥ 22.22.1; React Native/Metro aceitam 20.19.4+, 22.13+ ou 24.3+).

### 10.2 Carrossel: os quadrados de volta
- O formato redondo da rodada 5 foi desfeito. Voltaram os **quadrados originais**: cantos arredondados, borda grossa na cor da situação do caso, nome completo no selo branco e o mesmo tamanho máximo de antes (104 px).
- Continua da rodada 5: deslizar para o lado no estilo Stories, encaixe no próximo quadrado, o último quadrado cortado na borda indicando que há mais, e **mais de duas pessoas** (próximas primeiro, depois as mais recentes, até 20, sem casos encerrados).

### 10.3 Cadastro de conta
- **O CPF não vai mais na URL.** Nome, CPF, e-mail, celular e CEP passavam da etapa 1 para a etapa da senha como parâmetros de rota — no navegador, ficavam na barra de endereço e no histórico. Agora ficam só na memória do app (`src/lib/signup-draft.ts`) e são apagados ao concluir ou sair do cadastro.
- Se a API recusar um dado da etapa 1 (ex.: "CPF já cadastrado"), o app volta para a etapa 1 com o erro no campo certo e com o que a pessoa já tinha digitado.
- **Aceite das regras obrigatório**: caixa "Li e aceito as regras de uso e privacidade…", com link para a nova tela `/regras`. O momento do aceite vai para a API como `termsAcceptedAt` (também no cadastro pelo Google).
- **Campo "Claúsula"**: era um texto livre ("Exemplo…") que **nunca foi enviado à API** — a tela foi retirada na rodada 3 e agora saiu também o resto do código. O aceite explícito das regras ocupa esse papel de forma verificável. `clause: ''` continua no tipo do payload para não mexer no contrato.

### 10.4 Cadastro de pessoa desaparecida — legitimidade
Todos os campos e validações originais foram mantidos (nome completo, cidade obrigatória, telefone obrigatório e válido, foto PNG/JPG até 2 MB, altura 30–250 cm, data no passado). Acrescentado, no bloco "Sobre quem está cadastrando":
- **Vínculo com a pessoa** (obrigatório): mãe ou pai, responsável legal, outro familiar, cônjuge, amigo(a), outro.
- **Número do boletim de ocorrência**: **obrigatório para menores de 18 anos**; para adultos, recomendado. O app confere só se foi preenchido e se tem ao menos 4 dígitos — **não consegue verificar se o B.O. existe** (não há integração com as polícias).
- **Declaração de veracidade** (obrigatória), citando bloqueio da conta e responsabilização civil e criminal.
- **Idade passou a ser obrigatória** (pode ser aproximada). *Impacto avaliado:* antes era opcional, e bastava deixar a idade em branco para o B.O. de uma criança deixar de ser exigido. A faixa válida (0–130) é a mesma de antes.
- Os três dados vão para a API como `reporterRelationship`, `policeReportNumber` e `truthDeclarationAt`. **A API atual provavelmente ignora esses campos** — o app não afirma em lugar nenhum que eles ficam registrados. Ver §10.10.

### 10.5 Cadastros feitos sem conta: revisar antes de enviar
- **Antes:** o cadastro feito sem conta ficava no aparelho e era **enviado sozinho assim que qualquer pessoa entrasse numa conta** naquele aparelho (risco já apontado no §2.3: em aparelho compartilhado, uma pessoa publicava o cadastro de outra, sem ver o conteúdo nem assumir a declaração).
- **Agora:** nada é enviado sozinho. A pessoa logada toca em **"Revisar e enviar"** — no próprio caso pendente ou em Meu perfil — e abre o formulário já preenchido (`/cadastrar-pessoa?rascunho=<id>`). Ela confere, completa o que faltar (rascunhos antigos não têm vínculo nem B.O.) e **aceita a declaração de novo**. Só então o caso é enviado pela conta dela, e o rascunho local só é apagado depois que a API confirma.
- *Impacto avaliado:* um passo a mais para quem cadastrou sem conta. Em troca, todo caso enviado tem uma conta identificada que viu os dados e assumiu a declaração. Saíram `src/services/people/people.sync.ts` e as chamadas de envio automático (login, cadastro, Google, desbloqueio, listas e abertura do app). Apagar rascunhos continua em Configurações › Privacidade e localização.

### 10.6 Correção, atualização e denúncia de casos
- Cada caso publicado ganhou **"Algo errado neste cadastro?"**, com "Pedir correção ou atualização" (inclusive "a pessoa foi encontrada") e "Denunciar este cadastro" — também para quem é a pessoa cadastrada, está em segurança e não quer ser localizada (proteção de mulheres que se afastaram por segurança).
- Funciona **sem login** (denúncia não pode depender de conta). Abre o e-mail do suporte com a identificação do caso; a tela diz que o pedido só chega quando a pessoa enviar. Novo assunto de suporte: "Corrigir ou atualizar um caso".
- **Histórico de alterações e de situação** do caso não existe no app: depende de a API guardar quem mudou o quê e quando (§10.10).

### 10.7 Regras de uso e privacidade (`/regras`)
- Tela nova com regras da comunidade, responsabilidade e resumo de dados. Abre a partir do cadastro de conta, da declaração do cadastro de pessoa, de Configurações e de Sobre.
- Diz com todas as letras que **o uso do app não é anônimo** e que os dados de identificação podem ser entregues às autoridades com ordem judicial ou outra obrigação legal. Não promete anonimato nem "guarda com segurança" que não dá para verificar no app.
- Os Termos de Uso e a Política de Privacidade **completos** continuam pendentes de revisão jurídica — a tela avisa isso.

### 10.8 CPF — como é tratado hoje (conferido no código)
- Coletado só no cadastro de conta. Validado pelos dígitos verificadores (`isCpf`), com máscara. Vai para a API como `document` (só dígitos) por HTTPS. O login aceita e-mail ou CPF.
- **Não aparece em nenhuma tela** e não é guardado pelo app: a sessão guarda só os tokens e `id`, `nome` e `e-mail`.
- Corrigido nesta rodada: o vazamento do CPF pela URL no navegador (§10.3).
- **Não dá para verificar daqui:** como a API guarda o CPF (criptografia?), quem tem acesso e o que vai para logs.
- Coletar CPF **não torna o app seguro por si só** e não tira a responsabilidade da empresa: hoje o app confere só se o número é válido, não se pertence a quem está se cadastrando.

### 10.9 Verificação de e-mail e celular (avaliação)
- **Hoje não existe** nenhuma das duas: a conta é criada sem confirmar e-mail ou celular. Nenhuma tela de "código enviado" foi criada, para não simular uma verificação que não acontece.
- Recomendação: confirmar o **e-mail** por link ou código no cadastro (barato, reduz contas falsas) e, se o orçamento permitir, o **celular por SMS** antes de publicar o primeiro caso (custo por mensagem). As duas dependem do backend; o app adiciona as telas quando os endpoints existirem.

### 10.10 O que o backend precisa garantir (o app sozinho não garante)
1. Gravar `reporterRelationship`, `policeReportNumber` e `truthDeclarationAt` (caso) e `termsAcceptedAt` (conta), junto com o id do usuário, data/hora e IP — e **recusar no servidor** caso de menor sem B.O. (a checagem do app pode ser contornada).
2. Caso novo entra como "Pendente" e só fica público depois de revisão — com prioridade para crianças.
3. Endpoints de denúncia e de pedido de correção, fila de moderação e atualização de situação pelo responsável, com **histórico** (quem, quando, o que mudou).
4. Trilha de auditoria só de acréscimo para edições e mudanças de situação.
5. CPF: criptografia em repouso (ou hash para unicidade + valor cifrado), nunca devolvido em endpoint público, acesso por perfil com registro de quem consultou e mascaramento no painel.
6. Registros de acesso (IP, data e hora) guardados por 6 meses em ambiente controlado — exigência do Marco Civil da Internet (Lei 12.965/2014, art. 15) para aplicações.
7. **Retenção e exclusão** (proposta a validar com advogado): excluir dados da conta a pedido (LGPD, art. 18), mantendo só o que a lei exige ou o necessário para exercício de direitos; remover ou anonimizar fotos e dados de casos encerrados após prazo definido; base legal e cuidados específicos para dados de crianças e adolescentes (LGPD, art. 14).
8. **Preservação de provas** de abuso só com fundamento legal (ordem judicial, obrigação legal ou exercício regular de direitos), com acesso restrito, registro de quem acessou e prazo definido.
9. **Alerta para contatos (futuro):** o app só mostrará "enviado" depois de a API responder 2xx com `alertId` e `receivedAt`. Sem essa confirmação: "não confirmado — ligue 190".
10. Telefone de contato do caso: na rodada 7 passou a ir como `contactPhone` (só dígitos), mas **a API ainda não tem esse campo** — ver §11.2.
11. Antes de publicar, **testar o cadastro contra a API real**: se ela recusar campos desconhecidos (configuração incomum no .NET), os campos novos precisam ser criados na API primeiro.

### 10.11 Emergência fora do app — confirmação de recebimento
- O atalho da tela inicial (Android) abre a tela "Pedir ajuda"; a ligação é feita pelo próprio celular. Como nada é enviado pela internet, o app **nunca diz "alerta enviado"** — a regra "confirmar o recebimento antes de dizer que foi enviado" é cumprida por desenho. Quando existir o alerta para contatos, vale o contrato do item 9 acima.
- Permissões: o atalho não pede permissão nova do Android, e o app não pede permissão de ligação (abre o discador com o número; a pessoa toca para ligar). Ativar exige conta e, se houver, digital/rosto; usar não exige login.

### 10.12 Avaliação do que saiu ou mudou nesta rodada
| O que | Por quê |
|---|---|
| Envio automático de cadastros feitos sem conta | Substituído por "Revisar e enviar" (§10.5): responsabilização e proteção em aparelho compartilhado. |
| Formato redondo do carrossel (rodada 5) e o nome curto | Pedido de preservar os quadrados; voltou o nome completo como no original. |
| Resto do campo "Claúsula" | Nunca foi enviado à API; substituído pelo aceite das regras. |
| Idade opcional → obrigatória | Fecha o atalho para não informar o B.O. de menores. |

Nada mais foi retirado. Pets (Premium) e as demais funções não mudaram nesta rodada.

### 10.13 Verificação desta rodada
- Sintaxe de todos os arquivos TS/TSX alterados desde `4ad5152`: ok.
- Checagem de tipos parcial comparada com o commit anterior: **nenhum erro novo** (os restantes vêm da falta das dependências instaladas neste ambiente).
- 32 testes de lógica passando, incluindo os novos: idade/B.O./vínculo, preenchimento do formulário de revisão (foto, vínculo inválido, rascunho antigo), mensagens de correção e denúncia, rascunho do cadastro de conta fora da URL, novas perguntas da ajuda e ausência de promessa de anonimato.
- **Não executados aqui** (npm bloqueado neste ambiente): `npm run check`, `npx expo export --platform web` e o build Android. Rode os três antes de aceitar as mudanças.

## 11. Rodada 7 — aperfeiçoar e finalizar o Encontra-me

Trabalho feito sobre o projeto existente (mesma base Expo/React Native/TypeScript, mesmas telas e arquitetura). Nada foi removido; o que mudou de comportamento está em §11.9.

### 11.1 Pedido × situação
| Pedido | Situação |
|---|---|
| Rótulos "Cidade de los", "dell", "País de '" no "Cadastrar uma pessoa" | Corrigido (§11.2) |
| Nome completo, Localidade, Cidade, Estado, País, Telefone e Foto | Ajustados (§11.2) |
| Botão "+" cobrindo campos e a barra inferior | Corrigido (§11.2) |
| Cadastro de usuário: CPF, validação, autenticação, proteção de dados | Senha mais forte e mostrar/ocultar senha nesta rodada; CPF, aceite das regras e dados fora da URL na rodada 6 (§10.3, §10.8) |
| Cadastro de pessoa, publicação do alerta, carrossel | Rodadas 5 e 6 (§9.1, §10.2–10.6); nesta rodada, campos e telefone (§11.2) |
| Botão de emergência com contagem de 10 s, cancelar e confirmação real | Feito (§11.3) |
| Ligação para serviços de emergência | Avaliada: o app abre o discador; ligar sozinho não é permitido (§11.3) |
| Compartilhar localização com contatos (pedido das 23:10) | Feito (§11.4) |
| Tema claro ou escuro | Feito, no menu do Início e em Configurações (§11.5) |
| Idiomas (pedido das 23:19) | Português, inglês e espanhol (§11.6) |
| Notificações, comentários, painel administrativo | Dependem do backend — não simulados (§11.7) |
| IA e reconhecimento facial | Verificados — nada simulado (§11.7) |
| Premium (seção 13 do prompt mestre) | Estrutura montada (§11.12): preço de referência R$ 9,90/mês centralizado, grátis × Premium, situação da assinatura e tela `/premium`. Pronto hoje: cadastro de pets; os demais recursos aparecem como "Em breve" |
| Banco de dados, segurança, permissões, persistência, erros | Conferidos (§11.8) |

### 11.2 Cadastrar uma pessoa
- **Causa dos rótulos embaralhados:** o HTML padrão do Expo na web declara `lang="en"`. O navegador oferecia "traduzir do inglês" e a tradução automática transformava os rótulos em português em "Cidade de los", "dell", "País de '". Agora `src/pages/+html.tsx` declara `lang="pt-BR"` (e o app troca para o idioma escolhido, §11.6).
- Campos: **Nome completo** e **Localidade** (onde a pessoa foi vista pela última vez — obrigatório) no topo; bloco "De onde a pessoa é (opcional)" com **Cidade**, **Estado**, **País** e **Bairro**; **Telefone** com explicação ("da família ou de quem cadastra"); **Foto** com quadro "Adicionar foto", prévia e "Remover foto". Validações anteriores mantidas.
- O telefone passou a ser enviado à API como `contactPhone` (só dígitos). **A API ainda não tem esse campo** — sem ele, o telefone não fica gravado (§11.10).
- Botões flutuantes ("+" e "Enviar cadastro"): ficam acima da altura **medida** da barra inferior, somem com o teclado aberto e o formulário ganhou folga no fim — não cobrem mais campos nem a barra.

### 11.3 Alerta de emergência (contagem de 10 s)
- Em "Pedir ajuda" › **Acionar alerta de emergência** (também em Configurações › Emergência). Contagem de 10 s com botão grande **Cancelar alerta**, vibração curta a cada segundo e aviso para leitor de tela. A contagem **pausa** enquanto o sistema pergunta sobre a localização, para a janela de permissão não esconder o "Cancelar".
- Ao fim: abre o **discador com o 190** — a pessoa toca em ligar. Se o app estiver em segundo plano nesse momento, a tela mostra "Ligue para o 190" ao voltar. Há também "Não esperar — ligar 190 agora".
- **Envio ao servidor (contrato proposto):** `POST /EmergencyAlert` com `triggeredAt`, `latitude`, `longitude`, `accuracyMeters` e `locationCapturedAt`. A tela só diz **"Alerta recebido pelo Encontra-me"** se a resposta trouxer `alertId` (ou `emergencyAlertId`) **e** `receivedAt`; o número de contatos avisados só aparece se o servidor informar `notifiedContacts`. Sem isso: "Envio do alerta não confirmado — ligue 190" e "Tentar enviar de novo".
- Ligado por `EXPO_PUBLIC_ENABLE_EMERGENCY_ALERT` (padrão: ligado em dev com mock, **desligado em produção**). Desligado, a tela diz que o alerta automático ainda não existe. Sem login, o alerta não é enviado; ligar e mandar a localização funcionam sem conta.
- No mock, o comprovante é marcado como teste ("nenhum alerta real foi enviado"); `EXPO_PUBLIC_MOCK_EMERGENCY_FAIL=true` simula falha.
- **Ligação automática para o 190 (avaliação):** não é possível com as permissões disponíveis. O Android só deixa apps comuns abrirem o discador com o número (a chamada direta a números de emergência é reservada ao discador do sistema), e o iOS sempre pede confirmação. Por isso o app **não pede** a permissão `CALL_PHONE` e nunca diz que "ligou" ou "avisou a polícia".

### 11.4 Localização para contatos
- **Contatos de confiança** (`/contatos-confianca`): até 5 pessoas (nome + celular com DDD), salvos **só no aparelho** (SecureStore no celular; armazenamento do navegador na web) — não vão para o servidor.
- **Compartilhar localização** (`/compartilhar-localizacao`, no "Pedir ajuda" e em Configurações): pega a posição atual (12 s; se falhar, a última conhecida) e monta a mensagem com link do Google Maps, precisão e horário. Envio por **WhatsApp** (`wa.me`), **SMS** ou **outro app** (compartilhamento do sistema). Sem permissão de localização, a mensagem vai sem o link e a tela explica.
- A tela nunca diz que a mensagem foi entregue: "A mensagem só chega quando você tocar em enviar". A mesma área aparece no fim do alerta de emergência ("Avise seus contatos").

### 11.5 Tema, divulgar caso e senha
- **Tema claro/escuro:** no menu do Início ("Tema do app": Auto, Claro ou Escuro) e em Configurações › Aparência e acessibilidade (Automático, Claro ou Escuro). Automático segue o modo do celular. O menu do Início agora rola em telas pequenas, para o tema e o idioma não cobrirem os itens.
- **Divulgar este caso:** texto pronto com nome, idade, onde e quando foi vista e características — sem telefone nem endereço; com `EXPO_PUBLIC_WEB_URL`, inclui o link do caso.
- **Senha nova:** mínimo de 8 caracteres, com letras e números (antes: 6). Botão mostrar/ocultar no login e no cadastro. Recuperação de senha continua dependendo da API.

### 11.6 Idiomas: português, inglês e espanhol
- Escolha em **Configurações › Idioma** (Português, English, Español, Automático) e no **menu do Início** (PT · EN · ES · Auto). Sem escolha salva, o app fica em **português**; "Automático" segue o idioma do celular (outros idiomas → inglês). A escolha fica salva no aparelho.
- Traduzidos: todas as telas, avisos, mensagens de erro, Central de Ajuda, regras de uso, mensagens montadas pelo app (localização, divulgar caso ou pet, pedido de correção). As opções de seleção continuam indo **em português** para a API.
- **Não traduzidos, de propósito:** o nome "Encontra-me", o slogan e "Um produto da Nexora Prism."; o que as pessoas escrevem (casos, avistamentos, grupo); as respostas da Sofia (vêm do servidor); o assunto do e-mail de suporte (para a triagem da equipe); os números de emergência, que continuam os do Brasil.
- O app envia o idioma escolhido no cabeçalho `Accept-Language` das chamadas à API — a API pode usá-lo (por exemplo, para a Sofia responder no mesmo idioma), mas hoje não há confirmação de que use.
- Na web, a página declara o idioma em uso: a tradução automática do navegador funciona corretamente para outros idiomas.
- iOS: as mensagens de permissão (localização, câmera, fotos, Face ID) saem no idioma do celular (`locales/*.json`, aplicado no próximo build nativo).
- **Por que não "todos os idiomas" dentro do app:** cada idioma exige revisar cerca de 900 textos, incluindo orientações de emergência e textos jurídicos — tradução automática sem revisão nesses pontos é um risco. A estrutura está pronta para mais idiomas: novo arquivo em `src/translations/`, registro em `src/lib/i18n.tsx` e `npm run i18n:check`.
- As traduções para inglês e espanhol foram escritas nesta rodada e **merecem revisão de um falante nativo** antes do lançamento, principalmente as orientações de emergência e as regras de uso.

### 11.7 Integrações verificadas (nada simulado)
- **Sofia (IA):** o app só troca mensagens com a API (`/IAChat/messages`, `/IAChat/exercises`); o modelo roda no servidor. Os avisos de que a Sofia não substitui profissionais e não atende emergências foram mantidos.
- **Reconhecimento facial:** **não existe** no app nem na API usada por ele. O "Face ID" das Configurações é só a biometria do próprio celular para entrar na conta (o app não recebe a imagem). Nenhuma tela sugere busca de pessoas por foto.
- **Notificações:** não há envio de notificações (não há serviço de push configurado). Configurações mostra "Em breve" — sem botão que finge funcionar.
- **Comentários nos casos e painel administrativo:** não existem na API usada pelo app; não foram criados para não simular moderação. Dependem de endpoints e de perfis de acesso no backend (§10.10, itens 2–4).

### 11.8 Dados, segurança e permissões (conferido no código)
- **No aparelho:** sessão (tokens + id, nome e e-mail), preferências (tema, idioma, biometria, atalho) e contatos de confiança em SecureStore (celular) ou no armazenamento do navegador (web); cadastros feitos sem conta em SQLite local, até "Revisar e enviar". O CPF não é guardado no aparelho nem aparece em telas.
- **Permissões pedidas:** localização só com o app aberto, câmera, fotos e biometria — cada uma quando a função é usada. Não há localização em segundo plano, ligação direta, leitura de contatos nem SMS (o app abre o aplicativo de mensagens).
- **Erros:** falhas de rede e de servidor viram mensagens claras no idioma do app; nada é dado como enviado sem resposta da API.

### 11.9 O que mudou de comportamento (avaliação)
| O que | Por quê |
|---|---|
| Senha mínima de 6 → 8 caracteres, com letras e números | Pedido de reforçar a autenticação; vale só para senhas novas. |
| Página da pessoa: rótulo "Porte" → "Porte físico" | Mesmo nome do formulário (e tradução sem ambiguidade com o porte de pets). |
| Textos de permissão do iOS | Descrevem todos os usos reais (localização também para mandar a contatos; câmera e fotos também para pets). |
| `package.json`: script `i18n:check`, incluído no `npm run check` | Impede tradução com variáveis trocadas. Dependências não mudaram. |
| `app.json`: `locales` e textos de permissão | Mensagens de permissão no idioma do celular (iOS). |

### 11.10 Depende de credenciais, serviços externos ou autorização
1. **API:** `POST /EmergencyAlert` (com aviso real aos contatos) e o campo `contactPhone` do caso; gravação de vínculo, B.O., declaração e aceite (§10.10); moderação, correções, comentários, histórico e painel administrativo com perfis de acesso.
2. **Notificações push:** serviço de push (ex.: Firebase Cloud Messaging com `expo-notifications`) e endpoints de inscrição por região.
3. **Chaves:** Google Maps (Android e web), OAuth do Google e `EXPO_PUBLIC_APP_KEY` — no ambiente do build (Netlify/EAS), nunca no repositório.
4. **Sofia:** depende do servidor de IA da API.
5. **Revisão jurídica** dos Termos de Uso e da Política de Privacidade; **revisão nativa** das traduções.
6. **Publicação:** este ambiente não tem permissão de envio ao repositório `Nexora-PRISM/EncontrameApp` no GitHub — é preciso conectar a conta GitHub ao Claude e autorizar o repositório, ou enviar o pacote/patch manualmente.

### 11.11 Verificação desta rodada
- **70 testes de lógica passando**: os 49 anteriores (localização, contatos, alerta, comprovante do servidor, senha, cadastro, ajuda…) e 21 novos de idiomas (tradução e variáveis, idioma do aparelho, padrão português, marca preservada, Central de Ajuda completa e com busca nos dois idiomas, mensagens de localização, divulgação e pets em inglês e espanhol).
- `node scripts/check-i18n.js --strict`: 898 textos, nenhum sem tradução, nenhuma variável trocada.
- Checagem de tipos parcial comparada com o commit anterior: **nenhum erro novo** (os restantes vêm da falta das dependências instaladas neste ambiente).
- Varreduras: nenhum `t()` fora de componente (o idioma não fica "congelado"), nenhum hook dentro de função aninhada, nenhum `useMemo`/`useEffect` que use `t` sem tê-lo nas dependências, nenhum hex solto nas telas.
- **Não executados aqui** (npm bloqueado neste ambiente): `npm run check` (inclui ESLint), `npm run format`, `npx expo export --platform web` e o build Android/iOS. Rode-os antes de publicar e teste num celular o alerta (contagem, cancelar, discador), o compartilhamento por WhatsApp/SMS e a troca de idioma.

### 11.12 Premium: estrutura do plano (seção 13 do prompt mestre)
- **Preço centralizado** em `src/lib/premium-plan.ts`: **R$ 9,90 por mês** como preço de referência. Plano anual (`annualDiscountPercent`) e teste grátis (`trialDays`) ficam prontos para configurar — vazios, não aparecem. `onSale: false`: o app mostra o preço como referência e diz que **nada é cobrado**.
- **Grátis × Premium** na mesma configuração. Sempre grátis: casos e mapa, cadastro de pessoa e avistamentos, "Pedir ajuda" e alerta de emergência, mandar a localização atual, ver e divulgar pets, Central de Ajuda, Sofia e grupo; alertas regionais (planejado). Premium: cadastro de pets (pronto) e, planejados, monitoramento ampliado de trajetos com histórico, localização em tempo real com contatos autorizados, círculo de proteção familiar, alertas personalizados, passeios de pets (trajeto, histórico, avisos de atraso e afastamento), perfis de animais e ferramentas extras.
- **Situação da assinatura** lida de `GET /Subscription/me` (contrato proposto): `active` + `status` (`none`, `trial`, `active`, `grace` = pagamento recusado, `cancelled`, `expired`), `plan` (`monthly`/`annual`), `renewsAt`, `expiresAt`. O acesso é sempre o `active` do servidor; a tela nunca mostra "ativo" sem acesso. Sem o endpoint (404), a conta é tratada como gratuita, sem modal de erro.
- **Telas:** nova `/premium` (sem login) com preço, situação, grátis × Premium com "Disponível"/"Em breve" e o compromisso "emergência nunca será paga"; Configurações › Premium ("Conhecer o Premium" e "Minha assinatura"); item "Premium" no menu do Início; botão "Conhecer o Premium" na área de pets; duas perguntas na Central de Ajuda (preço vindo da configuração).
- **Pets:** publicar alerta de pet continua no Premium, como pedido na rodada 5. O prompt mestre (13.1) coloca "consulta e publicação de alertas Pet" no plano gratuito — a chave `petAlertsRequirePremium` muda isso em um lugar só, quando os sócios decidirem.
- **Não feito (depende de fora):** compra, renovação, cancelamento e restauração de compras exigem a cobrança da loja (Google Play Billing, nova biblioteca nativa + Play Console) e a API de assinaturas com validação no servidor. Trajetos, passeios e avisos com o app fechado exigem localização em segundo plano e notificações (novos módulos nativos e permissões do Android). Tempo real e círculo familiar exigem servidor. Nada disso foi simulado.
- **Verificação:** 95 testes de lógica passando (25 novos: preço e formato, plano anual, grátis × Premium sem itens de emergência, chave dos pets, leitura da situação da API, 404 = gratuito, textos em português e inglês, ajuda com o preço da configuração); traduções completas (961 textos); nenhum erro de tipo novo além do ruído da falta do pacote axios neste ambiente.

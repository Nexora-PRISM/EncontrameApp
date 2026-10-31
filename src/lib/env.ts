/**
 * Acesso centralizado às variáveis de ambiente públicas do Expo.
 * Só variáveis com prefixo EXPO_PUBLIC_ ficam disponíveis no bundle do app.
 * Fonte: env da máquina / Netlify, depois `.env.local` / `.env.production` (ver AGENTS.md).
 */
export const env = {
  /**
   * Quando true, os services usam os repositórios mockados (sem depender da API).
   * Em desenvolvimento o padrão continua sendo mock (a menos que a env seja "false").
   * Em build de produção só usa mock se a env for explicitamente "true" — assim um
   * deploy com a variável vazia não publica dados fictícios nem login que aceita qualquer senha.
   */
  useMocks:
    process.env.EXPO_PUBLIC_USE_MOCKS === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS !== 'false'),
  /** URL base da API (já inclui /api; usada quando useMocks = false). */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  /** Client ID web do OAuth Google (público; audience do ID token). */
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  /** API key da Maps JavaScript API (web). Não use a chave restrita ao Android. */
  googleMapsWebApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY ?? '',
  /** Chave fixa enviada no header X-App-Key (consulta pública pelo app). */
  appKey: process.env.EXPO_PUBLIC_APP_KEY ?? '',
  /**
   * Envio do alerta de emergência para o servidor (POST /EmergencyAlert), ao fim da contagem.
   * Em desenvolvimento fica ligado (com mocks); em produção só com
   * EXPO_PUBLIC_ENABLE_EMERGENCY_ALERT=true — ligue quando a API receber o alerta e avisar
   * os contatos. Desligado, a contagem só abre o telefone com o 190.
   */
  emergencyAlertEnabled:
    process.env.EXPO_PUBLIC_ENABLE_EMERGENCY_ALERT === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_EMERGENCY_ALERT !== 'false'),
  /**
   * Notificações que dependem do servidor (casos perto, novos cadastros da região e "Acompanhar").
   * Em desenvolvimento fica ligado (com mocks); em produção só com
   * EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true — ligue quando a API guardar o aparelho e enviar
   * os avisos. Desligado, essas opções aparecem como "Em breve" e o botão "Acompanhar" some.
   * O lembrete de cadastros salvos no aparelho não depende desta flag.
   */
  pushEnabled:
    process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS !== 'false'),
  /**
   * Relato completo de avistamento ("Eu vi essa pessoa"): data, horário, descrição, foto opcional, número e
   * situação do relato, e a tela "Meus relatos". Depende de POST /SightingReport e GET /SightingReport/mine
   * (docs/evolucao/CONTRATOS-API.md). Em desenvolvimento fica ligado (com mocks); em produção só com
   * EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS=true. Desligado, o app usa o registro simples de avistamento de hoje.
   */
  sightingReportsEnabled:
    process.env.EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS !== 'false'),
  /**
   * Linha do tempo completa do caso vinda da API (GET /MissingPerson/{id}/timeline): mudanças de situação,
   * atualizações da família, correções e buscas ampliadas. Em desenvolvimento fica ligada (com mocks); em produção
   * só com EXPO_PUBLIC_ENABLE_CASE_TIMELINE=true. Desligada, a linha do tempo é montada com o que a API de hoje já
   * devolve (cadastro e histórico de avistamentos).
   */
  caseTimelineApiEnabled:
    process.env.EXPO_PUBLIC_ENABLE_CASE_TIMELINE === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_CASE_TIMELINE !== 'false'),
  /**
   * Rede inteligente de busca: raio dos alertas, sugestão de região e, no Painel da equipe, ampliação da busca,
   * pausa dos alertas e a "teia" do caso. Depende de endpoints novos (docs/evolucao/CONTRATOS-API.md).
   * Em desenvolvimento fica ligada (com mocks); em produção só com EXPO_PUBLIC_ENABLE_SEARCH_NETWORK=true.
   */
  searchNetworkEnabled:
    process.env.EXPO_PUBLIC_ENABLE_SEARCH_NETWORK === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_SEARCH_NETWORK !== 'false'),
  /**
   * Sugestões da IA para a equipe (relatos relacionados, duplicidades, contradições), sempre com decisão humana.
   * Em desenvolvimento fica ligada (com mocks); em produção só com EXPO_PUBLIC_ENABLE_AI_ASSIST=true.
   */
  aiAssistEnabled:
    process.env.EXPO_PUBLIC_ENABLE_AI_ASSIST === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_AI_ASSIST !== 'false'),
  /**
   * "Quero ajudar": cadastro de voluntário com orientações de segurança (PUT/GET/DELETE /Volunteer/me).
   * Em desenvolvimento fica ligado (com mocks); em produção só com EXPO_PUBLIC_ENABLE_VOLUNTEERS=true.
   * Desligado, a tela mostra só as orientações e o cadastro aparece como "Em breve".
   */
  volunteersEnabled:
    process.env.EXPO_PUBLIC_ENABLE_VOLUNTEERS === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_VOLUNTEERS !== 'false'),
  /**
   * Encontra-me Vision: rede de câmeras participantes (cobertura por região, painel do responsável por câmera e
   * ambiente institucional com operações, preservação de imagens, correspondências e trajeto). Nenhum endpoint existe
   * ainda na API (docs/evolucao/VISION.md). Em desenvolvimento fica ligado com dados de demonstração; em produção só
   * com EXPO_PUBLIC_ENABLE_VISION=true, depois da API, dos convênios e da avaliação jurídica.
   */
  visionEnabled:
    process.env.EXPO_PUBLIC_ENABLE_VISION === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_VISION !== 'false'),
  /**
   * Central de Inteligência (ambiente institucional de dossiês, pistas, preservação e exportação segura para
   * autoridades) e Central técnica. Nenhum endpoint existe ainda (docs/evolucao/CENTRAL.md). Em desenvolvimento fica
   * ligada com dados fictícios; em produção só com EXPO_PUBLIC_ENABLE_CENTRAL=true.
   */
  centralEnabled:
    process.env.EXPO_PUBLIC_ENABLE_CENTRAL === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_CENTRAL !== 'false'),
  /**
   * Envio de pista confidencial (POST /ConfidentialTip), com a identidade separada da pista. Em desenvolvimento fica
   * ligado com mock; em produção só com EXPO_PUBLIC_ENABLE_CONFIDENTIAL_TIPS=true.
   */
  /**
   * Nossos Apoiadores: seção no fim da lista do Início, no Sobre e no menu, página /apoiadores e administração no
   * Painel da equipe (GET/POST/PUT/DELETE /Supporter). Em desenvolvimento fica ligado com empresas fictícias; em
   * produção só com EXPO_PUBLIC_ENABLE_SUPPORTERS=true, depois da API e de haver apoiador com marca autorizada.
   */
  supportersEnabled:
    process.env.EXPO_PUBLIC_ENABLE_SUPPORTERS === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_SUPPORTERS !== 'false'),
  confidentialTipsEnabled:
    process.env.EXPO_PUBLIC_ENABLE_CONFIDENTIAL_TIPS === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_CONFIDENTIAL_TIPS !== 'false'),
  /**
   * Endereço público do app web (ex.: https://encontrame.nexoraprism.com.br), sem barra no fim.
   * Quando preenchido, o texto de divulgação de um caso inclui o link da página dele.
   */
  webUrl: (process.env.EXPO_PUBLIC_WEB_URL ?? '').trim().replace(/\/+$/, ''),
} as const;

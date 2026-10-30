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
   * Endereço público do app web (ex.: https://encontrame.nexoraprism.com.br), sem barra no fim.
   * Quando preenchido, o texto de divulgação de um caso inclui o link da página dele.
   */
  webUrl: (process.env.EXPO_PUBLIC_WEB_URL ?? '').trim().replace(/\/+$/, ''),
} as const;

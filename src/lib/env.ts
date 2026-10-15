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
   * Plano Premium (tela /premium, item do Menu, grupo em Configurações e artigos da Ajuda).
   * Retirado do app por decisão dos sócios (15/10/2026): fica escondido em todos os ambientes até
   * EXPO_PUBLIC_ENABLE_PREMIUM=true. O código continua no projeto para voltar quando for a hora.
   */
  premiumEnabled: process.env.EXPO_PUBLIC_ENABLE_PREMIUM === 'true',
  /**
   * Pets desaparecidos (recurso do Premium). Em desenvolvimento fica ligado (com mocks);
   * em produção só aparece com EXPO_PUBLIC_ENABLE_PETS=true — ligue quando a API
   * (/MissingPet e /Subscription/me) e a assinatura estiverem prontas.
   * Como faz parte do Premium, também some enquanto o Premium estiver desligado.
   */
  petsEnabled:
    process.env.EXPO_PUBLIC_ENABLE_PREMIUM === 'true' &&
    (process.env.EXPO_PUBLIC_ENABLE_PETS === 'true' ||
      (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_PETS !== 'false')),
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
   * Avisos de segurança no mapa (relatos da comunidade sobre ruas perigosas). Em desenvolvimento
   * fica ligado (com mocks); em produção só com EXPO_PUBLIC_ENABLE_SAFETY_NOTES=true — ligue quando
   * a API tiver /SafetyNote (contrato em services/safety-notes/safety-notes.axios.repository.ts).
   */
  safetyNotesEnabled:
    process.env.EXPO_PUBLIC_ENABLE_SAFETY_NOTES === 'true' ||
    (__DEV__ && process.env.EXPO_PUBLIC_ENABLE_SAFETY_NOTES !== 'false'),
  /**
   * Endereço público do app web (ex.: https://encontrame.nexoraprism.com.br), sem barra no fim.
   * Quando preenchido, o texto de divulgação de um caso inclui o link da página dele.
   */
  webUrl: (process.env.EXPO_PUBLIC_WEB_URL ?? '').trim().replace(/\/+$/, ''),
} as const;

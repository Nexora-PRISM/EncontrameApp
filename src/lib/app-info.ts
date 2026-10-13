import Constants from 'expo-constants';

import { msg } from '@/lib/i18n-msg';

/** Dados institucionais exibidos em "Sobre", Configurações e Ajuda. */
export const AppInfo = {
  name: 'Encontra-me',
  slogan: 'para que nenhuma história termine em silêncio',
  company: 'Nexora Prism',
  companyLine: 'Um produto da Nexora Prism.',
  mission:
    msg('Mobilização social para encontrar pessoas desaparecidas, com prioridade para a proteção de crianças e mulheres — e aberta a toda a sociedade.'),
  companySite: 'https://nexoraprism.com.br',
  supportEmail: 'contato@nexoraprism.com.br',
  /** Página HTML pública (Play Store e link dentro do app). */
  privacyPolicyUrl: 'https://encontrame.nexoraprism.com.br/privacidade',
} as const;

/** Versão do app definida em app.json (`expo.version`). */
export function appVersion(): string {
  return Constants.expoConfig?.version ?? '—';
}

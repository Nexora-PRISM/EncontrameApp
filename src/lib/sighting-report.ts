import type { MaterialCommunityIcons } from '@expo/vector-icons';

import { msg } from '@/lib/i18n-msg';
import { checkRateLimit, type RateLimitResult, type SightingStatus } from '@/lib/sighting-report-rules';

/** Como cada situação do relato aparece na tela. Nenhuma delas diz que a pessoa foi encontrada. */
export const SIGHTING_STATUS_META: Readonly<
  Record<
    SightingStatus,
    { label: string; description: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
  >
> = {
  received: {
    label: msg('Recebido'),
    description: msg('O servidor recebeu o relato.'),
    icon: 'inbox-arrow-down',
  },
  pending_review: {
    label: msg('Aguardando análise'),
    description: msg('O relato está na fila da equipe de análise.'),
    icon: 'clock-outline',
  },
  in_review: {
    label: msg('Em análise'),
    description: msg('Uma pessoa da equipe está verificando o relato.'),
    icon: 'magnify',
  },
  relevant: {
    label: msg('Considerado relevante'),
    description: msg('A equipe considerou a informação útil para o caso. Isso não confirma que era a pessoa.'),
    icon: 'lightbulb-on-outline',
  },
  not_confirmed: {
    label: msg('Não confirmado'),
    description: msg('Não foi possível confirmar a informação.'),
    icon: 'help-circle-outline',
  },
  closed: {
    label: msg('Encerrado'),
    description: msg('A análise deste relato terminou.'),
    icon: 'archive-outline',
  },
};

/**
 * Envios recentes por caso, só na memória deste aparelho (some ao fechar o app).
 * É uma proteção da interface contra toques repetidos; o limite de verdade precisa existir no servidor.
 */
const recentByCase = new Map<string, number[]>();

export function checkSightingRateLimit(personId: string, now = Date.now()): RateLimitResult {
  const result = checkRateLimit(recentByCase.get(personId) ?? [], now);
  recentByCase.set(personId, result.recent);
  return result;
}

export function rememberSightingSent(personId: string, now = Date.now()): void {
  recentByCase.set(personId, [...(recentByCase.get(personId) ?? []), now]);
}

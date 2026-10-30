/**
 * Rede inteligente de busca ("teia"): níveis de ampliação, limite de alertas e leitura das sugestões da IA.
 * Sem dependências do app (tests/search-network-rules.test.mjs). O envio de alertas acontece no servidor; estas
 * regras documentam o comportamento esperado e são usadas no modo de demonstração.
 */

/** Níveis de alcance, do menor para o maior. Ampliar só anda para a frente; reduzir é outra decisão registrada. */
export const EXPANSION_LEVELS = ['neighborhood', 'city', 'neighbors', 'state', 'country', 'international'] as const;
export type ExpansionLevel = (typeof EXPANSION_LEVELS)[number];

/** Raio sugerido para cada nível (km). Estado, país e exterior usam a divisão política, não o raio. */
export const LEVEL_RADIUS_KM: Readonly<Record<ExpansionLevel, number | null>> = {
  neighborhood: 3,
  city: 15,
  neighbors: 50,
  state: null,
  country: null,
  international: null,
};

export function levelIndex(level: ExpansionLevel): number {
  return EXPANSION_LEVELS.indexOf(level);
}

/** Próximos níveis possíveis a partir do atual. */
export function nextExpansionLevels(current: ExpansionLevel): ExpansionLevel[] {
  return EXPANSION_LEVELS.slice(levelIndex(current) + 1);
}

export function normalizeLevel(value: unknown): ExpansionLevel {
  return (EXPANSION_LEVELS as readonly unknown[]).includes(value) ? (value as ExpansionLevel) : 'neighborhood';
}

export type ExpansionError = 'same_or_smaller' | 'paused';

/** Ampliar exige nível maior que o atual e alertas não pausados. A justificativa é validada à parte. */
export function expansionError(current: ExpansionLevel, next: ExpansionLevel, paused: boolean): ExpansionError | undefined {
  if (paused) return 'paused';
  if (levelIndex(next) <= levelIndex(current)) return 'same_or_smaller';
  return undefined;
}

// ------------------------------------------------------------------ limite de alertas (contra cansaço e spam)

export const ALERT_LIMITS = {
  /** No máximo 3 alertas de casos por pessoa a cada 24 horas. */
  perDay: 3,
  dayMs: 24 * 60 * 60 * 1000,
} as const;

export interface SentAlert {
  caseId: string;
  at: number;
  /** Versão da informação divulgada (ex.: aumenta quando a busca é ampliada ou surge informação relevante). */
  infoVersion: number;
}

export type AlertDecision = { send: true } | { send: false; reason: 'same_info' | 'daily_limit' | 'paused' };

/**
 * Decide se uma pessoa deve receber o alerta de um caso agora:
 * nunca a mesma informação do mesmo caso duas vezes; no máximo 3 alertas por dia; nada com alertas pausados.
 */
export function shouldSendAlert(
  history: readonly SentAlert[],
  alert: { caseId: string; infoVersion: number; paused?: boolean },
  now: number,
): AlertDecision {
  if (alert.paused) return { send: false, reason: 'paused' };
  if (history.some((item) => item.caseId === alert.caseId && item.infoVersion >= alert.infoVersion)) {
    return { send: false, reason: 'same_info' };
  }
  const today = history.filter((item) => now - item.at < ALERT_LIMITS.dayMs && item.at <= now);
  if (today.length >= ALERT_LIMITS.perDay) return { send: false, reason: 'daily_limit' };
  return { send: true };
}

// ------------------------------------------------------------------ teia

export const CONNECTION_STATUSES = ['suggested', 'pending', 'validated', 'discarded'] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export function normalizeConnectionStatus(value: unknown): ConnectionStatus {
  return (CONNECTION_STATUSES as readonly unknown[]).includes(value) ? (value as ConnectionStatus) : 'pending';
}

/** Só conexões validadas por uma pessoa podem gerar nova divulgação. */
export function connectionCanTriggerAlert(status: ConnectionStatus): boolean {
  return status === 'validated';
}

// ------------------------------------------------------------------ IA de apoio

export type AiIndication = 'weak' | 'moderate' | 'strong';

/**
 * A pontuação da IA (0 a 1) vira só uma indicação técnica de compatibilidade. Não existe "confirmado":
 * confirmar é decisão de uma pessoa.
 */
export function aiIndication(score: number): AiIndication {
  if (!Number.isFinite(score) || score < 0.5) return 'weak';
  if (score < 0.8) return 'moderate';
  return 'strong';
}

/** Distância em km entre dois pontos (fórmula de haversine). */
export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

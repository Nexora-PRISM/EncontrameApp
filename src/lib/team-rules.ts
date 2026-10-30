/**
 * Regras do Painel da equipe, sem dependências do app (tests/team-rules.test.mjs).
 * Espelham o que a API já faz (transições de situação) e o que os contratos propõem.
 */

/** Ids de situação da API: 1 Pendente, 2 Procurado, 3 Encontrado, 4 Alerta, 99 Cancelado. */
export const CASE_STATUS = { pending: 1, searching: 2, found: 3, alert: 4, cancelled: 99 } as const;

/** Mudanças permitidas, iguais às do servidor. Encontrado e Cancelado são finais. */
const ALLOWED: Readonly<Record<number, readonly number[]>> = {
  1: [2, 4, 99],
  2: [4, 3, 99],
  4: [2, 3, 99],
};

export function allowedStatusTransitions(current: number | undefined): number[] {
  return [...(ALLOWED[current ?? CASE_STATUS.pending] ?? [])];
}

export function canChangeStatus(current: number | undefined, next: number): boolean {
  return allowedStatusTransitions(current).includes(next);
}

export const JUSTIFICATION_MIN = 10;
export const JUSTIFICATION_MAX = 500;

/** Toda decisão da equipe pede justificativa (mínimo de 10 letras). */
export function justificationError(text: string): 'required' | 'too_short' | 'too_long' | undefined {
  const value = text.trim();
  if (!value) return 'required';
  if (value.length < JUSTIFICATION_MIN) return 'too_short';
  if (value.length > JUSTIFICATION_MAX) return 'too_long';
  return undefined;
}

/** Tipos de conteúdo que a API aceita em denúncias. */
export type ReportTarget = 'MissingPerson' | 'GroupMessage' | 'SafetyNote' | 'other';

export function normalizeReportTarget(value: unknown): ReportTarget {
  return value === 'MissingPerson' || value === 'GroupMessage' || value === 'SafetyNote' ? value : 'other';
}

export type ReportReason = 'abuse' | 'false_info' | 'scam' | 'other';

export function normalizeReportReason(value: unknown): ReportReason {
  return value === 'abuse' || value === 'false_info' || value === 'scam' ? value : 'other';
}

/** Golpe e informação falsa vêm primeiro na fila; depois, as mais antigas. */
export function sortReportsForReview<T extends { reason: ReportReason; createdAt: string }>(reports: readonly T[]): T[] {
  const weight: Record<ReportReason, number> = { scam: 0, false_info: 1, abuse: 2, other: 3 };
  return [...reports].sort(
    (left, right) =>
      weight[left.reason] - weight[right.reason] || Date.parse(left.createdAt) - Date.parse(right.createdAt),
  );
}

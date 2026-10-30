/**
 * Regras de colaboração da comunidade: voluntariado ("Quero ajudar") e sugestão de região para divulgar.
 * Sem dependências do app (tests/collaboration-rules.test.mjs).
 */

/** Formas de colaborar (valores do contrato). Nenhuma inclui busca em campo, abordagem ou confronto. */
export const VOLUNTEER_WAYS = [
  'share_posters',
  'share_campaigns',
  'report_sightings',
  'regional_alerts',
  'distribute_info',
  'support_actions',
  'suggest_connections',
] as const;

export type VolunteerWay = (typeof VOLUNTEER_WAYS)[number];

export interface VolunteerForm {
  region: string;
  ways: readonly string[];
  availability: string;
  acceptedGuidelines: boolean;
}

export type VolunteerError = 'region' | 'ways' | 'guidelines';

/** Pede só o necessário: região, ao menos uma forma de colaborar e o aceite das orientações de segurança. */
export function validateVolunteer(form: VolunteerForm): VolunteerError[] {
  const errors: VolunteerError[] = [];
  if (form.region.trim().length < 2) errors.push('region');
  if (!form.ways.some((way) => (VOLUNTEER_WAYS as readonly string[]).includes(way))) errors.push('ways');
  if (!form.acceptedGuidelines) errors.push('guidelines');
  return errors;
}

/** Remove formas desconhecidas e repetidas, mantendo a ordem da lista oficial. */
export function normalizeWays(ways: readonly unknown[]): VolunteerWay[] {
  return VOLUNTEER_WAYS.filter((way) => ways.includes(way));
}

export type RegionSuggestionError = 'place' | 'reason';

export function validateRegionSuggestion(place: string, reason: string): RegionSuggestionError[] {
  const errors: RegionSuggestionError[] = [];
  if (place.trim().length < 3) errors.push('place');
  if (reason.trim().length < 10) errors.push('reason');
  return errors;
}

/** Recebimento só é confirmado com número e horário do servidor. */
export function isReceiptConfirmed(id?: string | null, receivedAt?: string | null): boolean {
  return Boolean(id && String(id).trim()) && Boolean(receivedAt) && !Number.isNaN(Date.parse(String(receivedAt)));
}

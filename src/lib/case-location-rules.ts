/**
 * Ponto no mapa do cadastro de caso (onde a pessoa foi vista pela última vez). Regras sem dependências.
 *
 * O ponto é arredondado para 3 casas decimais (cerca de 110 m): basta para a busca e para o alerta da região,
 * e evita expor no mapa público um endereço exato — muitas vezes o cadastro é feito de casa.
 */
export const CASE_POINT_DECIMALS = 3;

export type CasePoint = { latitude: number; longitude: number };

const round = (value: number) => {
  const factor = 10 ** CASE_POINT_DECIMALS;
  return Math.round(value * factor) / factor;
};

/** Coordenada utilizável: números finitos, dentro dos limites e diferente de (0, 0), que é erro de leitura. */
export function isValidCasePoint(point: { latitude?: number | null; longitude?: number | null } | null | undefined): boolean {
  if (!point) return false;
  const { latitude, longitude } = point;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
  return !(latitude === 0 && longitude === 0);
}

/** Arredonda o ponto (cerca de 110 m). Ponto inválido vira null. */
export function roundCasePoint(point: { latitude?: number | null; longitude?: number | null } | null | undefined): CasePoint | null {
  if (!isValidCasePoint(point)) return null;
  const { latitude, longitude } = point as CasePoint;
  return { latitude: round(latitude), longitude: round(longitude) };
}

/** Texto mínimo para procurar o local no mapa ("Savassi, BH" já serve). */
export const CASE_LOCATION_MIN_CHARS = 3;
export const canSearchCaseLocation = (text: string) => text.trim().length >= CASE_LOCATION_MIN_CHARS;

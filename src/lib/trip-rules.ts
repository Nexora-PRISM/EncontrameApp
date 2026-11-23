/**
 * Regras puras do trajeto compartilhado com o círculo familiar. Espelham a API (`TripService`).
 */
import { haversineKm } from '@/lib/geo';

export const TRIP_MIN_MINUTES = 5;
export const TRIP_MAX_MINUTES = 720;
export const TRIP_DESTINATION_MAX = 120;
/** A API aceita até 100 pontos por envio. */
export const TRIP_MAX_POINTS_PER_SEND = 100;

/** Atalhos de "em quanto tempo você chega". */
export const TRIP_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const;

/** Manda ponto novo se andou 40 m (e passou 15 s) ou se passou 2 min parado. Poupa bateria e dados. */
const MIN_MOVE_METERS = 40;
const MIN_INTERVAL_MS = 15 * 1000;
const MAX_SILENCE_MS = 2 * 60 * 1000;

export type TimedPoint = { latitude: number; longitude: number; at: number };

export function shouldSendPoint(last: TimedPoint | null, next: TimedPoint): boolean {
  if (!last) return true;
  const elapsed = next.at - last.at;
  if (elapsed >= MAX_SILENCE_MS) return true;
  if (elapsed < MIN_INTERVAL_MS) return false;
  const meters = haversineKm(last.latitude, last.longitude, next.latitude, next.longitude) * 1000;
  return meters >= MIN_MOVE_METERS;
}

export function tripDurationError(minutes: number) {
  if (!Number.isFinite(minutes) || minutes < TRIP_MIN_MINUTES || minutes > TRIP_MAX_MINUTES) {
    return 'out_of_range' as const;
  }
  return undefined;
}

export function tripDestinationError(destination: string) {
  return destination.trim().length > TRIP_DESTINATION_MAX ? ('too_long' as const) : undefined;
}

/** Minutos até o horário previsto (negativo = passou). Arredonda para cima enquanto falta. */
export function minutesUntil(expectedIso: string, now: number): number | null {
  const expected = new Date(expectedIso).getTime();
  if (Number.isNaN(expected)) return null;
  const diff = (expected - now) / 60000;
  return diff >= 0 ? Math.ceil(diff) : -Math.ceil(-diff);
}

/** Pontos em lotes do tamanho que a API aceita (envio depois de ficar sem internet). */
export function chunkPoints<T>(points: readonly T[], size = TRIP_MAX_POINTS_PER_SEND): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < points.length; index += size) chunks.push(points.slice(index, index + size));
  return chunks;
}

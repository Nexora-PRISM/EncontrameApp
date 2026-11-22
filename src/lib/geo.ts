/** Raio padrão do mapa de pessoas próximas, alinhado à API. */
export const DEFAULT_NEARBY_RADIUS_KM = 50;

/** Distância em km entre dois pontos (Haversine). */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Reduz jitter do GPS (~1 km) para não refazer o nearby a cada poucos metros. */
export function snapNearbyCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Coordenada utilizável no mapa: números finitos, dentro da faixa e diferente de (0, 0) — um
 * "0, 0" quase sempre é campo vazio que virou número e colocaria o marcador no meio do Atlântico.
 */
export function isValidCoordinate(latitude: unknown, longitude: unknown): boolean {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
  return !(latitude === 0 && longitude === 0);
}

/** Distância curta para leitura: "350 m", "1,2 km", "18 km". */
export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) return '';
  if (km < 1) {
    const meters = Math.max(10, Math.round((km * 1000) / 10) * 10);
    return `${meters} m`;
  }
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
}

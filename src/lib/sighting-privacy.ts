import type { PersonLastSeen } from '@/services/people/people.types';

/**
 * Avistamentos mostrados ao público sem virar ferramenta de rastreamento:
 * - só os mais recentes ({@link PUBLIC_SIGHTINGS_LIMIT}), não o histórico inteiro de lugares;
 * - ponto arredondado para ~100 m ({@link PUBLIC_COORD_DECIMALS} casas decimais);
 * - sem número da casa nem CEP no texto do local.
 *
 * Isso reduz o que a TELA mostra. A restrição de verdade (quem pode ver o histórico completo) é
 * da API — proposta em `atualizacao-futura/`.
 */
export const PUBLIC_SIGHTINGS_LIMIT = 5;
export const PUBLIC_COORD_DECIMALS = 3;

export function blurCoordinate(value: number, decimals = PUBLIC_COORD_DECIMALS): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Tira CEP e número de casa/prédio ("Rua X, 123", "nº 45", "Av. Y 1200 - apto 3"). */
export function stripHouseNumber(text: string | undefined): string | undefined {
  if (!text) return text;
  const cleaned = text
    .replace(/\b(cep:?\s*)?\d{5}-?\d{3}\b/gi, '')
    .replace(/\b(apto|apartamento|ap|bloco|casa|lote)\.?\s*\w+/gi, '')
    .replace(/,?\s*(n[º°o]\.?\s*)?\b\d{1,5}[a-zA-Z]?\b(?=\s*(,|-|–|$))/g, '')
    .replace(/\s*[-–,]\s*(?=[-–,]|$)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || undefined;
}

/** Versão pública do histórico: ordem por data, os últimos N, ponto aproximado, sem número. */
export function publicSightings(items: readonly PersonLastSeen[]): PersonLastSeen[] {
  const sorted = [...items].sort(
    (left, right) => new Date(left.dtRegistration).getTime() - new Date(right.dtRegistration).getTime(),
  );
  return sorted.slice(-PUBLIC_SIGHTINGS_LIMIT).map((item) => ({
    ...item,
    location: stripHouseNumber(item.location),
    latitude: typeof item.latitude === 'number' ? blurCoordinate(item.latitude) : item.latitude,
    longitude: typeof item.longitude === 'number' ? blurCoordinate(item.longitude) : item.longitude,
  }));
}

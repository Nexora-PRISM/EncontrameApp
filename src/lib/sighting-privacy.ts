import type { PersonLastSeen } from '@/services/people/people.types';

/**
 * Avistamentos mostrados ao público sem virar ferramenta de rastreamento:
 * - só os mais recentes ({@link PUBLIC_SIGHTINGS_LIMIT}), não o histórico inteiro de lugares;
 * - ponto trocado pelo centro de uma região de ~10 km ({@link PUBLIC_GRID_DEGREES} grau, ~11 km):
 *   o ponto real pode estar em qualquer lugar dessa região;
 * - avistamentos na mesma região viram um só (fica o mais recente);
 * - sem rua, número, CEP nem bairro: só cidade e estado.
 *
 * Isso reduz o que a TELA mostra. A restrição de verdade (quem pode ver o histórico completo) é
 * da API — proposta em `atualizacao-futura/05-avistamentos-privacidade-api.md`.
 */
export const PUBLIC_SIGHTINGS_LIMIT = 5;
/** Tamanho da região, em graus (0,1° ≈ 11 km de latitude). */
export const PUBLIC_GRID_DEGREES = 0.1;

/** Centro da região de ~10 km que contém o valor (sempre o mesmo para pontos da mesma região). */
export function blurCoordinate(value: number, step = PUBLIC_GRID_DEGREES): number {
  const center = (Math.floor(value / step) + 0.5) * step;
  return Math.round(center * 1000) / 1000;
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

/** Versão pública do histórico: regiões de ~10 km, só cidade/estado, as últimas N regiões. */
export function publicSightings(items: readonly PersonLastSeen[]): PersonLastSeen[] {
  const sorted = [...items].sort(
    (left, right) => new Date(left.dtRegistration).getTime() - new Date(right.dtRegistration).getTime(),
  );
  const byRegion = new Map<string, PersonLastSeen>();
  sorted.forEach((item, index) => {
    const hasPoint = typeof item.latitude === 'number' && typeof item.longitude === 'number';
    const latitude = hasPoint ? blurCoordinate(item.latitude as number) : undefined;
    const longitude = hasPoint ? blurCoordinate(item.longitude as number) : undefined;
    const key = hasPoint ? `${latitude},${longitude}` : `sem-ponto-${index}`;
    // Mesma região: fica só o avistamento mais recente (a lista já está em ordem de data).
    byRegion.delete(key);
    byRegion.set(key, {
      id: item.id,
      dtRegistration: item.dtRegistration,
      city: item.city,
      state: item.state,
      latitude,
      longitude,
    });
  });
  return [...byRegion.values()].slice(-PUBLIC_SIGHTINGS_LIMIT);
}

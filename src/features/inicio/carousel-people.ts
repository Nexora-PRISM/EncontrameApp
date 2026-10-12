import type { Person } from '@/services/people/people.types';

/** Situações que não devem aparecer como "desaparecido" no carrossel. */
const HIDDEN_STATUS_IDS = new Set([3, 99]); // Encontrado, Cancelado

/** Máximo de pessoas no carrossel do Início (as próximas nunca são cortadas). */
export const CAROUSEL_MAX = 20;

/**
 * Monta a fila do carrossel: primeiro quem está perto, depois casos recentes
 * (sem repetir e sem casos encerrados), para o usuário poder deslizar e ver mais.
 */
export function buildCarouselPeople(
  nearby: Person[],
  recent: Person[],
  max = CAROUSEL_MAX,
): Person[] {
  const seen = new Set(nearby.map((person) => person.id));
  const extra: Person[] = [];

  for (const person of recent) {
    if (seen.has(person.id)) continue;
    if (person.statusId != null && HIDDEN_STATUS_IDS.has(person.statusId)) continue;
    seen.add(person.id);
    extra.push(person);
  }

  return [...nearby, ...extra].slice(0, Math.max(max, nearby.length));
}

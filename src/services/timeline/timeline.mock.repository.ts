import { buildFallbackTimeline, type CaseTimelineEvent, sortTimeline } from '@/lib/case-timeline-rules';
import { peopleMockRepository } from '@/services/people/people.mock.repository';
import type { TimelineRepository } from '@/services/timeline/timeline.repository';

const HOUR = 60 * 60 * 1000;

function shift(iso: string, ms: number): string {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? iso : new Date(time + ms).toISOString();
}

/**
 * Modo de demonstração: parte dos dados fictícios do caso e acrescenta exemplos do que a API completa traria
 * (aprovação pela equipe, atualização da família, busca ampliada), para mostrar todas as classificações.
 */
export const timelineMockRepository: TimelineRepository = {
  async getTimeline(personId: string) {
    const [person, history] = await Promise.all([
      peopleMockRepository.getById(personId),
      peopleMockRepository.listLastSeenHistory(personId),
    ]);
    const base = buildFallbackTimeline(person, history);
    const registered = base.find((event) => event.type === 'case_registered');
    const extra: CaseTimelineEvent[] = [];

    if (registered) {
      extra.push({
        id: `${personId}-approved`,
        type: 'status_change',
        occurredAt: shift(registered.occurredAt, 2 * HOUR),
        classification: 'confirmed',
        statusFrom: 1,
        statusTo: 2,
        actor: 'moderation',
      });
      extra.push({
        id: `${personId}-family`,
        type: 'family_update',
        occurredAt: shift(registered.occurredAt, 26 * HOUR),
        classification: 'informed',
        note: 'Pode estar usando um casaco cinza. Qualquer informação, envie pelo app.',
        actor: 'family',
      });
      extra.push({
        id: `${personId}-expanded`,
        type: 'search_expanded',
        occurredAt: shift(registered.occurredAt, 50 * HOUR),
        classification: 'confirmed',
        place: person.city ? `${person.city} e região metropolitana` : undefined,
        actor: 'moderation',
      });
    }

    const sightings = base.filter((event) => event.type === 'sighting');
    const latest = sightings[sightings.length - 1];
    const events = base.map((event) =>
      event === latest ? { ...event, classification: 'pending_review' as const } : event,
    );
    return sortTimeline([...events, ...extra]);
  },
};

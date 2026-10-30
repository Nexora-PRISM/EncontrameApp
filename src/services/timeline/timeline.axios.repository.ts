import { api } from '@/lib/axios';
import {
  type CaseTimelineEvent,
  normalizeActor,
  normalizeClassification,
  normalizeEventType,
  sortTimeline,
} from '@/lib/case-timeline-rules';
import type { TimelineRepository } from '@/services/timeline/timeline.repository';

/**
 * Contrato proposto (a API .NET ainda não tem este endpoint — ver docs/evolucao/CONTRATOS-API.md):
 * GET /MissingPerson/{id}/timeline → ApiTimelineEvent[] (só o que pode ser público).
 */
interface ApiTimelineEvent {
  timelineEventId: number | string;
  type: string;
  occurredAt: string;
  approximate?: boolean | null;
  classification?: string | null;
  place?: string | null;
  statusFromId?: number | null;
  statusToId?: number | null;
  note?: string | null;
  actorRole?: string | null;
}

export const timelineAxiosRepository: TimelineRepository = {
  async getTimeline(personId: string) {
    const { data } = await api.get<ApiTimelineEvent[]>(`/MissingPerson/${personId}/timeline`);
    const events: CaseTimelineEvent[] = [];
    for (const item of data ?? []) {
      const type = normalizeEventType(item.type);
      if (!type || !item.occurredAt) continue;
      events.push({
        id: String(item.timelineEventId),
        type,
        occurredAt: item.occurredAt,
        approximate: item.approximate === true,
        classification: normalizeClassification(item.classification),
        place: item.place?.trim() || undefined,
        statusFrom: item.statusFromId ?? undefined,
        statusTo: item.statusToId ?? undefined,
        note: item.note?.trim() || undefined,
        actor: normalizeActor(item.actorRole),
      });
    }
    return sortTimeline(events);
  },
};

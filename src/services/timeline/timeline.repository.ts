import type { CaseTimelineEvent } from '@/lib/case-timeline-rules';
import { env } from '@/lib/env';
import { timelineAxiosRepository } from '@/services/timeline/timeline.axios.repository';
import { timelineMockRepository } from '@/services/timeline/timeline.mock.repository';

/** Contrato comum aos repositórios da linha do tempo completa (axios e mock). */
export interface TimelineRepository {
  /** Acontecimentos públicos do caso, do mais antigo para o mais recente. */
  getTimeline(personId: string): Promise<CaseTimelineEvent[]>;
}

export function getTimelineRepository(): TimelineRepository {
  return env.useMocks ? timelineMockRepository : timelineAxiosRepository;
}

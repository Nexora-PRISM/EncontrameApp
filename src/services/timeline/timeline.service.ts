import { useQuery } from '@tanstack/react-query';

import { buildFallbackTimeline } from '@/lib/case-timeline-rules';
import { env } from '@/lib/env';
import { isLocalPersonId } from '@/lib/person-status';
import { getPeopleRepository } from '@/services/people/people.repository';
import { getTimelineRepository } from '@/services/timeline/timeline.repository';
import type { CaseTimeline } from '@/services/timeline/timeline.types';

/**
 * Linha do tempo do caso. Com EXPO_PUBLIC_ENABLE_CASE_TIMELINE, vem da API completa; sem ela, é montada com o
 * cadastro e o histórico de avistamentos (endpoints que já existem). Rascunho local não tem linha do tempo.
 */
export function useCaseTimelineQuery(id: string) {
  const source = env.caseTimelineApiEnabled ? 'api' : 'case_data';

  return useQuery({
    queryKey: ['timeline', id, source] as const,
    queryFn: async (): Promise<CaseTimeline> => {
      if (source === 'api') {
        return { source, events: await getTimelineRepository().getTimeline(id) };
      }
      const people = getPeopleRepository();
      const [person, history] = await Promise.all([people.getById(id), people.listLastSeenHistory(id)]);
      return { source, events: buildFallbackTimeline(person, history) };
    },
    enabled: id.length > 0 && !isLocalPersonId(id),
  });
}

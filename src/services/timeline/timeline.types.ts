import type { CaseTimelineEvent } from '@/lib/case-timeline-rules';

/**
 * De onde veio a linha do tempo:
 * - `api`: GET /MissingPerson/{id}/timeline (organizada pelo servidor, com classificação da equipe);
 * - `case_data`: montada no app com o cadastro e o histórico de avistamentos que a API de hoje já devolve.
 */
export type TimelineSource = 'api' | 'case_data';

export interface CaseTimeline {
  source: TimelineSource;
  events: CaseTimelineEvent[];
}

import { env } from '@/lib/env';
import type { ExpansionLevel } from '@/lib/search-network-rules';
import type { SightingStatus } from '@/lib/sighting-report-rules';
import { teamAxiosRepository } from '@/services/team/team.axios.repository';
import { teamMockRepository } from '@/services/team/team.mock.repository';
import type {
  AiSuggestion,
  SearchOverview,
  TeamContentReport,
  TeamSightingReport,
} from '@/services/team/team.types';

/** Painel da equipe. Os métodos marcados como "existe" usam endpoints que a API já tem. */
export interface TeamRepository {
  /** Existe: GET /Moderation/reports devolve 401/403 para quem não é da equipe. */
  isStaff(): Promise<boolean>;
  /** Existe: GET /Moderation/reports. */
  listReports(): Promise<TeamContentReport[]>;
  /** Existe: POST /Moderation/reports/{id}/hide. */
  hideReport(id: string): Promise<void>;
  /** Existe: POST /Moderation/reports/{id}/dismiss. */
  dismissReport(id: string): Promise<void>;
  /** Existe: POST /Moderation/missing-person/{id}/status. A justificativa vai junto (a API ainda não guarda). */
  changeCaseStatus(caseId: string, statusId: number, justification: string): Promise<void>;
  /** Proposto: GET /SightingReport?missingPersonId=&status=. */
  listSightingReports(caseId: string): Promise<TeamSightingReport[]>;
  /** Proposto: PATCH /SightingReport/{id}/status. */
  decideSightingReport(reportId: string, status: SightingStatus, justification: string): Promise<void>;
  /** Proposto: GET /MissingPerson/{id}/search. */
  getSearchOverview(caseId: string): Promise<SearchOverview>;
  /** Proposto: POST /MissingPerson/{id}/search/expansions. */
  expandSearch(caseId: string, to: ExpansionLevel, justification: string): Promise<void>;
  /** Proposto: POST /MissingPerson/{id}/search/pause. */
  setAlertsPaused(caseId: string, paused: boolean, justification: string): Promise<void>;
  /** Proposto: GET /MissingPerson/{id}/ai-suggestions. */
  listAiSuggestions(caseId: string): Promise<AiSuggestion[]>;
  /** Proposto: POST /AiSuggestion/{id}/decision. */
  decideAiSuggestion(id: string, accept: boolean, justification: string): Promise<void>;
}

export function getTeamRepository(): TeamRepository {
  return env.useMocks ? teamMockRepository : teamAxiosRepository;
}

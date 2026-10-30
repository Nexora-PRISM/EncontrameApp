import { env } from '@/lib/env';
import { collaborationAxiosRepository } from '@/services/collaboration/collaboration.axios.repository';
import { collaborationMockRepository } from '@/services/collaboration/collaboration.mock.repository';
import type { Receipt, RegionSuggestionPayload, VolunteerProfile } from '@/services/collaboration/collaboration.types';

/** Colaboração da comunidade. Todos os endpoints são propostos (docs/evolucao/CONTRATOS-API.md). */
export interface CollaborationRepository {
  /** GET /Volunteer/me — null quando a conta ainda não é voluntária. */
  getVolunteer(): Promise<VolunteerProfile | null>;
  /** PUT /Volunteer/me */
  saveVolunteer(profile: VolunteerProfile): Promise<Receipt>;
  /** DELETE /Volunteer/me */
  leaveVolunteer(): Promise<void>;
  /** POST /MissingPerson/{id}/region-suggestions */
  suggestRegion(payload: RegionSuggestionPayload): Promise<Receipt>;
}

export function getCollaborationRepository(): CollaborationRepository {
  return env.useMocks ? collaborationMockRepository : collaborationAxiosRepository;
}

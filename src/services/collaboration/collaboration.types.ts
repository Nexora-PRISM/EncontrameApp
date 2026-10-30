import type { VolunteerWay } from '@/lib/collaboration-rules';

/** Cadastro de voluntário: só o necessário. O nome vem da conta; não há ranking nem contagem de "ajudas". */
export interface VolunteerProfile {
  region: string;
  ways: VolunteerWay[];
  availability?: string;
  /** Quer receber alertas de voluntariado da região. */
  alerts: boolean;
}

export interface Receipt {
  id?: string;
  receivedAt?: string;
  /** Só no modo de demonstração. */
  simulated?: boolean;
}

export interface RegionSuggestionPayload {
  personId: string;
  place: string;
  reason: string;
}

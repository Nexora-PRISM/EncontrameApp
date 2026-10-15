/** Tipo de aviso. Lista fechada para manter os relatos objetivos (sem texto livre como título). */
export type SafetyNoteCategory =
  | 'attention'
  | 'robbery'
  | 'deserted'
  | 'lighting'
  | 'avoid-time'
  | 'other';

/** Parte do dia em que o cuidado vale. */
export type SafetyNotePeriod = 'any' | 'dawn' | 'morning' | 'afternoon' | 'night';

/** "Continua assim" ou "não está mais assim". */
export type SafetyNoteVote = 'confirm' | 'outdated';

/**
 * Aviso de segurança da comunidade sobre um lugar (rua, praça, trecho). Fala do lugar, nunca de
 * pessoas. O autor não aparece para os outros, mas o aviso fica ligado à conta de quem publicou.
 */
export interface SafetyNote {
  id: string;
  category: SafetyNoteCategory;
  period: SafetyNotePeriod;
  /** Referência do local escrita por quem avisou (ex.: "Rua das Flores, perto da praça"). */
  reference: string;
  /** Observação curta e opcional (até 140 caracteres). */
  note?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  /** Some do mapa nesta data, a menos que alguém confirme (a confirmação renova o prazo). */
  expiresAt: string;
  confirmations: number;
  outdatedReports: number;
  /** Voto da pessoa logada neste aviso, quando houver. */
  myVote?: SafetyNoteVote | null;
  /** O aviso foi publicado pela pessoa logada. */
  mine?: boolean;
}

export interface CreateSafetyNotePayload {
  category: SafetyNoteCategory;
  period: SafetyNotePeriod;
  reference: string;
  note?: string;
  latitude: number;
  longitude: number;
  /** Momento em que a pessoa aceitou a declaração (ISO). */
  declarationAcceptedAt: string;
}

export type NearbySafetyNotesParams = {
  latitude: number;
  longitude: number;
  radiusKm?: number;
};

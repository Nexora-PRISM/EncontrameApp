import { env } from '@/lib/env';
import { safetyNotesAxiosRepository } from '@/services/safety-notes/safety-notes.axios.repository';
import { safetyNotesMockRepository } from '@/services/safety-notes/safety-notes.mock.repository';
import type {
  CreateSafetyNotePayload,
  NearbySafetyNotesParams,
  SafetyNote,
  SafetyNoteVote,
} from '@/services/safety-notes/safety-notes.types';

/** Contrato comum aos repositórios de avisos de segurança (axios e mock). */
export interface SafetyNotesRepository {
  /** Avisos válidos perto de um ponto (os vencidos ou derrubados pela comunidade não vêm). */
  listNearby(params: NearbySafetyNotesParams): Promise<SafetyNote[]>;
  create(payload: CreateSafetyNotePayload): Promise<SafetyNote>;
  /** Registra (ou troca) o voto da pessoa logada e devolve o aviso atualizado. */
  vote(id: string, vote: SafetyNoteVote): Promise<SafetyNote>;
}

export function getSafetyNotesRepository(): SafetyNotesRepository {
  return env.useMocks ? safetyNotesMockRepository : safetyNotesAxiosRepository;
}

import { env } from '@/lib/env';
import { sightingsAxiosRepository } from '@/services/sightings/sightings.axios.repository';
import { sightingsMockRepository } from '@/services/sightings/sightings.mock.repository';
import type {
  MySightingReport,
  SightingReceipt,
  SightingReportPayload,
} from '@/services/sightings/sightings.types';

/** Contrato comum aos repositórios de relatos de avistamento (axios e mock). */
export interface SightingsRepository {
  /** Envia o relato. A tela só diz "recebido" se o comprovante tiver número e horário. */
  submit(payload: SightingReportPayload): Promise<SightingReceipt>;
  /** Relatos enviados pela conta logada, do mais recente para o mais antigo. */
  listMine(): Promise<MySightingReport[]>;
}

export function getSightingsRepository(): SightingsRepository {
  return env.useMocks ? sightingsMockRepository : sightingsAxiosRepository;
}

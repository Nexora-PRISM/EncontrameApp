import { env } from '@/lib/env';
import { emergencyAxiosRepository } from '@/services/emergency/emergency.axios.repository';
import { emergencyMockRepository } from '@/services/emergency/emergency.mock.repository';
import type {
  EmergencyAlertPayload,
  EmergencyAlertReceipt,
} from '@/services/emergency/emergency.types';

/** Contrato comum aos repositórios do alerta de emergência (axios e mock). */
export interface EmergencyRepository {
  /** Resolve só com comprovante de recebimento do servidor; qualquer outra resposta rejeita. */
  sendAlert(payload: EmergencyAlertPayload): Promise<EmergencyAlertReceipt>;
}

export function getEmergencyRepository(): EmergencyRepository {
  return env.useMocks ? emergencyMockRepository : emergencyAxiosRepository;
}

import { api } from '@/lib/axios';
import type { EmergencyRepository } from '@/services/emergency/emergency.repository';
import {
  type EmergencyAlertPayload,
  type EmergencyAlertReceipt,
  EmergencyAlertNotConfirmedError,
} from '@/services/emergency/emergency.types';

/** Resposta esperada de POST /EmergencyAlert (contrato proposto — ver docs/AUDITORIA §11). */
interface ApiEmergencyAlertReceipt {
  emergencyAlertId?: string | number | null;
  alertId?: string | number | null;
  receivedAt?: string | null;
  notifiedContacts?: number | null;
}

/** Converte a resposta da API em comprovante; sem id e horário de recebimento, não há comprovante. */
export function toEmergencyReceipt(data: ApiEmergencyAlertReceipt | null | undefined): EmergencyAlertReceipt {
  const rawId = data?.emergencyAlertId ?? data?.alertId;
  const alertId = rawId == null ? '' : String(rawId).trim();
  const receivedAt = typeof data?.receivedAt === 'string' ? data.receivedAt : '';
  if (!alertId || !receivedAt || Number.isNaN(new Date(receivedAt).getTime())) {
    throw new EmergencyAlertNotConfirmedError();
  }
  const notified = data?.notifiedContacts;
  return {
    alertId,
    receivedAt,
    ...(typeof notified === 'number' && Number.isFinite(notified) && notified >= 0
      ? { notifiedContacts: Math.floor(notified) }
      : {}),
  };
}

/**
 * Implementação real: POST /EmergencyAlert (autenticado). O endpoint ainda precisa ser criado
 * na API; até lá o recurso fica desligado em produção (EXPO_PUBLIC_ENABLE_EMERGENCY_ALERT).
 */
export const emergencyAxiosRepository: EmergencyRepository = {
  async sendAlert(payload: EmergencyAlertPayload) {
    const { data } = await api.post<ApiEmergencyAlertReceipt>('/EmergencyAlert', payload, {
      timeout: 12000,
    });
    return toEmergencyReceipt(data);
  },
};

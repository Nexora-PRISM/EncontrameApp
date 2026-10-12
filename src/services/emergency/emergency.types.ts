import { msg } from '@/lib/i18n-msg';

/** Alerta disparado ao fim da contagem de 10 segundos da tela "Alerta de emergência". */
export interface EmergencyAlertPayload {
  /** Momento em que a contagem terminou (ISO). */
  triggeredAt: string;
  latitude: number | null;
  longitude: number | null;
  /** Precisão informada pelo GPS, em metros. */
  accuracyMeters: number | null;
  /** Momento em que a localização foi obtida (ISO). */
  locationCapturedAt: string | null;
}

/**
 * Comprovante de RECEBIMENTO devolvido pelo servidor. A tela só diz que o alerta foi recebido
 * quando existe um comprovante com `alertId` e `receivedAt` vindos da API.
 */
export interface EmergencyAlertReceipt {
  alertId: string;
  receivedAt: string;
  /** Quantos contatos o servidor avisou. Ausente = o servidor não informou (a tela não presume). */
  notifiedContacts?: number;
  /** true só no repositório de teste (modo mock). */
  simulated?: boolean;
}

/** O servidor respondeu, mas sem os dados que comprovam o recebimento. */
export class EmergencyAlertNotConfirmedError extends Error {
  constructor() {
    super(msg('O servidor não confirmou o recebimento do alerta.'));
    this.name = 'EmergencyAlertNotConfirmedError';
  }
}

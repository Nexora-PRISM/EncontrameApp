import type { SharedLocation } from '@/lib/location-share';
import type { EmergencyAlertPayload } from '@/services/emergency/emergency.types';

/** Segundos da contagem antes de agir — tempo para cancelar um toque sem querer. */
export const ALERT_COUNTDOWN_SECONDS = 10;

/** Número aberto no telefone ao fim da contagem. */
export const ALERT_CALL_NUMBER = '190';

/** Situação do envio ao servidor, mostrada na tela depois da contagem. */
export type AlertSendStatus =
  /** Recurso desligado neste build (sem API de alerta ainda). */
  | 'disabled'
  /** Ligado, mas sem conta conectada: o servidor não saberia quem pediu ajuda. */
  | 'needs-login'
  | 'idle'
  | 'sending'
  /** O servidor devolveu comprovante de recebimento. */
  | 'confirmed'
  /** Sem comprovante: pode não ter chegado. */
  | 'failed';

export function initialSendStatus(enabled: boolean, loggedIn: boolean): AlertSendStatus {
  if (!enabled) return 'disabled';
  return loggedIn ? 'idle' : 'needs-login';
}

/** Segundos que faltam, arredondando para cima (10, 9, … 1, 0). */
export function secondsLeft(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function buildAlertPayload(
  triggeredAt: Date,
  location: SharedLocation | null,
): EmergencyAlertPayload {
  return {
    triggeredAt: triggeredAt.toISOString(),
    latitude: location ? location.latitude : null,
    longitude: location ? location.longitude : null,
    accuracyMeters: location?.accuracy != null ? Math.round(location.accuracy) : null,
    locationCapturedAt: location ? new Date(location.capturedAt).toISOString() : null,
  };
}

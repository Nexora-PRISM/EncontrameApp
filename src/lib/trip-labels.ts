import { msg } from '@/lib/i18n-msg';
import type { TripAlertReason, TripAlertStatus, TripPhase } from '@/lib/trip-rules';

/**
 * Textos do trajeto compartilhado. Nenhum diz que a pessoa "desapareceu": atraso e falta de sinal têm muitas
 * explicações (bateria, internet, trânsito). Só a família, com a equipe, decide se é caso de cadastro.
 */
export const TRIP_PHASE_LABEL: Record<TripPhase, string> = {
  active: msg('A caminho'),
  overdue: msg('Ainda não confirmou a chegada'),
  arrived: msg('Chegou em segurança'),
  cancelled: msg('Compartilhamento encerrado'),
  expired: msg('Prazo encerrado sem confirmação de chegada'),
};

export const TRIP_ALERT_REASON_LABEL: Record<TripAlertReason, string> = {
  overdue: msg('Passou do horário previsto, com a tolerância, sem confirmar a chegada.'),
  signal_lost: msg('Sem atualização de localização há mais de 10 minutos.'),
  expired: msg('O compartilhamento acabou sem confirmação de chegada.'),
};

export const TRIP_ALERT_STATUS_LABEL: Record<TripAlertStatus, string> = {
  open: msg('Sinal de Alerta aberto: com a equipe do Encontra-me'),
  monitoring: msg('Em acompanhamento pela equipe'),
  found: msg('Pessoa localizada'),
  owner_ok: msg('A pessoa avisou que está bem'),
  unfounded: msg('Encerrado pela equipe'),
};

export const TRIP_EVENT_LABEL: Record<string, string> = {
  raised: msg('Sinal de Alerta acionado'),
  info: msg('Outro contato acrescentou informação'),
  owner_ok: msg('A pessoa avisou que está bem'),
  owner_arrived: msg('A pessoa confirmou a chegada'),
  owner_ended: msg('A pessoa encerrou o compartilhamento'),
  found: msg('Pessoa localizada'),
  case_registered: msg('Cadastro de desaparecimento ligado ao alerta'),
  staff_monitoring: msg('Equipe: em acompanhamento'),
  staff_found: msg('Equipe: pessoa localizada'),
  staff_unfounded: msg('Equipe: alerta encerrado'),
};

export const tripEventLabel = (kind: string): string => TRIP_EVENT_LABEL[kind] ?? msg('Atualização');

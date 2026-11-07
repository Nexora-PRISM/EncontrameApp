/**
 * Compartilhar meu trajeto: regras sem dependências (testadas em tests/trip-rules.test.mjs).
 *
 * Só a própria pessoa inicia o compartilhamento, escolhe quem acompanha e encerra quando quiser. Os contatos
 * escolhidos veem a localização enquanto o trajeto está ativo; o Sinal de Alerta só existe quando há motivo
 * (atraso depois da tolerância, sinal perdido ou prazo encerrado sem confirmação de chegada) e vai para a equipe,
 * nunca para o público. Nenhum texto diz que a pessoa "desapareceu".
 */

export const TRIP_ARRIVAL_OPTIONS_MIN = [15, 30, 45, 60, 90, 120] as const;
export const TRIP_TOLERANCE_OPTIONS_MIN = [5, 10, 15, 30, 60] as const;
export const TRIP_DEFAULT_ARRIVAL_MIN = 30;
export const TRIP_DEFAULT_TOLERANCE_MIN = 15;
/** "Ainda estou em deslocamento": mais 15 minutos na previsão. */
export const TRIP_EXTEND_MIN = 15;
export const TRIP_MAX_WATCHERS = 5;
/** Duração máxima de um compartilhamento (o servidor encerra sozinho depois disso). */
export const TRIP_MAX_HOURS = 12;
export const TRIP_LABEL_MIN = 2;
export const TRIP_LABEL_MAX = 120;
export const CONTACT_ATTEMPT_MIN = 10;
export const CONTACT_ATTEMPT_MAX = 500;
/** Sem posição nova por este tempo, o contato vê "sem atualização" (o servidor usa o mesmo valor). */
export const TRIP_SIGNAL_LOST_MIN = 10;
/** Depois do prazo sem confirmação, o contato ainda vê o último registro e pode acionar o alerta por 24 h. */
export const TRIP_ALERT_WINDOW_HOURS = 24;
/** Atualização das telas que acompanham um trajeto (sem servidor de tempo real: consulta periódica). */
export const TRIP_POLL_MS = 30 * 1000;
/** Fila de posições guardadas sem internet: no máximo uma por minuto e as 30 mais recentes. */
export const POINT_QUEUE_GAP_MS = 60 * 1000;
export const POINT_QUEUE_MAX = 30;
/** Posição com mais de 2 km de imprecisão não ajuda ninguém: é descartada. */
export const POINT_ACCURACY_MAX_M = 2000;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export type TripStatus = 'active' | 'arrived' | 'cancelled' | 'expired';
/** Situação para mostrar: `overdue` = passou da previsão + tolerância sem confirmar a chegada. */
export type TripPhase = TripStatus | 'overdue';
export type TripSignal = 'ok' | 'stale' | 'none';
export type TripAlertReason = 'overdue' | 'signal_lost' | 'expired';
export type TripAlertStatus = 'open' | 'monitoring' | 'found' | 'owner_ok' | 'unfounded';

export const OPEN_ALERT_STATUSES: readonly TripAlertStatus[] = ['open', 'monitoring'];
export const isOpenAlertStatus = (status: TripAlertStatus | null | undefined): boolean =>
  status != null && OPEN_ALERT_STATUSES.includes(status);

export type TripTimes = {
  status: TripStatus;
  startedAt: string;
  expectedArrivalAt: string;
  toleranceMinutes: number;
  endedAt: string | null;
  lastPointAt: string | null;
};

const time = (iso: string | null | undefined): number => (iso ? new Date(iso).getTime() : Number.NaN);

export const overdueAtMs = (trip: Pick<TripTimes, 'expectedArrivalAt' | 'toleranceMinutes'>): number =>
  time(trip.expectedArrivalAt) + trip.toleranceMinutes * MINUTE;

export function tripPhase(trip: TripTimes, now: Date): TripPhase {
  if (trip.status !== 'active') return trip.status;
  return now.getTime() >= overdueAtMs(trip) ? 'overdue' : 'active';
}

export function signalState(trip: Pick<TripTimes, 'lastPointAt'>, now: Date, lostMinutes = TRIP_SIGNAL_LOST_MIN): TripSignal {
  if (!trip.lastPointAt) return 'none';
  return now.getTime() - time(trip.lastPointAt) >= lostMinutes * MINUTE ? 'stale' : 'ok';
}

/** Motivo para acionar o Sinal de Alerta, ou null (a caminho e com sinal, ou já encerrado). */
export function alertReason(trip: TripTimes, now: Date): TripAlertReason | null {
  if (trip.status === 'expired') {
    return trip.endedAt && now.getTime() - time(trip.endedAt) <= TRIP_ALERT_WINDOW_HOURS * HOUR ? 'expired' : null;
  }
  if (trip.status !== 'active') return null;
  if (now.getTime() >= overdueAtMs(trip)) return 'overdue';
  const reference = trip.lastPointAt ?? trip.startedAt;
  if (now.getTime() - time(reference) >= TRIP_SIGNAL_LOST_MIN * MINUTE) return 'signal_lost';
  return null;
}

/** Contato vê a localização com o trajeto ativo, com alerta aberto ou até 24 h depois do prazo sem chegada. */
export function watcherSeesLocation(trip: TripTimes, now: Date, alertOpen: boolean): boolean {
  if (alertOpen || trip.status === 'active') return true;
  if (trip.status === 'expired' && trip.endedAt) return now.getTime() - time(trip.endedAt) <= TRIP_ALERT_WINDOW_HOURS * HOUR;
  return false;
}

/** "15 min", "1 h", "1 h 30" (rótulo curto das opções de previsão). */
export function shortDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)} h ${rest}` : `${minutes / 60} h`;
}

/** Minutos inteiros desde `iso` (nunca negativo). */
export function minutesSince(iso: string, now: Date): number {
  const value = time(iso);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor((now.getTime() - value) / MINUTE));
}

/** Milissegundos até `iso` (negativo = já passou). */
export const msUntil = (iso: string, now: Date): number => time(iso) - now.getTime();

/** "Ainda estou em deslocamento": nova previsão = maior entre a atual e agora, + minutos; null se passar de 12 h. */
export function extendedArrival(trip: Pick<TripTimes, 'startedAt' | 'expectedArrivalAt'>, now: Date, minutes = TRIP_EXTEND_MIN): string | null {
  const base = Math.max(time(trip.expectedArrivalAt), now.getTime());
  const next = base + minutes * MINUTE;
  if (next > time(trip.startedAt) + TRIP_MAX_HOURS * HOUR) return null;
  return new Date(next).toISOString();
}

/** Nova previsão contada de agora (mudança de destino), dentro das 12 h desde o início. */
export function arrivalFromNow(trip: Pick<TripTimes, 'startedAt'>, now: Date, minutes: number): string | null {
  const next = now.getTime() + minutes * MINUTE;
  if (next > time(trip.startedAt) + TRIP_MAX_HOURS * HOUR) return null;
  return new Date(next).toISOString();
}

// ---------------------------------------------------------------- convite

const INVITE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_LENGTH = 12;

/** Aceita o código com espaços, hífens ou minúsculas (como a pessoa digitou ou colou). */
export function normalizeInviteCode(raw: string | null | undefined): string | null {
  const code = String(raw ?? '').toUpperCase().replace(/[\s-]/g, '');
  if (code.length !== INVITE_CODE_LENGTH) return null;
  for (const char of code) if (!INVITE_ALPHABET.includes(char)) return null;
  return code;
}

/** "ABCD-EFGH-JKMN", mais fácil de ler em voz alta. */
export function formatInviteCode(code: string): string {
  return code.match(/.{1,4}/g)?.join('-') ?? code;
}

/** Link do convite (só quando o endereço do app web está configurado). */
export function inviteLink(code: string, webUrl: string): string | null {
  const base = webUrl.trim().replace(/\/+$/, '');
  return base ? `${base}/trajeto/convite/${code}` : null;
}

// ---------------------------------------------------------------- formulários

export type TripFormCode = 'required' | 'too_short' | 'too_long' | 'limit_reached';

export type TripForm = {
  originLabel: string;
  destinationLabel: string;
  arrivalMinutes: number;
  toleranceMinutes: number;
  contactIds: string[];
  consent: boolean;
};

function labelError(value: string): TripFormCode | null {
  const clean = value.trim();
  if (!clean) return 'required';
  if (clean.length < TRIP_LABEL_MIN) return 'too_short';
  if (clean.length > TRIP_LABEL_MAX) return 'too_long';
  return null;
}

/** Erros do início do trajeto, por campo. Vazio = pode começar. */
export function validateTripForm(form: TripForm): Partial<Record<keyof TripForm, TripFormCode>> {
  const errors: Partial<Record<keyof TripForm, TripFormCode>> = {};
  const origin = labelError(form.originLabel);
  if (origin) errors.originLabel = origin;
  const destination = labelError(form.destinationLabel);
  if (destination) errors.destinationLabel = destination;
  if (!(TRIP_ARRIVAL_OPTIONS_MIN as readonly number[]).includes(form.arrivalMinutes)) errors.arrivalMinutes = 'required';
  if (!(TRIP_TOLERANCE_OPTIONS_MIN as readonly number[]).includes(form.toleranceMinutes)) errors.toleranceMinutes = 'required';
  if (form.contactIds.length === 0) errors.contactIds = 'required';
  else if (form.contactIds.length > TRIP_MAX_WATCHERS) errors.contactIds = 'limit_reached';
  if (!form.consent) errors.consent = 'required';
  return errors;
}

export function destinationError(value: string): TripFormCode | null {
  return labelError(value);
}

/** Como a pessoa tentou falar com quem está compartilhando (obrigatório no Sinal de Alerta). */
export function contactAttemptError(text: string): TripFormCode | null {
  const clean = text.trim();
  if (!clean) return 'required';
  if (clean.length < CONTACT_ATTEMPT_MIN) return 'too_short';
  if (clean.length > CONTACT_ATTEMPT_MAX) return 'too_long';
  return null;
}

// ---------------------------------------------------------------- fila de posições (sem internet)

export type QueuedPoint = { latitude: number; longitude: number; accuracyMeters: number | null; recordedAt: string };

export function isUsablePoint(point: QueuedPoint): boolean {
  const { latitude, longitude, accuracyMeters } = point;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
  if (latitude === 0 && longitude === 0) return false;
  if (accuracyMeters != null && (!Number.isFinite(accuracyMeters) || accuracyMeters < 0 || accuracyMeters > POINT_ACCURACY_MAX_M)) return false;
  return Number.isFinite(time(point.recordedAt));
}

/**
 * Acrescenta uma posição à fila. Dentro do mesmo minuto, a mais nova substitui a anterior; acima de 30, saem as
 * mais antigas (a última posição é a que mais importa para quem acompanha).
 */
export function queuePoint(queue: QueuedPoint[], point: QueuedPoint): QueuedPoint[] {
  if (!isUsablePoint(point)) return queue;
  const last = queue[queue.length - 1];
  if (last && time(point.recordedAt) <= time(last.recordedAt)) return queue;
  const next = last && time(point.recordedAt) - time(last.recordedAt) < POINT_QUEUE_GAP_MS ? [...queue.slice(0, -1), point] : [...queue, point];
  return next.slice(-POINT_QUEUE_MAX);
}

/** Formato compacto para guardar no aparelho: [lat, lng, precisão, horário em ms]. */
export function serializePointQueue(queue: QueuedPoint[]): string {
  return JSON.stringify(
    queue.map((p) => [Math.round(p.latitude * 1e5) / 1e5, Math.round(p.longitude * 1e5) / 1e5, p.accuracyMeters == null ? null : Math.round(p.accuracyMeters), time(p.recordedAt)]),
  );
}

export function parsePointQueue(raw: string | null): QueuedPoint[] {
  if (!raw) return [];
  try {
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const points: QueuedPoint[] = [];
    for (const item of list) {
      if (!Array.isArray(item) || item.length !== 4) continue;
      const [latitude, longitude, accuracy, at] = item as unknown[];
      if (typeof latitude !== 'number' || typeof longitude !== 'number' || typeof at !== 'number') continue;
      const point: QueuedPoint = {
        latitude,
        longitude,
        accuracyMeters: typeof accuracy === 'number' ? accuracy : null,
        recordedAt: new Date(at).toISOString(),
      };
      if (isUsablePoint(point)) points.push(point);
    }
    return points.slice(-POINT_QUEUE_MAX);
  } catch {
    return [];
  }
}

/** Trajeto ativo guardado neste aparelho (para enviar posições mesmo com a tela fechada). */
export type ActiveTripRef = { tripId: string; until: string };

export function parseActiveTripRef(raw: string | null, now: Date): ActiveTripRef | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const tripId = typeof value.tripId === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value.tripId) ? value.tripId : null;
    const until = typeof value.until === 'string' ? value.until : '';
    if (!tripId || !Number.isFinite(time(until)) || time(until) <= now.getTime()) return null;
    return { tripId, until };
  } catch {
    return null;
  }
}

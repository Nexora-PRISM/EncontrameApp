import type {
  QueuedPoint,
  TripAlertReason,
  TripAlertStatus,
  TripPhase,
  TripSignal,
  TripStatus,
} from '@/lib/trip-rules';

export type TripCoords = { latitude: number; longitude: number };
export type TripPoint = QueuedPoint;

/** Vínculo de confiança: aceito por convite. `id` é o do vínculo (para desfazer). */
export type TripContact = { id: string; name: string; since: string };

export type TripContacts = {
  /** Quem acompanha os meus trajetos (escolho entre eles ao iniciar). */
  watchers: TripContact[];
  /** Quem compartilha trajetos comigo. */
  sharingWithMe: TripContact[];
};

export type TripInvite = { code: string; expiresAt: string };

export type TripInvitePreview = {
  ownerName: string;
  expiresAt: string;
  ownInvite: boolean;
  alreadyConnected: boolean;
};

export type TripAlertSummary = {
  id: string;
  status: TripAlertStatus;
  reason: TripAlertReason;
  raisedByName: string;
  raisedAt: string;
  closedAt: string | null;
  missingPersonId: string | null;
};

export type TripAlertEvent = { kind: string; note: string | null; at: string; name: string | null };

/** O que cada um vê do trajeto. O contato só recebe posição enquanto faz sentido (`locationVisible`). */
export type TripView = {
  id: string;
  role: 'owner' | 'watcher';
  ownerName: string;
  status: TripStatus;
  phase: TripPhase;
  originLabel: string;
  origin: TripCoords | null;
  destinationLabel: string;
  destination: TripCoords | null;
  expectedArrivalAt: string;
  toleranceMinutes: number;
  overdueAt: string;
  shareUntil: string;
  startedAt: string;
  endedAt: string | null;
  locationVisible: boolean;
  signal: TripSignal | null;
  lastPoint: TripPoint | null;
  path: TripPoint[];
  /** Só para quem compartilha: os nomes de quem acompanha. */
  watcherNames: string[] | null;
  /** Só para o contato: quantos outros acompanham. */
  otherWatchersCount: number | null;
  canRaiseAlert: boolean;
  alertReason: TripAlertReason | null;
  alert: TripAlertSummary | null;
  alertEvents: TripAlertEvent[];
};

export type TripSummary = {
  id: string;
  status: TripStatus;
  phase: TripPhase;
  destinationLabel: string;
  expectedArrivalAt: string;
  startedAt: string;
  endedAt: string | null;
  watchersCount: number;
};

export type TripWatchingItem = {
  id: string;
  ownerName: string;
  status: TripStatus;
  phase: TripPhase;
  destinationLabel: string;
  expectedArrivalAt: string;
  lastPointAt: string | null;
  signal: TripSignal | null;
  alertStatus: TripAlertStatus | null;
};

export type TripStartPayload = {
  originLabel: string;
  origin: TripCoords | null;
  destinationLabel: string;
  destination: TripCoords | null;
  expectedArrivalAt: string;
  toleranceMinutes: number;
  contactIds: string[];
  consentAcceptedAt: string;
};

export type TripUpdatePayload = {
  destinationLabel?: string;
  destination?: TripCoords | null;
  expectedArrivalAt?: string;
};

export type TripAlertPayload = { contactAttempt: string; triedToContact: true };

/** Comprovante do Sinal de Alerta: a tela só diz "recebido" com número e horário. */
export type TripAlertReceipt = {
  alertId: string;
  receivedAt: string;
  status: TripAlertStatus;
  reason: TripAlertReason;
  alreadyOpen: boolean;
  lastPoint: { latitude: number; longitude: number; recordedAt: string } | null;
};

export type StaffTripAlert = {
  id: string;
  status: TripAlertStatus;
  reason: TripAlertReason;
  raisedAt: string;
  raisedByName: string;
  contactAttempt: string;
  lastPoint: { latitude: number; longitude: number; recordedAt: string } | null;
  missingPersonId: string | null;
  trip: {
    id: string;
    ownerName: string;
    status: TripStatus;
    phase: TripPhase;
    originLabel: string;
    destinationLabel: string;
    destination: TripCoords | null;
    expectedArrivalAt: string;
    startedAt: string;
    path: TripPoint[];
    watcherNames: string[];
  } | null;
  events: TripAlertEvent[];
};

export type StaffTripAlertDecision = 'monitoring' | 'found' | 'unfounded';

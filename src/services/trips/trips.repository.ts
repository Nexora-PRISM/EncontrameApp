import { env } from '@/lib/env';
import { tripsAxiosRepository } from '@/services/trips/trips.axios.repository';
import { tripsMockRepository } from '@/services/trips/trips.mock.repository';
import type {
  StaffTripAlert,
  StaffTripAlertDecision,
  TripAlertPayload,
  TripAlertReceipt,
  TripContact,
  TripContacts,
  TripInvite,
  TripInvitePreview,
  TripPoint,
  TripStartPayload,
  TripSummary,
  TripUpdatePayload,
  TripView,
  TripWatchingItem,
} from '@/services/trips/trips.types';

/**
 * Compartilhar meu trajeto (TripContact = vínculos e convites; Trip = trajetos e Sinal de Alerta).
 * Contrato em docs/evolucao/CONTRATOS-API.md, seção "Trajeto compartilhado".
 */
export interface TripsRepository {
  createInvite(): Promise<TripInvite>;
  previewInvite(code: string): Promise<TripInvitePreview>;
  acceptInvite(code: string): Promise<TripContact>;
  listContacts(): Promise<TripContacts>;
  removeContact(id: string): Promise<void>;

  start(payload: TripStartPayload): Promise<TripView>;
  listMine(): Promise<TripSummary[]>;
  listWatching(): Promise<TripWatchingItem[]>;
  get(id: string): Promise<TripView>;
  update(id: string, payload: TripUpdatePayload): Promise<TripView>;
  addPoints(id: string, points: TripPoint[]): Promise<{ accepted: number }>;
  arrived(id: string): Promise<TripView>;
  cancel(id: string): Promise<TripView>;

  raiseAlert(id: string, payload: TripAlertPayload): Promise<TripAlertReceipt>;
  ownerOk(id: string): Promise<TripView>;
  found(id: string, note: string): Promise<TripView>;
  linkCase(id: string, missingPersonId: string): Promise<TripView>;

  staffList(closed: boolean): Promise<StaffTripAlert[]>;
  staffDecide(alertId: string, status: StaffTripAlertDecision, justification: string): Promise<void>;
}

export function getTripsRepository(): TripsRepository {
  return env.useMocks ? tripsMockRepository : tripsAxiosRepository;
}

import { api } from '@/lib/axios';
import type { TripAlertReason, TripAlertStatus, TripPhase, TripSignal, TripStatus } from '@/lib/trip-rules';
import type { TripsRepository } from '@/services/trips/trips.repository';
import type {
  StaffTripAlert,
  TripAlertEvent,
  TripAlertSummary,
  TripContact,
  TripCoords,
  TripInvitePreview,
  TripPoint,
  TripSummary,
  TripView,
  TripWatchingItem,
} from '@/services/trips/trips.types';

/** As telas do trajeto mostram os próprios erros; o envio em segundo plano nunca abre o modal de erro. */
const QUIET = { quietErrors: true } as const;

type ApiPoint = { latitude: number; longitude: number; accuracyMeters?: number | null; recordedAt: string };
type ApiContact = { tripContactId: number; name: string; since: string };
type ApiAlert = {
  tripAlertId: number;
  status: TripAlertStatus;
  reason: TripAlertReason;
  raisedByName: string;
  raisedAt: string;
  closedAt?: string | null;
  missingPersonId?: number | null;
};
type ApiView = {
  tripId: number;
  role: 'owner' | 'watcher';
  ownerName: string;
  status: TripStatus;
  phase: TripPhase;
  originLabel: string;
  origin?: TripCoords | null;
  destinationLabel: string;
  destination?: TripCoords | null;
  expectedArrivalAt: string;
  toleranceMinutes: number;
  overdueAt: string;
  shareUntil: string;
  startedAt: string;
  endedAt?: string | null;
  locationVisible: boolean;
  signal?: TripSignal | null;
  lastPoint?: ApiPoint | null;
  path?: ApiPoint[];
  watchers?: { name: string }[];
  otherWatchersCount?: number;
  canRaiseAlert: boolean;
  alertReason?: TripAlertReason | null;
  alert?: ApiAlert | null;
  alertEvents?: TripAlertEvent[];
};

const mapPoint = (p: ApiPoint): TripPoint => ({
  latitude: p.latitude,
  longitude: p.longitude,
  accuracyMeters: p.accuracyMeters ?? null,
  recordedAt: p.recordedAt,
});

const mapContact = (c: ApiContact): TripContact => ({ id: String(c.tripContactId), name: c.name, since: c.since });

const mapAlert = (a: ApiAlert | null | undefined): TripAlertSummary | null =>
  a
    ? {
        id: String(a.tripAlertId),
        status: a.status,
        reason: a.reason,
        raisedByName: a.raisedByName,
        raisedAt: a.raisedAt,
        closedAt: a.closedAt ?? null,
        missingPersonId: a.missingPersonId == null ? null : String(a.missingPersonId),
      }
    : null;

const mapView = (v: ApiView): TripView => ({
  id: String(v.tripId),
  role: v.role,
  ownerName: v.ownerName,
  status: v.status,
  phase: v.phase,
  originLabel: v.originLabel,
  origin: v.origin ?? null,
  destinationLabel: v.destinationLabel,
  destination: v.destination ?? null,
  expectedArrivalAt: v.expectedArrivalAt,
  toleranceMinutes: v.toleranceMinutes,
  overdueAt: v.overdueAt,
  shareUntil: v.shareUntil,
  startedAt: v.startedAt,
  endedAt: v.endedAt ?? null,
  locationVisible: v.locationVisible,
  signal: v.signal ?? null,
  lastPoint: v.lastPoint ? mapPoint(v.lastPoint) : null,
  path: (v.path ?? []).map(mapPoint),
  watcherNames: v.watchers ? v.watchers.map((w) => w.name) : null,
  otherWatchersCount: v.otherWatchersCount ?? null,
  canRaiseAlert: v.canRaiseAlert === true,
  alertReason: v.alertReason ?? null,
  alert: mapAlert(v.alert),
  alertEvents: v.alertEvents ?? [],
});

const tripPath = (id: string) => `/Trip/${encodeURIComponent(id)}`;

export const tripsAxiosRepository: TripsRepository = {
  async createInvite() {
    const { data } = await api.post<{ code: string; expiresAt: string }>('/TripContact/invite', undefined, QUIET);
    return data;
  },
  async previewInvite(code) {
    const { data } = await api.get<TripInvitePreview>(`/TripContact/invite/${encodeURIComponent(code)}`, QUIET);
    return data;
  },
  async acceptInvite(code) {
    const { data } = await api.post<ApiContact>(`/TripContact/invite/${encodeURIComponent(code)}/accept`, undefined, QUIET);
    return mapContact(data);
  },
  async listContacts() {
    const { data } = await api.get<{ watchers: ApiContact[]; sharingWithMe: ApiContact[] }>('/TripContact', QUIET);
    return { watchers: data.watchers.map(mapContact), sharingWithMe: data.sharingWithMe.map(mapContact) };
  },
  async removeContact(id) {
    await api.delete(`/TripContact/${encodeURIComponent(id)}`, QUIET);
  },

  async start(payload) {
    const { data } = await api.post<ApiView>(
      '/Trip',
      {
        originLabel: payload.originLabel,
        originLatitude: payload.origin?.latitude ?? null,
        originLongitude: payload.origin?.longitude ?? null,
        destinationLabel: payload.destinationLabel,
        destinationLatitude: payload.destination?.latitude ?? null,
        destinationLongitude: payload.destination?.longitude ?? null,
        expectedArrivalAt: payload.expectedArrivalAt,
        toleranceMinutes: payload.toleranceMinutes,
        contactIds: payload.contactIds.map(Number),
        consentAcceptedAt: payload.consentAcceptedAt,
      },
      QUIET,
    );
    return mapView(data);
  },
  async listMine() {
    const { data } = await api.get<(Omit<TripSummary, 'id'> & { tripId: number })[]>('/Trip/mine', QUIET);
    return data.map(({ tripId, ...rest }) => ({ ...rest, id: String(tripId), endedAt: rest.endedAt ?? null }));
  },
  async listWatching() {
    const { data } = await api.get<(Omit<TripWatchingItem, 'id'> & { tripId: number })[]>('/Trip/watching', QUIET);
    return data.map(({ tripId, ...rest }) => ({
      ...rest,
      id: String(tripId),
      lastPointAt: rest.lastPointAt ?? null,
      signal: rest.signal ?? null,
      alertStatus: rest.alertStatus ?? null,
    }));
  },
  async get(id) {
    const { data } = await api.get<ApiView>(tripPath(id), QUIET);
    return mapView(data);
  },
  async update(id, payload) {
    const body: Record<string, unknown> = {};
    if (payload.destinationLabel) {
      body.destinationLabel = payload.destinationLabel;
      body.destinationLatitude = payload.destination?.latitude ?? null;
      body.destinationLongitude = payload.destination?.longitude ?? null;
    }
    if (payload.expectedArrivalAt) body.expectedArrivalAt = payload.expectedArrivalAt;
    const { data } = await api.put<ApiView>(tripPath(id), body, QUIET);
    return mapView(data);
  },
  async addPoints(id, points) {
    const { data } = await api.post<{ accepted: number }>(`${tripPath(id)}/points`, { points }, QUIET);
    return { accepted: data.accepted };
  },
  async arrived(id) {
    const { data } = await api.post<ApiView>(`${tripPath(id)}/arrived`, undefined, QUIET);
    return mapView(data);
  },
  async cancel(id) {
    const { data } = await api.post<ApiView>(`${tripPath(id)}/cancel`, undefined, QUIET);
    return mapView(data);
  },

  async raiseAlert(id, payload) {
    const { data } = await api.post<{
      tripAlertId: number;
      receivedAt: string;
      status: TripAlertStatus;
      reason: TripAlertReason;
      alreadyOpen: boolean;
      lastPoint: { latitude: number; longitude: number; recordedAt: string } | null;
    }>(`${tripPath(id)}/alert`, payload, QUIET);
    return {
      alertId: String(data.tripAlertId),
      receivedAt: data.receivedAt,
      status: data.status,
      reason: data.reason,
      alreadyOpen: data.alreadyOpen === true,
      lastPoint: data.lastPoint ?? null,
    };
  },
  async ownerOk(id) {
    const { data } = await api.post<ApiView>(`${tripPath(id)}/alert/owner-ok`, undefined, QUIET);
    return mapView(data);
  },
  async found(id, note) {
    const { data } = await api.post<ApiView>(`${tripPath(id)}/alert/found`, note.trim() ? { note: note.trim() } : {}, QUIET);
    return mapView(data);
  },
  async linkCase(id, missingPersonId) {
    const { data } = await api.post<ApiView>(`${tripPath(id)}/alert/case`, { missingPersonId: Number(missingPersonId) }, QUIET);
    return mapView(data);
  },

  async staffList(closed) {
    const { data } = await api.get<
      (Omit<StaffTripAlert, 'id' | 'trip' | 'missingPersonId'> & {
        tripAlertId: number;
        missingPersonId?: number | null;
        trip: (Omit<NonNullable<StaffTripAlert['trip']>, 'id' | 'path' | 'watcherNames'> & {
          tripId: number;
          path?: ApiPoint[];
          watchers?: { name: string }[];
        }) | null;
      })[]
    >('/Moderation/trip-alerts', { ...QUIET, params: closed ? { closed: true } : undefined });
    return data.map(({ tripAlertId, missingPersonId, trip, ...rest }) => ({
      ...rest,
      id: String(tripAlertId),
      missingPersonId: missingPersonId == null ? null : String(missingPersonId),
      trip: trip
        ? {
            id: String(trip.tripId),
            ownerName: trip.ownerName,
            status: trip.status,
            phase: trip.phase,
            originLabel: trip.originLabel,
            destinationLabel: trip.destinationLabel,
            destination: trip.destination ?? null,
            expectedArrivalAt: trip.expectedArrivalAt,
            startedAt: trip.startedAt,
            path: (trip.path ?? []).map(mapPoint),
            watcherNames: (trip.watchers ?? []).map((w) => w.name),
          }
        : null,
    }));
  },
  async staffDecide(alertId, status, justification) {
    await api.post(`/Moderation/trip-alerts/${encodeURIComponent(alertId)}/status`, { status, justification }, QUIET);
  },
};

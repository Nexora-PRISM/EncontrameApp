import {
  alertReason,
  isOpenAlertStatus,
  normalizeInviteCode,
  overdueAtMs,
  signalState,
  type TripAlertStatus,
  type TripStatus,
  tripPhase,
  watcherSeesLocation,
} from '@/lib/trip-rules';
import { TripMockError } from '@/services/trips/trips.errors';
import type { TripsRepository } from '@/services/trips/trips.repository';
import type {
  StaffTripAlert,
  TripAlertEvent,
  TripAlertSummary,
  TripContact,
  TripCoords,
  TripPoint,
  TripView,
} from '@/services/trips/trips.types';

/**
 * Demonstração em memória: contatos e trajetos fictícios ("exemplo"), nada sai do aparelho.
 * "Júlia (exemplo)" compartilha um trajeto atrasado e sem sinal, para mostrar a tela de quem acompanha e o
 * Sinal de Alerta. Os horários são relativos à abertura do app.
 */
const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
const MINUTE = 60 * 1000;
const ago = (minutes: number) => new Date(Date.now() - minutes * MINUTE).toISOString();

type MockAlert = TripAlertSummary & { contactAttempt: string; events: TripAlertEvent[]; lastPoint: TripPoint | null };

type MockTrip = {
  id: string;
  mine: boolean;
  ownerName: string;
  status: TripStatus;
  originLabel: string;
  origin: TripCoords | null;
  destinationLabel: string;
  destination: TripCoords | null;
  expectedArrivalAt: string;
  toleranceMinutes: number;
  shareUntil: string;
  startedAt: string;
  endedAt: string | null;
  points: TripPoint[];
  watcherNames: string[];
  alerts: MockAlert[];
};

const ME = 'Você';

let contacts: { watchers: TripContact[]; sharingWithMe: TripContact[] } = {
  watchers: [
    { id: '1', name: 'Ana (exemplo)', since: ago(60 * 24 * 12) },
    { id: '2', name: 'Carlos (exemplo)', since: ago(60 * 24 * 3) },
  ],
  sharingWithMe: [{ id: '3', name: 'Júlia (exemplo)', since: ago(60 * 24 * 20) }],
};
let nextContactId = 4;
let nextTripId = 2;
let nextAlertId = 101;

const julia: MockTrip = {
  id: '1',
  mine: false,
  ownerName: 'Júlia (exemplo)',
  status: 'active',
  originLabel: 'Trabalho',
  origin: { latitude: -19.9245, longitude: -43.9352 },
  destinationLabel: 'Casa',
  destination: { latitude: -19.9012, longitude: -43.9611 },
  expectedArrivalAt: ago(40),
  toleranceMinutes: 15,
  shareUntil: new Date(Date.now() + 11 * 60 * MINUTE).toISOString(),
  startedAt: ago(70),
  endedAt: null,
  points: [
    { latitude: -19.9245, longitude: -43.9352, accuracyMeters: 15, recordedAt: ago(69) },
    { latitude: -19.9198, longitude: -43.9417, accuracyMeters: 18, recordedAt: ago(55) },
    { latitude: -19.9141, longitude: -43.9478, accuracyMeters: 22, recordedAt: ago(40) },
    { latitude: -19.9093, longitude: -43.9530, accuracyMeters: 25, recordedAt: ago(25) },
  ],
  watcherNames: [ME, 'Outra pessoa (exemplo)'],
  alerts: [],
};

let trips: MockTrip[] = [julia];

const openAlert = (trip: MockTrip) => trip.alerts.find((a) => isOpenAlertStatus(a.status)) ?? null;
const latestAlert = (trip: MockTrip) => openAlert(trip) ?? trip.alerts[trip.alerts.length - 1] ?? null;

function times(trip: MockTrip) {
  const lastPoint = trip.points[trip.points.length - 1] ?? null;
  return {
    status: trip.status,
    startedAt: trip.startedAt,
    expectedArrivalAt: trip.expectedArrivalAt,
    toleranceMinutes: trip.toleranceMinutes,
    endedAt: trip.endedAt,
    lastPointAt: lastPoint?.recordedAt ?? null,
  };
}

/** Prazo de 12 h encerrado sem confirmação: o servidor faria isso sozinho. */
function settle(trip: MockTrip, now: Date) {
  if (trip.status === 'active' && now.getTime() >= new Date(trip.shareUntil).getTime()) {
    trip.status = 'expired';
    trip.endedAt = trip.shareUntil;
  }
}

function view(trip: MockTrip): TripView {
  const now = new Date();
  settle(trip, now);
  const t = times(trip);
  const alert = latestAlert(trip);
  const visible = trip.mine || watcherSeesLocation(t, now, openAlert(trip) != null);
  const reason = alertReason(t, now);
  const summary: TripAlertSummary | null = alert
    ? {
        id: alert.id,
        status: alert.status,
        reason: alert.reason,
        raisedByName: alert.raisedByName,
        raisedAt: alert.raisedAt,
        closedAt: alert.closedAt,
        missingPersonId: alert.missingPersonId,
      }
    : null;
  return {
    id: trip.id,
    role: trip.mine ? 'owner' : 'watcher',
    ownerName: trip.ownerName,
    status: trip.status,
    phase: tripPhase(t, now),
    originLabel: trip.originLabel,
    origin: trip.origin,
    destinationLabel: trip.destinationLabel,
    destination: trip.destination,
    expectedArrivalAt: trip.expectedArrivalAt,
    toleranceMinutes: trip.toleranceMinutes,
    overdueAt: new Date(overdueAtMs(t)).toISOString(),
    shareUntil: trip.shareUntil,
    startedAt: trip.startedAt,
    endedAt: trip.endedAt,
    locationVisible: visible,
    signal: visible ? signalState(t, now) : null,
    lastPoint: visible ? trip.points[trip.points.length - 1] ?? null : null,
    path: visible ? [...trip.points] : [],
    watcherNames: trip.mine ? [...trip.watcherNames] : null,
    otherWatchersCount: trip.mine ? null : Math.max(0, trip.watcherNames.length - 1),
    canRaiseAlert: !trip.mine && reason !== null,
    alertReason: trip.mine ? null : reason,
    alert: summary,
    alertEvents: alert ? [...alert.events] : [],
  };
}

function find(id: string): MockTrip {
  const trip = trips.find((item) => item.id === id);
  if (!trip) throw new TripMockError('not_found');
  return trip;
}

function closeOpenAlert(trip: MockTrip, status: TripAlertStatus, kind: string, name: string, note: string | null = null) {
  const open = openAlert(trip);
  if (!open) return false;
  const at = new Date().toISOString();
  open.status = status;
  open.closedAt = status === 'monitoring' ? null : at;
  open.events.push({ kind, note, at, name });
  return true;
}

function finish(id: string, status: 'arrived' | 'cancelled') {
  const trip = find(id);
  if (!trip.mine) throw new TripMockError('not_found');
  if (trip.status !== 'active' && trip.status !== 'expired') throw new TripMockError('not_active');
  trip.status = status;
  trip.endedAt = trip.endedAt ?? new Date().toISOString();
  closeOpenAlert(trip, 'owner_ok', status === 'arrived' ? 'owner_arrived' : 'owner_ended', ME);
  return view(trip);
}

export const tripsMockRepository: TripsRepository = {
  async createInvite() {
    await wait();
    // Código fictício e fixo: o mock não cria vínculo de verdade.
    return { code: 'DEMQ2TRAJETX', expiresAt: new Date(Date.now() + 48 * 60 * MINUTE).toISOString() };
  },
  async previewInvite(code) {
    await wait();
    if (!normalizeInviteCode(code)) throw new TripMockError('not_found');
    return { ownerName: 'Pessoa de exemplo', expiresAt: new Date(Date.now() + 47 * 60 * MINUTE).toISOString(), ownInvite: false, alreadyConnected: false };
  },
  async acceptInvite(code) {
    await wait();
    if (!normalizeInviteCode(code)) throw new TripMockError('not_found');
    const contact = { id: String(nextContactId++), name: 'Pessoa de exemplo', since: new Date().toISOString() };
    contacts = { ...contacts, sharingWithMe: [...contacts.sharingWithMe, contact] };
    return contact;
  },
  async listContacts() {
    await wait();
    return { watchers: [...contacts.watchers], sharingWithMe: [...contacts.sharingWithMe] };
  },
  async removeContact(id) {
    await wait();
    const removed = contacts.sharingWithMe.find((c) => c.id === id);
    contacts = {
      watchers: contacts.watchers.filter((c) => c.id !== id),
      sharingWithMe: contacts.sharingWithMe.filter((c) => c.id !== id),
    };
    // Vínculo desfeito: os trajetos dessa pessoa deixam de aparecer na hora.
    if (removed) trips = trips.filter((trip) => trip.mine || trip.ownerName !== removed.name);
  },

  async start(payload) {
    await wait();
    if (trips.some((trip) => trip.mine && trip.status === 'active')) throw new TripMockError('already_active');
    const chosen = contacts.watchers.filter((c) => payload.contactIds.includes(c.id));
    if (chosen.length !== payload.contactIds.length) throw new TripMockError('invalid');
    const now = Date.now();
    const trip: MockTrip = {
      id: String(nextTripId++),
      mine: true,
      ownerName: ME,
      status: 'active',
      originLabel: payload.originLabel.trim(),
      origin: payload.origin,
      destinationLabel: payload.destinationLabel.trim(),
      destination: payload.destination,
      expectedArrivalAt: payload.expectedArrivalAt,
      toleranceMinutes: payload.toleranceMinutes,
      shareUntil: new Date(now + 12 * 60 * MINUTE).toISOString(),
      startedAt: new Date(now).toISOString(),
      endedAt: null,
      points: payload.origin ? [{ ...payload.origin, accuracyMeters: null, recordedAt: new Date(now).toISOString() }] : [],
      watcherNames: chosen.map((c) => c.name),
      alerts: [],
    };
    trips = [trip, ...trips];
    return view(trip);
  },
  async listMine() {
    await wait();
    return trips
      .filter((trip) => trip.mine)
      .map((trip) => {
        const v = view(trip);
        return {
          id: v.id,
          status: v.status,
          phase: v.phase,
          destinationLabel: v.destinationLabel,
          expectedArrivalAt: v.expectedArrivalAt,
          startedAt: v.startedAt,
          endedAt: v.endedAt,
          watchersCount: trip.watcherNames.length,
        };
      });
  },
  async listWatching() {
    await wait();
    return trips
      .filter((trip) => !trip.mine)
      .map((trip) => {
        const v = view(trip);
        return {
          id: v.id,
          ownerName: v.ownerName,
          status: v.status,
          phase: v.phase,
          destinationLabel: v.destinationLabel,
          expectedArrivalAt: v.expectedArrivalAt,
          lastPointAt: v.lastPoint?.recordedAt ?? null,
          signal: v.signal,
          alertStatus: openAlert(trip)?.status ?? null,
        };
      })
      .filter((item) => item.status === 'active' || item.status === 'expired' || item.alertStatus != null);
  },
  async get(id) {
    await wait();
    return view(find(id));
  },
  async update(id, payload) {
    await wait();
    const trip = find(id);
    if (!trip.mine) throw new TripMockError('not_found');
    if (trip.status !== 'active') throw new TripMockError('not_active');
    if (payload.destinationLabel) {
      trip.destinationLabel = payload.destinationLabel.trim();
      trip.destination = payload.destination ?? null;
    }
    if (payload.expectedArrivalAt) trip.expectedArrivalAt = payload.expectedArrivalAt;
    return view(trip);
  },
  async addPoints(id, points) {
    await wait();
    const trip = find(id);
    if (!trip.mine) throw new TripMockError('not_found');
    if (trip.status !== 'active') throw new TripMockError('not_active');
    trip.points = [...trip.points, ...points].slice(-300);
    return { accepted: points.length };
  },
  async arrived(id) {
    await wait();
    return finish(id, 'arrived');
  },
  async cancel(id) {
    await wait();
    return finish(id, 'cancelled');
  },

  async raiseAlert(id, payload) {
    await wait();
    const trip = find(id);
    if (trip.mine) throw new TripMockError('forbidden');
    const now = new Date();
    const existing = openAlert(trip);
    if (existing) {
      existing.events.push({ kind: 'info', note: payload.contactAttempt.trim(), at: now.toISOString(), name: ME });
      return {
        alertId: existing.id,
        receivedAt: now.toISOString(),
        status: existing.status,
        reason: existing.reason,
        alreadyOpen: true,
        lastPoint: existing.lastPoint,
      };
    }
    const reason = alertReason(times(trip), now);
    if (!reason) throw new TripMockError('too_early');
    const last = trip.points[trip.points.length - 1] ?? null;
    const alert: MockAlert = {
      id: String(nextAlertId++),
      status: 'open',
      reason,
      raisedByName: ME,
      raisedAt: now.toISOString(),
      closedAt: null,
      missingPersonId: null,
      contactAttempt: payload.contactAttempt.trim(),
      lastPoint: last,
      events: [{ kind: 'raised', note: payload.contactAttempt.trim(), at: now.toISOString(), name: ME }],
    };
    trip.alerts.push(alert);
    return { alertId: alert.id, receivedAt: alert.raisedAt, status: 'open', reason, alreadyOpen: false, lastPoint: last };
  },
  async ownerOk(id) {
    await wait();
    const trip = find(id);
    if (!trip.mine || !closeOpenAlert(trip, 'owner_ok', 'owner_ok', ME)) throw new TripMockError('not_found');
    return view(trip);
  },
  async found(id, note) {
    await wait();
    const trip = find(id);
    if (trip.mine || !closeOpenAlert(trip, 'found', 'found', ME, note.trim() || null)) throw new TripMockError('not_found');
    return view(trip);
  },
  async linkCase(id, missingPersonId) {
    await wait();
    const trip = find(id);
    const open = openAlert(trip);
    if (trip.mine || !open) throw new TripMockError('not_found');
    open.missingPersonId = missingPersonId;
    open.events.push({ kind: 'case_registered', note: `#${missingPersonId}`, at: new Date().toISOString(), name: ME });
    return view(trip);
  },

  async staffList(closed) {
    await wait();
    const list: StaffTripAlert[] = [];
    for (const trip of trips) {
      for (const alert of trip.alerts) {
        if (isOpenAlertStatus(alert.status) === closed) continue;
        const v = view(trip);
        list.push({
          id: alert.id,
          status: alert.status,
          reason: alert.reason,
          raisedAt: alert.raisedAt,
          raisedByName: alert.raisedByName,
          contactAttempt: alert.contactAttempt,
          lastPoint: alert.lastPoint,
          missingPersonId: alert.missingPersonId,
          trip: {
            id: trip.id,
            ownerName: trip.ownerName,
            status: trip.status,
            phase: v.phase,
            originLabel: trip.originLabel,
            destinationLabel: trip.destinationLabel,
            destination: trip.destination,
            expectedArrivalAt: trip.expectedArrivalAt,
            startedAt: trip.startedAt,
            path: [...trip.points],
            watcherNames: [...trip.watcherNames],
          },
          events: [...alert.events],
        });
      }
    }
    return list;
  },
  async staffDecide(alertId, status, justification) {
    await wait();
    const trip = trips.find((item) => item.alerts.some((a) => a.id === alertId));
    const alert = trip?.alerts.find((a) => a.id === alertId);
    if (!trip || !alert || !isOpenAlertStatus(alert.status)) throw new TripMockError('not_found');
    alert.status = status;
    alert.closedAt = status === 'monitoring' ? null : new Date().toISOString();
    alert.events.push({ kind: `staff_${status}`, note: justification, at: new Date().toISOString(), name: 'Equipe' });
  },
};

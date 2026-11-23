import { getSessionUser } from '@/lib/session';
import type { CircleRepository } from '@/services/circle/circle.repository';
import type { CircleMember, Trip } from '@/services/circle/circle.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MINUTE = 60 * 1000;

/** Código aceito pelo mock para entrar num círculo. */
export const MOCK_CIRCLE_CODE = 'FAMI2345';

function apiError(status: number, field: string, code: string): Error {
  const error = new Error(code) as Error & { isAxiosError: boolean; response: unknown; toJSON: () => object };
  error.isAxiosError = true;
  error.response = { status, data: { message: 'validation_failed', errors: [{ field, error: code }] } };
  error.toJSON = () => ({});
  return error;
}

let members: CircleMember[] = [
  { userId: 'mock-mae', name: 'Maria (mãe)', since: new Date(Date.now() - 20 * 86400000).toISOString() },
];
let myTrip: Trip | null = null;

/** Trajeto de alguém do círculo, para ver a tela de acompanhar. */
function memberTrip(): Trip {
  const started = Date.now() - 12 * MINUTE;
  return {
    id: '901',
    userId: 'mock-mae',
    name: 'Maria (mãe)',
    destination: 'Casa',
    startedAt: new Date(started).toISOString(),
    expectedArrivalAt: new Date(started + 30 * MINUTE).toISOString(),
    endedAt: null,
    status: 'active',
    overdue: false,
    lastLatitude: -19.9265,
    lastLongitude: -43.9395,
    lastPointAt: new Date(Date.now() - MINUTE).toISOString(),
    route: [
      { latitude: -19.9191, longitude: -43.9386 },
      { latitude: -19.9221, longitude: -43.9389 },
      { latitude: -19.9248, longitude: -43.9392 },
      { latitude: -19.9265, longitude: -43.9395 },
    ],
    mine: false,
  };
}

function requireMine(id: string): Trip {
  if (!myTrip || myTrip.id !== id || myTrip.status !== 'active') throw apiError(404, 'trip', 'not_found');
  return myTrip;
}

export const circleMockRepository: CircleRepository = {
  async getCircle() {
    await delay(250);
    return { members: members.map((member) => ({ ...member })), maxMembers: 10 };
  },

  async createInvite() {
    await delay(250);
    return { code: MOCK_CIRCLE_CODE, expiresAt: new Date(Date.now() + 24 * 60 * MINUTE).toISOString() };
  },

  async join(code) {
    await delay(300);
    if (code.replace(/[^a-z0-9]/gi, '').toUpperCase() !== MOCK_CIRCLE_CODE) {
      throw apiError(400, 'code', 'invalid_or_expired');
    }
    const member = { userId: 'mock-irmao', name: 'João (irmão)', since: new Date().toISOString() };
    if (members.some((item) => item.userId === member.userId)) throw apiError(409, 'code', 'already_registered');
    members = [...members, member];
    return { ...member };
  },

  async removeMember(userId) {
    await delay(200);
    members = members.filter((member) => member.userId !== userId);
  },

  async startTrip(payload) {
    await delay(300);
    if (members.length === 0) throw apiError(400, 'circle', 'not_available');
    const now = Date.now();
    const first =
      payload.latitude != null && payload.longitude != null
        ? [{ latitude: payload.latitude, longitude: payload.longitude, recordedAt: new Date(now).toISOString() }]
        : [];
    myTrip = {
      id: String(now).slice(-8),
      userId: getSessionUser()?.id ?? 'mock-user-1',
      name: getSessionUser()?.name ?? 'Você',
      destination: payload.destination.trim(),
      startedAt: new Date(now).toISOString(),
      expectedArrivalAt: new Date(now + payload.durationMinutes * MINUTE).toISOString(),
      endedAt: null,
      status: 'active',
      overdue: false,
      lastLatitude: first[0]?.latitude ?? null,
      lastLongitude: first[0]?.longitude ?? null,
      lastPointAt: first[0]?.recordedAt ?? null,
      route: first,
      mine: true,
    };
    return { ...myTrip };
  },

  async myTrip() {
    await delay(200);
    return myTrip && myTrip.status === 'active' ? { ...myTrip } : null;
  },

  async circleTrips() {
    await delay(250);
    return members.some((member) => member.userId === 'mock-mae') ? [memberTrip()] : [];
  },

  async getTrip(id) {
    await delay(200);
    if (myTrip && myTrip.id === id) return { ...myTrip };
    if (id === '901' && members.some((member) => member.userId === 'mock-mae')) return memberTrip();
    throw apiError(404, 'trip', 'not_found');
  },

  async addPoints(id, points) {
    await delay(100);
    const trip = requireMine(id);
    const last = points[points.length - 1];
    myTrip = {
      ...trip,
      route: [...trip.route, ...points],
      lastLatitude: last?.latitude ?? trip.lastLatitude,
      lastLongitude: last?.longitude ?? trip.lastLongitude,
      lastPointAt: last ? new Date().toISOString() : trip.lastPointAt,
    };
    return { ...myTrip };
  },

  async arrive(id) {
    await delay(250);
    const trip = requireMine(id);
    myTrip = { ...trip, status: 'arrived', endedAt: new Date().toISOString(), route: [] };
    return { ...myTrip };
  },

  async cancel(id) {
    await delay(250);
    const trip = requireMine(id);
    myTrip = { ...trip, status: 'cancelled', endedAt: new Date().toISOString(), route: [] };
    return { ...myTrip };
  },
};

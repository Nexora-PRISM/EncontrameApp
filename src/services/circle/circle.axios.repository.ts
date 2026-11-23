import { api } from '@/lib/axios';
import type { CircleRepository } from '@/services/circle/circle.repository';
import type { CircleMember, Trip, TripPoint, TripStatus } from '@/services/circle/circle.types';

interface ApiMember {
  userId?: string | number;
  name?: string;
  since?: string;
}

interface ApiPoint {
  latitude?: number | string;
  longitude?: number | string;
  recordedAt?: string | null;
}

interface ApiTrip {
  id?: string | number;
  userId?: string | number;
  name?: string;
  destination?: string;
  startedAt?: string;
  expectedArrivalAt?: string;
  endedAt?: string | null;
  status?: string;
  overdue?: boolean;
  lastLatitude?: number | string | null;
  lastLongitude?: number | string | null;
  lastPointAt?: string | null;
  route?: ApiPoint[];
  mine?: boolean;
}

const STATUSES: readonly TripStatus[] = ['active', 'arrived', 'cancelled', 'expired'];

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function mapMember(data: ApiMember): CircleMember {
  return { userId: String(data.userId ?? ''), name: data.name ?? '', since: data.since ?? '' };
}

export function mapTrip(data: ApiTrip): Trip {
  const status = (data.status ?? '').toLowerCase() as TripStatus;
  return {
    id: String(data.id ?? ''),
    userId: String(data.userId ?? ''),
    name: data.name ?? '',
    destination: data.destination ?? '',
    startedAt: data.startedAt ?? '',
    expectedArrivalAt: data.expectedArrivalAt ?? '',
    endedAt: data.endedAt ?? null,
    status: STATUSES.includes(status) ? status : 'active',
    overdue: Boolean(data.overdue),
    lastLatitude: toNumber(data.lastLatitude),
    lastLongitude: toNumber(data.lastLongitude),
    lastPointAt: data.lastPointAt ?? null,
    route: (data.route ?? [])
      .map((point) => ({
        latitude: toNumber(point.latitude),
        longitude: toNumber(point.longitude),
        recordedAt: point.recordedAt ?? undefined,
      }))
      .filter((point): point is TripPoint => point.latitude != null && point.longitude != null),
    mine: Boolean(data.mine),
  };
}

export const circleAxiosRepository: CircleRepository = {
  async getCircle() {
    const { data } = await api.get<{ members?: ApiMember[]; maxMembers?: number }>('/Circle');
    return { members: (data?.members ?? []).map(mapMember), maxMembers: Number(data?.maxMembers ?? 10) };
  },

  async createInvite() {
    const { data } = await api.post<{ code?: string; expiresAt?: string }>('/Circle/invite');
    return { code: data?.code ?? '', expiresAt: data?.expiresAt ?? '' };
  },

  async join(code) {
    const { data } = await api.post<ApiMember>('/Circle/join', { code });
    return mapMember(data);
  },

  async removeMember(userId) {
    await api.delete(`/Circle/members/${encodeURIComponent(userId)}`);
  },

  async startTrip(payload) {
    const { data } = await api.post<ApiTrip>('/Trip', payload);
    return mapTrip(data);
  },

  async myTrip() {
    const response = await api.get<ApiTrip | ''>('/Trip/mine');
    if (response.status === 204 || !response.data) return null;
    return mapTrip(response.data);
  },

  async circleTrips() {
    const { data } = await api.get<ApiTrip[]>('/Trip/circle');
    return Array.isArray(data) ? data.map(mapTrip) : [];
  },

  async getTrip(id) {
    const { data } = await api.get<ApiTrip>(`/Trip/${encodeURIComponent(id)}`);
    return mapTrip(data);
  },

  async addPoints(id, points) {
    const { data } = await api.post<ApiTrip>(`/Trip/${encodeURIComponent(id)}/points`, { points });
    return mapTrip(data);
  },

  async arrive(id) {
    const { data } = await api.post<ApiTrip>(`/Trip/${encodeURIComponent(id)}/arrived`);
    return mapTrip(data);
  },

  async cancel(id) {
    const { data } = await api.post<ApiTrip>(`/Trip/${encodeURIComponent(id)}/cancel`);
    return mapTrip(data);
  },
};

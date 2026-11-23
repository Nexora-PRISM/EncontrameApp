/** Alguém do círculo familiar (vínculo aceito pelos dois lados). Só nome — sem foto, telefone ou e-mail. */
export interface CircleMember {
  userId: string;
  name: string;
  since: string;
}

export interface FamilyCircle {
  members: CircleMember[];
  maxMembers: number;
}

/** Código de convite: 8 caracteres, vale 24 h e uma vez só. */
export interface CircleInvite {
  code: string;
  expiresAt: string;
}

export interface TripPoint {
  latitude: number;
  longitude: number;
  recordedAt?: string;
}

export type TripStatus = 'active' | 'arrived' | 'cancelled' | 'expired';

/** Trajeto compartilhado com o círculo. Os pontos somem quando termina. */
export interface Trip {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startedAt: string;
  expectedArrivalAt: string;
  endedAt: string | null;
  status: TripStatus;
  overdue: boolean;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastPointAt: string | null;
  route: TripPoint[];
  mine: boolean;
}

export interface StartTripPayload {
  destination: string;
  durationMinutes: number;
  latitude?: number;
  longitude?: number;
}

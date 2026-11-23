import { env } from '@/lib/env';
import { circleAxiosRepository } from '@/services/circle/circle.axios.repository';
import { circleMockRepository } from '@/services/circle/circle.mock.repository';
import type {
  CircleInvite,
  CircleMember,
  FamilyCircle,
  StartTripPayload,
  Trip,
  TripPoint,
} from '@/services/circle/circle.types';

/** Círculo familiar (`/Circle`) e trajetos compartilhados com ele (`/Trip`). */
export interface CircleRepository {
  getCircle(): Promise<FamilyCircle>;
  createInvite(): Promise<CircleInvite>;
  join(code: string): Promise<CircleMember>;
  removeMember(userId: string): Promise<void>;
  startTrip(payload: StartTripPayload): Promise<Trip>;
  /** Trajeto ativo de quem está usando; null quando não há. */
  myTrip(): Promise<Trip | null>;
  circleTrips(): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip>;
  addPoints(id: string, points: TripPoint[]): Promise<Trip>;
  arrive(id: string): Promise<Trip>;
  cancel(id: string): Promise<Trip>;
}

export function getCircleRepository(): CircleRepository {
  return env.useMocks ? circleMockRepository : circleAxiosRepository;
}

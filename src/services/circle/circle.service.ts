import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getCircleRepository } from '@/services/circle/circle.repository';
import type { StartTripPayload, TripPoint } from '@/services/circle/circle.types';

export const circleKeys = {
  circle: ['circle'] as const,
  myTrip: ['trip', 'mine'] as const,
  circleTrips: ['trip', 'circle'] as const,
  trip: (id: string) => ['trip', 'detail', id] as const,
};

export function useCircleQuery(enabled: boolean) {
  return useQuery({
    queryKey: circleKeys.circle,
    queryFn: () => getCircleRepository().getCircle(),
    enabled,
  });
}

export function useCreateInviteMutation() {
  return useMutation({ mutationFn: () => getCircleRepository().createInvite() });
}

export function useJoinCircleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => getCircleRepository().join(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: circleKeys.circle });
      void queryClient.invalidateQueries({ queryKey: circleKeys.circleTrips });
    },
  });
}

export function useRemoveMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => getCircleRepository().removeMember(userId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: circleKeys.circle });
      void queryClient.invalidateQueries({ queryKey: circleKeys.circleTrips });
    },
  });
}

/** Trajeto ativo de quem está usando. Atualiza a cada minuto (o servidor pode encerrar sozinho). */
export function useMyTripQuery(enabled: boolean) {
  return useQuery({
    queryKey: circleKeys.myTrip,
    queryFn: () => getCircleRepository().myTrip(),
    enabled,
    refetchInterval: 60 * 1000,
  });
}

/** Trajetos ativos do círculo. Atualiza a cada 30 s enquanto a tela está aberta. */
export function useCircleTripsQuery(enabled: boolean) {
  return useQuery({
    queryKey: circleKeys.circleTrips,
    queryFn: () => getCircleRepository().circleTrips(),
    enabled,
    refetchInterval: 30 * 1000,
  });
}

export function useTripQuery(id: string, enabled: boolean) {
  return useQuery({
    queryKey: circleKeys.trip(id),
    queryFn: () => getCircleRepository().getTrip(id),
    enabled: enabled && id.length > 0,
    refetchInterval: 30 * 1000,
  });
}

export function useStartTripMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartTripPayload) => getCircleRepository().startTrip(payload),
    onSuccess: (trip) => queryClient.setQueryData(circleKeys.myTrip, trip),
  });
}

export function useAddTripPointsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, points }: { id: string; points: TripPoint[] }) =>
      getCircleRepository().addPoints(id, points),
    onSuccess: (trip) => queryClient.setQueryData(circleKeys.myTrip, trip),
  });
}

export function useEndTripMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, arrived }: { id: string; arrived: boolean }) =>
      arrived ? getCircleRepository().arrive(id) : getCircleRepository().cancel(id),
    onSuccess: () => queryClient.setQueryData(circleKeys.myTrip, null),
  });
}

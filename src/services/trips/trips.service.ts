import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { env } from '@/lib/env';
import { TRIP_POLL_MS } from '@/lib/trip-rules';
import { getTripsRepository } from '@/services/trips/trips.repository';
import type {
  StaffTripAlertDecision,
  TripAlertPayload,
  TripStartPayload,
  TripUpdatePayload,
  TripView,
} from '@/services/trips/trips.types';

export const tripKeys = {
  all: ['trips'] as const,
  contacts: ['trips', 'contacts'] as const,
  invite: (code: string) => ['trips', 'invite', code] as const,
  mine: ['trips', 'mine'] as const,
  watching: ['trips', 'watching'] as const,
  detail: (id: string) => ['trips', 'detail', id] as const,
  staff: (closed: boolean) => ['trips', 'staff', closed ? 'closed' : 'open'] as const,
};

/** Desligado (EXPO_PUBLIC_ENABLE_TRIP_SHARING) ou sem conta, nada é consultado. */
export function useTripContactsQuery(enabled: boolean) {
  return useQuery({
    queryKey: tripKeys.contacts,
    queryFn: () => getTripsRepository().listContacts(),
    enabled: env.tripSharingEnabled && enabled,
  });
}

export function useTripInvitePreviewQuery(code: string | null) {
  return useQuery({
    queryKey: tripKeys.invite(code ?? ''),
    queryFn: () => getTripsRepository().previewInvite(code as string),
    enabled: env.tripSharingEnabled && code != null,
    retry: false,
  });
}

export function useMyTripsQuery(enabled: boolean) {
  return useQuery({
    queryKey: tripKeys.mine,
    queryFn: () => getTripsRepository().listMine(),
    enabled: env.tripSharingEnabled && enabled,
    refetchInterval: TRIP_POLL_MS * 2,
  });
}

export function useWatchingTripsQuery(enabled: boolean) {
  return useQuery({
    queryKey: tripKeys.watching,
    queryFn: () => getTripsRepository().listWatching(),
    enabled: env.tripSharingEnabled && enabled,
    refetchInterval: TRIP_POLL_MS * 2,
  });
}

/** Trajeto aberto na tela: atualiza a cada 30 s (não há servidor de tempo real, de propósito: sem custo extra). */
export function useTripQuery(id: string | null) {
  return useQuery({
    queryKey: tripKeys.detail(id ?? ''),
    queryFn: () => getTripsRepository().get(id as string),
    enabled: env.tripSharingEnabled && id != null,
    refetchInterval: TRIP_POLL_MS,
    retry: false,
  });
}

export function useStaffTripAlertsQuery(enabled: boolean, closed: boolean) {
  return useQuery({
    queryKey: tripKeys.staff(closed),
    queryFn: () => getTripsRepository().staffList(closed),
    enabled: env.tripSharingEnabled && enabled,
    refetchInterval: TRIP_POLL_MS * 2,
  });
}

export function useTripActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: tripKeys.all });
  /** Resposta com o trajeto atualizado: entra direto no cache (a tela não pisca) e o resto é recarregado. */
  const store = (view: TripView) => {
    queryClient.setQueryData(tripKeys.detail(view.id), view);
    void refresh();
  };
  const repo = getTripsRepository;
  return {
    createInvite: useMutation({ mutationFn: () => repo().createInvite() }),
    acceptInvite: useMutation({ mutationFn: (code: string) => repo().acceptInvite(code), onSuccess: refresh }),
    removeContact: useMutation({ mutationFn: (id: string) => repo().removeContact(id), onSuccess: refresh }),
    start: useMutation({ mutationFn: (payload: TripStartPayload) => repo().start(payload), onSuccess: store }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: TripUpdatePayload }) => repo().update(id, payload),
      onSuccess: store,
    }),
    arrived: useMutation({ mutationFn: (id: string) => repo().arrived(id), onSuccess: store }),
    cancel: useMutation({ mutationFn: (id: string) => repo().cancel(id), onSuccess: store }),
    raiseAlert: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: TripAlertPayload }) => repo().raiseAlert(id, payload),
      onSuccess: refresh,
    }),
    ownerOk: useMutation({ mutationFn: (id: string) => repo().ownerOk(id), onSuccess: store }),
    found: useMutation({ mutationFn: ({ id, note }: { id: string; note: string }) => repo().found(id, note), onSuccess: store }),
    linkCase: useMutation({
      mutationFn: ({ id, missingPersonId }: { id: string; missingPersonId: string }) => repo().linkCase(id, missingPersonId),
      onSuccess: store,
    }),
    staffDecide: useMutation({
      mutationFn: ({ alertId, status, justification }: { alertId: string; status: StaffTripAlertDecision; justification: string }) =>
        repo().staffDecide(alertId, status, justification),
      onSuccess: refresh,
    }),
  };
}

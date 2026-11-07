import { type Href, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { useTicker, useTripFormat } from '@/features/trajeto/use-trip-format';
import { env } from '@/lib/env';
import { useSafeBack } from '@/lib/safe-back';
import { type TrackingMode, getTrackingMode, subscribeTripTracking } from '@/lib/trip-tracking';
import { useMyTripsQuery, useTripContactsQuery, useWatchingTripsQuery } from '@/services/trips/trips.service';
import type { TripWatchingItem } from '@/services/trips/trips.types';

/** Precisa de atenção: atrasado, prazo vencido, sem sinal ou com Sinal de Alerta aberto. */
const needsAttention = (item: TripWatchingItem) =>
  item.phase === 'overdue' || item.phase === 'expired' || item.signal === 'stale' || item.alertStatus != null;

/**
 * "/trajeto": meu trajeto ativo, pessoas compartilhando comigo, alertas de não chegada e contatos.
 * Só a própria pessoa inicia um compartilhamento; ninguém começa a acompanhar outra pessoa sozinho.
 */
export function useTrajetoController() {
  const router = useRouter();
  const goBack = useSafeBack('/inicio' as Href);
  const format = useTripFormat();
  const now = useTicker();
  const enabled = env.tripSharingEnabled;
  const mineQuery = useMyTripsQuery(true);
  const watchingQuery = useWatchingTripsQuery(true);
  const contactsQuery = useTripContactsQuery(true);
  const [tracking, setTracking] = useState<TrackingMode>('none');

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void getTrackingMode()
        .then((mode) => {
          if (!cancelled) setTracking(mode);
        })
        .catch(() => undefined);
    };
    load();
    const unsubscribe = subscribeTripTracking(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const mine = mineQuery.data ?? [];
  const activeTrip = mine.find((trip) => trip.status === 'active') ?? null;
  const history = mine.filter((trip) => trip.status !== 'active').slice(0, 5);
  const watching = useMemo(() => watchingQuery.data ?? [], [watchingQuery.data]);
  const attention = watching.filter(needsAttention);
  const calm = watching.filter((item) => !needsAttention(item));

  return {
    enabled,
    goBack,
    now,
    format,
    loading: mineQuery.isLoading || watchingQuery.isLoading,
    error: mineQuery.isError || watchingQuery.isError,
    retry: () => {
      void mineQuery.refetch();
      void watchingQuery.refetch();
      void contactsQuery.refetch();
    },
    activeTrip,
    tracking,
    history,
    attention,
    calm,
    watchersCount: contactsQuery.data?.watchers.length ?? null,
    sharingWithMeCount: contactsQuery.data?.sharingWithMe.length ?? null,
    startNew: () => router.push('/trajeto/novo' as Href),
    openTrip: (id: string) => router.push(`/trajeto/${id}` as Href),
    goToContacts: () => router.push('/trajeto/contatos' as Href),
    goToSafeArrival: () => router.push('/chegada-segura' as Href),
  };
}

export type TrajetoController = ReturnType<typeof useTrajetoController>;

import { isAxiosError } from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { formatTime, tripMap, useArrivalLabel } from '@/features/trajeto/trajeto.controller';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import { useAccountCapabilitiesQuery } from '@/services/account/account.service';
import { useTripQuery } from '@/services/circle/circle.service';

/**
 * "/trajeto/[id]": acompanhar o trajeto de alguém do círculo (aberto pela lista ou pela notificação).
 * Só quem está no círculo vê, e só enquanto o trajeto está ativo.
 */
export function useTrajetoDetalheController() {
  const t = useT();
  const goBack = useSafeBack('/trajeto');
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' && /^\d{1,12}$/.test(params.id) ? params.id : '';
  const sessionUser = useSessionUser();
  const capabilities = useAccountCapabilitiesQuery();
  const available = capabilities.data?.trips === true;
  const tripQuery = useTripQuery(id, sessionUser != null && available);
  const arrivalLabel = useArrivalLabel();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  const trip = tripQuery.data ?? null;
  const map = useMemo(() => tripMap(trip, trip?.name.trim().charAt(0).toUpperCase() || '?'), [trip]);
  const notFound =
    !id || (tripQuery.isError && isAxiosError(tripQuery.error) && tripQuery.error.response?.status === 404);

  const statusText = !trip
    ? ''
    : trip.status === 'arrived'
      ? t('{name} avisou que chegou às {time}.', { name: trip.name, time: formatTime(trip.endedAt) })
      : trip.status === 'active'
        ? arrivalLabel(trip, now)
        : t('Este trajeto terminou. O caminho foi apagado.');

  return {
    goBack,
    loading: capabilities.isPending || (available && id !== '' && tripQuery.isPending),
    available: capabilities.isSuccess && available,
    notFound,
    loadError: tripQuery.isError && !notFound,
    retry: () => void tripQuery.refetch(),
    trip,
    active: trip?.status === 'active',
    statusText,
    lastPointText: trip?.lastPointAt
      ? t('Última posição recebida às {time}', { time: formatTime(trip.lastPointAt) })
      : t('Ainda sem posição: o círculo vê só o horário previsto.'),
    ...map,
  };
}

export type TrajetoDetalheController = ReturnType<typeof useTrajetoDetalheController>;

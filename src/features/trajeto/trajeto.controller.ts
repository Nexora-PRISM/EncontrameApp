import { type Href, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import type { MapFocus, MapPin, MapPolyline } from '@/components/brand-map';
import { useTripTracker } from '@/features/trajeto/use-trip-tracker';
import { accountFormError } from '@/lib/account-errors';
import { confirmAction, showAlert } from '@/lib/dialog';
import { getActiveLanguage, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import {
  minutesUntil,
  TRIP_DESTINATION_MAX,
  TRIP_DURATION_OPTIONS,
  tripDestinationError,
  tripDurationError,
} from '@/lib/trip-rules';
import { useSessionUser } from '@/lib/use-session-user';
import { retryUserLocation, useUserLocation } from '@/lib/use-user-location';
import { useAccountCapabilitiesQuery } from '@/services/account/account.service';
import {
  useCircleQuery,
  useCircleTripsQuery,
  useEndTripMutation,
  useMyTripQuery,
  useStartTripMutation,
} from '@/services/circle/circle.service';
import type { Trip } from '@/services/circle/circle.types';

const LOCALE = { 'pt-BR': 'pt-BR', en: 'en-US', es: 'es' } as const;

export function formatTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[getActiveLanguage()] ?? 'pt-BR', { timeStyle: 'short' }).format(date);
}

/** "Chega em 12 min" / "Atrasado 5 min" / "Previsto para 18:40". */
export function useArrivalLabel() {
  const t = useT();
  return (trip: Trip, now: number) => {
    const minutes = minutesUntil(trip.expectedArrivalAt, now);
    if (minutes == null) return '';
    if (trip.overdue || minutes < 0) {
      return t('Passou do horário previsto ({time})', { time: formatTime(trip.expectedArrivalAt) });
    }
    if (minutes <= 90) return t('Previsto para chegar em {minutes} min', { minutes });
    return t('Previsto para chegar às {time}', { time: formatTime(trip.expectedArrivalAt) });
  };
}

/** Mapa de um trajeto: caminho (se houver) e o último ponto. */
export function tripMap(trip: Trip | null | undefined, label: string) {
  if (!trip) return { pins: [] as MapPin[], polylines: [] as MapPolyline[], focus: null as MapFocus | null };
  const pins: MapPin[] =
    trip.lastLatitude != null && trip.lastLongitude != null
      ? [{ id: `trip-${trip.id}`, latitude: trip.lastLatitude, longitude: trip.lastLongitude, label, emphasized: true }]
      : [];
  const polylines: MapPolyline[] =
    trip.route.length > 1
      ? [{ id: `trip-${trip.id}-route`, coordinates: trip.route.map(({ latitude, longitude }) => ({ latitude, longitude })) }]
      : [];
  const focus: MapFocus | null = pins[0]
    ? { key: `trip-${trip.id}`, latitude: pins[0].latitude, longitude: pins[0].longitude, zoom: 'street' }
    : null;
  return { pins, polylines, focus };
}

/**
 * "/trajeto": compartilhar um trajeto com o círculo (destino opcional + em quanto tempo chega) e ver os
 * trajetos ativos do círculo. A posição só é enviada com esta tela aberta e o trajeto ligado.
 */
export function useTrajetoController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/perfil');
  const sessionUser = useSessionUser();
  const capabilities = useAccountCapabilitiesQuery();
  const available = capabilities.data?.trips === true && capabilities.data?.familyCircle === true;
  const enabled = sessionUser != null && available;
  const circleQuery = useCircleQuery(enabled);
  const myTripQuery = useMyTripQuery(enabled);
  const circleTripsQuery = useCircleTripsQuery(enabled);
  const startMutation = useStartTripMutation();
  const endMutation = useEndTripMutation();
  const arrivalLabel = useArrivalLabel();
  const { location, denied, unavailable } = useUserLocation();

  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [formError, setFormError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  // Relógio para "previsto para chegar em N min".
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  const myTrip = myTripQuery.data ?? null;
  const activeTripId = myTrip?.status === 'active' ? myTrip.id : null;
  const tracker = useTripTracker(activeTripId, location);

  const myTripView = useMemo(() => {
    if (!myTrip) return null;
    // Enquanto a tela está aberta, o ponto mais recente é a posição deste aparelho.
    const withLive: Trip =
      location && myTrip.status === 'active'
        ? { ...myTrip, lastLatitude: location.latitude, lastLongitude: location.longitude }
        : myTrip;
    return { ...withLive, ...tripMap(withLive, t('Você')) };
  }, [myTrip, location, t]);

  const start = async () => {
    const destinationError = tripDestinationError(destination);
    if (destinationError || tripDurationError(duration)) {
      setFormError(t('Confira o destino (até {max} caracteres).', { max: TRIP_DESTINATION_MAX }));
      return;
    }
    setFormError('');
    try {
      await startMutation.mutateAsync({
        destination: destination.trim(),
        durationMinutes: duration,
        ...(location ? { latitude: location.latitude, longitude: location.longitude } : {}),
      });
      setNow(Date.now());
    } catch (error) {
      const { fields, message } = accountFormError(error);
      setFormError(
        fields.circle === 'not_available'
          ? t('Chame alguém para o seu círculo familiar antes de compartilhar um trajeto.')
          : message || t('Não foi possível começar. Tente de novo.'),
      );
    }
  };

  const end = async (arrived: boolean) => {
    if (!activeTripId) return;
    if (!arrived) {
      const confirmed = await confirmAction({
        title: t('Parar de compartilhar?'),
        message: t('O círculo deixa de ver este trajeto e o caminho é apagado.'),
        confirmLabel: t('Parar'),
      });
      if (!confirmed) return;
    }
    try {
      await endMutation.mutateAsync({ id: activeTripId, arrived });
      setDestination('');
      showAlert(
        arrived ? t('Que bom que chegou') : t('Trajeto encerrado'),
        arrived
          ? t('Avisamos o seu círculo. O caminho foi apagado.')
          : t('O círculo não vê mais este trajeto. O caminho foi apagado.'),
      );
    } catch (error) {
      showAlert(t('Não foi possível encerrar'), accountFormError(error).message || t('Tente novamente em instantes.'));
    }
  };

  const circleTrips = (circleTripsQuery.data ?? []).filter((trip) => !trip.mine && trip.status === 'active');

  return {
    goBack,
    loading: capabilities.isPending || (available && (circleQuery.isPending || myTripQuery.isPending)),
    available: capabilities.isSuccess && available,
    loadError: circleQuery.isError || myTripQuery.isError,
    retry: () => {
      void circleQuery.refetch();
      void myTripQuery.refetch();
    },
    hasCircle: (circleQuery.data?.members.length ?? 0) > 0,
    goToCircle: () => router.push('/circulo' as Href),
    // Formulário
    destination,
    setDestination: (value: string) => {
      setDestination(value);
      setFormError('');
    },
    durationOptions: TRIP_DURATION_OPTIONS.map((minutes) => ({
      minutes,
      label: minutes < 60 ? t('{minutes} min', { minutes }) : t('{hours} h', { hours: minutes / 60 }),
      selected: duration === minutes,
      select: () => setDuration(minutes),
    })),
    formError,
    starting: startMutation.isPending,
    start: () => void start(),
    // Trajeto ativo
    myTrip: myTripView,
    myArrival: myTrip ? arrivalLabel(myTrip, now) : '',
    locationDenied: denied,
    locationUnavailable: unavailable && !location,
    retryLocation: retryUserLocation,
    lastSentLabel: tracker.lastSentAt
      ? t('Posição enviada às {time}', { time: formatTime(new Date(tracker.lastSentAt).toISOString()) })
      : '',
    sendFailing: tracker.failing,
    ending: endMutation.isPending,
    arrive: () => void end(true),
    stop: () => void end(false),
    userLocation: location,
    // Círculo
    circleTrips: circleTrips.map((trip) => ({
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      overdue: trip.overdue,
      arrival: arrivalLabel(trip, now),
      open: () => router.push(`/trajeto/${trip.id}` as Href),
    })),
  };
}

export type TrajetoController = ReturnType<typeof useTrajetoController>;

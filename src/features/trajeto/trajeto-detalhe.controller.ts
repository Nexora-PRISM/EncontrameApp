import * as Linking from 'expo-linking';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import type { MapPin, MapPolyline } from '@/components/brand-map';
import { useTicker, useTripFormat } from '@/features/trajeto/use-trip-format';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { TRIP_ALERT_REASON_LABEL, TRIP_ALERT_STATUS_LABEL, TRIP_PHASE_LABEL, tripEventLabel } from '@/lib/trip-labels';
import {
  TRIP_ARRIVAL_OPTIONS_MIN,
  TRIP_LABEL_MAX,
  arrivalFromNow,
  destinationError,
  extendedArrival,
  isOpenAlertStatus,
  msUntil,
  shortDuration,
} from '@/lib/trip-rules';
import {
  type TrackingMode,
  backgroundTrackingSupported,
  enableBackgroundTracking,
  getActiveTrip,
  getTrackingMode,
  startTripTracking,
  stopTripTracking,
  subscribeTripTracking,
} from '@/lib/trip-tracking';
import { tripErrorCode } from '@/services/trips/trips.errors';
import { useTripActions, useTripQuery } from '@/services/trips/trips.service';
import type { TripView } from '@/services/trips/trips.types';

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const KEEP = 'keep';

/**
 * "/trajeto/[id]": a mesma tela para quem compartilha (dono) e para quem acompanha (contato escolhido).
 * Dono: localização sendo enviada, quem acompanha, "Sim, cheguei em segurança", "Ainda estou em deslocamento",
 * mudar destino, encerrar e "Estou bem". Contato: última localização com o horário real, avisos de atraso e de
 * falta de sinal, e o Sinal de Alerta quando há motivo. Nada aqui diz que a pessoa desapareceu.
 */
export function useTrajetoDetalheController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/trajeto' as Href);
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const raw = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = raw && ID_PATTERN.test(raw) ? raw : null;
  const query = useTripQuery(id);
  const actions = useTripActions();
  const format = useTripFormat();
  const now = useTicker();
  const trip: TripView | null = query.data ?? null;
  const isOwner = trip?.role === 'owner';

  const [tracking, setTracking] = useState<TrackingMode>('none');
  const [localTripId, setLocalTripId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newDestination, setNewDestination] = useState('');
  const [newArrival, setNewArrival] = useState(KEEP);
  const [destinationProblem, setDestinationProblem] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void Promise.all([getTrackingMode(), getActiveTrip()])
        .then(([mode, ref]) => {
          if (cancelled) return;
          setTracking(mode);
          setLocalTripId(ref?.tripId ?? null);
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

  // Encerrado no servidor (chegou, encerrou em outro aparelho ou prazo): este aparelho para de enviar na hora.
  const endedHere = trip != null && trip.role === 'owner' && trip.status !== 'active' && localTripId === trip.id;
  useEffect(() => {
    if (endedHere) void stopTripTracking();
  }, [endedHere]);

  const run = (work: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    void work()
      .catch((error: unknown) => {
        const code = tripErrorCode(error);
        if (code === 'offline') showAlert(t('Sem conexão'), t('Nada foi alterado. Confira sua internet e tente de novo.'));
        else if (code === 'not_active') showAlert(t('Este trajeto já foi encerrado'));
        else showAlert(t('Não foi possível concluir'), t('Tente de novo em alguns instantes.'));
        void query.refetch();
      })
      .finally(() => setBusy(false));
  };

  const askBackground = async () => {
    if (!backgroundTrackingSupported()) return;
    const ok = await confirmAction({
      title: t('Enviar também com a tela desligada?'),
      message: t('Para seus contatos verem onde você está com o celular no bolso, permita a localização "o tempo todo" para o Encontra-me. Ela só é usada enquanto este compartilhamento estiver ativo, com um aviso fixo na tela, e para assim que você encerrar ou chegar.'),
      confirmLabel: t('Permitir'),
    });
    if (ok) await enableBackgroundTracking();
  };

  const alertOpen = isOpenAlertStatus(trip?.alert?.status);
  const lastPoint = trip?.lastPoint ?? null;

  const pins: MapPin[] = [];
  if (trip?.destination) pins.push({ id: 'destination', latitude: trip.destination.latitude, longitude: trip.destination.longitude, label: t('Destino') });
  if (lastPoint) pins.push({ id: 'last', latitude: lastPoint.latitude, longitude: lastPoint.longitude, label: t('Última localização'), emphasized: true });
  const polylines: MapPolyline[] =
    trip && trip.path.length > 1 ? [{ id: 'path', coordinates: trip.path.map((p) => ({ latitude: p.latitude, longitude: p.longitude })) }] : [];

  const timing = (() => {
    if (!trip) return '';
    if (trip.phase === 'active') {
      return t('Chegada prevista às {clock} (faltam {time})', {
        clock: format.clock(trip.expectedArrivalAt),
        time: format.duration(msUntil(trip.expectedArrivalAt, now)),
      });
    }
    if (trip.phase === 'overdue') {
      return t('Chegada prevista às {clock}, sem confirmação há {time}', {
        clock: format.clock(trip.expectedArrivalAt),
        time: format.duration(-msUntil(trip.expectedArrivalAt, now)),
      });
    }
    if (trip.phase === 'expired') return t('O compartilhamento acabou às {clock} sem confirmação de chegada.', { clock: format.clock(trip.endedAt ?? trip.shareUntil) });
    if (trip.phase === 'arrived') return t('Chegada confirmada às {clock}.', { clock: format.clock(trip.endedAt ?? trip.expectedArrivalAt) });
    return t('Encerrado às {clock}.', { clock: format.clock(trip.endedAt ?? trip.startedAt) });
  })();

  return {
    enabled: env.tripSharingEnabled,
    goBack,
    now,
    format,
    loading: query.isLoading,
    notFound: id == null || (query.isError && tripErrorCode(query.error) === 'not_found'),
    error: query.isError,
    retry: () => {
      void query.refetch();
    },
    trip,
    isOwner,
    busy,
    phaseLabel: trip ? t(TRIP_PHASE_LABEL[trip.phase]) : '',
    timing,
    pins,
    polylines,
    lastUpdate: lastPoint
      ? t('Última localização {ago} (às {clock})', { ago: format.ago(lastPoint.recordedAt, now), clock: format.clock(lastPoint.recordedAt) })
      : trip?.locationVisible
        ? t('Nenhuma localização recebida ainda.')
        : t('A localização não está mais disponível para você: o compartilhamento terminou.'),
    signalStale: trip?.signal === 'stale' || (trip?.status === 'active' && trip.signal === 'none'),
    alertOpen,
    alertStatusLabel: trip?.alert ? t(TRIP_ALERT_STATUS_LABEL[trip.alert.status]) : '',
    alertReasonLabel: trip?.alert ? t(TRIP_ALERT_REASON_LABEL[trip.alert.reason]) : '',
    canRaiseReasonLabel: trip?.alertReason ? t(TRIP_ALERT_REASON_LABEL[trip.alertReason]) : '',
    events: (trip?.alertEvents ?? []).map((event, index) => ({
      key: `${event.at}-${index}`,
      label: t(tripEventLabel(event.kind)),
      who: event.name,
      when: format.dateTime(event.at),
      note: event.kind === 'raised' || event.kind === 'info' ? null : event.note,
    })),

    // ---------------------------------------------------------------- dono
    tracking,
    sendingFromThisDevice: trip != null && localTripId === trip.id,
    backgroundAvailable: backgroundTrackingSupported(),
    startHere: () => {
      if (!trip) return;
      run(async () => {
        const mode = await startTripTracking({ tripId: trip.id, until: trip.shareUntil });
        if (mode === 'none') {
          showAlert(t('Localização não permitida'), t('Permita a localização do Encontra-me nos ajustes do celular para seus contatos verem onde você está.'));
          return;
        }
        if (mode === 'foreground') await askBackground();
      });
    },
    enableBackground: () => run(askBackground),
    arrived: () => {
      if (!trip) return;
      run(async () => {
        await actions.arrived.mutateAsync(trip.id);
        await stopTripTracking();
        showAlert(t('Que bom que você chegou bem.'), t('O compartilhamento foi encerrado e seus contatos veem no app que você chegou.'));
      });
    },
    extend: () => {
      if (!trip) return;
      const next = extendedArrival(trip, new Date());
      if (!next) {
        showAlert(t('Limite de 12 horas'), t('Este compartilhamento não pode passar de 12 horas. Encerre e comece outro, se precisar.'));
        return;
      }
      run(async () => {
        await actions.update.mutateAsync({ id: trip.id, payload: { expectedArrivalAt: next } });
        showAlert(t('Previsão atualizada'), t('Nova chegada prevista às {clock}.', { clock: format.clock(next) }));
      });
    },
    editing,
    startEditing: () => {
      setNewDestination(trip?.destinationLabel ?? '');
      setNewArrival(KEEP);
      setDestinationProblem(undefined);
      setEditing(true);
    },
    stopEditing: () => setEditing(false),
    newDestination,
    setNewDestination: (value: string) => {
      setNewDestination(value.slice(0, TRIP_LABEL_MAX));
      setDestinationProblem(undefined);
    },
    newArrival,
    setNewArrival,
    newArrivalOptions: [
      { value: KEEP, label: t('Manter') },
      ...TRIP_ARRIVAL_OPTIONS_MIN.map((value) => ({ value: String(value), label: shortDuration(value) })),
    ],
    destinationProblem,
    saveDestination: () => {
      if (!trip) return;
      const problem = destinationError(newDestination);
      if (problem) {
        setDestinationProblem(problem === 'too_long' ? t('Texto muito longo.') : t('Escreva o novo destino.'));
        return;
      }
      const changed = newDestination.trim() !== trip.destinationLabel;
      const arrival = newArrival === KEEP ? null : arrivalFromNow(trip, new Date(), Number(newArrival));
      if (newArrival !== KEEP && !arrival) {
        showAlert(t('Limite de 12 horas'), t('Este compartilhamento não pode passar de 12 horas. Encerre e comece outro, se precisar.'));
        return;
      }
      if (!changed && !arrival) {
        setEditing(false);
        return;
      }
      run(async () => {
        await actions.update.mutateAsync({
          id: trip.id,
          payload: {
            ...(changed ? { destinationLabel: newDestination.trim(), destination: null } : {}),
            ...(arrival ? { expectedArrivalAt: arrival } : {}),
          },
        });
        setEditing(false);
        showAlert(t('Trajeto atualizado'), t('Seus contatos veem o novo destino e o novo horário.'));
      });
    },
    cancel: () => {
      if (!trip) return;
      void (async () => {
        const ok = await confirmAction({
          title: t('Encerrar o compartilhamento?'),
          message: t('Seus contatos deixam de ver sua localização na hora e são avisados de que você encerrou.'),
          confirmLabel: t('Encerrar'),
        });
        if (!ok) return;
        run(async () => {
          await actions.cancel.mutateAsync(trip.id);
          await stopTripTracking();
        });
      })();
    },
    ownerOk: () => {
      if (!trip) return;
      run(async () => {
        await actions.ownerOk.mutateAsync(trip.id);
        showAlert(t('Avisamos que você está bem'), t('O Sinal de Alerta foi encerrado. Seus contatos e a equipe veem isso no app.'));
      });
    },

    // ---------------------------------------------------------------- contato
    otherWatchersLabel:
      trip && !isOwner && trip.otherWatchersCount != null && trip.otherWatchersCount > 0
        ? t('Outras {count} pessoas também acompanham.', { count: trip.otherWatchersCount })
        : '',
    goToAlert: () => {
      if (trip) router.push(`/trajeto/${trip.id}/alerta` as Href);
    },
    markFound: () => {
      if (!trip) return;
      void (async () => {
        const ok = await confirmAction({
          title: t('A pessoa foi localizada?'),
          message: t('O Sinal de Alerta é encerrado e a equipe e os outros contatos veem isso no app.'),
          confirmLabel: t('Sim, foi localizada'),
        });
        if (!ok) return;
        run(async () => {
          await actions.found.mutateAsync({ id: trip.id, note: '' });
        });
      })();
    },
    registerCase: () => {
      if (trip) router.push({ pathname: '/cadastrar-pessoa', params: { trajeto: trip.id } } as Href);
    },
    openInMaps: () => {
      if (!lastPoint) return;
      const url = `https://www.google.com/maps/search/?api=1&query=${lastPoint.latitude},${lastPoint.longitude}`;
      void Linking.openURL(url).catch(() => showAlert(t('Não foi possível abrir o mapa')));
    },
    call190: () => {
      void Linking.openURL('tel:190').catch(() => showAlert(t('Não foi possível abrir o telefone'), t('Ligue 190 pelo telefone do aparelho.')));
    },
  };
}

export type TrajetoDetalheController = ReturnType<typeof useTrajetoDetalheController>;

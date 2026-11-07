import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import type { MapPin, MapPolyline } from '@/components/brand-map';
import { useJustification } from '@/features/equipe/use-justification';
import { useTripFormat } from '@/features/trajeto/use-trip-format';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { TRIP_ALERT_REASON_LABEL, TRIP_ALERT_STATUS_LABEL, TRIP_PHASE_LABEL, tripEventLabel } from '@/lib/trip-labels';
import { useIsStaffQuery } from '@/services/team/team.service';
import { useStaffTripAlertsQuery, useTripActions } from '@/services/trips/trips.service';
import type { StaffTripAlert, StaffTripAlertDecision } from '@/services/trips/trips.types';

/**
 * "/equipe/trajetos": Sinais de Alerta de trajeto. A equipe vê quem acionou, a tentativa de contato, a última
 * localização com o horário, o trajeto e o histórico; decide com justificativa (acompanhando, localizada ou sem
 * fundamento). Nada é publicado daqui: um caso público só nasce do cadastro normal, que passa pela moderação.
 */
export function useTripAlertsController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/equipe' as Href);
  const staffQuery = useIsStaffQuery();
  const isStaff = staffQuery.data === true;
  const [closed, setClosed] = useState(false);
  const listQuery = useStaffTripAlertsQuery(isStaff, closed);
  const actions = useTripActions();
  const justification = useJustification();
  const format = useTripFormat();

  const decide = (alert: StaffTripAlert, status: StaffTripAlertDecision) => {
    const reason = justification.take();
    if (!reason) return;
    void (async () => {
      const ok = await confirmAction({
        title:
          status === 'monitoring'
            ? t('Marcar como em acompanhamento?')
            : status === 'found'
              ? t('Encerrar: pessoa localizada?')
              : t('Encerrar como sem fundamento?'),
        message: t('A pessoa e os contatos veem a decisão no app. A justificativa fica registrada.'),
        confirmLabel: t('Confirmar'),
      });
      if (!ok) return;
      try {
        await actions.staffDecide.mutateAsync({ alertId: alert.id, status, justification: reason });
        justification.clear();
      } catch {
        showAlert(t('Não foi possível concluir'), t('Tente de novo em alguns instantes.'));
      }
    })();
  };

  return {
    enabled: env.tripSharingEnabled,
    goBack,
    demo: env.useMocks,
    checking: staffQuery.isLoading,
    checkFailed: staffQuery.isError,
    isStaff,
    retry: () => {
      void staffQuery.refetch();
      void listQuery.refetch();
    },
    closed,
    setClosed: (value: string) => setClosed(value === 'closed'),
    filterOptions: [
      { value: 'open', label: t('Abertos') },
      { value: 'closed', label: t('Encerrados') },
    ],
    loading: listQuery.isLoading,
    error: listQuery.isError,
    alerts: listQuery.data ?? [],
    justification,
    busy: actions.staffDecide.isPending,
    statusLabel: (alert: StaffTripAlert) => t(TRIP_ALERT_STATUS_LABEL[alert.status]),
    reasonLabel: (alert: StaffTripAlert) => t(TRIP_ALERT_REASON_LABEL[alert.reason]),
    phaseLabel: (alert: StaffTripAlert) => (alert.trip ? t(TRIP_PHASE_LABEL[alert.trip.phase]) : ''),
    dateTime: format.dateTime,
    eventLabel: (kind: string) => t(tripEventLabel(kind)),
    mapPins: (alert: StaffTripAlert): MapPin[] => {
      const pins: MapPin[] = [];
      if (alert.trip?.destination) pins.push({ id: 'destination', ...alert.trip.destination, label: t('Destino') });
      if (alert.lastPoint) pins.push({ id: 'last', latitude: alert.lastPoint.latitude, longitude: alert.lastPoint.longitude, label: t('Última localização'), emphasized: true });
      return pins;
    },
    mapLines: (alert: StaffTripAlert): MapPolyline[] =>
      alert.trip && alert.trip.path.length > 1
        ? [{ id: 'path', coordinates: alert.trip.path.map((p) => ({ latitude: p.latitude, longitude: p.longitude })) }]
        : [],
    isOpen: (alert: StaffTripAlert) => alert.status === 'open' || alert.status === 'monitoring',
    monitor: (alert: StaffTripAlert) => decide(alert, 'monitoring'),
    found: (alert: StaffTripAlert) => decide(alert, 'found'),
    unfounded: (alert: StaffTripAlert) => decide(alert, 'unfounded'),
    openCase: (id: string) => router.push(`/equipe/caso/${encodeURIComponent(id)}` as Href),
  };
}

export type TripAlertsController = ReturnType<typeof useTripAlertsController>;

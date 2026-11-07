import * as Location from 'expo-location';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { geocodeAddress } from '@/lib/geocode';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import {
  TRIP_ARRIVAL_OPTIONS_MIN,
  TRIP_DEFAULT_ARRIVAL_MIN,
  TRIP_DEFAULT_TOLERANCE_MIN,
  TRIP_LABEL_MAX,
  TRIP_MAX_WATCHERS,
  TRIP_TOLERANCE_OPTIONS_MIN,
  type TripFormCode,
  shortDuration,
  validateTripForm,
} from '@/lib/trip-rules';
import {
  backgroundTrackingSupported,
  enableBackgroundTracking,
  startTripTracking,
  type TrackingMode,
} from '@/lib/trip-tracking';
import { enableTripNotifications } from '@/services/notifications/notifications.service';
import { tripErrorCode } from '@/services/trips/trips.errors';
import { useMyTripsQuery, useTripActions, useTripContactsQuery } from '@/services/trips/trips.service';
import type { TripCoords } from '@/services/trips/trips.types';

type Errors = Partial<Record<'originLabel' | 'destinationLabel' | 'contactIds' | 'consent', string>>;

/**
 * "/trajeto/novo": origem, destino, previsão, tolerância, quem acompanha e o consentimento. Ao começar, o app pede a
 * localização com o app aberto e, à parte e explicando o motivo, a localização com a tela desligada.
 */
export function useTrajetoNovoController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/trajeto' as Href);
  const contactsQuery = useTripContactsQuery(true);
  const mineQuery = useMyTripsQuery(true);
  const actions = useTripActions();

  const [originLabel, setOriginLabel] = useState('');
  const [origin, setOrigin] = useState<TripCoords | null>(null);
  const [destinationLabel, setDestinationLabel] = useState('');
  const [destination, setDestination] = useState<TripCoords | null>(null);
  const [arrivalMinutes, setArrivalMinutes] = useState(String(TRIP_DEFAULT_ARRIVAL_MIN));
  const [toleranceMinutes, setToleranceMinutes] = useState(String(TRIP_DEFAULT_TOLERANCE_MIN));
  const [contactIds, setContactIds] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [locating, setLocating] = useState<'origin' | 'destination' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const labelMessage = (code: TripFormCode | undefined) =>
    code === 'required' ? t('Preencha este campo.') : code === 'too_short' ? t('Escreva pelo menos 2 letras.') : code === 'too_long' ? t('Texto muito longo.') : undefined;

  const markCurrentLocation = () => {
    if (locating) return;
    setLocating('origin');
    void (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          showAlert(t('Localização não permitida'), t('Escreva o ponto de partida. Você pode permitir a localização depois, nos ajustes do celular.'));
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setOrigin({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        if (!originLabel.trim()) setOriginLabel(t('Minha localização atual'));
      } catch {
        showAlert(t('Não foi possível obter sua localização'), t('Escreva o ponto de partida.'));
      } finally {
        setLocating(null);
      }
    })();
  };

  const findDestination = () => {
    if (locating || destinationLabel.trim().length < 3) return;
    setLocating('destination');
    void (async () => {
      try {
        const result = await geocodeAddress(destinationLabel.trim());
        if (result) setDestination({ latitude: result.latitude, longitude: result.longitude });
        else showAlert(t('Endereço não encontrado no mapa'), t('Tudo bem: o trajeto funciona só com o nome do destino.'));
      } catch {
        showAlert(t('Endereço não encontrado no mapa'), t('Tudo bem: o trajeto funciona só com o nome do destino.'));
      } finally {
        setLocating(null);
      }
    })();
  };

  const toggleContact = (id: string) => {
    setContactIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (current.length >= TRIP_MAX_WATCHERS) {
        showAlert(t('Até 5 contatos'), t('Escolha no máximo 5 pessoas para acompanhar este trajeto.'));
        return current;
      }
      return [...current, id];
    });
    if (errors.contactIds) setErrors((current) => ({ ...current, contactIds: undefined }));
  };

  /** Depois de começar: avisos e, se o build permitir, o envio com a tela desligada (sempre perguntando antes). */
  const afterStart = async (tripId: string, until: string) => {
    await enableTripNotifications();
    const mode: TrackingMode = await startTripTracking({ tripId, until });
    if (mode === 'none') {
      showAlert(
        t('Sua localização não está sendo enviada'),
        t('Sem a permissão de localização, seus contatos só veem o horário previsto e o aviso de atraso. Você pode permitir nos ajustes do celular e voltar ao trajeto.'),
      );
    } else if (mode === 'foreground' && backgroundTrackingSupported()) {
      const ok = await confirmAction({
        title: t('Enviar também com a tela desligada?'),
        message: t('Para seus contatos verem onde você está com o celular no bolso, permita a localização "o tempo todo" para o Encontra-me. Ela só é usada enquanto este compartilhamento estiver ativo, com um aviso fixo na tela, e para assim que você encerrar ou chegar.'),
        confirmLabel: t('Permitir'),
      });
      if (ok) await enableBackgroundTracking();
    }
    router.replace(`/trajeto/${tripId}` as Href);
  };

  const submit = () => {
    if (submitting) return;
    const form = {
      originLabel,
      destinationLabel,
      arrivalMinutes: Number(arrivalMinutes),
      toleranceMinutes: Number(toleranceMinutes),
      contactIds,
      consent,
    };
    const problems = validateTripForm(form);
    const next: Errors = {
      originLabel: labelMessage(problems.originLabel),
      destinationLabel: labelMessage(problems.destinationLabel),
      contactIds: problems.contactIds ? t('Escolha pelo menos uma pessoa.') : undefined,
      consent: problems.consent ? t('Para começar, confirme que entendeu como o compartilhamento funciona.') : undefined,
    };
    setErrors(next);
    if (Object.values(problems).some(Boolean)) return;

    setSubmitting(true);
    void (async () => {
      try {
        const view = await actions.start.mutateAsync({
          originLabel: originLabel.trim(),
          origin,
          destinationLabel: destinationLabel.trim(),
          destination,
          expectedArrivalAt: new Date(Date.now() + form.arrivalMinutes * 60 * 1000).toISOString(),
          toleranceMinutes: form.toleranceMinutes,
          contactIds,
          consentAcceptedAt: new Date().toISOString(),
        });
        await afterStart(view.id, view.shareUntil);
      } catch (error) {
        const code = tripErrorCode(error);
        if (code === 'already_active') {
          const active = mineQuery.data?.find((trip) => trip.status === 'active');
          showAlert(t('Você já está compartilhando um trajeto'), t('Encerre o trajeto atual antes de começar outro.'));
          if (active) router.replace(`/trajeto/${active.id}` as Href);
        } else if (code === 'offline') {
          showAlert(t('Sem conexão'), t('O trajeto não foi iniciado. Confira sua internet e tente de novo.'));
        } else {
          showAlert(t('Não foi possível começar'), t('O trajeto não foi iniciado. Confira os dados e tente de novo.'));
        }
      } finally {
        setSubmitting(false);
      }
    })();
  };

  const watchers = contactsQuery.data?.watchers ?? [];

  return {
    enabled: env.tripSharingEnabled,
    goBack,
    loadingContacts: contactsQuery.isLoading,
    contactsError: contactsQuery.isError,
    watchers,
    contactIds,
    toggleContact,
    goToContacts: () => router.push('/trajeto/contatos' as Href),
    originLabel,
    setOriginLabel: (value: string) => {
      setOriginLabel(value.slice(0, TRIP_LABEL_MAX));
      if (errors.originLabel) setErrors((current) => ({ ...current, originLabel: undefined }));
    },
    originMarked: origin != null,
    markCurrentLocation,
    destinationLabel,
    setDestinationLabel: (value: string) => {
      setDestinationLabel(value.slice(0, TRIP_LABEL_MAX));
      setDestination(null);
      if (errors.destinationLabel) setErrors((current) => ({ ...current, destinationLabel: undefined }));
    },
    destination,
    canFindDestination: destinationLabel.trim().length >= 3,
    findDestination,
    clearDestination: () => setDestination(null),
    locating,
    labelMax: TRIP_LABEL_MAX,
    arrivalMinutes,
    setArrivalMinutes,
    arrivalOptions: TRIP_ARRIVAL_OPTIONS_MIN.map((value) => ({ value: String(value), label: shortDuration(value) })),
    toleranceMinutes,
    setToleranceMinutes,
    toleranceOptions: TRIP_TOLERANCE_OPTIONS_MIN.map((value) => ({ value: String(value), label: `${value} min` })),
    consent,
    toggleConsent: () => {
      setConsent((value) => !value);
      if (errors.consent) setErrors((current) => ({ ...current, consent: undefined }));
    },
    errors,
    submitting,
    submit,
  };
}

export type TrajetoNovoController = ReturnType<typeof useTrajetoNovoController>;

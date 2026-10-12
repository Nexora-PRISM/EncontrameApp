import * as Location from 'expo-location';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { MapPin, MapPolyline } from '@/components/brand-map';
import {
  type CaseFeedbackKind,
  buildCaseFeedbackMessage,
} from '@/features/pessoa-detalhe/case-feedback';
import { buildPersonShareMessage } from '@/features/pessoa-detalhe/person-share';
import { AppInfo } from '@/lib/app-info';
import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { fieldErrorMessage } from '@/lib/error-messages';
import {
  geocodeAddress,
  resolveAddressSuggestion,
  reverseGeocode,
  suggestAddresses,
  type AddressSuggestion,
} from '@/lib/geocode';
import { useT } from '@/lib/i18n';
import { isLocalPersonId } from '@/lib/person-status';
import { getSessionUser } from '@/lib/session';
import { shareText } from '@/lib/share';
import { openSupportEmail } from '@/lib/support';
import { useSessionUser } from '@/lib/use-session-user';
import { useUserLocation } from '@/lib/use-user-location';
import { usePersonQuery, useLastSeenHistoryQuery, useReportLastSeenMutation } from '@/services/people/people.service';
import type { PersonLastSeen } from '@/services/people/people.types';

const SUGGEST_MIN_CHARS = 3;
const SUGGEST_DEBOUNCE_MS = 300;
const HISTORY_PREVIOUS_OPACITY = 0.55;

/** Centraliza dados, avistamento e navegação da tela de detalhe. */
export function usePessoaDetalheController() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');

  const personQuery = usePersonQuery(id);
  const reportMutation = useReportLastSeenMutation(id);
  const { location: userLocation } = useUserLocation();

  const [formOpen, setFormOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [addressError, setAddressError] = useState<string | undefined>();
  const [formMessage, setFormMessage] = useState<string | undefined>();
  const [thanksOpen, setThanksOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const suggestGen = useRef(0);
  const historyQuery = useLastSeenHistoryQuery(id, historyOpen);

  const person = personQuery.data ?? null;
  const sessionUser = useSessionUser();
  const isLocalPerson = isLocalPersonId(id);
  const sightingBlockedMessage = isLocalPerson
    ? sessionUser == null
      ? t('Este cadastro está salvo só neste aparelho. Entre na sua conta para revisar e enviar — depois disso ele pode receber avistamentos.')
      : t('Este cadastro foi feito neste aparelho e ainda não foi enviado. Revise os dados e confirme para enviá-lo pela sua conta.')
    : undefined;

  /** Correção/atualização ou denúncia do caso, pelo e-mail do suporte (sem API de moderação ainda). */
  const sendCaseFeedback = (kind: CaseFeedbackKind) => {
    if (!person || isLocalPerson) return;
    void (async () => {
      const opened = await openSupportEmail({
        topic: kind,
        message: buildCaseFeedbackMessage(kind, { id: person.id, fullName: person.fullName }, t),
        accountEmail: sessionUser?.email,
      });
      if (!opened) {
        showAlert(
          t('Não foi possível abrir o e-mail'),
          t('Escreva para {supportEmail} e informe a identificação do caso: {id}.', { supportEmail: AppInfo.supportEmail, id: person.id }),
        );
      }
    })();
  };

  useEffect(() => {
    if (!formOpen) {
      return;
    }

    const trimmed = address.trim();
    if (coords || trimmed.length < SUGGEST_MIN_CHARS) {
      return;
    }

    const generation = ++suggestGen.current;
    const timer = setTimeout(() => {
      void (async () => {
        setSuggesting(true);
        const items = await suggestAddresses(trimmed);
        if (generation !== suggestGen.current) {
          return;
        }

        setSuggestions(items);
        setSuggesting(false);
      })();
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [address, coords, formOpen]);

  const openSightingForm = () => {
    if (isLocalPersonId(id)) {
      return;
    }

    if (getSessionUser() == null) {
      router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}` } } as Href);
      return;
    }

    setFormOpen(true);
    setFormMessage(undefined);
    setThanksOpen(false);
    setAddressError(undefined);
    setSuggestions([]);
  };

  const useCurrentLocation = () => {
    void (async () => {
      setLocating(true);
      setAddressError(undefined);
      setFormMessage(undefined);
      setSuggestions([]);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddressError(t('Permita o acesso à localização para usar este recurso.'));
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const next = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };
        setCoords(next);
        const label = await reverseGeocode(next.latitude, next.longitude);
        setAddress(label ?? t('Localização atual'));
      } catch {
        setAddressError(t('Não foi possível obter sua localização.'));
      } finally {
        setLocating(false);
      }
    })();
  };

  const pickSuggestion = (suggestion: AddressSuggestion) => {
    void (async () => {
      setAddressError(undefined);
      const resolved = await resolveAddressSuggestion(suggestion);
      if (!resolved) {
        setAddressError(t('Não encontramos esse endereço. Tente outro ou use sua localização.'));
        return;
      }

      suggestGen.current += 1;
      setAddress(resolved.label);
      setCoords({ latitude: resolved.latitude, longitude: resolved.longitude });
      setSuggestions([]);
      setSuggesting(false);
    })();
  };

  const placeSightingOnMap = (latitude: number, longitude: number) => {
    const generation = ++suggestGen.current;
    setCoords({ latitude, longitude });
    setSuggestions([]);
    setSuggesting(false);
    if (addressError) setAddressError(undefined);

    void reverseGeocode(latitude, longitude).then((label) => {
      if (generation !== suggestGen.current) {
        return;
      }
      setAddress(label ?? t('Localização atual'));
    });
  };

  const handlePinDragEnd = (_id: string, latitude: number, longitude: number) => {
    placeSightingOnMap(latitude, longitude);
  };

  const sightingPins: MapPin[] = useMemo(() => {
    if (!coords) {
      return [];
    }

    return [
      {
        id: person?.id ?? 'sighting',
        latitude: coords.latitude,
        longitude: coords.longitude,
        label: person?.nickname ?? person?.fullName,
        photoUri: person?.photoUri,
        draggable: true,
      },
    ];
  }, [coords, person]);

  const historyItems = useMemo(() => {
    if (isLocalPerson) {
      if (!person?.coords) {
        return [];
      }

      return [
        {
          id: `${person.id}-local`,
          location: person.lastSeen ?? person.location,
          city: person.city,
          neighborhood: person.neighborhood,
          state: person.state,
          latitude: person.coords.latitude,
          longitude: person.coords.longitude,
          dtRegistration: person.dtLastSeen ?? new Date().toISOString(),
        } satisfies PersonLastSeen,
      ];
    }

    return [...(historyQuery.data ?? [])].sort((left, right) => {
      const leftTime = new Date(left.dtRegistration).getTime();
      const rightTime = new Date(right.dtRegistration).getTime();
      return leftTime - rightTime;
    });
  }, [historyQuery.data, isLocalPerson, person]);

  const mappedSightings = useMemo(
    () =>
      historyItems.filter(
        (item): item is PersonLastSeen & { latitude: number; longitude: number } =>
          item.latitude != null &&
          item.longitude != null &&
          Number.isFinite(item.latitude) &&
          Number.isFinite(item.longitude),
      ),
    [historyItems],
  );

  const historyPins: MapPin[] = useMemo(() => {
    const lastIndex = mappedSightings.length - 1;
    return mappedSightings.map((item, index) => ({
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      photoUri: person?.photoUri,
      opacity: index === lastIndex ? 1 : HISTORY_PREVIOUS_OPACITY,
      zIndex: index + 1,
      tooltip: {
        title: formatSightingDate(item.dtRegistration),
        subtitle: formatSightingAddress(item) || t('Local não informado'),
      },
    }));
  }, [mappedSightings, person?.photoUri, t]);

  const historyPolylines: MapPolyline[] = useMemo(() => {
    if (mappedSightings.length < 2) {
      return [];
    }

    return [
      {
        id: `${id}-trail`,
        dashed: true,
        coordinates: mappedSightings.map((item) => ({
          latitude: item.latitude,
          longitude: item.longitude,
        })),
      },
    ];
  }, [id, mappedSightings]);

  const submitSighting = () => {
    void (async () => {
      if (isLocalPersonId(id)) {
        return;
      }

      if (getSessionUser() == null) {
        router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}` } } as Href);
        return;
      }

      setAddressError(undefined);
      setFormMessage(undefined);

      let point = coords;
      const trimmed = address.trim();
      if (!point) {
        if (!trimmed) {
          setAddressError(t(fieldErrorMessage('location', 'required')));
          return;
        }

        if (suggestions.length > 0) {
          setAddressError(t('Escolha um endereço da lista.'));
          return;
        }

        point = await geocodeAddress(trimmed);
        if (!point) {
          setAddressError(t('Não encontramos esse endereço. Tente outro ou use sua localização.'));
          return;
        }
      }

      try {
        await reportMutation.mutateAsync({
          location: trimmed || t('Localização atual'),
          latitude: point.latitude,
          longitude: point.longitude,
        });
        setFormOpen(false);
        setAddress('');
        setCoords(null);
        setSuggestions([]);
        setThanksOpen(true);
      } catch {
        setFormMessage(t('Não foi possível registrar o avistamento. Tente novamente.'));
      }
    })();
  };

  return {
    id,
    person,
    loading: personQuery.isLoading,
    notFound: !personQuery.isLoading && (personQuery.isError || person == null),
    formOpen,
    address,
    setAddress: (value: string) => {
      suggestGen.current += 1;
      setAddress(value);
      setCoords(null);
      setSuggestions([]);
      setSuggesting(false);
      if (addressError) setAddressError(undefined);
    },
    suggestions,
    suggesting,
    pickSuggestion,
    addressError,
    formMessage,
    thanksOpen,
    historyOpen,
    locating,
    submitting: reportMutation.isPending,
    historyLoading: historyQuery.isLoading,
    historyError: historyQuery.isError,
    isLocalPerson,
    isLoggedIn: sessionUser != null,
    sightingBlockedMessage,
    /** Abre o formulário preenchido para a pessoa logada revisar e enviar o rascunho local. */
    reviewLocalDraft: () =>
      router.push({ pathname: '/cadastrar-pessoa', params: { rascunho: id } } as Href),
    goToLogin: () => router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}` } } as Href),
    requestCorrection: () => sendCaseFeedback('correcao'),
    /** Divulga o caso publicado pelo compartilhamento do celular (rascunho local não é divulgado). */
    shareCase: () => {
      if (!person || isLocalPerson) return;
      void shareText(buildPersonShareMessage(person, env.webUrl, t), t('Pessoa desaparecida'));
    },
    reportCase: () => sendCaseFeedback('denuncia'),
    sightingPins,
    historyPins,
    historyPolylines,
    userLocation,
    placeSightingOnMap,
    handlePinDragEnd,
    openSightingForm,
    openHistory: () => setHistoryOpen(true),
    closeHistory: () => setHistoryOpen(false),
    useCurrentLocation,
    submitSighting,
    closeThanks: () => setThanksOpen(false),
    goToInicio: () => {
      setThanksOpen(false);
      router.replace('/inicio' as Href);
    },
  };
}

export type PessoaDetalheController = ReturnType<typeof usePessoaDetalheController>;

function formatSightingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatSightingAddress(item: PersonLastSeen) {
  const parts = [item.location, item.neighborhood, item.city, item.state].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.some((existing) => existing.toLowerCase() === part.toLowerCase())) {
      unique.push(part);
    }
  }
  return unique.join(', ');
}

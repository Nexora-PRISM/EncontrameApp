import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { MapPin, MapPolyline } from '@/components/brand-map';
import { buildCaseFeedbackMessage } from '@/features/pessoa-detalhe/case-feedback';
import { buildPersonShareMessage } from '@/features/pessoa-detalhe/person-share';
import { type SightingLocationInput, useSightingReportForm } from '@/features/pessoa-detalhe/sighting-report-form';
import { AppInfo } from '@/lib/app-info';
import { confirmAction, showAlert } from '@/lib/dialog';
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
import { loadNotificationPrefs, saveNotificationPrefs } from '@/lib/notification-prefs';
import { ensureNotificationPermission, localNotificationsSupported } from '@/lib/notifications';
import { isLocalPersonId } from '@/lib/person-status';
import { getSessionUser } from '@/lib/session';
import { shareText } from '@/lib/share';
import { checkSightingRateLimit, rememberSightingSent } from '@/lib/sighting-report';
import { isConfirmedReceipt, retryMinutes } from '@/lib/sighting-report-rules';
import { openSupportEmail } from '@/lib/support';
import { useSessionUser } from '@/lib/use-session-user';
import { useUserLocation } from '@/lib/use-user-location';
import {
  useFollowStatusQuery,
  useLastSeenHistoryQuery,
  usePersonQuery,
  useReportLastSeenMutation,
  useToggleFollowMutation,
} from '@/services/people/people.service';
import { useBlockUserMutation, useReportContentMutation } from '@/services/moderation/moderation.service';
import { syncPushRegistration } from '@/services/notifications/notifications.service';
import type { PersonLastSeen } from '@/services/people/people.types';
import { useSubmitSightingReportMutation } from '@/services/sightings/sightings.service';
import type { SightingLocationSource, SightingReceipt } from '@/services/sightings/sightings.types';

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
  const contentReportMutation = useReportContentMutation();
  const blockMutation = useBlockUserMutation();
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
  /** Relato completo (docs/evolucao): só com EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS; senão, o registro simples de hoje. */
  const reportEnabled = env.sightingReportsEnabled;
  const reportForm = useSightingReportForm();
  const submitReportMutation = useSubmitSightingReportMutation();
  const [locationSource, setLocationSource] = useState<SightingLocationSource>('address');
  const [receipt, setReceipt] = useState<SightingReceipt | null>(null);
  /** Evita dois envios do mesmo relato por toque duplo (a busca do endereço acontece antes do envio). */
  const reportInFlight = useRef(false);
  const historyQuery = useLastSeenHistoryQuery(id, historyOpen);

  const person = personQuery.data ?? null;
  const sessionUser = useSessionUser();
  const isLocalPerson = isLocalPersonId(id);
  // Só no celular, com o recurso ligado e caso já publicado: fora disso o botão não teria efeito.
  const canFollow = env.pushEnabled && localNotificationsSupported() && !isLocalPerson && id.length > 0;
  const followQuery = useFollowStatusQuery(id, canFollow);
  const followMutation = useToggleFollowMutation(id);
  const following = followQuery.data === true;
  const sightingBlockedMessage = isLocalPerson
    ? sessionUser == null
      ? t('Este cadastro está salvo só neste aparelho. Entre na sua conta para revisar e enviar — depois disso ele pode receber avistamentos.')
      : t('Este cadastro foi feito neste aparelho e ainda não foi enviado. Revise os dados e confirme para enviá-lo pela sua conta.')
    : undefined;

  /** Correção do caso continua por e-mail: não há API de edição. */
  const requestCorrection = () => {
    if (!person || isLocalPerson) return;
    void (async () => {
      const opened = await openSupportEmail({
        topic: 'correcao',
        message: buildCaseFeedbackMessage('correcao', { id: person.id, fullName: person.fullName }, t),
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

  const reportCase = () => {
    if (!person || isLocalPerson) return;
    if (sessionUser == null) {
      showAlert(t('Entre na sua conta'), t('Para denunciar um cadastro, entre na sua conta.'));
      router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}` } } as Href);
      return;
    }
    void (async () => {
      try {
        await contentReportMutation.mutateAsync({
          targetType: 'MissingPerson',
          targetId: person.id,
          reason: 'false_info',
        });
        showAlert(t('Denúncia registrada'), t('A equipe pode analisar esta denúncia.'));
      } catch {
        showAlert(t('Não foi possível registrar'), t('Tente de novo em alguns instantes.'));
      }
    })();
  };

  /** Liga ou desliga o "Acompanhar". Ao ligar, pede a permissão de notificação e ativa o tipo de aviso. */
  const toggleFollow = () => {
    if (!canFollow || followMutation.isPending) return;
    if (sessionUser == null) {
      showAlert(t('Entre na sua conta'), t('Para acompanhar um caso, entre na sua conta.'));
      router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}` } } as Href);
      return;
    }
    void (async () => {
      if (following) {
        try {
          await followMutation.mutateAsync(false);
        } catch {
          showAlert(t('Não foi possível parar de acompanhar'), t('Tente de novo em alguns instantes.'));
        }
        return;
      }

      const permission = await ensureNotificationPermission();
      if (permission !== 'granted') {
        const open = await confirmAction({
          title: t('Notificações desligadas'),
          message: t('Para receber as novidades deste caso, permita as notificações do Encontra-me nos ajustes do celular.'),
          confirmLabel: t('Abrir ajustes'),
        });
        if (open) void Linking.openSettings().catch(() => undefined);
        return;
      }

      try {
        const prefs = await loadNotificationPrefs();
        if (!prefs.followedUpdates) {
          await saveNotificationPrefs({ ...prefs, followedUpdates: true });
        }
        await followMutation.mutateAsync(true);
        await syncPushRegistration().catch(() => undefined);
        showAlert(
          t('Você está acompanhando este caso'),
          t('Avisamos quando ele mudar de situação ou receber um novo avistamento. A notificação pode atrasar.'),
        );
      } catch {
        showAlert(t('Não foi possível acompanhar'), t('Tente de novo em alguns instantes.'));
      }
    })();
  };

  const blockAuthor = () => {
    if (!person?.authorId || isLocalPerson) return;
    if (sessionUser == null) {
      showAlert(t('Entre na sua conta'), t('Para bloquear quem publicou, entre na sua conta.'));
      router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}` } } as Href);
      return;
    }
    if (sessionUser.id === person.authorId) return;
    void (async () => {
      const confirmed = await confirmAction({
        title: t('Bloquear quem publicou?'),
        message: t('Você deixa de ver os cadastros e as mensagens desta conta.'),
        confirmLabel: t('Bloquear'),
      });
      if (!confirmed || !person.authorId) return;
      try {
        await blockMutation.mutateAsync(person.authorId);
        showAlert(t('Pessoa bloqueada'), t('O conteúdo desta conta saiu da sua lista.'));
        router.back();
      } catch {
        showAlert(t('Não foi possível bloquear'), t('Tente de novo em alguns instantes.'));
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
    setReceipt(null);
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
        setLocationSource('gps');
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
      setLocationSource('address');
      setSuggestions([]);
      setSuggesting(false);
    })();
  };

  const placeSightingOnMap = (latitude: number, longitude: number) => {
    const generation = ++suggestGen.current;
    setCoords({ latitude, longitude });
    setLocationSource('map');
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

  /** Envia o relato completo. Só diz "recebido" com número e horário devolvidos pelo servidor. */
  const submitFullReport = async (
    location: SightingLocationInput,
    seenAt: string,
  ) => {
    const rate = checkSightingRateLimit(id);
    if (!rate.allowed) {
      setFormMessage(
        t('Você enviou vários relatos sobre este caso há pouco. Para evitar repetições, espere {minutes} min para enviar outro.', {
          minutes: retryMinutes(rate.retryInMs),
        }),
      );
      return;
    }

    const notConfirmed = t('O envio não foi confirmado: seu relato pode não ter chegado. Tente de novo em alguns instantes. Se a pessoa estiver em perigo agora, ligue 190.');
    try {
      const result = await submitReportMutation.mutateAsync(reportForm.toPayload(location, seenAt));
      rememberSightingSent(id);
      if (!isConfirmedReceipt(result)) {
        setFormMessage(notConfirmed);
        return;
      }
      setFormOpen(false);
      setAddress('');
      setCoords(null);
      setSuggestions([]);
      setLocationSource('address');
      reportForm.reset();
      setReceipt(result);
      setThanksOpen(true);
    } catch {
      setFormMessage(notConfirmed);
    }
  };

  const runSubmitSighting = async () => {
    if (isLocalPersonId(id)) {
      return;
    }

    if (getSessionUser() == null) {
      router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}` } } as Href);
      return;
    }

    setAddressError(undefined);
    setFormMessage(undefined);
    // No relato completo, valida os outros campos antes, para mostrar todos os erros de uma vez.
    const seenAt = reportEnabled ? reportForm.validate() : null;

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

    if (reportEnabled) {
      if (!seenAt) {
        setFormMessage(t('Confira os campos destacados.'));
        return;
      }
      await submitFullReport(
        {
          personId: id,
          location: trimmed || t('Localização atual'),
          latitude: point.latitude,
          longitude: point.longitude,
          locationSource,
        },
        seenAt,
      );
      return;
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
  };

  const submitSighting = () => {
    if (reportEnabled && reportInFlight.current) return;
    if (reportEnabled) reportInFlight.current = true;
    void (async () => {
      try {
        await runSubmitSighting();
      } finally {
        if (reportEnabled) reportInFlight.current = false;
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
      setLocationSource('address');
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
    submitting: reportEnabled ? submitReportMutation.isPending : reportMutation.isPending,
    reportEnabled,
    report: reportForm,
    receipt,
    /** Abre "Meus relatos" (relatos enviados pela conta e a situação de cada um). */
    goToMyReports: () => {
      setThanksOpen(false);
      router.push('/meus-relatos' as Href);
    },
    historyLoading: historyQuery.isLoading,
    historyError: historyQuery.isError,
    isLocalPerson,
    isLoggedIn: sessionUser != null,
    sightingBlockedMessage,
    /** Abre o formulário preenchido para a pessoa logada revisar e enviar o rascunho local. */
    reviewLocalDraft: () =>
      router.push({ pathname: '/cadastrar-pessoa', params: { rascunho: id } } as Href),
    goToLogin: () => router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}` } } as Href),
    requestCorrection,
    /** Divulga o caso publicado pelo compartilhamento do celular (rascunho local não é divulgado). */
    shareCase: () => {
      if (!person || isLocalPerson) return;
      void shareText(buildPersonShareMessage(person, env.webUrl, t), t('Pessoa desaparecida'));
    },
    reportCase,
    canFollow,
    following,
    followBusy: followMutation.isPending || (canFollow && sessionUser != null && followQuery.isLoading),
    toggleFollow,
    blockAuthor,
    canBlockAuthor:
      sessionUser != null &&
      person?.authorId != null &&
      sessionUser.id !== person.authorId,
    sightingPins,
    historyPins,
    historyPolylines,
    userLocation,
    placeSightingOnMap,
    handlePinDragEnd,
    openSightingForm,
    openHistory: () => setHistoryOpen(true),
    /** Linha do tempo pública do caso (docs/evolucao, etapa 2). */
    openTimeline: () => router.push(`/pessoa/${id}/linha-do-tempo` as Href),
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

import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import type { MapPin } from '@/components/brand-map';
import { buildCarouselPeople } from '@/features/inicio/carousel-people';
import { TUTORIAL_LAST_STEP } from '@/features/inicio/tutorial-steps';
import { completeAppOnboarding, isAppOnboardingComplete } from '@/lib/app-onboarding';
import { useBrand, useBrandTheme } from '@/lib/brand-theme';
import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useI18n, useT } from '@/lib/i18n';
import {
  categoryAgeRange,
  matchesCategory,
  type CategoryFilter,
} from '@/lib/person-category';
import { isPersonSearchingStatus, resolvePersonStatusColor } from '@/lib/person-status';
import { safetyNoteCategoryInfo } from '@/lib/safety-notes';
import { signOut } from '@/lib/sign-out';
import { isSofiaWelcomeComplete } from '@/lib/sofia-prefs';
import { useSplashDone } from '@/lib/splash-state';
import { useSessionUser } from '@/lib/use-session-user';
import { useUserLocation } from '@/lib/use-user-location';
import { useNearbyPeopleQuery, usePeopleSearchQuery, useRecentPeopleQuery } from '@/services/people/people.service';
import type { Person } from '@/services/people/people.types';
import {
  useNearbySafetyNotesQuery,
  useVoteSafetyNoteMutation,
} from '@/services/safety-notes/safety-notes.service';
import type { SafetyNote, SafetyNoteVote } from '@/services/safety-notes/safety-notes.types';
import { useReportContentMutation } from '@/services/moderation/moderation.service';

/** Item tocado no mapa: abre o cartão flutuante em vez de trocar de tela. */
type MapSelection = { kind: 'person'; id: string } | { kind: 'note'; id: string } | null;

/** Iniciais para o avatar (ex.: "Maria Souza" → "MS"). */
function initialsOf(name: string | undefined): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/** Centraliza dados e navegação da tela inicial (dashboard). */
export function useInicioController() {
  const router = useRouter();
  const t = useT();
  const brand = useBrand();
  const sessionUser = useSessionUser();
  const { appearance, setAppearance } = useBrandTheme();
  const { preference: languagePreference, setPreference: setLanguagePreference } = useI18n();
  const { location: userLocation, denied: locationDenied } = useUserLocation();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const peopleQuery = useNearbyPeopleQuery({
    query,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
  });

  const [menuOpen, setMenuOpen] = useState(false);
  /** Filtro por faixa de idade: vale para os alertas e para os pins do mapa. */
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  /** Mapa com imagem de satélite (com nomes de ruas por cima). */
  const [satellite, setSatellite] = useState(false);
  /** Avisos de segurança da comunidade no mapa (camada liga/desliga). */
  const safetyNotesEnabled = env.safetyNotesEnabled;
  const [showSafetyNotes, setShowSafetyNotes] = useState(true);
  const [selection, setSelection] = useState<MapSelection>(null);
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const loggedIn = sessionUser != null;
  /** O passo a passo só aparece depois da abertura (senão o Modal cobriria a logo). */
  const splashDone = useSplashDone();

  // Confere a cada volta ao Início (não só na montagem): "Ver o passo a passo de novo", em
  // Configurações, precisa abrir o tutorial quando a pessoa volta para cá.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void isAppOnboardingComplete().then((done) => {
        if (!cancelled && !done) {
          setOnboardingStep(0);
          setOnboardingVisible(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const people = useMemo(() => peopleQuery.data ?? [], [peopleQuery.data]);
  // Sem busca ativa, o carrossel completa as pessoas próximas com casos recentes.
  const recentQuery = useRecentPeopleQuery(query.trim().length === 0);
  const carouselPeople = useMemo(
    () => (query.trim() ? people : buildCarouselPeople(people, recentQuery.data ?? [])),
    [people, query, recentQuery.data],
  );
  /** Fileira de "Alertas recentes", já com o filtro de idade aplicado. */
  const alertPeople = useMemo(
    () => carouselPeople.filter((person) => matchesCategory(person, categoryFilter)),
    [carouselPeople, categoryFilter],
  );
  const ageRange = categoryAgeRange(categoryFilter);
  const alertsPages = usePeopleSearchQuery({ pageSize: 12, ...ageRange });
  const pagedPeople = useMemo(
    () => alertsPages.data?.pages.flatMap((page) => page.items) ?? [],
    [alertsPages.data],
  );
  /** Lista aberta: quem está na fileira, depois as páginas da busca (sem repetir caso encerrado). */
  const scrollPeople = useMemo(() => {
    const seen = new Set<string>();
    const merged: Person[] = [];
    const push = (person: Person, allowClosed: boolean) => {
      if (seen.has(person.id)) return;
      if (!allowClosed && (person.statusId === 3 || person.statusId === 99)) return;
      if (!matchesCategory(person, categoryFilter)) return;
      seen.add(person.id);
      merged.push(person);
    };
    for (const person of alertPeople) push(person, true);
    for (const person of pagedPeople) push(person, false);
    return merged;
  }, [alertPeople, categoryFilter, pagedPeople]);
  const loadMoreAlerts = () => {
    if (alertsPages.hasNextPage && !alertsPages.isFetchingNextPage) {
      void alertsPages.fetchNextPage();
    }
  };
  const waitingLocation = !locationDenied && userLocation == null;
  const showPeopleSkeleton =
    waitingLocation ||
    peopleQuery.isLoading ||
    peopleQuery.isPlaceholderData ||
    (peopleQuery.isFetching && people.length === 0);

  const notesQuery = useNearbySafetyNotesQuery(
    userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null,
    safetyNotesEnabled && showSafetyNotes,
  );
  const safetyNotes = useMemo<SafetyNote[]>(
    () => (safetyNotesEnabled && showSafetyNotes ? (notesQuery.data ?? []) : []),
    [notesQuery.data, safetyNotesEnabled, showSafetyNotes],
  );
  const voteMutation = useVoteSafetyNoteMutation();
  const reportMutation = useReportContentMutation();

  const personPins: MapPin[] = useMemo(
    () =>
      people.flatMap((person) => {
        if (!person.coords || !matchesCategory(person, categoryFilter)) {
          return [];
        }

        return [
          {
            id: person.id,
            latitude: person.coords.latitude,
            longitude: person.coords.longitude,
            locked: person.restricted,
            photoUri: person.photoUri,
            label: person.nickname ?? person.fullName,
            accentColor: resolvePersonStatusColor(brand, person.statusId, person.statusDescription),
            pulse: isPersonSearchingStatus(person.statusId, person.statusDescription),
            emphasized: selection?.kind === 'person' && selection.id === person.id,
            zIndex: selection?.kind === 'person' && selection.id === person.id ? 20 : 2,
            onPress: () => setSelection({ kind: 'person', id: person.id }),
          },
        ];
      }),
    [brand, categoryFilter, people, selection],
  );

  const notePins: MapPin[] = useMemo(
    () =>
      safetyNotes.map((note) => {
        const info = safetyNoteCategoryInfo(note.category);
        const selected = selection?.kind === 'note' && selection.id === note.id;
        return {
          id: `aviso-${note.id}`,
          latitude: note.latitude,
          longitude: note.longitude,
          variant: 'note' as const,
          icon: info.icon,
          label: t(info.label),
          emphasized: selected,
          zIndex: selected ? 20 : 1,
          onPress: () => setSelection({ kind: 'note', id: note.id }),
        };
      }),
    [safetyNotes, selection, t],
  );

  const pins = useMemo(() => [...notePins, ...personPins], [notePins, personPins]);

  const selectedPerson =
    selection?.kind === 'person'
      ? (people.find((person) => person.id === selection.id) ?? null)
      : null;
  const selectedNote =
    selection?.kind === 'note'
      ? (safetyNotes.find((note) => note.id === selection.id) ?? null)
      : null;

  const clearSelection = () => setSelection(null);

  /** "Continua assim" / "Não está mais assim": exige conta (um voto por pessoa). */
  const voteSafetyNote = (vote: SafetyNoteVote) => {
    if (!selectedNote) return;
    if (!loggedIn) {
      showAlert(
        t('Entre na sua conta'),
        t('Para confirmar ou atualizar um aviso, entre na sua conta. Assim cada pessoa vota uma vez.'),
      );
      router.push({ pathname: '/login', params: { returnTo: '/inicio' } } as Href);
      return;
    }
    voteMutation.mutate({ id: selectedNote.id, vote });
  };

  /** Denúncia gravada na API. Sem conta, o aviso pede login. */
  const reportSafetyNote = () => {
    if (!selectedNote) return;
    if (!loggedIn) {
      showAlert(
        t('Entre na sua conta'),
        t('Para denunciar um aviso, entre na sua conta.'),
      );
      router.push({ pathname: '/login', params: { returnTo: '/inicio' } } as Href);
      return;
    }
    const note = selectedNote;
    void (async () => {
      try {
        await reportMutation.mutateAsync({
          targetType: 'SafetyNote',
          targetId: note.id,
          reason: 'other',
        });
        showAlert(t('Denúncia registrada'), t('A equipe pode analisar esta denúncia.'));
      } catch {
        showAlert(t('Não foi possível registrar'), t('Tente de novo em alguns instantes.'));
      }
    })();
  };

  const closeMenu = () => setMenuOpen(false);

  /** Fecha o menu e navega para a rota escolhida. */
  const goTo = (action: () => void) => {
    closeMenu();
    // No Android, navegar no mesmo instante em que o menu fecha derruba o app.
    setTimeout(action, Platform.OS === 'android' ? 50 : 0);
  };

  const handleSearch = () => {
    setQuery(search.trim());
  };

  const clearSearch = () => {
    setSearch('');
    setQuery('');
  };

  const finishOnboarding = (after?: () => void) => {
    setOnboardingVisible(false);
    void completeAppOnboarding();
    after?.();
  };

  const onboardingContinue = () => {
    setOnboardingStep((current) => Math.min(current + 1, TUTORIAL_LAST_STEP));
  };

  const onboardingBack = () => {
    setOnboardingStep((current) => Math.max(current - 1, 0));
  };

  /** "Pular": fecha o passo a passo em qualquer passo e não mostra de novo sozinho. */
  const onboardingSkip = () => {
    finishOnboarding();
  };

  /** Menu "Como usar o app": abre o passo a passo do começo. */
  const openTutorial = () => {
    closeMenu();
    setOnboardingStep(0);
    setOnboardingVisible(true);
  };

  const onboardingReport = () => {
    finishOnboarding(() => router.push('/pessoas-desaparecidas' as Href));
  };

  const onboardingRegister = () => {
    finishOnboarding(() => router.push('/cadastrar-pessoa'));
  };

  const onboardingExplore = () => {
    finishOnboarding();
  };

  /** Botão "voltar" do Android: volta um passo; no primeiro passo, fecha (o mesmo que "Pular"). */
  const onboardingRequestClose = () => {
    if (onboardingStep > 0) {
      onboardingBack();
      return;
    }

    onboardingSkip();
  };

  const logout = () =>
    goTo(() => {
      void signOut()
        .catch(() => undefined)
        .finally(() => {
          router.replace('/inicio');
        });
    });

  const locationLine = (person: Person) =>
    [person.neighborhood, person.city, person.state].filter(Boolean).join(', ') ||
    person.lastSeen ||
    person.location ||
    '';

  return {
    people,
    carouselPeople,
    alertPeople,
    scrollPeople,
    loadMoreAlerts,
    alertsLoadingMore: alertsPages.isFetchingNextPage,
    pins,
    /** Pessoas no mapa com o filtro atual (sem contar os avisos). */
    personPinsCount: personPins.length,
    categoryFilter,
    setCategoryFilter: (value: CategoryFilter) => {
      setCategoryFilter(value);
      setSelection(null);
    },
    satellite,
    toggleSatellite: () => setSatellite((current) => !current),
    /** Avisos de segurança (só quando o recurso está ligado). */
    safetyNotesEnabled,
    showSafetyNotes,
    toggleSafetyNotes: () => {
      setShowSafetyNotes((current) => !current);
      setSelection(null);
    },
    safetyNotesCount: safetyNotes.length,
    goToNewSafetyNote: () => goTo(() => router.push('/aviso-seguranca' as Href)),
    /** Cartão flutuante do item tocado no mapa. */
    selectedPerson,
    selectedNote,
    hasSelection: selectedPerson != null || selectedNote != null,
    clearSelection,
    voteSafetyNote,
    votingSafetyNote: voteMutation.isPending,
    reportSafetyNote,
    userLocation,
    locationDenied,
    search,
    setSearch,
    handleSearch,
    clearSearch,
    loading: peopleQuery.isLoading || peopleQuery.isFetching,
    showPeopleSkeleton,
    loggedIn,
    /** Iniciais do avatar no canto do Início. */
    userInitials: initialsOf(sessionUser?.name),
    /** Tema do app (Automático / Claro / Escuro) — atalho no menu; também em Configurações. */
    appearance,
    setAppearance,
    /** Idioma (Português / English / Español / Automático) — também em Configurações. */
    languagePreference,
    setLanguagePreference,
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu,
    goToPerson: (personId: string) => router.push(`/pessoa/${personId}` as Href),
    goToChat: () =>
      goTo(() => {
        void isSofiaWelcomeComplete().then((done) => {
          router.push((done ? '/chat' : '/sofia-welcome') as Href);
        });
      }),
    goToTheme: () => goTo(() => router.push('/sofia-theme' as Href)),
    goToSettings: () => goTo(() => router.push('/configuracoes' as Href)),
    goToProfile: () => goTo(() => router.push('/perfil' as Href)),
    goToHelp: () => goTo(() => router.push('/ajuda' as Href)),
    goToGroupChat: () => goTo(() => router.push('/grupo-chat')),
    // Já estamos no Início: só fecha o menu (antes empilhava outra cópia da tela).
    goToHomeFromMenu: closeMenu,
    goToRegisterFromMenu: () => goTo(() => router.push('/cadastrar-pessoa')),
    goToAllPeopleFromMenu: () => goTo(() => router.push('/pessoas-desaparecidas' as Href)),
    goToAllPeople: () => router.push('/pessoas-desaparecidas' as Href),
    goToLogin: () => goTo(() => router.push('/login')),
    goToProfileOrLogin: () =>
      goTo(() => router.push((sessionUser ? '/perfil' : '/login') as Href)),
    logout,
    locationLine,
    onboardingVisible: onboardingVisible && splashDone,
    onboardingStep,
    onboardingContinue,
    onboardingBack,
    onboardingSkip,
    openTutorial,
    onboardingReport,
    onboardingRegister,
    onboardingExplore,
    onboardingRequestClose,
  };
}

export type InicioController = ReturnType<typeof useInicioController>;

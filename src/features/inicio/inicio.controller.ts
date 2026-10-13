import { type Href, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import type { MapPin } from '@/components/brand-map';
import { buildCarouselPeople } from '@/features/inicio/carousel-people';
import { completeAppOnboarding, isAppOnboardingComplete } from '@/lib/app-onboarding';
import { useBrandTheme } from '@/lib/brand-theme';
import { useI18n } from '@/lib/i18n';
import { signOut } from '@/lib/sign-out';
import { isSofiaWelcomeComplete } from '@/lib/sofia-prefs';
import { useSessionUser } from '@/lib/use-session-user';
import { useUserLocation } from '@/lib/use-user-location';
import { useNearbyPeopleQuery, useRecentPeopleQuery } from '@/services/people/people.service';
import type { Person } from '@/services/people/people.types';

const ONBOARDING_LAST_STEP = 2;

/** Centraliza dados e navegação da tela inicial (dashboard). */
export function useInicioController() {
  const router = useRouter();
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
  /** No celular: mapa recolhido mostra a busca e a lista no lugar do carrossel. */
  const [mapCollapsed, setMapCollapsedState] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const loggedIn = sessionUser != null;

  useEffect(() => {
    let cancelled = false;
    void isAppOnboardingComplete().then((done) => {
      if (!cancelled) {
        setOnboardingVisible(!done);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const people = useMemo(() => peopleQuery.data ?? [], [peopleQuery.data]);
  // Sem busca ativa, o carrossel completa as pessoas próximas com casos recentes.
  const recentQuery = useRecentPeopleQuery(query.trim().length === 0);
  const carouselPeople = useMemo(
    () => (query.trim() ? people : buildCarouselPeople(people, recentQuery.data ?? [])),
    [people, query, recentQuery.data],
  );
  const waitingLocation = !locationDenied && userLocation == null;
  const showPeopleSkeleton =
    waitingLocation ||
    peopleQuery.isLoading ||
    peopleQuery.isPlaceholderData ||
    (peopleQuery.isFetching && people.length === 0);

  const pins: MapPin[] = useMemo(
    () =>
      people.flatMap((person) => {
        if (!person.coords) {
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
            onPress: () => router.push(`/pessoa/${person.id}` as Href),
          },
        ];
      }),
    [people, router],
  );

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
    setOnboardingStep((current) => Math.min(current + 1, ONBOARDING_LAST_STEP));
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

  const onboardingRequestClose = () => {
    if (onboardingStep === ONBOARDING_LAST_STEP) {
      onboardingExplore();
      return;
    }

    if (onboardingStep > 0) {
      setOnboardingStep((current) => current - 1);
    }
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
    pins,
    userLocation,
    locationDenied,
    search,
    setSearch,
    handleSearch,
    clearSearch,
    loading: peopleQuery.isLoading || peopleQuery.isFetching,
    showPeopleSkeleton,
    loggedIn,
    /** Tema do app (Automático / Claro / Escuro) — atalho no menu; também em Configurações. */
    appearance,
    setAppearance,
    /** Idioma (Português / English / Español / Automático) — também em Configurações. */
    languagePreference,
    setLanguagePreference,
    mapCollapsed,
    setMapCollapsed: setMapCollapsedState,
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
    goToPetsFromMenu: () => goTo(() => router.push('/pets' as Href)),
    goToPremiumFromMenu: () => goTo(() => router.push('/premium' as Href)),
    goToGroupChat: () => goTo(() => router.push('/grupo-chat')),
    // Já estamos no Início: só fecha o menu (antes empilhava outra cópia da tela).
    goToHomeFromMenu: closeMenu,
    goToRegisterFromMenu: () => goTo(() => router.push('/cadastrar-pessoa')),
    goToAllPeopleFromMenu: () => goTo(() => router.push('/pessoas-desaparecidas' as Href)),
    goToAllPeople: () => router.push('/pessoas-desaparecidas' as Href),
    goToLogin: () => goTo(() => router.push('/login')),
    logout,
    locationLine,
    onboardingVisible,
    onboardingStep,
    onboardingContinue,
    onboardingReport,
    onboardingRegister,
    onboardingExplore,
    onboardingRequestClose,
  };
}

export type InicioController = ReturnType<typeof useInicioController>;

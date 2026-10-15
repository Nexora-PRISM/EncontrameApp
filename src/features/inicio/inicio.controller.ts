import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import type { MapPin } from '@/components/brand-map';
import { buildCarouselPeople } from '@/features/inicio/carousel-people';
import { TUTORIAL_LAST_STEP } from '@/features/inicio/tutorial-steps';
import { completeAppOnboarding, isAppOnboardingComplete } from '@/lib/app-onboarding';
import { useBrand, useBrandTheme } from '@/lib/brand-theme';
import { useI18n } from '@/lib/i18n';
import {
  categoryColor,
  matchesCategory,
  personCategory,
  type CategoryFilter,
} from '@/lib/person-category';
import { signOut } from '@/lib/sign-out';
import { isSofiaWelcomeComplete } from '@/lib/sofia-prefs';
import { useSessionUser } from '@/lib/use-session-user';
import { useUserLocation } from '@/lib/use-user-location';
import { useNearbyPeopleQuery, useRecentPeopleQuery } from '@/services/people/people.service';
import type { Person } from '@/services/people/people.types';

/** Primeiro nome para a saudação ("Olá, Maria"). */
function firstNameOf(name: string | undefined): string {
  return name?.trim().split(/\s+/)[0] ?? '';
}

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
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const loggedIn = sessionUser != null;

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
  /** Cartões de "Alertas recentes", já com o filtro de idade aplicado. */
  const alertPeople = useMemo(
    () => carouselPeople.filter((person) => matchesCategory(person, categoryFilter)),
    [carouselPeople, categoryFilter],
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
        if (!person.coords || !matchesCategory(person, categoryFilter)) {
          return [];
        }

        const category = personCategory(person);
        return [
          {
            id: person.id,
            latitude: person.coords.latitude,
            longitude: person.coords.longitude,
            locked: person.restricted,
            photoUri: person.photoUri,
            label: person.nickname ?? person.fullName,
            // Anel do pin na cor da faixa de idade (sem idade informada, fica branco).
            accentColor: category ? categoryColor(brand, category) : undefined,
            onPress: () => router.push(`/pessoa/${person.id}` as Href),
          },
        ];
      }),
    [brand, categoryFilter, people, router],
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
    setOnboardingStep((current) => Math.min(current + 1, TUTORIAL_LAST_STEP));
  };

  const onboardingBack = () => {
    setOnboardingStep((current) => Math.max(current - 1, 0));
  };

  /** "Pular": fecha o passo a passo em qualquer passo e não mostra de novo sozinho. */
  const onboardingSkip = () => {
    finishOnboarding();
  };

  /** Botão "?" do Início: abre o passo a passo do começo. */
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
    pins,
    categoryFilter,
    setCategoryFilter,
    satellite,
    toggleSatellite: () => setSatellite((current) => !current),
    userLocation,
    locationDenied,
    search,
    setSearch,
    handleSearch,
    clearSearch,
    loading: peopleQuery.isLoading || peopleQuery.isFetching,
    showPeopleSkeleton,
    loggedIn,
    /** Saudação do Início ("Olá, Maria") e iniciais do avatar. */
    userFirstName: firstNameOf(sessionUser?.name),
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
    goToPetsFromMenu: () => goTo(() => router.push('/pets' as Href)),
    goToPremiumFromMenu: () => goTo(() => router.push('/premium' as Href)),
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
    onboardingVisible,
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

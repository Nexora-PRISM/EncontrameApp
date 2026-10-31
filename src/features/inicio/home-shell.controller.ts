import { type Href, usePathname, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Platform } from 'react-native';

import { updateHomeState, useHomeSharedState } from '@/features/inicio/home-shared-state';
import { useBrandTheme } from '@/lib/brand-theme';
import { useI18n } from '@/lib/i18n';
import type { CategoryFilter } from '@/lib/person-category';
import { signOut } from '@/lib/sign-out';
import { isSofiaWelcomeComplete } from '@/lib/sofia-prefs';
import { useSessionUser } from '@/lib/use-session-user';
import { useUserLocation } from '@/lib/use-user-location';
import { useNearbyPeopleQuery } from '@/services/people/people.service';
import type { Person } from '@/services/people/people.types';

/** Iniciais para o avatar (ex.: "Maria Souza" → "MS"). */
function initialsOf(name: string | undefined): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Header, menu e lista de pessoas próximas do Início. Na web em tela larga eles ficam fixos
 * no layout raiz; a tela do Início usa o mesmo controller e acrescenta o mapa.
 */
export function useHomeShellController() {
  const router = useRouter();
  const pathname = usePathname();
  const sessionUser = useSessionUser();
  const { appearance, setAppearance } = useBrandTheme();
  const { preference: languagePreference, setPreference: setLanguagePreference } = useI18n();
  const { location: userLocation, denied: locationDenied } = useUserLocation();
  const { search, query, categoryFilter, menuOpen } = useHomeSharedState();
  const peopleQuery = useNearbyPeopleQuery({
    query,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
  });
  const people = useMemo(() => peopleQuery.data ?? [], [peopleQuery.data]);
  const loggedIn = sessionUser != null;
  const onHome = pathname === '/inicio';

  const waitingLocation = !locationDenied && userLocation == null;
  const showPeopleSkeleton =
    waitingLocation ||
    peopleQuery.isLoading ||
    peopleQuery.isPlaceholderData ||
    (peopleQuery.isFetching && people.length === 0);

  const closeMenu = () => updateHomeState({ menuOpen: false });

  /** Fecha o menu e navega para a rota escolhida. */
  const goTo = (action: () => void) => {
    closeMenu();
    // No Android, navegar no mesmo instante em que o menu fecha derruba o app.
    setTimeout(action, Platform.OS === 'android' ? 50 : 0);
  };

  const goHome = () => router.dismissTo('/inicio');

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
    query,
    userLocation,
    locationDenied,
    search,
    setSearch: (value: string) => updateHomeState({ search: value }),
    handleSearch: () => updateHomeState({ query: search.trim() }),
    clearSearch: () => updateHomeState({ search: '', query: '' }),
    loading: peopleQuery.isLoading || peopleQuery.isFetching,
    showPeopleSkeleton,
    /** Filtro por faixa de idade: vale para a lista, os alertas e os pins do mapa. */
    categoryFilter,
    setCategoryFilter: (value: CategoryFilter) => updateHomeState({ categoryFilter: value }),
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
    openMenu: () => updateHomeState({ menuOpen: true }),
    closeMenu,
    /** Logo do header: volta ao Início (já no Início, não faz nada). */
    goToHome: () => {
      if (!onHome) goHome();
    },
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
    /** Evolução: voluntariado e Central de Apoio às Famílias. */
    goToVolunteer: () => goTo(() => router.push('/quero-ajudar' as Href)),
    goToSupportCenter: () => goTo(() => router.push('/central-de-apoio' as Href)),
    /** Chegada segura: lembrete local no horário combinado, sem rastreamento. */
    goToSafeArrival: () => goTo(() => router.push('/chegada-segura' as Href)),
    /** Ficha de identificação (só neste aparelho). */
    goToIdSheets: () => goTo(() => router.push('/ficha' as Href)),
    /** Nossos apoiadores (EXPO_PUBLIC_ENABLE_SUPPORTERS). */
    goToSupporters: () => goTo(() => router.push('/apoiadores' as Href)),
    /** Evolução: Encontra-me Vision (rede de câmeras participantes). */
    goToVision: () => goTo(() => router.push('/vision' as Href)),
    /** Evolução: pista confidencial (Central de Inteligência, ambiente público). */
    goToConfidentialTip: () => goTo(() => router.push('/pista-confidencial' as Href)),
    // No Início só fecha o menu (antes empilhava outra cópia da tela).
    goToHomeFromMenu: onHome ? closeMenu : () => goTo(goHome),
    goToRegisterFromMenu: () => goTo(() => router.push('/cadastrar-pessoa')),
    goToAllPeopleFromMenu: () => goTo(() => router.push('/pessoas-desaparecidas' as Href)),
    goToAllPeople: () => router.push('/pessoas-desaparecidas' as Href),
    goToNewSafetyNote: () => goTo(() => router.push('/aviso-seguranca' as Href)),
    goToLogin: () => goTo(() => router.push('/login')),
    goToProfileOrLogin: () => goTo(() => router.push((sessionUser ? '/perfil' : '/login') as Href)),
    logout,
    locationLine,
    /** Menu "Como usar o app": o passo a passo abre no Início. */
    openTutorial: () => {
      updateHomeState({ menuOpen: false, onboardingVisible: true, onboardingStep: 0 });
      if (!onHome) {
        setTimeout(goHome, Platform.OS === 'android' ? 50 : 0);
      }
    },
  };
}

export type HomeShellController = ReturnType<typeof useHomeShellController>;

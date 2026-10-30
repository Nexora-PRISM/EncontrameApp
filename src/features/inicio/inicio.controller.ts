import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import type { MapPin } from '@/components/brand-map';
import { buildCarouselPeople } from '@/features/inicio/carousel-people';
import { updateHomeState, useHomeSharedState } from '@/features/inicio/home-shared-state';
import { useHomeShellController } from '@/features/inicio/home-shell.controller';
import { TUTORIAL_LAST_STEP } from '@/features/inicio/tutorial-steps';
import { completeAppOnboarding, isAppOnboardingComplete } from '@/lib/app-onboarding';
import { useBrand } from '@/lib/brand-theme';
import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { categoryAgeRange, matchesCategory } from '@/lib/person-category';
import { isPersonSearchingStatus, resolvePersonStatusColor } from '@/lib/person-status';
import { safetyNoteCategoryInfo } from '@/lib/safety-notes';
import { useSplashDone } from '@/lib/splash-state';
import { usePeopleSearchQuery, useRecentPeopleQuery } from '@/services/people/people.service';
import type { Person } from '@/services/people/people.types';
import {
  useNearbySafetyNotesQuery,
  useVoteSafetyNoteMutation,
} from '@/services/safety-notes/safety-notes.service';
import type { SafetyNote, SafetyNoteVote } from '@/services/safety-notes/safety-notes.types';
import { useReportContentMutation } from '@/services/moderation/moderation.service';

/** Item tocado no mapa: abre o cartão flutuante em vez de trocar de tela. */
type MapSelection = { kind: 'person'; id: string } | { kind: 'note'; id: string } | null;

/** Centraliza dados e navegação da tela inicial (dashboard). */
export function useInicioController() {
  const router = useRouter();
  const t = useT();
  const brand = useBrand();
  const shell = useHomeShellController();
  const { people, query, userLocation, categoryFilter, loggedIn } = shell;
  // Passo a passo no estado compartilhado: o menu da web (fora desta tela) também abre.
  const { onboardingVisible, onboardingStep } = useHomeSharedState();
  /** Mapa com imagem de satélite (com nomes de ruas por cima). */
  const [satellite, setSatellite] = useState(false);
  /** Camada dos avisos de segurança no mapa (liga/desliga). */
  const [showSafetyNotes, setShowSafetyNotes] = useState(true);
  const [selection, setSelection] = useState<MapSelection>(null);
  const [selectionFilter, setSelectionFilter] = useState(categoryFilter);
  /** O passo a passo só aparece depois da abertura (senão o Modal cobriria a logo). */
  const splashDone = useSplashDone();

  // Trocar a faixa de idade (no header da web ou no mapa) fecha o cartão do pin tocado.
  if (selectionFilter !== categoryFilter) {
    setSelectionFilter(categoryFilter);
    setSelection(null);
  }

  // Confere a cada volta ao Início (não só na montagem): "Ver o passo a passo de novo", em
  // Configurações, precisa abrir o tutorial quando a pessoa volta para cá.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void isAppOnboardingComplete().then((done) => {
        if (!cancelled && !done) {
          updateHomeState({ onboardingVisible: true, onboardingStep: 0 });
        }
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

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
  const notesQuery = useNearbySafetyNotesQuery(
    userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null,
    showSafetyNotes,
  );
  const safetyNotes = useMemo<SafetyNote[]>(
    () => (showSafetyNotes ? (notesQuery.data ?? []) : []),
    [notesQuery.data, showSafetyNotes],
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

  const finishOnboarding = (after?: () => void) => {
    updateHomeState({ onboardingVisible: false });
    void completeAppOnboarding();
    after?.();
  };

  const onboardingContinue = () => {
    updateHomeState({ onboardingStep: Math.min(onboardingStep + 1, TUTORIAL_LAST_STEP) });
  };

  const onboardingBack = () => {
    updateHomeState({ onboardingStep: Math.max(onboardingStep - 1, 0) });
  };

  /** "Pular": fecha o passo a passo em qualquer passo e não mostra de novo sozinho. */
  const onboardingSkip = () => {
    finishOnboarding();
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

  return {
    ...shell,
    carouselPeople,
    alertPeople,
    scrollPeople,
    loadMoreAlerts,
    alertsLoadingMore: alertsPages.isFetchingNextPage,
    pins,
    /** Pessoas no mapa com o filtro atual (sem contar os avisos). */
    personPinsCount: personPins.length,
    satellite,
    toggleSatellite: () => setSatellite((current) => !current),
    showSafetyNotes,
    toggleSafetyNotes: () => {
      setShowSafetyNotes((current) => !current);
      setSelection(null);
    },
    safetyNotesCount: safetyNotes.length,
    /** Cartão flutuante do item tocado no mapa. */
    selectedPerson,
    selectedNote,
    hasSelection: selectedPerson != null || selectedNote != null,
    clearSelection,
    voteSafetyNote,
    votingSafetyNote: voteMutation.isPending,
    reportSafetyNote,
    onboardingVisible: onboardingVisible && splashDone,
    onboardingStep,
    onboardingContinue,
    onboardingBack,
    onboardingSkip,
    onboardingReport,
    onboardingRegister,
    onboardingExplore,
    onboardingRequestClose,
  };
}

export type InicioController = ReturnType<typeof useInicioController>;

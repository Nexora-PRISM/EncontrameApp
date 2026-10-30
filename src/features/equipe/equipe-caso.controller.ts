import { type Href, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import type { MapPin, MapPolyline } from '@/components/brand-map';
import { useJustification } from '@/features/equipe/use-justification';
import { useBrand } from '@/lib/brand-theme';
import { CASE_STATUS_LABEL_BY_ID } from '@/lib/case-timeline';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useI18n, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { type ExpansionLevel, nextExpansionLevels } from '@/lib/search-network-rules';
import type { SightingStatus } from '@/lib/sighting-report-rules';
import { EXPANSION_LEVEL_LABEL, connectionColor, nodeColor } from '@/lib/team-labels';
import { allowedStatusTransitions } from '@/lib/team-rules';
import { usePersonQuery } from '@/services/people/people.service';
import {
  useAiSuggestionsQuery,
  useIsStaffQuery,
  useSearchOverviewQuery,
  useTeamActions,
  useTeamSightingsQuery,
} from '@/services/team/team.service';

/** "/equipe/caso/[id]": ferramentas da equipe para um caso. Toda decisão leva a justificativa da tela. */
export function useEquipeCasoController() {
  const t = useT();
  const brand = useBrand();
  const { language } = useI18n();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');
  const goBack = useSafeBack('/equipe' as Href);
  const staffQuery = useIsStaffQuery();
  const isStaff = staffQuery.data === true;
  const personQuery = usePersonQuery(id);
  const sightingsQuery = useTeamSightingsQuery(id, isStaff);
  const searchQuery = useSearchOverviewQuery(id, isStaff);
  const aiQuery = useAiSuggestionsQuery(id, isStaff);
  const actions = useTeamActions();
  const justification = useJustification();
  const [nextLevel, setNextLevel] = useState<ExpansionLevel | null>(null);

  const person = personQuery.data ?? null;
  const statusId = person?.statusId;
  const overview = searchQuery.data ?? null;

  const statusLabel = (value?: number) => {
    const label = value != null ? CASE_STATUS_LABEL_BY_ID[value] : undefined;
    return label ? t(label) : t('Sem situação');
  };

  /** Pede a justificativa, confirma e executa. Mostra o erro se a API recusar. */
  const run = (title: string, message: string, action: (reason: string) => Promise<unknown>) => {
    const reason = justification.take();
    if (!reason) return;
    void (async () => {
      const ok = await confirmAction({ title, message });
      if (!ok) return;
      try {
        await action(reason);
        justification.clear();
      } catch {
        showAlert(t('Não foi possível concluir'), t('Tente de novo em alguns instantes.'));
      }
    })();
  };

  const levels = overview ? nextExpansionLevels(overview.level) : [];
  const chosenLevel = nextLevel && levels.includes(nextLevel) ? nextLevel : (levels[0] ?? null);

  const networkPins: MapPin[] = useMemo(
    () =>
      (overview?.nodes ?? []).map((node) => ({
        id: node.id,
        latitude: node.latitude,
        longitude: node.longitude,
        label: node.label,
        accentColor: nodeColor(brand, node.kind),
        emphasized: node.kind === 'origin',
        tooltip: { title: node.label, subtitle: '' },
      })),
    [overview, brand],
  );

  const networkLines: MapPolyline[] = useMemo(() => {
    const byId = new Map((overview?.nodes ?? []).map((node) => [node.id, node]));
    return (overview?.connections ?? [])
      .filter((link) => link.status !== 'discarded')
      .flatMap((link) => {
        const from = byId.get(link.from);
        const to = byId.get(link.to);
        if (!from || !to) return [];
        return [
          {
            id: link.id,
            dashed: link.status !== 'validated',
            coordinates: [
              { latitude: from.latitude, longitude: from.longitude },
              { latitude: to.latitude, longitude: to.longitude },
            ],
          },
        ];
      });
  }, [overview]);

  return {
    id,
    goBack,
    demo: env.useMocks,
    checking: staffQuery.isLoading,
    checkFailed: staffQuery.isError,
    isStaff,
    retry: () => {
      void staffQuery.refetch();
    },
    justification,
    person,
    personLoading: personQuery.isLoading,
    statusLabel,
    currentStatus: statusLabel(statusId),
    transitions: allowedStatusTransitions(statusId),
    changeStatus: (next: number) =>
      run(
        t('Mudar a situação para {status}?', { status: statusLabel(next) }),
        t('Quem acompanha o caso pode ser avisado da mudança.'),
        (reason) => actions.changeStatus.mutateAsync({ caseId: id, statusId: next, justification: reason }),
      ),
    // relatos
    sightingsEnabled: env.sightingReportsEnabled,
    sightings: sightingsQuery.data ?? [],
    sightingsLoading: sightingsQuery.isLoading,
    decideSighting: (reportId: string, status: SightingStatus, label: string) =>
      run(t('Marcar o relato como "{status}"?', { status: label }), t('Quem enviou o relato vê a nova situação em "Meus relatos".'), (reason) =>
        actions.decideSighting.mutateAsync({ reportId, status, justification: reason }),
      ),
    // busca e teia
    searchEnabled: env.searchNetworkEnabled,
    overview,
    searchLoading: searchQuery.isLoading,
    searchError: searchQuery.isError,
    networkPins,
    networkLines,
    connectionColor: (status: Parameters<typeof connectionColor>[1]) => connectionColor(brand, status),
    levels,
    chosenLevel,
    setNextLevel,
    levelLabel: (level: ExpansionLevel) => t(EXPANSION_LEVEL_LABEL[level]),
    expand: () => {
      if (!chosenLevel) return;
      run(
        t('Ampliar a busca para {level}?', { level: t(EXPANSION_LEVEL_LABEL[chosenLevel]) }),
        t('Pessoas com alertas ligados na nova área podem receber o aviso. A ampliação fica registrada.'),
        (reason) => actions.expandSearch.mutateAsync({ caseId: id, to: chosenLevel, justification: reason }),
      );
    },
    togglePause: () => {
      const paused = !overview?.paused;
      run(
        paused ? t('Pausar os alertas deste caso?') : t('Retomar os alertas deste caso?'),
        paused ? t('Nenhum alerta novo sai até a busca ser retomada.') : t('Os alertas voltam a seguir as regras de região e limite.'),
        (reason) => actions.setPaused.mutateAsync({ caseId: id, paused, justification: reason }),
      );
    },
    // IA
    aiEnabled: env.aiAssistEnabled,
    suggestions: aiQuery.data ?? [],
    aiLoading: aiQuery.isLoading,
    decideAi: (suggestionId: string, accept: boolean) =>
      run(
        accept ? t('Aceitar a sugestão para análise?') : t('Descartar a sugestão?'),
        accept ? t('Aceitar não confirma nada: a sugestão vira um item de análise da equipe.') : t('A sugestão sai da fila.'),
        (reason) => actions.decideAi.mutateAsync({ id: suggestionId, accept, justification: reason }),
      ),
    busy:
      actions.changeStatus.isPending ||
      actions.decideSighting.isPending ||
      actions.expandSearch.isPending ||
      actions.setPaused.isPending ||
      actions.decideAi.isPending,
    formatDate: (iso: string) => {
      const date = new Date(iso);
      return Number.isNaN(date.getTime())
        ? iso
        : new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short' }).format(date);
    },
    formatNumber: (value: number) => new Intl.NumberFormat(language).format(value),
  };
}

export type EquipeCasoController = ReturnType<typeof useEquipeCasoController>;

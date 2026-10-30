import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { env } from '@/lib/env';
import type { ExpansionLevel } from '@/lib/search-network-rules';
import type { SightingStatus } from '@/lib/sighting-report-rules';
import { useSessionUser } from '@/lib/use-session-user';
import { getTeamRepository } from '@/services/team/team.repository';

const keys = {
  all: ['team'] as const,
  staff: (userId: string) => ['team', 'staff', userId] as const,
  reports: ['team', 'reports'] as const,
  sightings: (caseId: string) => ['team', 'sightings', caseId] as const,
  search: (caseId: string) => ['team', 'search', caseId] as const,
  ai: (caseId: string) => ['team', 'ai', caseId] as const,
};

/** A conta logada é da equipe? Uma consulta só, guardada por 10 minutos. */
export function useIsStaffQuery() {
  const userId = useSessionUser()?.id;
  return useQuery({
    queryKey: keys.staff(userId ?? 'anon'),
    queryFn: () => getTeamRepository().isStaff(),
    enabled: userId != null,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTeamReportsQuery(enabled: boolean) {
  return useQuery({ queryKey: keys.reports, queryFn: () => getTeamRepository().listReports(), enabled });
}

export function useTeamSightingsQuery(caseId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.sightings(caseId),
    queryFn: () => getTeamRepository().listSightingReports(caseId),
    enabled: enabled && env.sightingReportsEnabled && caseId.length > 0,
  });
}

export function useSearchOverviewQuery(caseId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.search(caseId),
    queryFn: () => getTeamRepository().getSearchOverview(caseId),
    enabled: enabled && env.searchNetworkEnabled && caseId.length > 0,
  });
}

export function useAiSuggestionsQuery(caseId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.ai(caseId),
    queryFn: () => getTeamRepository().listAiSuggestions(caseId),
    enabled: enabled && env.aiAssistEnabled && caseId.length > 0,
  });
}

/** Ações da equipe. Depois de cada uma, as listas do painel são recarregadas. */
export function useTeamActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.all });
  const repo = () => getTeamRepository();

  return {
    hideReport: useMutation({ mutationFn: (id: string) => repo().hideReport(id), onSuccess: refresh }),
    dismissReport: useMutation({ mutationFn: (id: string) => repo().dismissReport(id), onSuccess: refresh }),
    changeStatus: useMutation({
      mutationFn: (input: { caseId: string; statusId: number; justification: string }) =>
        repo().changeCaseStatus(input.caseId, input.statusId, input.justification),
      onSuccess: () => {
        void refresh();
        void queryClient.invalidateQueries({ queryKey: ['people'] });
      },
    }),
    decideSighting: useMutation({
      mutationFn: (input: { reportId: string; status: SightingStatus; justification: string }) =>
        repo().decideSightingReport(input.reportId, input.status, input.justification),
      onSuccess: refresh,
    }),
    expandSearch: useMutation({
      mutationFn: (input: { caseId: string; to: ExpansionLevel; justification: string }) =>
        repo().expandSearch(input.caseId, input.to, input.justification),
      onSuccess: refresh,
    }),
    setPaused: useMutation({
      mutationFn: (input: { caseId: string; paused: boolean; justification: string }) =>
        repo().setAlertsPaused(input.caseId, input.paused, input.justification),
      onSuccess: refresh,
    }),
    decideAi: useMutation({
      mutationFn: (input: { id: string; accept: boolean; justification: string }) =>
        repo().decideAiSuggestion(input.id, input.accept, input.justification),
      onSuccess: refresh,
    }),
  };
}

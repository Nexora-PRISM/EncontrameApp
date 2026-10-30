import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { env } from '@/lib/env';
import { useSessionUser } from '@/lib/use-session-user';
import { getCollaborationRepository } from '@/services/collaboration/collaboration.repository';
import type { RegionSuggestionPayload, VolunteerProfile } from '@/services/collaboration/collaboration.types';

export function useVolunteerQuery() {
  const userId = useSessionUser()?.id;
  return useQuery({
    queryKey: ['volunteer', userId ?? 'anon'] as const,
    queryFn: () => getCollaborationRepository().getVolunteer(),
    enabled: env.volunteersEnabled && userId != null,
  });
}

export function useVolunteerActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['volunteer'] });
  return {
    save: useMutation({
      mutationFn: (profile: VolunteerProfile) => getCollaborationRepository().saveVolunteer(profile),
      onSuccess: refresh,
    }),
    leave: useMutation({ mutationFn: () => getCollaborationRepository().leaveVolunteer(), onSuccess: refresh }),
  };
}

export function useSuggestRegionMutation() {
  return useMutation({
    mutationFn: (payload: RegionSuggestionPayload) => getCollaborationRepository().suggestRegion(payload),
  });
}

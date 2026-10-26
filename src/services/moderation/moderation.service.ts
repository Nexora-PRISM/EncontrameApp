import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getModerationRepository } from '@/services/moderation/moderation.repository';
import type { ReportContentPayload } from '@/services/moderation/moderation.types';

export function useReportContentMutation() {
  return useMutation({
    mutationFn: (payload: ReportContentPayload) => getModerationRepository().report(payload),
  });
}

export function useBlockUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => getModerationRepository().block(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['people'] });
      void queryClient.invalidateQueries({ queryKey: ['grupo-chat'] });
    },
  });
}

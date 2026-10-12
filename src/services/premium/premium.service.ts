import { useQuery } from '@tanstack/react-query';

import { useSessionUser } from '@/lib/use-session-user';
import { getPremiumRepository } from '@/services/premium/premium.repository';

/** Assinatura Premium da conta conectada. Sem login, nunca é Premium. */
export function usePremiumStatusQuery(enabled = true) {
  const user = useSessionUser();

  return useQuery({
    queryKey: ['premium', 'status', user?.id ?? 'anon'] as const,
    enabled: enabled && user != null,
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: () => getPremiumRepository().getStatus(),
  });
}

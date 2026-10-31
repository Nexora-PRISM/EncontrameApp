import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { env } from '@/lib/env';
import { getSupportersRepository } from '@/services/supporters/supporters.repository';
import type { SupporterPayload } from '@/services/supporters/supporters.types';

const keys = {
  all: ['supporters'] as const,
  public: (home: boolean) => ['supporters', 'public', home ? 'home' : 'all'] as const,
  admin: ['supporters', 'admin'] as const,
  logo: (id: string) => ['supporters', 'admin-logo', id] as const,
};

/** Apoiadores publicados. Desligado (EXPO_PUBLIC_ENABLE_SUPPORTERS) não consulta nada. */
export function useSupportersQuery(home: boolean) {
  return useQuery({
    queryKey: keys.public(home),
    queryFn: () => getSupportersRepository().listPublic({ home }),
    enabled: env.supportersEnabled,
    staleTime: 30 * 60 * 1000,
  });
}

export function useSupportersAdminQuery(enabled: boolean) {
  return useQuery({ queryKey: keys.admin, queryFn: () => getSupportersRepository().listAdmin(), enabled });
}

export function useSupporterAdminLogoQuery(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: keys.logo(id ?? 'novo'),
    queryFn: () => getSupportersRepository().getAdminLogo(id as string),
    enabled: enabled && id !== null,
  });
}

export function useSupporterActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.all });
  return {
    create: useMutation({ mutationFn: (payload: SupporterPayload) => getSupportersRepository().create(payload), onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: SupporterPayload }) => getSupportersRepository().update(id, payload),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: (id: string) => getSupportersRepository().remove(id), onSuccess: refresh }),
    reorder: useMutation({ mutationFn: (ids: string[]) => getSupportersRepository().reorder(ids), onSuccess: refresh }),
  };
}

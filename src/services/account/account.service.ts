import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getActiveLanguage } from '@/lib/i18n';
import { updateSessionUser } from '@/lib/session';
import { getAccountRepository } from '@/services/account/account.repository';
import type {
  ChangePasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from '@/services/account/account.types';

export const accountKeys = {
  capabilities: ['account', 'capabilities'] as const,
  profile: ['account', 'profile'] as const,
  sessions: ['account', 'sessions'] as const,
};

/** O que a API oferece (perfil, senha, sessões). Sem resposta: tudo continua "Em breve". */
export function useAccountCapabilitiesQuery() {
  return useQuery({
    queryKey: accountKeys.capabilities,
    queryFn: () => getAccountRepository().capabilities(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useProfileQuery(enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.profile,
    queryFn: () => getAccountRepository().getProfile(),
    enabled,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => getAccountRepository().updateProfile(payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(accountKeys.profile, profile);
      // O nome aparece no menu e nas Configurações: atualiza o que está guardado da sessão.
      await updateSessionUser({ name: profile.name });
    },
  });
}

export function useSetProfilePhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (base64: string) => getAccountRepository().setPhoto(base64),
    onSuccess: (profile) => queryClient.setQueryData(accountKeys.profile, profile),
  });
}

export function useRemoveProfilePhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => getAccountRepository().removePhoto(),
    onSuccess: (profile) => queryClient.setQueryData(accountKeys.profile, profile),
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => getAccountRepository().changePassword(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.sessions });
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      getAccountRepository().forgotPassword({ email, language: getActiveLanguage() }),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => getAccountRepository().resetPassword(payload),
  });
}

export function useSessionsQuery(enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.sessions,
    queryFn: () => getAccountRepository().listSessions(),
    enabled,
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getAccountRepository().revokeSession(id),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.sessions });
    },
  });
}

export function useRevokeOtherSessionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => getAccountRepository().revokeOtherSessions(),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.sessions });
    },
  });
}

import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { accountFormError } from '@/lib/account-errors';
import { otherSessionsCount, sortSessions } from '@/lib/account-rules';
import { confirmAction, showAlert } from '@/lib/dialog';
import { getActiveLanguage, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import {
  useAccountCapabilitiesQuery,
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
  useSessionsQuery,
} from '@/services/account/account.service';

const LOCALE = { 'pt-BR': 'pt-BR', en: 'en-US', es: 'es' } as const;

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[getActiveLanguage()] ?? 'pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

/** "/sessoes": aparelhos e navegadores conectados à conta; encerrar um ou todos os outros. */
export function useSessoesController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/configuracoes');
  const sessionUser = useSessionUser();
  const capabilities = useAccountCapabilitiesQuery();
  const available = capabilities.data?.sessions === true;
  const sessionsQuery = useSessionsQuery(sessionUser != null && available);
  const revokeOne = useRevokeSessionMutation();
  const revokeOthers = useRevokeOtherSessionsMutation();

  const sessions = useMemo(
    () =>
      sortSessions(sessionsQuery.data ?? []).map((session) => ({
        ...session,
        title: session.current ? t('Este aparelho') : t('Outro aparelho ou navegador'),
        subtitle: session.current
          ? t('Você está usando agora.')
          : t('Última atividade por volta de {when}', { when: formatWhen(session.lastActiveAt) }),
      })),
    [sessionsQuery.data, t],
  );

  const endSession = (id: string) => {
    void (async () => {
      const confirmed = await confirmAction({
        title: t('Desconectar este acesso?'),
        message: t('Quem estiver usando a conta nesse aparelho vai precisar entrar de novo.'),
        confirmLabel: t('Desconectar'),
      });
      if (!confirmed) return;
      try {
        await revokeOne.mutateAsync(id);
        showAlert(t('Acesso desconectado'), t('Se você não reconhece esse acesso, troque também a sua senha.'));
      } catch (error) {
        showAlert(t('Não foi possível desconectar'), accountFormError(error).message || t('Tente novamente em instantes.'));
      }
    })();
  };

  const endOthers = () => {
    void (async () => {
      const confirmed = await confirmAction({
        title: t('Desconectar os outros aparelhos?'),
        message: t('Só este aparelho continua conectado.'),
        confirmLabel: t('Desconectar'),
      });
      if (!confirmed) return;
      try {
        const count = await revokeOthers.mutateAsync();
        showAlert(
          t('Pronto'),
          count === 1
            ? t('1 aparelho foi desconectado.')
            : t('{count} aparelhos foram desconectados.', { count }),
        );
      } catch (error) {
        showAlert(t('Não foi possível desconectar'), accountFormError(error).message || t('Tente novamente em instantes.'));
      }
    })();
  };

  return {
    goBack,
    loading: capabilities.isPending || (available && sessionsQuery.isPending),
    available: capabilities.isSuccess && available,
    loadError: sessionsQuery.isError,
    retry: () => void sessionsQuery.refetch(),
    sessions,
    othersCount: otherSessionsCount(sessions),
    busy: revokeOne.isPending || revokeOthers.isPending,
    endSession,
    endOthers,
    goToChangePassword: () => router.push('/alterar-senha' as Href),
  };
}

export type SessoesController = ReturnType<typeof useSessoesController>;

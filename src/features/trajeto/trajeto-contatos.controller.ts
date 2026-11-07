import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { useTripFormat } from '@/features/trajeto/use-trip-format';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { tr, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { shareText } from '@/lib/share';
import { formatInviteCode, inviteLink, normalizeInviteCode } from '@/lib/trip-rules';
import { tripErrorCode } from '@/services/trips/trips.errors';
import { useTripActions, useTripContactsQuery } from '@/services/trips/trips.service';
import type { TripContact, TripInvite } from '@/services/trips/trips.types';

/**
 * "/trajeto/contatos": quem acompanha meus trajetos e quem compartilha comigo. O vínculo nasce de um convite que a
 * outra pessoa aceita no app, com a conta dela (consentimento dos dois lados). Qualquer lado desfaz quando quiser.
 */
export function useTrajetoContatosController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/trajeto' as Href);
  const format = useTripFormat();
  const query = useTripContactsQuery(true);
  const actions = useTripActions();
  const [invite, setInvite] = useState<TripInvite | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();

  const inviteMessage = (value: TripInvite) => {
    const link = inviteLink(value.code, env.webUrl);
    const lines = [
      tr('Quero que você acompanhe meus trajetos pelo Encontra-me, quando eu escolher compartilhar.'),
      link ? tr('Abra este link no app, com a sua conta: {link}', { link }) : tr('No app Encontra-me, abra Trajeto compartilhado › Contatos e convites e digite o código: {code}', { code: formatInviteCode(value.code) }),
      tr('O convite vale por 48 horas e só pode ser usado uma vez.'),
    ];
    return lines.join('\n\n');
  };

  const createInvite = () => {
    if (actions.createInvite.isPending) return;
    void actions.createInvite
      .mutateAsync()
      .then((created) => {
        setInvite(created);
        void shareText(inviteMessage(created), t('Convite do Encontra-me'));
      })
      .catch((error: unknown) => {
        if (tripErrorCode(error) === 'limit_reached') {
          showAlert(t('Muitos convites em aberto'), t('Espere alguém aceitar ou os convites vencerem (48 horas) para criar outro.'));
        } else {
          showAlert(t('Não foi possível criar o convite'), t('Confira sua conexão e tente de novo.'));
        }
      });
  };

  const remove = (contact: TripContact, side: 'watcher' | 'owner') => {
    void (async () => {
      const ok = await confirmAction({
        title: t('Desfazer o vínculo com {name}?', { name: contact.name }),
        message:
          side === 'watcher'
            ? t('{name} deixa de acompanhar seus trajetos, inclusive o que estiver em andamento.', { name: contact.name })
            : t('Você deixa de ver os trajetos de {name}, inclusive o que estiver em andamento.', { name: contact.name }),
        confirmLabel: t('Desfazer'),
      });
      if (!ok) return;
      try {
        await actions.removeContact.mutateAsync(contact.id);
      } catch {
        showAlert(t('Não foi possível concluir'), t('Tente de novo em alguns instantes.'));
      }
    })();
  };

  return {
    enabled: env.tripSharingEnabled,
    goBack,
    loading: query.isLoading,
    error: query.isError,
    retry: () => {
      void query.refetch();
    },
    watchers: query.data?.watchers ?? [],
    sharingWithMe: query.data?.sharingWithMe ?? [],
    since: (contact: TripContact) => t('Desde {date}', { date: format.dateTime(contact.since) }),
    removeWatcher: (contact: TripContact) => remove(contact, 'watcher'),
    removeOwner: (contact: TripContact) => remove(contact, 'owner'),
    creatingInvite: actions.createInvite.isPending,
    createInvite,
    invite,
    inviteCode: invite ? formatInviteCode(invite.code) : '',
    inviteExpires: invite ? t('Vale até {date}, uma vez só.', { date: format.dateTime(invite.expiresAt) }) : '',
    shareInviteAgain: () => {
      if (invite) void shareText(inviteMessage(invite), t('Convite do Encontra-me'));
    },
    code,
    setCode: (value: string) => {
      setCode(value.slice(0, 20));
      setCodeError(undefined);
    },
    codeError,
    openCode: () => {
      const normalized = normalizeInviteCode(code);
      if (!normalized) {
        setCodeError(t('Confira o código: são 12 letras e números.'));
        return;
      }
      router.push(`/trajeto/convite/${normalized}` as Href);
    },
  };
}

export type TrajetoContatosController = ReturnType<typeof useTrajetoContatosController>;

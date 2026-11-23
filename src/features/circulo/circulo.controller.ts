import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Share } from 'react-native';

import { accountFormError } from '@/lib/account-errors';
import { formatResetCode, normalizeResetCode, resetCodeError } from '@/lib/account-rules';
import { confirmAction, showAlert } from '@/lib/dialog';
import { getActiveLanguage, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import { useAccountCapabilitiesQuery } from '@/services/account/account.service';
import {
  useCircleQuery,
  useCreateInviteMutation,
  useJoinCircleMutation,
  useRemoveMemberMutation,
} from '@/services/circle/circle.service';
import type { CircleInvite } from '@/services/circle/circle.types';

const LOCALE = { 'pt-BR': 'pt-BR', en: 'en-US', es: 'es' } as const;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[getActiveLanguage()] ?? 'pt-BR', { dateStyle: 'short' }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[getActiveLanguage()] ?? 'pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

/**
 * "/circulo": pessoas de confiança que veem os trajetos que você decidir compartilhar.
 * Vínculo de mão dupla: convite por código, aceito pela outra pessoa; qualquer um sai quando quiser.
 */
export function useCirculoController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/perfil');
  const sessionUser = useSessionUser();
  const capabilities = useAccountCapabilitiesQuery();
  const available = capabilities.data?.familyCircle === true;
  const circleQuery = useCircleQuery(sessionUser != null && available);
  const inviteMutation = useCreateInviteMutation();
  const joinMutation = useJoinCircleMutation();
  const removeMutation = useRemoveMemberMutation();

  const [invite, setInvite] = useState<CircleInvite | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const members = circleQuery.data?.members ?? [];
  const maxMembers = circleQuery.data?.maxMembers ?? 10;

  const shareInvite = async (next: CircleInvite) => {
    const message = t(
      'Entre no meu círculo familiar do Encontra-me com o código {code}. Ele vale até {until} e serve uma vez só. No app: Perfil > Círculo familiar > Entrar com um código.',
      { code: formatResetCode(next.code), until: formatDateTime(next.expiresAt) },
    );
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !('share' in navigator)) return;
    try {
      await Share.share({ message });
    } catch {
      // Sem a folha de compartilhar: o código continua na tela para a pessoa mandar como quiser.
    }
  };

  const createInvite = async () => {
    setInviteError('');
    try {
      const next = await inviteMutation.mutateAsync();
      setInvite(next);
      await shareInvite(next);
    } catch (error) {
      const { fields, message } = accountFormError(error);
      setInviteError(fields.circle === 'limit_reached' ? t('O círculo chegou ao limite de 10 pessoas.') : message);
    }
  };

  const join = async () => {
    const found = resetCodeError(code);
    if (found) {
      setCodeError(found === 'required' ? t('Digite o código que você recebeu.') : t('O código tem 8 caracteres.'));
      return;
    }
    setCodeError('');
    try {
      const member = await joinMutation.mutateAsync(normalizeResetCode(code));
      setCode('');
      showAlert(t('Pronto'), t('Você e {name} agora estão no mesmo círculo familiar.', { name: member.name }));
    } catch (error) {
      const { fields, message } = accountFormError(error);
      const codeKey = fields.code ?? fields.circle;
      setCodeError(
        codeKey === 'invalid_or_expired'
          ? t('Código errado, vencido ou já usado. Peça um novo.')
          : codeKey === 'already_registered'
            ? t('Vocês já estão no mesmo círculo.')
            : codeKey === 'not_available'
              ? t('Esse é o seu próprio convite. Mande para a outra pessoa digitar.')
              : codeKey === 'limit_reached'
                ? t('Um dos círculos chegou ao limite de 10 pessoas.')
                : message,
      );
    }
  };

  const remove = async (userId: string, name: string) => {
    const confirmed = await confirmAction({
      title: t('Tirar {name} do círculo?', { name }),
      message: t('Vocês deixam de ver os trajetos um do outro. Para voltar, é preciso um convite novo.'),
      confirmLabel: t('Tirar do círculo'),
    });
    if (!confirmed) return;
    try {
      await removeMutation.mutateAsync(userId);
    } catch (error) {
      showAlert(t('Não foi possível tirar do círculo'), accountFormError(error).message || t('Tente novamente em instantes.'));
    }
  };

  return {
    goBack,
    loading: capabilities.isPending || (available && circleQuery.isPending),
    available: capabilities.isSuccess && available,
    loadError: circleQuery.isError,
    retry: () => void circleQuery.refetch(),
    members: members.map((member) => ({
      ...member,
      initial: member.name.trim().charAt(0).toUpperCase() || '?',
      sinceLabel: t('No círculo desde {date}', { date: formatDate(member.since) }),
    })),
    maxMembers,
    full: members.length >= maxMembers,
    invite: invite
      ? { code: formatResetCode(invite.code), until: formatDateTime(invite.expiresAt) }
      : null,
    inviteError,
    creatingInvite: inviteMutation.isPending,
    createInvite: () => void createInvite(),
    shareAgain: invite ? () => void shareInvite(invite) : undefined,
    code,
    setCode: (value: string) => {
      setCode(formatResetCode(value));
      setCodeError('');
    },
    codeError,
    joining: joinMutation.isPending,
    join: () => void join(),
    removing: removeMutation.isPending,
    remove: (userId: string, name: string) => void remove(userId, name),
    tripsAvailable: capabilities.data?.trips === true,
    goToTrip: () => router.push('/trajeto' as Href),
  };
}

export type CirculoController = ReturnType<typeof useCirculoController>;

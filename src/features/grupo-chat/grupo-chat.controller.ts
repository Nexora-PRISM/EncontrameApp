import { useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';

import { confirmAction, showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { useSessionUser } from '@/lib/use-session-user';
import {
  useGroupChatHistoryQuery,
  useSendGroupMessageMutation,
} from '@/services/grupo-chat/grupo-chat.service';
import { CURRENT_USER } from '@/services/grupo-chat/grupo-chat.types';
import type { GroupChatMessage } from '@/services/grupo-chat/grupo-chat.types';
import { useBlockUserMutation, useReportContentMutation } from '@/services/moderation/moderation.service';

function nowTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function todayLabel() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${now.getFullYear()}`;
}

/** Centraliza estado e envio de mensagens do chat em grupo (Grupo de apoio). */
export function useGrupoChatController() {
  const t = useT();
  const router = useRouter();
  const sessionUser = useSessionUser();
  const historyQuery = useGroupChatHistoryQuery();
  const sendMutation = useSendGroupMessageMutation();
  const reportMutation = useReportContentMutation();
  const blockMutation = useBlockUserMutation();

  // Mensagens da conversa vindas do histórico (query) + as adicionadas na sessão.
  const [sessionMessages, setSessionMessages] = useState<GroupChatMessage[]>([]);
  const [blockedSenderIds, setBlockedSenderIds] = useState<string[]>([]);

  const messages: GroupChatMessage[] = [...(historyQuery.data ?? []), ...sessionMessages].filter(
    (message) => message.isMine || !blockedSenderIds.includes(message.sender.id),
  );

  const requireAccount = useCallback(() => {
    if (sessionUser != null) return true;
    showAlert(
      t('Entre na sua conta'),
      t('Para denunciar ou bloquear, entre na sua conta.'),
    );
    router.push({ pathname: '/login', params: { returnTo: '/grupo-chat' } } as Href);
    return false;
  }, [router, sessionUser, t]);

  const reportMessage = useCallback(
    (message: GroupChatMessage) => {
      if (message.isMine || !requireAccount()) return;
      void (async () => {
        const confirmed = await confirmAction({
          title: t('Denunciar esta mensagem?'),
          message: t('A denúncia fica registrada para a equipe analisar.'),
          confirmLabel: t('Denunciar'),
        });
        if (!confirmed) return;
        try {
          await reportMutation.mutateAsync({
            targetType: 'GroupMessage',
            targetId: message.id,
            reason: 'abuse',
          });
          showAlert(t('Denúncia registrada'), t('A equipe pode analisar esta denúncia.'));
        } catch {
          showAlert(t('Não foi possível registrar'), t('Tente de novo em alguns instantes.'));
        }
      })();
    },
    [reportMutation, requireAccount, t],
  );

  const blockSender = useCallback(
    (message: GroupChatMessage) => {
      if (message.isMine || !requireAccount()) return;
      void (async () => {
        const confirmed = await confirmAction({
          title: t('Bloquear esta pessoa?'),
          message: t('Você deixa de ver as mensagens e os cadastros publicados por esta conta.'),
          confirmLabel: t('Bloquear'),
        });
        if (!confirmed) return;
        try {
          await blockMutation.mutateAsync(message.sender.id);
          setBlockedSenderIds((prev) =>
            prev.includes(message.sender.id) ? prev : [...prev, message.sender.id],
          );
          setSessionMessages((prev) => prev.filter((item) => item.sender.id !== message.sender.id));
          showAlert(t('Pessoa bloqueada'), t('O conteúdo desta conta saiu da sua lista.'));
        } catch {
          showAlert(t('Não foi possível bloquear'), t('Tente de novo em alguns instantes.'));
        }
      })();
    },
    [blockMutation, requireAccount, t],
  );

  const handleSend = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    const optimisticMessage: GroupChatMessage = {
      id: `me-${Date.now()}`,
      sender: CURRENT_USER,
      text,
      time: nowTime(),
      isMine: true,
    };
    setSessionMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendMutation.mutateAsync({ text });
    } catch {
      setSessionMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
      throw new Error('send-failed');
    }
  }, [sendMutation]);

  return {
    messages,
    allowSend: !sendMutation.isPending,
    sending: sendMutation.isPending,
    today: todayLabel(),
    handleSend,
    reportMessage,
    blockSender,
  };
}

export type GrupoChatController = ReturnType<typeof useGrupoChatController>;

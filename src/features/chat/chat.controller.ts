import { useQueryClient } from '@tanstack/react-query';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';

import {
  acceptSofiaDisclaimer,
  isSofiaDisclaimerAccepted,
  isSofiaWelcomeComplete,
} from '@/lib/sofia-prefs';
import {
  chatKeys,
  useChatHistoryQuery,
  useClearChatHistoryMutation,
  useSendMessageMutation,
} from '@/services/chat/chat.service';
import type { ChatMessage } from '@/services/chat/chat.types';
import { apiErrorDisplayMessage } from '@/lib/api-errors';
import { notifyApiError } from '@/lib/api-error-events';

const STREAM_WORD_INTERVAL_MS = 50;

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

/** Centraliza estado e envio de mensagens do chat com a IA (Sofia). */
export function useChatController() {
  const router = useRouter();
  const goBack = useCallback(() => {
    router.dismissTo('/inicio');
  }, [router]);
  const queryClient = useQueryClient();
  const historyQuery = useChatHistoryQuery();
  const sendMutation = useSendMessageMutation();
  const clearMutation = useClearChatHistoryMutation();

  const [optimistic, setOptimistic] = useState<ChatMessage[]>([]);
  const [streamStarted, setStreamStarted] = useState(false);
  const [streamAnimationActive, setStreamAnimationActive] = useState(false);
  const [streamingAssistantMessageId, setStreamingAssistantMessageId] = useState<string | null>(null);
  const pendingStreamText = useRef('');
  const completeStreamText = useRef('');
  const streamResponseComplete = useRef(false);
  const streamingAssistantId = useRef<string | null>(null);
  const [disclaimerReady, setDisclaimerReady] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [welcomeGate, setWelcomeGate] = useState<'checking' | 'ok'>('checking');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const welcomeDone = await isSofiaWelcomeComplete();
      if (!mounted) return;
      if (!welcomeDone) {
        router.replace('/sofia-welcome' as Href);
        return;
      }
      setWelcomeGate('ok');

      const accepted = await isSofiaDisclaimerAccepted();
      if (mounted) {
        setDisclaimerAccepted(accepted);
        setDisclaimerReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!streamAnimationActive) return;

    const timer = setInterval(() => {
      const assistantId = streamingAssistantId.current;
      if (!assistantId || pendingStreamText.current.length === 0) return;

      const nextWord = pendingStreamText.current.match(/^\s*\S+\s*/u)?.[0];
      if (!nextWord) {
        if (!streamResponseComplete.current || !/^\s+$/u.test(pendingStreamText.current)) return;
        const trailingWhitespace = pendingStreamText.current;
        pendingStreamText.current = '';
        setOptimistic((prev) =>
          prev.map((message) =>
            message.id === assistantId ? { ...message, text: message.text + trailingWhitespace } : message,
          ),
        );
        return;
      }
      if (!streamResponseComplete.current && !/\s$/u.test(nextWord)) return;

      pendingStreamText.current = pendingStreamText.current.slice(nextWord.length);
      setStreamStarted(true);
      setOptimistic((prev) =>
        prev.map((message) =>
          message.id === assistantId ? { ...message, text: message.text + nextWord } : message,
        ),
      );
    }, STREAM_WORD_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [streamAnimationActive]);

  const messages: ChatMessage[] = [...(historyQuery.data ?? []), ...optimistic];

  const handleSend = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || !disclaimerAccepted) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text,
        time: nowTime(),
      };
      const assistantId = `assistant-${Date.now()}`;
      pendingStreamText.current = '';
      completeStreamText.current = '';
      streamResponseComplete.current = false;
      streamingAssistantId.current = assistantId;
      setStreamingAssistantMessageId(assistantId);
      setStreamStarted(false);
      setStreamAnimationActive(true);
      setOptimistic((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'assistant', text: '', time: nowTime() },
      ]);

      try {
        await sendMutation.mutateAsync({
          payload: { text },
          onChunk: (chunk) => {
            pendingStreamText.current += chunk;
            completeStreamText.current += chunk;
          },
        });
        streamResponseComplete.current = true;
        while (pendingStreamText.current.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, STREAM_WORD_INTERVAL_MS));
        }
        streamingAssistantId.current = null;
        setStreamingAssistantMessageId(null);
        setStreamStarted(false);
        setStreamAnimationActive(false);
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          text: completeStreamText.current,
          time: nowTime(),
        };
        await queryClient.cancelQueries({ queryKey: chatKeys.history });
        queryClient.setQueryData<ChatMessage[]>(chatKeys.history, (previous = []) => [
          ...previous,
          userMessage,
          assistantMessage,
        ]);
        completeStreamText.current = '';
        streamResponseComplete.current = false;
        setOptimistic([]);
      } catch (error) {
        pendingStreamText.current = '';
        completeStreamText.current = '';
        streamResponseComplete.current = false;
        streamingAssistantId.current = null;
        setStreamingAssistantMessageId(null);
        setStreamAnimationActive(false);
        setOptimistic((prev) =>
          prev.filter((message) => message.id !== userMessage.id && message.id !== assistantId),
        );
        setStreamStarted(false);
        if (!isAxiosError(error)) notifyApiError(apiErrorDisplayMessage(error));
        throw new Error('send-failed');
      }
    },
    [disclaimerAccepted, queryClient, sendMutation],
  );

  const handleAcceptDisclaimer = async () => {
    await acceptSofiaDisclaimer();
    setDisclaimerAccepted(true);
  };

  const handleClear = async () => {
    setConfirmClear(false);
    try {
      await clearMutation.mutateAsync();
      setOptimistic([]);
    } catch {
      setOptimistic([]);
    }
  };

  return {
    messages,
    allowSend: disclaimerAccepted && !historyQuery.isLoading && !sendMutation.isPending,
    sending: sendMutation.isPending,
    streamStarted,
    streamAnimationActive,
    streamingAssistantId: streamingAssistantMessageId,
    clearing: clearMutation.isPending,
    loading: historyQuery.isLoading,
    today: todayLabel(),
    handleSend,
    disclaimerVisible: disclaimerReady && !disclaimerAccepted,
    handleAcceptDisclaimer,
    confirmClear,
    setConfirmClear,
    handleClear,
    welcomeGate,
    goBack,
  };
}

export type ChatController = ReturnType<typeof useChatController>;

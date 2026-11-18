import { api } from '@/lib/axios';
import type { ChatRepository } from '@/services/chat/chat.repository';
import type { ChatMessage, ChatRole, SendMessagePayload } from '@/services/chat/chat.types';

interface ApiChatMessage {
  id: number;
  message: string;
  messageType?: string | null;
  sentBy?: string | null;
  dtRegistration: string;
}

/** Implementação real: fala com /IAChat/messages. */
export const chatAxiosRepository: ChatRepository = {
  async history() {
    const { data } = await api.get<ApiChatMessage[]>('/IAChat/messages');
    return data.map(mapMessage);
  },

  async send(payload: SendMessagePayload, onChunk?: (chunk: string) => void) {
    let responseTextRead = 0;
    let pendingLine = '';
    let eventData: string[] = [];
    let streamError: string | null = null;
    let receivedDone = false;
    let streamedText = '';

    const dispatchEvent = () => {
      if (eventData.length === 0 || receivedDone) return;
      const event = eventData.join('\n');
      eventData = [];
      if (event === '[DONE]') {
        receivedDone = true;
        return;
      }
      try {
        const parsed = JSON.parse(event) as { response?: unknown; error?: unknown };
        if (typeof parsed.error === 'string') {
          streamError = parsed.error;
        } else if (typeof parsed.response === 'string') {
          streamedText += parsed.response;
          onChunk?.(parsed.response);
        }
      } catch {
        streamError = 'llm_unavailable';
      }
    };

    const consumeText = (text: string) => {
      if (text.length < responseTextRead) responseTextRead = 0;
      pendingLine += text.slice(responseTextRead);
      responseTextRead = text.length;
      const lines = pendingLine.split('\n');
      pendingLine = lines.pop() ?? '';
      for (const rawLine of lines) {
        const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
        if (line.length === 0) dispatchEvent();
        else if (line.startsWith('data:')) eventData.push(line.slice(5).trimStart());
      }
    };

    const { data } = await api.post<string>(
      '/IAChat/messages',
      {
        message: payload.text,
      },
      {
        timeout: 120000,
        responseType: 'text',
        onDownloadProgress: (progress) => {
          const event = progress.event as { target?: { responseText?: string } } | undefined;
          const text = event?.target?.responseText;
          if (typeof text === 'string') consumeText(text);
        },
      },
    );

    consumeText(data);
    if (pendingLine.length > 0) {
      if (pendingLine.startsWith('data:')) eventData.push(pendingLine.slice(5).trimStart());
      pendingLine = '';
    }
    dispatchEvent();
    if (streamError) throw new Error(streamError);
    if (!receivedDone) throw new Error('llm_unavailable');

    return {
      id: `sofia-${Date.now()}`,
      role: 'assistant',
      text: streamedText,
      time: formatTime(new Date().toISOString()),
    } satisfies ChatMessage;
  },

  async clearHistory() {
    await api.delete('/IAChat/messages');
  },
};

function mapMessage(api: ApiChatMessage): ChatMessage {
  return {
    id: String(api.id),
    role: normalizeRole(api.sentBy),
    text: api.message,
    time: formatTime(api.dtRegistration),
  };
}

function normalizeRole(sentBy?: string | null): ChatRole {
  return sentBy?.toLowerCase() === 'assistant' ? 'assistant' : 'user';
}

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

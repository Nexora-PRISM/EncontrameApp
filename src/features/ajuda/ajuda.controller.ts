import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  searchHelp,
  type HelpCategoryId,
} from '@/features/ajuda/help-content';
import { AppInfo } from '@/lib/app-info';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { openSupportEmail, type SupportTopic } from '@/lib/support';
import { useSessionUser } from '@/lib/use-session-user';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

type ContactResult = 'opened' | 'no-mail-app' | null;

const isCategory = (value: string): value is HelpCategoryId =>
  HELP_CATEGORIES.some((category) => category.id === value);

const isTopic = (value: string): value is SupportTopic =>
  ['duvida', 'problema', 'conta', 'privacidade', 'exclusao', 'denuncia'].includes(value);

/** Central de ajuda: busca nas perguntas frequentes e contato com o suporte. */
export function useAjudaController() {
  const t = useT();
  const params = useLocalSearchParams<{ categoria?: string; assunto?: string }>();
  const sessionUser = useSessionUser();
  const goBack = useSafeBack('/inicio');

  const initialCategory = params.categoria && isCategory(params.categoria) ? params.categoria : null;
  const initialTopic = params.assunto && isTopic(params.assunto) ? params.assunto : null;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<HelpCategoryId | null>(initialCategory);
  const [openId, setOpenId] = useState<string | null>(null);

  const [contactOpen, setContactOpen] = useState(initialTopic != null);
  const [topic, setTopic] = useState<SupportTopic>(initialTopic ?? 'duvida');
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [contactResult, setContactResult] = useState<ContactResult>(null);

  const searching = query.trim().length > 0;

  const articles = useMemo(() => {
    if (searching) return searchHelp(query, t);
    if (category) return HELP_ARTICLES.filter((article) => article.category === category);
    return [];
  }, [category, query, searching, t]);

  const selectedCategory = HELP_CATEGORIES.find((item) => item.id === category) ?? null;

  const openContact = (nextTopic: SupportTopic) => {
    setTopic(nextTopic);
    setContactOpen(true);
    setContactResult(null);
    setMessageError(undefined);
  };

  const changeMessage = (value: string) => {
    setMessage(value.slice(0, MESSAGE_MAX));
    if (messageError) setMessageError(undefined);
  };

  const submitContact = () => {
    const trimmed = message.trim();
    if (trimmed.length < MESSAGE_MIN) {
      setMessageError(t('Escreva pelo menos {MESSAGE_MIN} caracteres para podermos ajudar.', { MESSAGE_MIN }));
      return;
    }

    void (async () => {
      setSending(true);
      try {
        const opened = await openSupportEmail({
          topic,
          message: trimmed,
          accountEmail: sessionUser?.email,
        });
        setContactResult(opened ? 'opened' : 'no-mail-app');
      } finally {
        setSending(false);
      }
    })();
  };

  return {
    goBack,
    query,
    setQuery: (value: string) => {
      setQuery(value);
      setOpenId(null);
    },
    clearQuery: () => setQuery(''),
    searching,
    categories: HELP_CATEGORIES,
    category,
    selectedCategory,
    selectCategory: (id: HelpCategoryId) => {
      setCategory(id);
      setOpenId(null);
    },
    clearCategory: () => {
      setCategory(null);
      setOpenId(null);
    },
    articles,
    openId,
    toggleArticle: (id: string) => setOpenId((current) => (current === id ? null : id)),
    contactOpen,
    openContact,
    closeContact: () => setContactOpen(false),
    topic,
    setTopic,
    message,
    setMessage: changeMessage,
    messageMax: MESSAGE_MAX,
    messageError,
    sending,
    submitContact,
    contactResult,
    resetContact: () => {
      setContactResult(null);
      setMessage('');
    },
    supportEmail: AppInfo.supportEmail,
  };
}

export type AjudaController = ReturnType<typeof useAjudaController>;

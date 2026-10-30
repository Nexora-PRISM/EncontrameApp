import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { getLocalItem, setLocalItem } from '@/lib/local-store';
import { useSafeBack } from '@/lib/safe-back';
import { isSofiaWelcomeComplete } from '@/lib/sofia-prefs';

const CHECKLIST_KEY = 'encontrame.supportChecklist';

/** "/central-de-apoio": orientações para famílias e uma lista do que reunir, salva só no aparelho. */
export function useCentralApoioController() {
  const router = useRouter();
  const goBack = useSafeBack('/inicio' as Href);
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    void getLocalItem(CHECKLIST_KEY)
      .then((raw) => {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) setChecked(parsed.filter((item): item is string => typeof item === 'string'));
      })
      .catch(() => undefined);
  }, []);

  const toggle = (key: string) => {
    setChecked((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      void setLocalItem(CHECKLIST_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  return {
    goBack,
    checked,
    toggle,
    goToRegister: () => router.push('/cadastrar-pessoa'),
    goToSofia: () => {
      void isSofiaWelcomeComplete().then((done) => router.push((done ? '/chat' : '/sofia-welcome') as Href));
    },
    goToGroup: () => router.push('/grupo-chat'),
    callCvv: () => {
      void Linking.openURL('tel:188').catch(() => undefined);
    },
  };
}

export type CentralApoioController = ReturnType<typeof useCentralApoioController>;

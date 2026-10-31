import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { confirmAction, showAlert } from '@/lib/dialog';
import { tr } from '@/lib/i18n';
import { getLocalItem, setLocalItem } from '@/lib/local-store';
import { BRAZIL_STATES, isOfficialGovUrl, onlineReportFor } from '@/lib/police-report-states';
import { useSafeBack } from '@/lib/safe-back';
import { isSofiaWelcomeComplete } from '@/lib/sofia-prefs';

const CHECKLIST_KEY = 'encontrame.supportChecklist';
/** Estado escolhido para o boletim pela internet (só neste aparelho). */
const STATE_KEY = 'encontrame.supportState';
const stateLabel = (state: (typeof BRAZIL_STATES)[number]) => `${state.name} (${state.uf})`;

/** "/central-de-apoio": orientações para famílias e uma lista do que reunir, salva só no aparelho. */
export function useCentralApoioController() {
  const router = useRouter();
  const goBack = useSafeBack('/inicio' as Href);
  const [checked, setChecked] = useState<string[]>([]);
  const [uf, setUf] = useState('');

  useEffect(() => {
    void getLocalItem(STATE_KEY)
      .then((saved) => {
        if (saved && BRAZIL_STATES.some((state) => state.uf === saved)) setUf(saved);
      })
      .catch(() => undefined);
  }, []);

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

  const selected = BRAZIL_STATES.find((state) => state.uf === uf);
  const onlineReport = uf ? onlineReportFor(uf) : null;

  return {
    goBack,
    checked,
    toggle,
    stateOptions: BRAZIL_STATES.map(stateLabel),
    stateLabel: selected ? stateLabel(selected) : '',
    selectState: (label: string) => {
      const state = BRAZIL_STATES.find((item) => stateLabel(item) === label);
      if (!state) return;
      setUf(state.uf);
      void setLocalItem(STATE_KEY, state.uf).catch(() => undefined);
    },
    onlineReport,
    /** Abre o site oficial do estado, depois de avisar que sai do app. */
    openOnlineReport: () => {
      const url = onlineReport?.url;
      if (!url || !isOfficialGovUrl(url)) return;
      void (async () => {
        const ok = await confirmAction({
          title: tr('Abrir o site oficial?'),
          message: tr('O site {site} abre fora do Encontra-me.', { site: new URL(url).hostname }),
          confirmLabel: tr('Abrir site'),
        });
        if (!ok) return;
        await Linking.openURL(url).catch(() =>
          showAlert(tr('Não foi possível abrir o site'), tr('Tente de novo em alguns instantes.')),
        );
      })();
    },
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

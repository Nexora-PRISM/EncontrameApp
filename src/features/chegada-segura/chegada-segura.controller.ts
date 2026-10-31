import * as Linking from 'expo-linking';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  type ArrivalReminderStatus,
  cancelArrivalReminder,
  loadArrivalCheck,
  saveArrivalCheck,
  scheduleArrivalReminder,
} from '@/lib/arrival-check';
import {
  ARRIVAL_DESTINATION_MAX,
  ARRIVAL_DURATIONS_MIN,
  type ArrivalCheck,
  arrivalPhase,
  canExtendArrivalCheck,
  extendArrivalCheck,
  formatRemaining,
  remainingMs,
  startArrivalCheck,
} from '@/lib/arrival-check-rules';
import { confirmAction, showAlert } from '@/lib/dialog';
import { useI18n, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { type TrustedContact, loadTrustedContacts } from '@/lib/trusted-contacts';

/**
 * "/chegada-segura": a pessoa diz em quanto tempo espera chegar; no horário o app pergunta se ela chegou.
 * Não acompanha pelo mapa e não avisa ninguém sozinho.
 */
export function useChegadaSeguraController() {
  const t = useT();
  const { language } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/inicio' as Href);
  const [check, setCheck] = useState<ArrivalCheck | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [destination, setDestination] = useState('');
  const [minutes, setMinutes] = useState('30');
  const [reminder, setReminder] = useState<ArrivalReminderStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);

  useEffect(() => {
    let cancelled = false;
    void loadArrivalCheck()
      .then((saved) => {
        if (cancelled) return;
        setCheck(saved);
        setNow(new Date());
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Relógio da contagem, só enquanto há trajeto.
  useEffect(() => {
    if (!check) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [check]);

  // Recarrega os contatos ao voltar da tela "Contatos de confiança".
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void loadTrustedContacts()
        .then((list) => {
          if (!cancelled) setContacts(list);
        })
        .catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const phase = arrivalPhase(check, now);
  const clock = (iso: string) => new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

  const apply = async (next: ArrivalCheck) => {
    await saveArrivalCheck(next);
    setCheck(next);
    setNow(new Date());
    setReminder(await scheduleArrivalReminder(next));
  };

  const run = (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    void action()
      .catch(() => showAlert(t('Não foi possível concluir'), t('Tente de novo em alguns instantes.')))
      .finally(() => setBusy(false));
  };

  const finish = async (message: string) => {
    await cancelArrivalReminder();
    await saveArrivalCheck(null);
    setCheck(null);
    setReminder(null);
    showAlert(message);
  };

  return {
    goBack,
    loaded,
    phase,
    check,
    destination,
    setDestination: (value: string) => setDestination(value.slice(0, ARRIVAL_DESTINATION_MAX)),
    destinationMax: ARRIVAL_DESTINATION_MAX,
    minutes,
    setMinutes,
    durationOptions: ARRIVAL_DURATIONS_MIN.map((value) => ({ value: String(value), label: `${value} min` })),
    remaining: check ? formatRemaining(remainingMs(check, now)) : '',
    deadlineClock: check ? clock(check.deadline) : '',
    canExtend: check ? canExtendArrivalCheck(check) : false,
    reminder,
    contacts,
    busy,
    start: () => run(() => apply(startArrivalCheck(new Date(), Number(minutes) || 30, destination))),
    extend: () => {
      if (check) run(() => apply(extendArrivalCheck(check, new Date())));
    },
    arrived: () => run(() => finish(t('Que bom que você chegou bem.'))),
    stop: () => {
      void (async () => {
        const ok = await confirmAction({
          title: t('Encerrar a chegada segura?'),
          message: t('O lembrete é cancelado.'),
          confirmLabel: t('Encerrar'),
        });
        if (ok) run(() => finish(t('Chegada segura encerrada.')));
      })();
    },
    goToContacts: () => router.push('/contatos-confianca' as Href),
    goToHelp: () => router.push('/pedir-ajuda' as Href),
    call190: () => {
      void Linking.openURL('tel:190').catch(() =>
        showAlert(t('Não foi possível abrir o telefone'), t('Ligue 190 pelo telefone do aparelho.')),
      );
    },
  };
}

export type ChegadaSeguraController = ReturnType<typeof useChegadaSeguraController>;

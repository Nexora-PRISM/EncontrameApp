import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';

import {
  buildPossibleMissingEmail,
  possibleMissingInfo,
  type PossibleMissingSituation,
} from '@/features/possivel-desaparecimento/possible-missing';
import { AppInfo } from '@/lib/app-info';
import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { openSupportEmail } from '@/lib/support';
import { useSessionUser } from '@/lib/use-session-user';

/** "/possivel-desaparecimento" — encontrei alguém perdido. Sem login: emergência não espera conta. */
export function usePossivelDesaparecimentoController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/inicio');
  const sessionUser = useSessionUser();

  const [situation, setSituation] = useState<PossibleMissingSituation | null>(null);
  const [place, setPlace] = useState('');
  const [details, setDetails] = useState('');
  const [calledEmergency, setCalledEmergency] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [emailResult, setEmailResult] = useState<'opened' | 'failed' | null>(null);

  const call = (number: string) => {
    setCalledEmergency(true);
    Linking.openURL(`tel:${number}`).catch(() => {
      showAlert(t('Não foi possível abrir o telefone'), t('Ligue manualmente para {number}.', { number }));
    });
  };

  const submit = async () => {
    if (!situation) {
      setError(t('Escolha a situação.'));
      return;
    }
    setSending(true);
    try {
      const email = buildPossibleMissingEmail({ situation, place, details, calledEmergency }, t);
      const opened = await openSupportEmail({
        topic: 'denuncia',
        subject: email.subject,
        message: email.body,
        accountEmail: sessionUser?.email ?? undefined,
      });
      setEmailResult(opened ? 'opened' : 'failed');
    } finally {
      setSending(false);
    }
  };

  return {
    goBack,
    situation,
    calls: situation ? possibleMissingInfo(situation).calls : ['190'],
    chooseSituation: (value: PossibleMissingSituation) => {
      setSituation(value);
      setError(undefined);
    },
    place,
    setPlace,
    details,
    setDetails,
    error,
    call,
    sending,
    submit: () => void submit(),
    emailResult,
    supportEmail: AppInfo.supportEmail,
    goToEmergency: () => router.push('/pedir-ajuda' as Href),
    goToSearch: () => router.push('/pessoas-desaparecidas' as Href),
  };
}

export type PossivelDesaparecimentoController = ReturnType<typeof usePossivelDesaparecimentoController>;

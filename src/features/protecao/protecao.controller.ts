import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';

import {
  buildProtectionEmail,
  isUrgentProtection,
  looksLikeLocation,
  normalizeSituations,
  parseProtectionMode,
  protectionReportReason,
  type ProtectionMode,
  type ProtectionSituation,
} from '@/features/protecao/protecao-request';
import { AppInfo } from '@/lib/app-info';
import { confirmAction, showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { isLocalPersonId } from '@/lib/person-status';
import { useSafeBack } from '@/lib/safe-back';
import { openSupportEmail } from '@/lib/support';
import { useSessionUser } from '@/lib/use-session-user';
import { useReportContentMutation } from '@/services/moderation/moderation.service';

export type ProtectionResult = {
  /** A denúncia entrou na fila da equipe pela API (só com conta e caso publicado). */
  registered: boolean;
  /** O app de e-mail abriu com a mensagem pronta (ela só chega quando a pessoa envia). */
  emailOpened: boolean;
  urgent: boolean;
};

/**
 * "/protecao" — "Sou a pessoa procurada" e "Estou sofrendo perseguição".
 * Não exige login (quem está em risco pode não ter conta) e nunca pede a localização.
 */
export function useProtecaoController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/inicio');
  const params = useLocalSearchParams<{ caso?: string; modo?: string }>();
  const sessionUser = useSessionUser();
  const reportMutation = useReportContentMutation();

  const caseId = typeof params.caso === 'string' && params.caso.trim() ? params.caso.trim() : undefined;
  /** Só um caso publicado (id da API) pode ser denunciado na fila; rascunho local não. */
  const publishedCaseId = caseId && !isLocalPersonId(caseId) ? caseId : undefined;

  const [mode, setModeState] = useState<ProtectionMode>(parseProtectionMode(params.modo));
  const [situations, setSituations] = useState<ProtectionSituation[]>([]);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ProtectionResult | null>(null);

  const setMode = (next: ProtectionMode) => {
    setModeState(next);
    setSituations((current) => normalizeSituations(next, current));
    setError(undefined);
  };

  const toggleSituation = (value: ProtectionSituation) => {
    setSituations((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
    setError(undefined);
  };

  const call = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      showAlert(t('Não foi possível abrir o telefone'), t('Ligue manualmente para {number}.', { number }));
    });
  };

  const submit = async () => {
    const chosen = normalizeSituations(mode, situations);
    if (chosen.length === 0) {
      setError(t('Escolha pelo menos uma opção.'));
      return;
    }
    if (looksLikeLocation(details)) {
      const keep = await confirmAction({
        title: t('Você escreveu um endereço?'),
        message: t('Não precisamos saber onde você está para analisar o pedido. Se quiser, apague o endereço antes de enviar.'),
        confirmLabel: t('Enviar assim mesmo'),
        cancelLabel: t('Voltar e apagar'),
      });
      if (!keep) return;
    }

    setSending(true);
    const urgent = isUrgentProtection(mode, chosen);
    let registered = false;
    try {
      if (sessionUser && publishedCaseId) {
        try {
          await reportMutation.mutateAsync({
            targetType: 'MissingPerson',
            targetId: publishedCaseId,
            reason: protectionReportReason(mode, chosen),
          });
          registered = true;
        } catch {
          // Sem internet ou erro da API: o e-mail abaixo continua sendo o caminho do pedido.
          registered = false;
        }
      }

      const email = buildProtectionEmail(
        { mode, situations: chosen, details, caseId, registeredInApp: registered },
        t,
      );
      const emailOpened = await openSupportEmail({
        topic: 'protecao',
        subject: email.subject,
        message: email.body,
        accountEmail: sessionUser?.email ?? undefined,
      });
      if (!emailOpened && !registered) {
        showAlert(
          t('Não foi possível abrir o e-mail'),
          t('Escreva para {email} com o assunto "{subject}".', {
            email: AppInfo.supportEmail,
            subject: email.subject,
          }),
        );
      }
      setResult({ registered, emailOpened, urgent });
    } finally {
      setSending(false);
    }
  };

  return {
    goBack,
    mode,
    setMode,
    caseId,
    hasPublishedCase: publishedCaseId != null,
    loggedIn: sessionUser != null,
    situations,
    toggleSituation,
    details,
    setDetails: (value: string) => {
      setDetails(value);
      setError(undefined);
    },
    error,
    sending,
    submit: () => void submit(),
    result,
    startOver: () => {
      setResult(null);
      setSituations([]);
      setDetails('');
    },
    call,
    goToEmergency: () => router.push('/pedir-ajuda' as Href),
    goToLogin: () =>
      router.push({
        pathname: '/login',
        params: { returnTo: caseId ? `/protecao?caso=${caseId}&modo=${mode}` : `/protecao?modo=${mode}` },
      } as Href),
    goToCase: caseId ? () => router.push(`/pessoa/${caseId}` as Href) : undefined,
    supportEmail: AppInfo.supportEmail,
  };
}

export type ProtecaoController = ReturnType<typeof useProtecaoController>;

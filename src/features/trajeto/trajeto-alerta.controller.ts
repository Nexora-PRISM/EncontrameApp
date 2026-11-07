import * as Linking from 'expo-linking';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useTripFormat } from '@/features/trajeto/use-trip-format';
import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { TRIP_ALERT_REASON_LABEL } from '@/lib/trip-labels';
import { CONTACT_ATTEMPT_MAX, contactAttemptError } from '@/lib/trip-rules';
import { tripErrorCode } from '@/services/trips/trips.errors';
import { useTripActions, useTripQuery } from '@/services/trips/trips.service';
import type { TripAlertReceipt } from '@/services/trips/trips.types';

/**
 * "/trajeto/[id]/alerta": um contato escolhido aciona o Sinal de Alerta. Só com motivo (o servidor confere), dizendo
 * como tentou falar com a pessoa. Vai para a equipe do Encontra-me, nunca para o público, e não chama a polícia.
 * A tela só diz "recebido" com número e horário vindos do servidor.
 */
export function useTrajetoAlertaController() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const raw = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = raw && /^[A-Za-z0-9_-]{1,64}$/.test(raw) ? raw : null;
  const goBack = useSafeBack((id ? `/trajeto/${id}` : '/trajeto') as Href);
  const query = useTripQuery(id);
  const actions = useTripActions();
  const format = useTripFormat();

  const [tried, setTried] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [errors, setErrors] = useState<{ tried?: string; attempt?: string }>({});
  const [receipt, setReceipt] = useState<TripAlertReceipt | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const trip = query.data ?? null;

  const submit = () => {
    if (!id || actions.raiseAlert.isPending) return;
    const problem = contactAttemptError(attempt);
    const next = {
      tried: tried ? undefined : t('Confirme que tentou falar com a pessoa antes de acionar.'),
      attempt:
        problem === 'required'
          ? t('Conte como e quando você tentou falar com a pessoa.')
          : problem === 'too_short'
            ? t('Escreva pelo menos 10 letras.')
            : problem === 'too_long'
              ? t('Texto muito longo.')
              : undefined,
    };
    setErrors(next);
    if (next.tried || next.attempt) return;
    setFailure(null);
    void actions.raiseAlert
      .mutateAsync({ id, payload: { contactAttempt: attempt.trim(), triedToContact: true } })
      .then((result) => {
        // Só confirma com número e horário do servidor.
        if (result.alertId && result.receivedAt) setReceipt(result);
        else setFailure(t('Não foi possível confirmar o envio. Tente de novo; se houver risco, ligue 190.'));
      })
      .catch((error: unknown) => {
        const code = tripErrorCode(error);
        if (code === 'too_early') {
          setFailure(t('Ainda não há motivo para o alerta: o trajeto está dentro do horário e com localização recente. Tente falar com a pessoa.'));
        } else if (code === 'limit_reached') {
          setFailure(t('Você já acionou o limite de alertas das últimas 24 horas. Se houver risco, ligue 190.'));
        } else if (code === 'not_found') {
          setFailure(t('Este trajeto não está mais disponível para você.'));
        } else {
          setFailure(t('O alerta não foi confirmado. Confira sua conexão e tente de novo; se houver risco, ligue 190.'));
        }
      });
  };

  return {
    enabled: env.tripSharingEnabled,
    goBack,
    loading: query.isLoading,
    unavailable: id == null || query.isError,
    trip,
    reasonLabel: trip?.alertReason ? t(TRIP_ALERT_REASON_LABEL[trip.alertReason]) : '',
    alreadyOpen: trip?.alert != null && (trip.alert.status === 'open' || trip.alert.status === 'monitoring'),
    tried,
    toggleTried: () => {
      setTried((value) => !value);
      setErrors((current) => ({ ...current, tried: undefined }));
    },
    attempt,
    setAttempt: (value: string) => {
      setAttempt(value.slice(0, CONTACT_ATTEMPT_MAX + 50));
      setErrors((current) => ({ ...current, attempt: undefined }));
    },
    attemptMax: CONTACT_ATTEMPT_MAX,
    errors,
    sending: actions.raiseAlert.isPending,
    submit,
    failure,
    receipt,
    receiptText: receipt
      ? t('Sinal de Alerta nº {id} recebido às {clock}.', { id: receipt.alertId, clock: format.clock(receipt.receivedAt) })
      : '',
    receiptPoint: receipt?.lastPoint
      ? t('Última localização registrada às {clock}.', { clock: format.clock(receipt.lastPoint.recordedAt) })
      : receipt
        ? t('Nenhuma localização foi registrada neste trajeto.')
        : '',
    /** Volta à tela do trajeto que abriu o alerta (sem empilhar outra cópia dela). */
    backToTrip: goBack,
    registerCase: () => {
      if (id) router.push({ pathname: '/cadastrar-pessoa', params: { trajeto: id } } as Href);
    },
    call190: () => {
      void Linking.openURL('tel:190').catch(() => showAlert(t('Não foi possível abrir o telefone'), t('Ligue 190 pelo telefone do aparelho.')));
    },
  };
}

export type TrajetoAlertaController = ReturnType<typeof useTrajetoAlertaController>;

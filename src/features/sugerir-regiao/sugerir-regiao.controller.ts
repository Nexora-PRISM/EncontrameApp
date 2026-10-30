import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { isReceiptConfirmed, type RegionSuggestionError, validateRegionSuggestion } from '@/lib/collaboration-rules';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import { useSuggestRegionMutation } from '@/services/collaboration/collaboration.service';
import { usePersonQuery } from '@/services/people/people.service';

/** "/pessoa/[id]/sugerir-regiao": a pessoa sugere uma região onde divulgar o caso. A equipe decide. */
export function useSugerirRegiaoController() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');
  const goBack = useSafeBack(`/pessoa/${id}` as Href);
  const user = useSessionUser();
  const person = usePersonQuery(id).data ?? null;
  const mutation = useSuggestRegionMutation();
  const [place, setPlace] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<RegionSuggestionError[]>([]);
  const [message, setMessage] = useState<string | undefined>();
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!user) {
      router.push({ pathname: '/login', params: { returnTo: `/pessoa/${id}/sugerir-regiao` } } as Href);
      return;
    }
    const found = validateRegionSuggestion(place, reason);
    setErrors(found);
    setMessage(undefined);
    if (found.length > 0) return;
    void (async () => {
      try {
        const receipt = await mutation.mutateAsync({ personId: id, place: place.trim(), reason: reason.trim() });
        if (!isReceiptConfirmed(receipt.id, receipt.receivedAt)) {
          setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
          return;
        }
        setDone(true);
        setMessage(
          receipt.simulated
            ? t('Sugestão recebida. Modo de demonstração: nada foi enviado de verdade.')
            : t('Sugestão recebida. A equipe analisa antes de ampliar a divulgação.'),
        );
      } catch {
        setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
      }
    })();
  };

  return {
    id,
    goBack,
    enabled: env.searchNetworkEnabled,
    name: person?.nickname ?? person?.fullName,
    place,
    setPlace: (value: string) => {
      setPlace(value);
      setErrors((current) => current.filter((item) => item !== 'place'));
    },
    reason,
    setReason: (value: string) => {
      setReason(value);
      setErrors((current) => current.filter((item) => item !== 'reason'));
    },
    errors,
    message,
    done,
    sending: mutation.isPending,
    submit,
    backToCase: () => router.replace(`/pessoa/${id}` as Href),
  };
}

export type SugerirRegiaoController = ReturnType<typeof useSugerirRegiaoController>;

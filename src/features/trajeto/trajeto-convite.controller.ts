import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useTripFormat } from '@/features/trajeto/use-trip-format';
import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { normalizeInviteCode } from '@/lib/trip-rules';
import { enableTripNotifications } from '@/services/notifications/notifications.service';
import { useTripActions, useTripInvitePreviewQuery } from '@/services/trips/trips.service';

/**
 * "/trajeto/convite/[code]": quem recebeu o convite vê de quem é e decide. Aceitar = consentir em ser escolhido
 * como contato de confiança dos trajetos dessa pessoa. Convite vencido, usado ou inválido aparece como indisponível.
 */
export function useTrajetoConviteController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/trajeto' as Href);
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const raw = Array.isArray(params.code) ? params.code[0] : params.code;
  const code = normalizeInviteCode(raw);
  const preview = useTripInvitePreviewQuery(code);
  const actions = useTripActions();
  const format = useTripFormat();
  const [accepting, setAccepting] = useState(false);

  const accept = () => {
    if (!code || accepting) return;
    setAccepting(true);
    void (async () => {
      try {
        const contact = await actions.acceptInvite.mutateAsync(code);
        await enableTripNotifications();
        showAlert(
          t('Convite aceito'),
          t('{name} pode escolher você para acompanhar os próximos trajetos. Você recebe um aviso quando isso acontecer.', { name: contact.name }),
        );
        router.replace('/trajeto' as Href);
      } catch {
        showAlert(t('Não foi possível aceitar'), t('O convite pode ter vencido ou já ter sido usado. Peça um novo.'));
      } finally {
        setAccepting(false);
      }
    })();
  };

  const data = preview.data ?? null;
  return {
    enabled: env.tripSharingEnabled,
    goBack,
    loading: preview.isLoading,
    unavailable: code == null || preview.isError,
    preview: data,
    expires: data ? t('Convite válido até {date}.', { date: format.dateTime(data.expiresAt) }) : '',
    accepting,
    accept,
    decline: () => router.replace('/trajeto' as Href),
  };
}

export type TrajetoConviteController = ReturnType<typeof useTrajetoConviteController>;

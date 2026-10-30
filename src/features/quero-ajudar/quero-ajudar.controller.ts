import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { isReceiptConfirmed, type VolunteerError, type VolunteerWay, validateVolunteer } from '@/lib/collaboration-rules';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import { useVolunteerActions, useVolunteerQuery } from '@/services/collaboration/collaboration.service';

/** "/quero-ajudar": orientações de segurança e cadastro mínimo de voluntário. Sem ranking. */
export function useQueroAjudarController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/inicio' as Href);
  const user = useSessionUser();
  const query = useVolunteerQuery();
  const actions = useVolunteerActions();
  const profile = query.data ?? null;

  const [region, setRegion] = useState('');
  const [ways, setWays] = useState<VolunteerWay[]>([]);
  const [availability, setAvailability] = useState('');
  const [alerts, setAlerts] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<VolunteerError[]>([]);
  const [message, setMessage] = useState<string | undefined>();

  // Preenche o formulário quando o cadastro salvo chega (ajuste durante a renderização, sem efeito).
  const [filledFrom, setFilledFrom] = useState<typeof profile>(null);
  if (profile && profile !== filledFrom) {
    setFilledFrom(profile);
    setRegion(profile.region);
    setWays(profile.ways);
    setAvailability(profile.availability ?? '');
    setAlerts(profile.alerts);
    setAccepted(true);
  }

  const clear = (key: VolunteerError) => setErrors((current) => current.filter((item) => item !== key));

  const save = () => {
    const found = validateVolunteer({ region, ways, availability, acceptedGuidelines: accepted });
    setErrors(found);
    setMessage(undefined);
    if (found.length > 0) return;
    void (async () => {
      try {
        const receipt = await actions.save.mutateAsync({
          region: region.trim(),
          ways,
          availability: availability.trim() || undefined,
          alerts,
        });
        if (!isReceiptConfirmed(receipt.id, receipt.receivedAt)) {
          setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
          return;
        }
        setMessage(
          receipt.simulated
            ? t('Cadastro de voluntário recebido. Modo de demonstração: nada foi enviado de verdade.')
            : t('Cadastro de voluntário recebido. Obrigado por ajudar!'),
        );
      } catch {
        setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
      }
    })();
  };

  const leave = () => {
    void (async () => {
      const ok = await confirmAction({
        title: t('Sair do voluntariado?'),
        message: t('Você deixa de receber pedidos e alertas de voluntariado.'),
        confirmLabel: t('Sair'),
      });
      if (!ok) return;
      try {
        await actions.leave.mutateAsync();
        setRegion('');
        setWays([]);
        setAvailability('');
        setAccepted(false);
        setMessage(t('Você saiu do voluntariado.'));
      } catch {
        showAlert(t('Não foi possível concluir'), t('Tente de novo em alguns instantes.'));
      }
    })();
  };

  return {
    goBack,
    enabled: env.volunteersEnabled,
    loggedIn: user != null,
    loading: query.isLoading,
    isVolunteer: profile != null,
    region,
    setRegion: (value: string) => {
      setRegion(value);
      clear('region');
    },
    ways,
    toggleWay: (way: VolunteerWay) => {
      setWays((current) => (current.includes(way) ? current.filter((item) => item !== way) : [...current, way]));
      clear('ways');
    },
    availability,
    setAvailability,
    alerts,
    setAlerts,
    accepted,
    toggleAccepted: () => {
      setAccepted((current) => !current);
      clear('guidelines');
    },
    errors,
    message,
    saving: actions.save.isPending,
    save,
    leave,
    goToLogin: () => router.push({ pathname: '/login', params: { returnTo: '/quero-ajudar' } } as Href),
  };
}

export type QueroAjudarController = ReturnType<typeof useQueroAjudarController>;

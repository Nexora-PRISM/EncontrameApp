import { type Href } from 'expo-router';
import { useState } from 'react';

import { centralErrorText } from '@/features/central/dossie.controller';
import { useVisionFormat } from '@/features/vision/vision-format';
import { centralCan, centralJustificationError, overallHealth } from '@/lib/central-rules';
import { isReceiptConfirmed } from '@/lib/collaboration-rules';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useCentralAccessQuery, useCentralActions, useTechnicalStatusQuery } from '@/services/central/central.service';

/** "/central-tecnica": saúde do sistema para a equipe técnica — sem acesso ao conteúdo dos dossiês. */
export function useCentralTecnicaController() {
  const t = useT();
  const goBack = useSafeBack('/institucional' as Href);
  const accessQuery = useCentralAccessQuery();
  const allowed = centralCan(accessQuery.data, 'view_technical');
  const query = useTechnicalStatusQuery(allowed);
  const actions = useCentralActions();
  const format = useVisionFormat();
  const [target, setTarget] = useState('');
  const [justification, setJustification] = useState('');
  const [message, setMessage] = useState<string | undefined>();

  const status = query.data;

  const requestAccess = () => {
    if (target.trim().length < 3 || centralJustificationError(justification)) {
      setMessage(t('Diga o que precisa acessar e por quê (pelo menos 15 letras).'));
      return;
    }
    void (async () => {
      try {
        const receipt = await actions.exceptionalAccess.mutateAsync({ target: target.trim(), justification: justification.trim() });
        if (!isReceiptConfirmed(receipt.id, receipt.receivedAt)) {
          setMessage(t('O envio não foi confirmado. Tente de novo em alguns instantes.'));
          return;
        }
        setMessage(
          t('Pedido {id} registrado. O acesso só é liberado depois da aprovação de quem responde pelos dados, por tempo limitado e com registro.', {
            id: receipt.id ?? '',
          }),
        );
        setTarget('');
        setJustification('');
      } catch (error) {
        setMessage(t(centralErrorText(error)));
      }
    })();
  };

  return {
    goBack,
    enabled: env.centralEnabled,
    demo: env.useMocks,
    format,
    checking: accessQuery.isLoading,
    allowed,
    loading: query.isLoading,
    error: query.isError,
    retry: () => {
      void query.refetch();
    },
    status,
    overall: status ? overallHealth(status.services.map((item) => item.state)) : null,
    target,
    justification,
    message,
    sending: actions.exceptionalAccess.isPending,
    setTarget,
    setJustification,
    requestAccess,
  };
}

export type CentralTecnicaController = ReturnType<typeof useCentralTecnicaController>;

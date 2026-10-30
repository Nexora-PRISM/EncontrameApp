import { type Href } from 'expo-router';
import { useState } from 'react';

import { useVisionFormat, visionErrorText } from '@/features/vision/vision-format';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { tr } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { preservationLetterText } from '@/lib/vision-rules';
import type { RequestView } from '@/services/vision/vision.derive';
import { useReceivedRequestsQuery, useVisionActions } from '@/services/vision/vision.service';

/** "/vision/pedidos": pedidos de preservação recebidos pelo responsável por câmera. A decisão é dele. */
export function usePedidosController() {
  const goBack = useSafeBack('/vision/minhas-cameras' as Href);
  const query = useReceivedRequestsQuery(true);
  const actions = useVisionActions();
  const format = useVisionFormat();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openLetter, setOpenLetter] = useState<string | null>(null);

  const letter = (request: RequestView) =>
    preservationLetterText({
      requestId: request.id,
      cameraName: request.cameraName,
      ownerName: request.ownerName,
      region: request.region,
      city: request.city,
      fromText: format.dateTime(request.from),
      toText: format.dateTime(request.to),
      deadlineText: format.dateTime(request.deadline),
      caseReference: request.caseReference,
      institution: request.institution,
      requesterName: request.requesterName,
      contact: request.contact,
    });

  const answer = (request: RequestView, accept: boolean) => {
    void (async () => {
      const ok = await confirmAction({
        title: accept ? tr('Aceitar preservar as gravações?') : tr('Recusar o pedido?'),
        message: accept
          ? tr('Você se compromete a não apagar as gravações desse intervalo. A entrega das imagens é combinada depois, com registro.')
          : tr('A recusa fica registrada. Se houver ordem judicial, ela chega por canal oficial, separado deste pedido.'),
        confirmLabel: accept ? tr('Aceitar') : tr('Recusar'),
      });
      if (!ok) return;
      try {
        await actions.movePreservation.mutateAsync({
          requestId: request.id,
          status: accept ? 'accepted' : 'declined',
          note: notes[request.id] ?? '',
        });
        setNotes((current) => ({ ...current, [request.id]: '' }));
      } catch (error) {
        showAlert(tr('Não foi possível concluir'), tr(visionErrorText(error)));
      }
    })();
  };

  return {
    goBack,
    enabled: env.visionEnabled,
    demo: env.useMocks,
    format,
    requests: query.data ?? [],
    loading: query.isLoading,
    error: query.isError,
    retry: () => {
      void query.refetch();
    },
    busy: actions.movePreservation.isPending,
    noteFor: (id: string) => notes[id] ?? '',
    setNote: (id: string, value: string) => setNotes((current) => ({ ...current, [id]: value })),
    letterOpen: (id: string) => openLetter === id,
    toggleLetter: (id: string) => setOpenLetter((current) => (current === id ? null : id)),
    letter,
    accept: (request: RequestView) => answer(request, true),
    decline: (request: RequestView) => answer(request, false),
  };
}

export type PedidosController = ReturnType<typeof usePedidosController>;

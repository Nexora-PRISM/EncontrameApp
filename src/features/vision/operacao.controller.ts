import { type Href, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useVisionFormat, visionErrorText } from '@/features/vision/vision-format';
import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { tr, useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { useSafeBack } from '@/lib/safe-back';
import { shareText } from '@/lib/share';
import {
  can,
  classifyError,
  isInstitutional,
  type MatchClass,
  type PreservationStatus,
  preservationActor,
  preservationLetterText,
  preservationNext,
  preservationWindowError,
  type Reliability,
  reliabilityChangeError,
  stepRadius,
  visionJustificationError,
} from '@/lib/vision-rules';
import type { RequestView } from '@/services/vision/vision.derive';
import {
  useOperationQuery,
  useVisionAccessQuery,
  useVisionActions,
  useVisionAuditQuery,
} from '@/services/vision/vision.service';
import type { ClipAccess, CollaborativeInfo, VisualMatch } from '@/services/vision/vision.types';

export const OPERATION_TABS = ['summary', 'cameras', 'preservation', 'matches', 'trajectory', 'infos', 'history'] as const;
export type OperationTab = (typeof OPERATION_TABS)[number];

export const OPERATION_TAB_LABEL: Readonly<Record<OperationTab, string>> = {
  summary: msg('Resumo'),
  cameras: msg('Câmeras'),
  preservation: msg('Preservação'),
  matches: msg('Correspondências'),
  trajectory: msg('Trajeto'),
  infos: msg('Outras fontes'),
  history: msg('Histórico'),
};

const MIN = 60 * 1000;

/** "/vision/institucional/operacao/[id]": painel de uma operação de busca audiovisual. */
export function useOperacaoController() {
  const t = useT();
  const goBack = useSafeBack('/vision/institucional' as Href);
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');
  const accessQuery = useVisionAccessQuery();
  const access = accessQuery.data ?? null;
  const institutional = isInstitutional(access);
  const query = useOperationQuery(id, institutional);
  const auditQuery = useVisionAuditQuery(id, can(access, 'view_audit'));
  const actions = useVisionActions();
  const format = useVisionFormat();

  const [tab, setTab] = useState<OperationTab>('summary');
  const [justification, setJustification] = useState('');
  const [justificationError, setJustificationError] = useState<string | undefined>();
  const [clips, setClips] = useState<Record<string, ClipAccess>>({});

  /** Justificativa da próxima ação (vale para uma ação e é limpa depois). */
  const takeJustification = (): string | null => {
    const problem = visionJustificationError(justification);
    if (!problem) {
      setJustificationError(undefined);
      return justification.trim();
    }
    setJustificationError(
      problem === 'too_long' ? t('Texto muito longo.') : t('Escreva a justificativa (pelo menos 15 letras).'),
    );
    return null;
  };

  const run = (work: () => Promise<unknown>) => {
    void (async () => {
      try {
        await work();
        setJustification('');
      } catch (error) {
        showAlert(tr('Não foi possível concluir'), tr(visionErrorText(error)));
      }
    })();
  };

  const view = query.data;
  const operation = view?.operation;

  const changeRadius = (direction: 'up' | 'down') => {
    if (!operation) return;
    const next = stepRadius(operation.radiusKm, direction);
    if (next === operation.radiusKm) return;
    const note = takeJustification();
    if (!note) return;
    run(() => actions.changeRadius.mutateAsync({ operationId: operation.id, radiusKm: next, justification: note }));
  };

  const requestPreservation = (cameraId: string) => {
    if (!operation) return;
    const seenAt = Date.parse(operation.lastSeenAt);
    const from = seenAt - 30 * MIN;
    const to = seenAt + 90 * MIN;
    if (preservationWindowError(from, to, Date.now())) {
      showAlert(tr('Intervalo inválido'), tr('Confira a data e o horário do último local conhecido.'));
      return;
    }
    const note = takeJustification();
    if (!note) return;
    run(() =>
      actions.requestPreservation.mutateAsync({
        operationId: operation.id,
        cameraId,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
        justification: note,
      }),
    );
  };

  /** Passos que a equipe institucional registra (aceitar e recusar são do responsável pela câmera). */
  const institutionSteps = (request: RequestView): PreservationStatus[] =>
    preservationNext(request.status).filter((status) => preservationActor(status) === 'institution');

  const movePreservation = (request: RequestView, status: PreservationStatus) => {
    const note = takeJustification();
    if (!note) return;
    run(() => actions.movePreservation.mutateAsync({ requestId: request.id, status, note }));
  };

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

  const shareLetter = (request: RequestView) => {
    void shareText(letter(request), tr('Pedido de preservação de imagens'));
  };

  const openClip = (match: VisualMatch) => {
    const note = takeJustification();
    if (!note) return;
    void (async () => {
      try {
        const granted = await actions.openClip.mutateAsync({ clipId: match.clipId, justification: note });
        setClips((current) => ({ ...current, [match.clipId]: granted }));
        setJustification('');
      } catch (error) {
        showAlert(tr('Não foi possível concluir'), tr(visionErrorText(error)));
      }
    })();
  };

  const classify = (match: VisualMatch, next: MatchClass) => {
    const problem = classifyError(match.classification, next, justification, clips[match.clipId] != null);
    if (problem === 'clip_not_reviewed') {
      showAlert(tr('Assista ao trecho antes'), tr('Só dá para confirmar uma correspondência depois de abrir o trecho de vídeo.'));
      return;
    }
    if (problem === 'same') return;
    const note = takeJustification();
    if (!note) return;
    run(() => actions.classifyMatch.mutateAsync({ matchId: match.id, classification: next, note }));
  };

  const rateInfo = (info: CollaborativeInfo, next: Reliability) => {
    const problem = reliabilityChangeError(info.reliability, next, justification);
    if (problem === 'same' || problem === 'invalid') return;
    const note = takeJustification();
    if (!note) return;
    run(() => actions.rateInfo.mutateAsync({ infoId: info.id, reliability: next, note }));
  };

  const busy =
    actions.changeRadius.isPending ||
    actions.requestPreservation.isPending ||
    actions.movePreservation.isPending ||
    actions.classifyMatch.isPending ||
    actions.openClip.isPending ||
    actions.rateInfo.isPending;

  return {
    id,
    goBack,
    enabled: env.visionEnabled,
    demo: env.useMocks,
    format,
    checking: accessQuery.isLoading,
    institutional,
    viewerName: access?.userName ?? '—',
    loading: query.isLoading,
    error: query.isError,
    retry: () => {
      void query.refetch();
    },
    view,
    tab,
    setTab,
    justification,
    justificationError,
    setJustification: (value: string) => {
      setJustification(value);
      if (justificationError) setJustificationError(undefined);
    },
    busy,
    permissions: {
      changeRadius: can(access, 'change_radius'),
      requestPreservation: can(access, 'request_preservation'),
      viewFootage: can(access, 'view_footage'),
      classify: can(access, 'classify_match'),
      rate: can(access, 'rate_information'),
      audit: can(access, 'view_audit'),
    },
    audit: auditQuery.data ?? [],
    auditLoading: auditQuery.isLoading,
    changeRadius,
    requestPreservation,
    institutionSteps,
    movePreservation,
    letter,
    shareLetter,
    clipFor: (match: VisualMatch) => clips[match.clipId],
    openClip,
    classify,
    rateInfo,
  };
}

export type OperacaoController = ReturnType<typeof useOperacaoController>;

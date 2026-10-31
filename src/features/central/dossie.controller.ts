import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { useVisionFormat } from '@/features/vision/vision-format';
import { LEGAL_BASIS_LABEL } from '@/lib/central-labels';
import {
  centralCan,
  centralJustificationError,
  type ClosureOutcome,
  crossTips,
  type InfoNature,
  LEGAL_BASES,
  type LegalBasis,
  movementHypothesis,
  type TipStatus,
} from '@/lib/central-rules';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { tr, useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { dateToIso, maskDate } from '@/lib/masks';
import { useSafeBack } from '@/lib/safe-back';
import { CentralDeniedError } from '@/services/central/central.errors';
import { useCentralAccessQuery, useCentralActions, useDossierQuery } from '@/services/central/central.service';
import type { DossierTip, WitnessIdentity } from '@/services/central/central.types';

export const DOSSIER_TABS = ['summary', 'timeline', 'tips', 'files', 'preservation', 'mobilization', 'closure', 'history'] as const;
export type DossierTab = (typeof DOSSIER_TABS)[number];

export const DOSSIER_TAB_LABEL: Readonly<Record<DossierTab, string>> = {
  summary: msg('Resumo'),
  timeline: msg('Cronologia'),
  tips: msg('Pistas'),
  files: msg('Arquivos'),
  preservation: msg('Preservação'),
  mobilization: msg('Mobilização'),
  closure: msg('Encerramento'),
  history: msg('Histórico'),
};

const ERROR_TEXT = {
  role: msg('Sua função não permite esta ação. A tentativa ficou registrada na auditoria.'),
  mfa: msg('Confirme o segundo fator (autenticação em dois fatores) para fazer isto.'),
  justification: msg('Escreva a justificativa (pelo menos 15 letras).'),
  invalid: msg('Confira os dados e tente de novo.'),
  flow: msg('Este passo não é possível na situação atual.'),
  generic: msg('Não foi possível concluir agora. Tente de novo em alguns instantes.'),
} as const;

export function centralErrorText(error: unknown): string {
  return error instanceof CentralDeniedError ? ERROR_TEXT[error.reason] : ERROR_TEXT.generic;
}

/** "/institucional/dossie/[id]": dossiê do caso com abas, decisões justificadas e registro de tudo. */
export function useDossieController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/institucional' as Href);
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');
  const accessQuery = useCentralAccessQuery();
  const access = accessQuery.data ?? null;
  const allowed = centralCan(access, 'view_dossiers');
  const query = useDossierQuery(id, allowed);
  const actions = useCentralActions();
  const format = useVisionFormat();

  const [tab, setTab] = useState<DossierTab>('summary');
  const [natureFilter, setNatureFilter] = useState<InfoNature | 'all'>('all');
  const [justification, setJustification] = useState('');
  const [justificationError, setJustificationError] = useState<string | undefined>();
  const [identities, setIdentities] = useState<Record<string, WitnessIdentity>>({});
  const [preservation, setPreservation] = useState({ legalBasis: '', reference: '', scope: '', until: '' });
  const [preservationError, setPreservationError] = useState<string | undefined>();
  const [outcome, setOutcome] = useState<ClosureOutcome>('found');

  const dossier = query.data;

  const takeJustification = (): string | null => {
    const problem = centralJustificationError(justification);
    if (!problem) {
      setJustificationError(undefined);
      return justification.trim();
    }
    setJustificationError(problem === 'too_long' ? t('Texto muito longo.') : t('Escreva a justificativa (pelo menos 15 letras).'));
    return null;
  };

  const run = (work: () => Promise<unknown>) => {
    void (async () => {
      try {
        await work();
        setJustification('');
      } catch (error) {
        showAlert(tr('Não foi possível concluir'), tr(centralErrorText(error)));
      }
    })();
  };

  const analysis = useMemo(() => {
    if (!dossier) return { links: [], sequence: [] as string[] };
    const located = dossier.tips
      .filter((tip) => tip.status !== 'not_confirmed' && tip.status !== 'duplicate')
      .map((tip) => ({
        id: tip.id,
        text: tip.text,
        at: Date.parse(tip.happenedAt ?? tip.receivedAt),
        latitude: tip.latitude,
        longitude: tip.longitude,
      }));
    return { links: crossTips(located), sequence: movementHypothesis(located) };
  }, [dossier]);

  const reviewTip = (tip: DossierTip, status: TipStatus) => {
    if (!dossier || tip.status === status) return;
    const note = takeJustification();
    if (!note) return;
    run(() => actions.reviewTip.mutateAsync({ dossierId: dossier.id, tipId: tip.id, status, note }));
  };

  const openIdentity = (tip: DossierTip) => {
    if (!dossier) return;
    const note = takeJustification();
    if (!note) return;
    void (async () => {
      try {
        const identity = await actions.openIdentity.mutateAsync({ dossierId: dossier.id, tipId: tip.id, justification: note });
        setIdentities((current) => ({ ...current, [tip.id]: identity }));
        setJustification('');
      } catch (error) {
        showAlert(tr('Não foi possível concluir'), tr(centralErrorText(error)));
      }
    })();
  };

  const addPreservation = () => {
    if (!dossier) return;
    const basis = (Object.entries(LEGAL_BASIS_LABEL) as [LegalBasis, string][]).find(([, label]) => label === preservation.legalBasis)?.[0];
    const untilIso = dateToIso(preservation.until);
    if (!basis || preservation.reference.trim().length < 3 || preservation.scope.trim().length < 5 || !untilIso) {
      setPreservationError(t('Preencha fundamento, referência do pedido, escopo e a data final (dd/mm/aaaa).'));
      return;
    }
    setPreservationError(undefined);
    const note = takeJustification();
    if (!note) return;
    run(async () => {
      await actions.addPreservation.mutateAsync({
        dossierId: dossier.id,
        legalBasis: basis,
        reference: preservation.reference.trim(),
        scope: preservation.scope.trim(),
        until: untilIso,
        justification: note,
      });
      setPreservation({ legalBasis: '', reference: '', scope: '', until: '' });
    });
  };

  const changeArea = (areaId: string, action: 'expand' | 'pause' | 'resume') => {
    if (!dossier) return;
    const note = takeJustification();
    if (!note) return;
    run(() => actions.changeMobilization.mutateAsync({ dossierId: dossier.id, areaId, action, justification: note }));
  };

  const closeCase = () => {
    if (!dossier) return;
    const note = takeJustification();
    if (!note) return;
    void (async () => {
      const ok = await confirmAction({
        title: tr('Encerrar o caso?'),
        message: tr('Os alertas e a mobilização param, a página pública passa a mostrar só a situação, e os registros ficam preservados.'),
        confirmLabel: tr('Encerrar'),
      });
      if (!ok) return;
      run(() => actions.closeCase.mutateAsync({ dossierId: dossier.id, outcome, justification: note }));
    })();
  };

  const createLink = (exportId: string, hours: number) => {
    if (!dossier) return;
    const note = takeJustification();
    if (!note) return;
    run(() => actions.createLink.mutateAsync({ dossierId: dossier.id, exportId, hours, justification: note }));
  };

  const revokeLink = (exportId: string, linkId: string) => {
    if (!dossier) return;
    const note = takeJustification();
    if (!note) return;
    run(() => actions.revokeLink.mutateAsync({ dossierId: dossier.id, exportId, linkId, justification: note }));
  };

  const busy =
    actions.reviewTip.isPending ||
    actions.openIdentity.isPending ||
    actions.addPreservation.isPending ||
    actions.changeMobilization.isPending ||
    actions.closeCase.isPending ||
    actions.createLink.isPending ||
    actions.revokeLink.isPending;

  return {
    id,
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
    dossier,
    tab,
    setTab,
    natureFilter,
    setNatureFilter,
    justification,
    justificationError,
    setJustification: (value: string) => {
      setJustification(value);
      if (justificationError) setJustificationError(undefined);
    },
    busy,
    can: {
      review: centralCan(access, 'review_tip'),
      identity: centralCan(access, 'view_witness_identity'),
      preserve: centralCan(access, 'preserve_records'),
      mobilize: centralCan(access, 'manage_mobilization'),
      export: centralCan(access, 'export_dossier'),
      links: centralCan(access, 'manage_links'),
      close: centralCan(access, 'close_case'),
    },
    analysis,
    identityFor: (tipId: string) => identities[tipId],
    reviewTip,
    openIdentity,
    preservation,
    preservationError,
    legalBasisOptions: LEGAL_BASES.map((basis) => LEGAL_BASIS_LABEL[basis]),
    setPreservationField: (key: keyof typeof preservation, value: string) =>
      setPreservation((current) => ({ ...current, [key]: key === 'until' ? maskDate(value) : value })),
    addPreservation,
    changeArea,
    outcome,
    setOutcome,
    closeCase,
    createLink,
    revokeLink,
    goToExport: () => router.push(`/institucional/dossie/${encodeURIComponent(id)}/exportar` as Href),
    goToVision: (operationId: string) => router.push(`/vision/institucional/operacao/${encodeURIComponent(operationId)}` as Href),
    visionEnabled: env.visionEnabled,
  };
}

export type DossieController = ReturnType<typeof useDossieController>;

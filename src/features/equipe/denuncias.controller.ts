import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useJustification } from '@/features/equipe/use-justification';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useI18n, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { sortReportsForReview } from '@/lib/team-rules';
import { useIsStaffQuery, useTeamActions, useTeamReportsQuery } from '@/services/team/team.service';
import type { TeamContentReport } from '@/services/team/team.types';

/** "/equipe/denuncias": denúncias abertas, golpes e informação falsa primeiro. */
export function useDenunciasController() {
  const t = useT();
  const { language } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/equipe' as Href);
  const staffQuery = useIsStaffQuery();
  const isStaff = staffQuery.data === true;
  const reportsQuery = useTeamReportsQuery(isStaff);
  const actions = useTeamActions();
  const justification = useJustification();
  const reports = useMemo(() => sortReportsForReview(reportsQuery.data ?? []), [reportsQuery.data]);

  const decide = (report: TeamContentReport, hide: boolean) => {
    const reason = justification.take();
    if (!reason) return;
    void (async () => {
      const ok = await confirmAction({
        title: hide ? t('Ocultar este conteúdo?') : t('Manter este conteúdo?'),
        message: hide
          ? t('O conteúdo deixa de aparecer no app. A decisão pode ser revista depois.')
          : t('A denúncia é encerrada e o conteúdo continua no app.'),
        confirmLabel: hide ? t('Ocultar') : t('Manter'),
      });
      if (!ok) return;
      try {
        await (hide ? actions.hideReport : actions.dismissReport).mutateAsync(report.id);
        justification.clear();
      } catch {
        showAlert(t('Não foi possível concluir'), t('Tente de novo em alguns instantes.'));
      }
    })();
  };

  return {
    goBack,
    demo: env.useMocks,
    checking: staffQuery.isLoading,
    checkFailed: staffQuery.isError,
    isStaff,
    retry: () => {
      void staffQuery.refetch();
    },
    loading: reportsQuery.isLoading,
    error: reportsQuery.isError,
    reports,
    justification,
    busy: actions.hideReport.isPending || actions.dismissReport.isPending,
    formatDate: (iso: string) => {
      const date = new Date(iso);
      return Number.isNaN(date.getTime())
        ? iso
        : new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short' }).format(date);
    },
    hide: (report: TeamContentReport) => decide(report, true),
    keep: (report: TeamContentReport) => decide(report, false),
    openCase: (id: string) => router.push(`/pessoa/${id}` as Href),
  };
}

export type DenunciasController = ReturnType<typeof useDenunciasController>;

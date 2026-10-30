import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useIsStaffQuery, useTeamReportsQuery } from '@/services/team/team.service';

/** "/equipe": entrada do Painel da equipe. Só para contas da equipe (a API responde 403 para as outras). */
export function useEquipeController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/perfil' as Href);
  const staffQuery = useIsStaffQuery();
  const isStaff = staffQuery.data === true;
  const reportsQuery = useTeamReportsQuery(isStaff);
  const [caseNumber, setCaseNumber] = useState('');
  const [caseError, setCaseError] = useState<string | undefined>();

  return {
    goBack,
    demo: env.useMocks,
    checking: staffQuery.isLoading,
    checkFailed: staffQuery.isError,
    isStaff,
    openReports: reportsQuery.data?.length ?? null,
    caseNumber,
    caseError,
    setCaseNumber: (value: string) => {
      setCaseNumber(value.trim());
      setCaseError(undefined);
    },
    openCase: () => {
      if (!caseNumber) {
        setCaseError(t('Informe o número do caso.'));
        return;
      }
      router.push(`/equipe/caso/${encodeURIComponent(caseNumber)}` as Href);
    },
    goToReports: () => router.push('/equipe/denuncias' as Href),
    retry: () => {
      void staffQuery.refetch();
    },
  };
}

export type EquipeController = ReturnType<typeof useEquipeController>;

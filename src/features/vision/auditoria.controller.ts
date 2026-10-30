import { type Href } from 'expo-router';
import { useState } from 'react';

import { useVisionFormat } from '@/features/vision/vision-format';
import { env } from '@/lib/env';
import { useSafeBack } from '@/lib/safe-back';
import { can, sortAudit } from '@/lib/vision-rules';
import { useVisionAccessQuery, useVisionAuditQuery } from '@/services/vision/vision.service';

/** "/vision/institucional/auditoria": quem acessou o quê, quando e por quê (inclusive tentativas negadas). */
export function useAuditoriaController() {
  const goBack = useSafeBack('/vision/institucional' as Href);
  const accessQuery = useVisionAccessQuery();
  const allowed = can(accessQuery.data, 'view_audit');
  const query = useVisionAuditQuery('', allowed);
  const [onlyDenied, setOnlyDenied] = useState(false);
  const entries = sortAudit(query.data ?? []);

  return {
    goBack,
    enabled: env.visionEnabled,
    demo: env.useMocks,
    format: useVisionFormat(),
    checking: accessQuery.isLoading,
    allowed,
    loading: query.isLoading,
    error: query.isError,
    retry: () => {
      void query.refetch();
    },
    onlyDenied,
    setOnlyDenied,
    total: entries.length,
    denied: entries.filter((entry) => entry.result === 'denied').length,
    entries: onlyDenied ? entries.filter((entry) => entry.result === 'denied') : entries,
  };
}

export type AuditoriaController = ReturnType<typeof useAuditoriaController>;

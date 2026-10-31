import { type Href } from 'expo-router';
import { useMemo, useState } from 'react';

import { useVisionFormat } from '@/features/vision/vision-format';
import { centralCan, type ChainedAudit, verifyAuditChain } from '@/lib/central-rules';
import { env } from '@/lib/env';
import { useSafeBack } from '@/lib/safe-back';
import { sha256Text } from '@/lib/sha256';
import { useCentralAccessQuery, useCentralAuditQuery } from '@/services/central/central.service';

/** "/institucional/auditoria": registro encadeado (cada registro inclui o hash do anterior). */
export function useCentralAuditoriaController() {
  const goBack = useSafeBack('/institucional' as Href);
  const accessQuery = useCentralAccessQuery();
  const allowed = centralCan(accessQuery.data, 'view_audit');
  const query = useCentralAuditQuery(allowed);
  const format = useVisionFormat();
  const [onlyDenied, setOnlyDenied] = useState(false);
  /** Teste local: uma cópia com um registro adulterado, para mostrar que a verificação detecta. */
  const [tampered, setTampered] = useState(false);

  const chain = useMemo<ChainedAudit[]>(() => {
    const original = query.data ?? [];
    if (!tampered || original.length < 2) return original;
    const index = Math.floor(original.length / 2);
    return original.map((entry, position) => (position === index ? { ...entry, target: `${entry.target} (alterado)` } : entry));
  }, [query.data, tampered]);

  const verification = useMemo(() => verifyAuditChain(chain, sha256Text), [chain]);
  const ordered = useMemo(() => [...chain].reverse(), [chain]);

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
    total: chain.length,
    denied: chain.filter((entry) => entry.result === 'denied').length,
    verification,
    entries: onlyDenied ? ordered.filter((entry) => entry.result === 'denied') : ordered,
    onlyDenied,
    setOnlyDenied,
    tampered,
    setTampered,
  };
}

export type CentralAuditoriaController = ReturnType<typeof useCentralAuditoriaController>;

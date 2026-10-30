import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { CASE_STATUS_LABEL_BY_ID } from '@/lib/case-timeline';
import { type CaseTimelineEvent, countByClassification } from '@/lib/case-timeline-rules';
import { useI18n, useT } from '@/lib/i18n';
import { isLocalPersonId } from '@/lib/person-status';
import { useSafeBack } from '@/lib/safe-back';
import { usePersonQuery } from '@/services/people/people.service';
import { useCaseTimelineQuery } from '@/services/timeline/timeline.service';

/** "/pessoa/[id]/linha-do-tempo": acontecimentos públicos do caso, com a classificação de cada informação. */
export function useLinhaDoTempoController() {
  const t = useT();
  const { language } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');
  const goBack = useSafeBack(`/pessoa/${id}` as Href);
  const personQuery = usePersonQuery(id);
  const timelineQuery = useCaseTimelineQuery(id);
  const data = timelineQuery.data;
  const events = useMemo(() => data?.events ?? [], [data]);
  const counts = useMemo(() => countByClassification(events), [events]);

  const formatWhen = (event: CaseTimelineEvent) => {
    const date = new Date(event.occurredAt);
    if (Number.isNaN(date.getTime())) return t('Data não informada');
    const text = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    return event.approximate ? t('{date}, aproximadamente', { date: text }) : text;
  };

  const statusLabel = (statusId?: number) => {
    if (statusId == null) return undefined;
    const label = CASE_STATUS_LABEL_BY_ID[statusId];
    return label ? t(label) : undefined;
  };

  /** "De Pendente para Procurado", "Nova situação: Encontrado" ou nada. */
  const statusChange = (event: CaseTimelineEvent) => {
    const to = statusLabel(event.statusTo);
    if (!to) return undefined;
    const from = statusLabel(event.statusFrom);
    return from ? t('De {from} para {to}', { from, to }) : t('Nova situação: {to}', { to });
  };

  return {
    id,
    goBack,
    person: personQuery.data ?? null,
    isLocal: isLocalPersonId(id),
    loading: timelineQuery.isLoading,
    error: timelineQuery.isError,
    refreshing: timelineQuery.isRefetching,
    refresh: () => {
      void timelineQuery.refetch();
    },
    source: timelineQuery.data?.source,
    events,
    counts,
    formatWhen,
    statusChange,
    openCase: () => router.push(`/pessoa/${id}` as Href),
  };
}

export type LinhaDoTempoController = ReturnType<typeof useLinhaDoTempoController>;

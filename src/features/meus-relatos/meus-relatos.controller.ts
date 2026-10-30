import { type Href, useRouter } from 'expo-router';

import { env } from '@/lib/env';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import { useMySightingReportsQuery } from '@/services/sightings/sightings.service';

/**
 * "Meus relatos": avistamentos enviados pela conta e a situação da análise de cada um.
 * Só existe com EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS (depende de GET /SightingReport/mine).
 */
export function useMeusRelatosController() {
  const router = useRouter();
  const goBack = useSafeBack('/perfil' as Href);
  const user = useSessionUser();
  const { language } = useI18n();
  const enabled = env.sightingReportsEnabled;
  const query = useMySightingReportsQuery(enabled);

  const formatDateTime = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short' }).format(date);
  };

  return {
    goBack,
    enabled,
    loggedIn: user != null,
    loading: enabled && user != null && query.isLoading,
    error: query.isError,
    reports: query.data ?? [],
    refreshing: query.isRefetching,
    refresh: () => {
      void query.refetch();
    },
    formatDateTime,
    openCase: (personId: string) => router.push(`/pessoa/${personId}` as Href),
    goToLogin: () => router.push({ pathname: '/login', params: { returnTo: '/meus-relatos' } } as Href),
  };
}

export type MeusRelatosController = ReturnType<typeof useMeusRelatosController>;

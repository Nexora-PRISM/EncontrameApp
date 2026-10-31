import { type Href } from 'expo-router';

import { openSupporterSite } from '@/features/apoiadores/use-supporter-site';
import { AppInfo } from '@/lib/app-info';
import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { tr } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { groupByCategory } from '@/lib/supporter-rules';
import { openSupportEmail } from '@/lib/support';
import { useSessionUser } from '@/lib/use-session-user';
import { useSupportersQuery } from '@/services/supporters/supporters.service';

/** "/apoiadores": todos os apoiadores publicados, por categoria. */
export function useApoiadoresController() {
  const goBack = useSafeBack('/sobre' as Href);
  const user = useSessionUser();
  const query = useSupportersQuery(false);
  const supporters = query.data ?? [];

  return {
    goBack,
    enabled: env.supportersEnabled,
    loading: query.isLoading,
    error: query.isError,
    retry: () => {
      void query.refetch();
    },
    groups: groupByCategory(supporters),
    empty: supporters.length === 0,
    demo: supporters.some((supporter) => supporter.demo === true),
    openSite: openSupporterSite,
    /** Empresas interessadas falam com a equipe por e-mail (não há cadastro aberto de apoiadores). */
    contact: async () => {
      const opened = await openSupportEmail({
        topic: 'duvida',
        message: tr('Olá! Quero saber como minha empresa ou organização pode apoiar o Encontra-me.'),
        accountEmail: user?.email,
      });
      if (!opened) {
        showAlert(tr('Nenhum app de e-mail encontrado'), tr('Escreva para {email}.', { email: AppInfo.supportEmail }));
      }
    },
  };
}

export type ApoiadoresController = ReturnType<typeof useApoiadoresController>;

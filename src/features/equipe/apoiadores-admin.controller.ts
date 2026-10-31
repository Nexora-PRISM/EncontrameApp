import { isAxiosError } from 'axios';
import { type Href, useRouter } from 'expo-router';

import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useI18n, useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { moveId } from '@/lib/supporter-rules';
import { useIsStaffQuery } from '@/services/team/team.service';
import { useSupporterActions, useSupportersAdminQuery } from '@/services/supporters/supporters.service';
import type { SupporterAdmin, SupporterPayload } from '@/services/supporters/supporters.types';

/** Mesmos dados do apoiador, com a mudança pedida (o logotipo fica como está). */
export function payloadFrom(item: SupporterAdmin, changes: Partial<SupporterPayload> = {}): SupporterPayload {
  return {
    name: item.name,
    websiteUrl: item.websiteUrl ?? '',
    category: item.category,
    isActive: item.isActive,
    showOnHome: item.showOnHome,
    authorizationConfirmed: item.authorizationConfirmed,
    authorizationNote: item.authorizationNote,
    ...changes,
  };
}

/**
 * "/equipe/apoiadores": a equipe publica, tira do ar, ordena e escolhe quem aparece no Início.
 * Contas comuns não chegam aqui (a API responde 403 e a tela mostra o bloqueio da equipe).
 */
export function useApoiadoresAdminController() {
  const t = useT();
  const { language } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/equipe' as Href);
  const staffQuery = useIsStaffQuery();
  const isStaff = staffQuery.data === true;
  const listQuery = useSupportersAdminQuery(isStaff && env.supportersEnabled);
  const actions = useSupporterActions();
  const items = listQuery.data ?? [];

  /** Erro da API já aparece no aviso geral do app; aqui só o que não veio dela. */
  const fail = (error: unknown) => {
    if (!isAxiosError(error)) showAlert(t('Não foi possível concluir'), t('Tente de novo em alguns instantes.'));
  };

  const save = (item: SupporterAdmin, changes: Partial<SupporterPayload>) => {
    actions.update.mutateAsync({ id: item.id, payload: payloadFrom(item, changes) }).catch(fail);
  };

  return {
    goBack,
    demo: env.useMocks,
    enabled: env.supportersEnabled,
    checking: staffQuery.isLoading,
    checkFailed: staffQuery.isError,
    isStaff,
    retry: () => {
      void staffQuery.refetch();
    },
    loading: listQuery.isLoading,
    error: listQuery.isError,
    reload: () => {
      void listQuery.refetch();
    },
    items,
    busy: actions.update.isPending || actions.reorder.isPending,
    formatDate: (iso: string | null) => {
      if (!iso) return '';
      const date = new Date(iso);
      return Number.isNaN(date.getTime()) ? iso : new Intl.DateTimeFormat(language, { dateStyle: 'short' }).format(date);
    },
    add: () => router.push('/equipe/apoiadores/novo' as Href),
    edit: (item: SupporterAdmin) => router.push(`/equipe/apoiadores/${encodeURIComponent(item.id)}` as Href),
    preview: () => router.push('/apoiadores' as Href),
    move: (item: SupporterAdmin, direction: -1 | 1) => {
      const ids = items.map((s) => s.id);
      const next = moveId(ids, item.id, direction);
      if (next === ids) return;
      actions.reorder.mutateAsync(next).catch(fail);
    },
    togglePublished: (item: SupporterAdmin) => {
      if (!item.isActive && !item.authorizationConfirmed) {
        showAlert(
          t('Falta a autorização da marca'),
          t('Abra o apoiador e confirme a autorização de uso do nome e do logotipo antes de publicar.'),
        );
        return;
      }
      save(item, { isActive: !item.isActive });
    },
    toggleHome: (item: SupporterAdmin) => save(item, { showOnHome: !item.showOnHome }),
  };
}

export type ApoiadoresAdminController = ReturnType<typeof useApoiadoresAdminController>;

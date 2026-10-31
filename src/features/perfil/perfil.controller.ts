import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { env } from '@/lib/env';
import { useSafeBack } from '@/lib/safe-back';
import { isSofiaWelcomeComplete } from '@/lib/sofia-prefs';
import { useSessionUser } from '@/lib/use-session-user';
import { listLocalPending } from '@/services/people/people.local.store';
import { useIsStaffQuery } from '@/services/team/team.service';

/** Iniciais para o avatar (ex.: "Maria Souza" → "MS"). */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/** Cadastro feito sem conta neste aparelho, aguardando revisão e envio. */
export interface LocalDraftSummary {
  id: string;
  name: string;
}

/**
 * Perfil do usuário. Só mostra números que o app consegue apurar de verdade;
 * o histórico de alertas e avistamentos depende de um endpoint da API ("meus casos").
 */
export function usePerfilController() {
  const router = useRouter();
  const user = useSessionUser();
  const goBack = useSafeBack('/inicio');
  const [localDrafts, setLocalDrafts] = useState<LocalDraftSummary[] | null>(null);
  // Uma consulta por sessão: a API responde 403 para quem não é da equipe (sem aviso de erro na tela).
  const staffQuery = useIsStaffQuery();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void listLocalPending()
        .then((items) => {
          if (cancelled) return;
          setLocalDrafts(
            items.map((item) => ({
              id: item.id,
              name: item.person.fullName.trim(),
            })),
          );
        })
        .catch(() => {
          if (!cancelled) setLocalDrafts(null);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return {
    goBack,
    user,
    initials: initialsOf(user?.name ?? ''),
    localPendingCount: localDrafts?.length ?? null,
    localDrafts: localDrafts ?? [],
    /** Abre o formulário preenchido para revisar e enviar pela conta logada. */
    reviewDraft: (id: string) =>
      router.push({ pathname: '/cadastrar-pessoa', params: { rascunho: id } } as Href),
    goToSettings: () => router.push('/configuracoes' as Href),
    goToTrustedContacts: () => router.push('/contatos-confianca' as Href),
    goToShareLocation: () => router.push('/compartilhar-localizacao' as Href),
    goToHelp: () => router.push('/ajuda' as Href),
    /** "Meus relatos" só existe com EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS (depende da API de relatos). */
    sightingReportsEnabled: env.sightingReportsEnabled,
    goToMyReports: () => router.push('/meus-relatos' as Href),
    /** Só aparece para contas da equipe. */
    isStaff: staffQuery.data === true,
    goToTeamPanel: () => router.push('/equipe' as Href),
    /** Central de Inteligência (EXPO_PUBLIC_ENABLE_CENTRAL); a função é conferida lá dentro. */
    centralEnabled: env.centralEnabled,
    goToCentral: () => router.push('/institucional' as Href),
    goToRegister: () => router.push('/cadastrar-pessoa'),
    goToAllPeople: () => router.push('/pessoas-desaparecidas' as Href),
    goToGroupChat: () => router.push('/grupo-chat'),
    goToChat: () => {
      void isSofiaWelcomeComplete().then((done) => {
        router.push((done ? '/chat' : '/sofia-welcome') as Href);
      });
    },
  };
}

export type PerfilController = ReturnType<typeof usePerfilController>;

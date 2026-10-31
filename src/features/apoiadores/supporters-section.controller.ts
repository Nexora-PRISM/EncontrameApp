import { type Href, useRouter } from 'expo-router';

import { openSupporterSite } from '@/features/apoiadores/use-supporter-site';
import { env } from '@/lib/env';
import { useSupportersQuery } from '@/services/supporters/supporters.service';

/** Quantos logotipos cabem na seção resumida; o resto fica na página completa. */
const COMPACT_LIMIT = 12;

/** Seção "Nossos apoiadores" do Início e do Sobre: só quem a equipe marcou para aparecer no Início. */
export function useSupportersSectionController() {
  const router = useRouter();
  const query = useSupportersQuery(true);
  const supporters = (query.data ?? []).slice(0, COMPACT_LIMIT);

  return {
    /** Desligada, carregando, com erro ou sem ninguém publicado: a seção não aparece. */
    visible: env.supportersEnabled && supporters.length > 0,
    supporters,
    demo: supporters.some((supporter) => supporter.demo === true),
    openSite: openSupporterSite,
    goToAll: () => router.push('/apoiadores' as Href),
  };
}

export type SupportersSectionController = ReturnType<typeof useSupportersSectionController>;

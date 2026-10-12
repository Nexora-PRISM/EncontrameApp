import { type Href, useRouter } from 'expo-router';

import { RULES_INTRO, RULES_LEGAL_NOTE, RULES_SECTIONS } from '@/features/regras/regras-content';
import { useSafeBack } from '@/lib/safe-back';

/** Regras de uso e resumo de privacidade. */
export function useRegrasController() {
  const router = useRouter();
  const goBack = useSafeBack('/inicio');

  return {
    goBack,
    intro: RULES_INTRO,
    sections: RULES_SECTIONS,
    legalNote: RULES_LEGAL_NOTE,
    goToPrivacyContact: () =>
      router.push({ pathname: '/ajuda', params: { assunto: 'privacidade' } } as Href),
  };
}

export type RegrasController = ReturnType<typeof useRegrasController>;

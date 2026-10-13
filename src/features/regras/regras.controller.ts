import * as Linking from 'expo-linking';
import { type Href, useRouter } from 'expo-router';

import { RULES_INTRO, RULES_LEGAL_NOTE, RULES_SECTIONS } from '@/features/regras/regras-content';
import { AppInfo } from '@/lib/app-info';
import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';

/** Regras de uso e resumo de privacidade. */
export function useRegrasController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/inicio');

  return {
    goBack,
    intro: RULES_INTRO,
    sections: RULES_SECTIONS,
    legalNote: RULES_LEGAL_NOTE,
    openPrivacyPolicy: () => {
      void Linking.openURL(AppInfo.privacyPolicyUrl).catch(() =>
        showAlert(t('Não foi possível abrir'), t('Acesse {site}.', { site: AppInfo.privacyPolicyUrl })),
      );
    },
    goToPrivacyContact: () =>
      router.push({ pathname: '/ajuda', params: { assunto: 'privacidade' } } as Href),
  };
}

export type RegrasController = ReturnType<typeof useRegrasController>;

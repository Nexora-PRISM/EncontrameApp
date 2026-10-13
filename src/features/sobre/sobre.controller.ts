import * as Linking from 'expo-linking';
import { type Href, useRouter } from 'expo-router';

import { AppInfo, appVersion } from '@/lib/app-info';
import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';

/** Tela "Sobre": dados institucionais e contato. */
export function useSobreController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/configuracoes' as Href);

  const open = (url: string, fallback: string) => {
    void Linking.openURL(url).catch(() => showAlert(t('Não foi possível abrir'), fallback));
  };

  return {
    goBack,
    info: AppInfo,
    version: appVersion(),
    openEmail: () =>
      open(`mailto:${AppInfo.supportEmail}`, t('Escreva para {email}.', { email: AppInfo.supportEmail })),
    openSite: () => open(AppInfo.companySite, t('Acesse {site}.', { site: AppInfo.companySite })),
    openPrivacyPolicy: () =>
      open(AppInfo.privacyPolicyUrl, t('Acesse {site}.', { site: AppInfo.privacyPolicyUrl })),
    goToRules: () => router.push('/regras' as Href),
  };
}

export type SobreController = ReturnType<typeof useSobreController>;

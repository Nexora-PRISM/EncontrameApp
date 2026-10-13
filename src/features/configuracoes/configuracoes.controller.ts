import { useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useEmergencyShortcutSettings } from '@/features/configuracoes/use-emergency-shortcut-settings';
import { AppInfo, appVersion } from '@/lib/app-info';
import { resetAppOnboarding } from '@/lib/app-onboarding';
import {
  authenticate,
  biometricCopy,
  getBiometricEnabled,
  getBiometricKind,
  isBiometricAvailable,
  setBiometricEnabled,
} from '@/lib/biometric';
import { type AppearancePreference, useBrandTheme } from '@/lib/brand-theme';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import {
  LANGUAGE_NAMES,
  LANGUAGE_OPTIONS,
  type LanguagePreference,
  useI18n,
  useT,
} from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { describeSubscription } from '@/lib/premium-plan';
import { useSafeBack } from '@/lib/safe-back';
import { signOut } from '@/lib/sign-out';
import { openSupportEmail } from '@/lib/support';
import { loadTrustedContacts } from '@/lib/trusted-contacts';
import { useSessionUser } from '@/lib/use-session-user';
import { deleteLocalPending, listLocalPending } from '@/services/people/people.local.store';
import { usePremiumStatusQuery } from '@/services/premium/premium.service';

type LocationStatus = 'granted' | 'denied' | 'undetermined' | 'unknown';

const LOCATION_LABEL: Record<LocationStatus, string> = {
  granted: msg('Permitida'),
  denied: msg('Negada'),
  undetermined: msg('Não definida'),
  unknown: '—',
};

/** Configurações: só ações que funcionam de verdade; o resto aparece como "Em breve". */
export function useConfiguracoesController() {
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionUser = useSessionUser();
  const goBack = useSafeBack('/inicio');
  const { appearance, setAppearance } = useBrandTheme();
  const {
    preference: languagePreference,
    setPreference: setLanguage,
    deviceLanguage,
  } = useI18n();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState<string>(msg('Entrar com biometria'));
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('unknown');
  const [localPendingCount, setLocalPendingCount] = useState<number | null>(null);
  const [trustedContactsCount, setTrustedContactsCount] = useState<number | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const emergencyShortcut = useEmergencyShortcutSettings(sessionUser != null);
  const premiumQuery = usePremiumStatusQuery();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [available, enabled, kind] = await Promise.all([
        isBiometricAvailable(),
        getBiometricEnabled(),
        getBiometricKind(),
      ]);
      if (cancelled) return;
      setBiometricAvailable(available);
      setBiometricOn(enabled);
      setBiometricLabel(biometricCopy(kind).loginButton);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshDeviceState = useCallback(() => {
    let cancelled = false;
    void (async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!cancelled) setLocationStatus(permission.status as LocationStatus);
      } catch {
        if (!cancelled) setLocationStatus('unknown');
      }
      try {
        const pending = await listLocalPending();
        if (!cancelled) setLocalPendingCount(pending.length);
      } catch {
        if (!cancelled) setLocalPendingCount(null);
      }
      try {
        const contacts = await loadTrustedContacts();
        if (!cancelled) setTrustedContactsCount(contacts.length);
      } catch {
        if (!cancelled) setTrustedContactsCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Atualiza ao voltar dos ajustes do aparelho ou de outra tela.
  useFocusEffect(refreshDeviceState);

  const toggleBiometric = (next: boolean) => {
    void (async () => {
      setBiometricBusy(true);
      try {
        if (next) {
          const ok = await authenticate(t('Confirme para ativar o login com biometria.'));
          if (!ok) return;
          await setBiometricEnabled(true);
          setBiometricOn(true);
          return;
        }
        await setBiometricEnabled(false);
        setBiometricOn(false);
      } finally {
        setBiometricBusy(false);
      }
    })();
  };

  const openDeviceSettings = () => {
    void Linking.openSettings().catch(() => {
      showAlert(t('Não foi possível abrir'), t('Abra os ajustes do celular e procure por Encontra-me.'));
    });
  };

  const deleteLocalPeople = () => {
    void (async () => {
      const confirmed = await confirmAction({
        title: t('Apagar cadastros deste aparelho?'),
        message:
          t('Os cadastros que ainda não foram enviados serão apagados e não poderão ser recuperados.'),
        confirmLabel: t('Apagar'),
      });
      if (!confirmed) return;

      try {
        const pending = await listLocalPending();
        for (const item of pending) {
          await deleteLocalPending(item.id);
        }
        setLocalPendingCount(0);
        await queryClient.invalidateQueries({ queryKey: ['people'] });
        showAlert(t('Pronto'), t('Os cadastros salvos neste aparelho foram apagados.'));
      } catch {
        showAlert(t('Não foi possível apagar'), t('Tente novamente em instantes.'));
        refreshDeviceState();
      }
    })();
  };

  const replayTutorial = () => {
    void (async () => {
      await resetAppOnboarding();
      showAlert(t('Apresentação reativada'), t('Ela vai aparecer quando você voltar ao Início.'));
    })();
  };

  const logout = () => {
    void (async () => {
      const confirmed = await confirmAction({
        title: t('Sair da conta?'),
        message: biometricOn
          ? t('Com a biometria ligada, sua conta fica travada neste aparelho até você entrar de novo.')
          : t('Você precisará entrar de novo para enviar cadastros e avistamentos.'),
        confirmLabel: t('Sair'),
      });
      if (!confirmed) return;

      setSigningOut(true);
      try {
        await signOut();
      } catch {
        // signOut já limpa a sessão local mesmo se a API falhar.
      } finally {
        setSigningOut(false);
        router.replace('/inicio');
      }
    })();
  };

  const requestAccountDeletion = () => {
    void (async () => {
      const confirmed = await confirmAction({
        title: t('Solicitar exclusão da conta'),
        message:
          t('Vamos abrir seu app de e-mail com o pedido pronto. A exclusão é feita pela equipe depois que o e-mail for enviado.'),
        confirmLabel: t('Continuar'),
      });
      if (!confirmed) return;

      const opened = await openSupportEmail({
        topic: 'exclusao',
        message:
          t('Solicito a exclusão da minha conta no Encontra-me e dos meus dados pessoais, nos termos da LGPD.'),
        accountEmail: sessionUser?.email,
      });
      if (!opened) {
        showAlert(
          t('App de e-mail não encontrado'),
          t('Envie o pedido de exclusão para {supportEmail} a partir do e-mail da sua conta.', { supportEmail: AppInfo.supportEmail }),
        );
      }
    })();
  };

  return {
    ...emergencyShortcut,
    goToEmergencyHelp: () =>
      router.push({ pathname: '/ajuda', params: { categoria: 'emergencia' } } as Href),
    goBack,
    user: sessionUser,
    loggedIn: sessionUser != null,
    isWeb: Platform.OS === 'web',
    appearance,
    setAppearance: (value: AppearancePreference) => setAppearance(value),
    languagePreference,
    setLanguagePreference: (value: LanguagePreference) => setLanguage(value),
    /** Opções do idioma: os nomes ficam no próprio idioma; "Automático" diz qual está valendo. */
    languageOptions: LANGUAGE_OPTIONS.map((option) =>
      option.value === 'system'
        ? {
            value: option.value,
            label: t(option.label),
            description:
              Platform.OS === 'web'
                ? t('Usa o idioma do navegador. Agora: {language}.', {
                    language: LANGUAGE_NAMES[deviceLanguage],
                  })
                : t('Usa o idioma do celular. Agora: {language}.', {
                    language: LANGUAGE_NAMES[deviceLanguage],
                  }),
          }
        : { value: option.value, label: option.label },
    ),
    biometricAvailable,
    biometricOn,
    biometricLabel: t(biometricLabel),
    biometricBusy,
    toggleBiometric,
    locationStatusLabel: t(LOCATION_LABEL[locationStatus]),
    openDeviceSettings,
    localPendingCount,
    trustedContactsCount,
    goToEmergencyAlert: () => router.push('/alerta-emergencia' as Href),
    goToTrustedContacts: () => router.push('/contatos-confianca' as Href),
    goToShareLocation: () => router.push('/compartilhar-localizacao' as Href),
    deleteLocalPeople,
    replayTutorial,
    logout,
    signingOut,
    requestAccountDeletion,
    version: appVersion(),
    companyLine: AppInfo.companyLine,
    goToLogin: () => router.push({ pathname: '/login', params: { returnTo: '/configuracoes' } } as Href),
    goToProfile: () => router.push('/perfil' as Href),
    goToHelp: () => router.push('/ajuda' as Href),
    goToScamTips: () => router.push({ pathname: '/ajuda', params: { categoria: 'golpes' } } as Href),
    goToSobre: () => router.push('/sobre' as Href),
    goToRules: () => router.push('/regras' as Href),
    openPrivacyPolicy: () => {
      void Linking.openURL(AppInfo.privacyPolicyUrl).catch(() =>
        showAlert(t('Não foi possível abrir'), t('Acesse {site}.', { site: AppInfo.privacyPolicyUrl })),
      );
    },
    goToSofiaTheme: () => router.push('/sofia-theme' as Href),
    petsEnabled: env.petsEnabled,
    goToPets: () => router.push('/pets' as Href),
    goToPremium: () => router.push('/premium' as Href),
    subscriptionLoading: sessionUser != null && premiumQuery.isLoading,
    /** Situação da assinatura (só o que o servidor informou). */
    subscription: describeSubscription(premiumQuery.data, sessionUser != null, t),
  };
}

export type ConfiguracoesController = ReturnType<typeof useConfiguracoesController>;

import * as Linking from 'expo-linking';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import {
  type NotificationPrefs,
  type RemoteNotificationPref,
  loadNotificationPrefs,
  saveNotificationPrefs,
} from '@/lib/notification-prefs';
import {
  type NotificationPermission,
  ensureNotificationPermission,
  getNotificationPermission,
  localNotificationsSupported,
} from '@/lib/notifications';
import { syncPendingReminder } from '@/lib/pending-reminder';
import {
  type PushSyncResult,
  useSyncPushRegistrationMutation,
} from '@/services/notifications/notifications.service';

export type NotificationAvailability =
  /** Celular com o módulo de notificações. */
  | 'available'
  /** Navegador: notificações só no aplicativo de celular. */
  | 'web'
  /** App instalado sem o módulo nativo (versão antiga). */
  | 'needs-update';

/**
 * Configurações › Notificações. Tudo começa desligado; ligar pede a permissão do sistema.
 * Os avisos do servidor só aparecem como opção com EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS
 * (senão ficam "Em breve") e exigem conta, porque o aparelho é registrado na API.
 */
export function useNotificationSettings(loggedIn: boolean) {
  const t = useT();
  const availability = useMemo<NotificationAvailability>(() => {
    if (Platform.OS === 'web') return 'web';
    return localNotificationsSupported() ? 'available' : 'needs-update';
  }, []);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('unsupported');
  const [busy, setBusy] = useState(false);
  const syncMutation = useSyncPushRegistrationMutation();

  // Recarrega ao voltar dos ajustes do celular (a permissão pode ter mudado lá).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const [nextPrefs, nextPermission] = await Promise.all([
          loadNotificationPrefs(),
          getNotificationPermission(),
        ]);
        if (cancelled) return;
        setPrefs(nextPrefs);
        setPermission(nextPermission);
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  /** Pede a permissão; se o sistema recusar, oferece abrir os ajustes. */
  const requirePermission = async (): Promise<boolean> => {
    const result = await ensureNotificationPermission();
    setPermission(result);
    if (result === 'granted') return true;
    if (result === 'denied') {
      const open = await confirmAction({
        title: t('Notificações desligadas'),
        message: t('Permita as notificações do Encontra-me nos ajustes do celular para receber avisos.'),
        confirmLabel: t('Abrir ajustes'),
      });
      if (open) void Linking.openSettings().catch(() => undefined);
      return false;
    }
    showAlert(t('Não disponível neste aparelho'), t('Atualize o Encontra-me para receber notificações.'));
    return false;
  };

  const togglePendingReminder = (next: boolean) => {
    if (!prefs || availability !== 'available') return;
    void (async () => {
      setBusy(true);
      try {
        if (next && !(await requirePermission())) return;
        const updated = { ...prefs, pendingReminder: next };
        await saveNotificationPrefs(updated);
        setPrefs(updated);
        await syncPendingReminder();
      } finally {
        setBusy(false);
      }
    })();
  };

  const toggleRemote = (key: RemoteNotificationPref, next: boolean) => {
    if (!prefs || availability !== 'available' || !env.pushEnabled || !loggedIn) return;
    void (async () => {
      setBusy(true);
      const previous = prefs;
      try {
        if (next && !(await requirePermission())) return;
        const updated = { ...prefs, [key]: next };
        await saveNotificationPrefs(updated);
        setPrefs(updated);

        let result: PushSyncResult;
        try {
          result = await syncMutation.mutateAsync();
        } catch {
          await saveNotificationPrefs(previous);
          setPrefs(previous);
          showAlert(t('Não foi possível salvar'), t('Confira sua conexão e tente de novo.'));
          return;
        }
        if (next && result === 'unsupported') {
          showAlert(
            t('Avisos indisponíveis neste aparelho'),
            t('Este aparelho não recebe avisos do servidor. Instale o Encontra-me pela loja de aplicativos em um celular.'),
          );
        }
      } finally {
        setBusy(false);
      }
    })();
  };

  const anyOn = prefs
    ? prefs.pendingReminder || prefs.nearbyCases || prefs.regionNewCases || prefs.followedUpdates
    : false;

  return {
    notificationAvailability: availability,
    pushEnabled: env.pushEnabled,
    notificationPrefs: prefs,
    notificationBusy: busy,
    /** Alguma opção ligada, mas o sistema bloqueou as notificações do app. */
    notificationsBlocked: anyOn && permission === 'denied',
    togglePendingReminder,
    toggleNearbyCases: (next: boolean) => toggleRemote('nearbyCases', next),
    toggleRegionNewCases: (next: boolean) => toggleRemote('regionNewCases', next),
    toggleFollowedUpdates: (next: boolean) => toggleRemote('followedUpdates', next),
  };
}

import type { NotificationResponse } from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { configureNotifications, getNotificationsModule, routeFromNotification } from '@/lib/notifications';
import { syncPendingReminder } from '@/lib/pending-reminder';
import { usePushRegistrationSync } from '@/services/notifications/notifications.service';

/**
 * Liga as notificações no boot (`_layout`). `ready` = navegação montada e idioma carregado:
 * antes disso o toque fica guardado e o texto do lembrete sairia no idioma errado.
 */
export function useNotificationsBootstrap(ready: boolean): void {
  const router = useRouter();
  const routerRef = useRef(router);
  const readyRef = useRef(ready);
  const pendingHrefRef = useRef<Href | null>(null);
  const handledRef = useRef<string | null>(null);

  usePushRegistrationSync();

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    readyRef.current = ready;
    if (!ready) return;
    const pending = pendingHrefRef.current;
    if (pending) {
      pendingHrefRef.current = null;
      routerRef.current.push(pending);
    }
    void (async () => {
      await configureNotifications();
      await syncPendingReminder();
    })();
  }, [ready]);

  useEffect(() => {
    const Notifications = getNotificationsModule();
    if (!Notifications) return;

    const handle = (response: NotificationResponse | null) => {
      if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      const { notification } = response;
      const key = `${notification.request.identifier}:${notification.date}`;
      if (handledRef.current === key) return;
      handledRef.current = key;
      const href = routeFromNotification(notification.request.content.data);
      if (!href) return;
      if (readyRef.current) {
        routerRef.current.push(href);
      } else {
        pendingHrefRef.current = href;
      }
    };

    try {
      // Toque que abriu o app fechado.
      handle(Notifications.getLastNotificationResponse());
      Notifications.clearLastNotificationResponse();
    } catch {
      // Sem resposta guardada.
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(handle);
    return () => subscription.remove();
  }, []);
}

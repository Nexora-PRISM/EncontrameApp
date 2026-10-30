import { tr } from '@/lib/i18n';
import { loadNotificationPrefs } from '@/lib/notification-prefs';
import { NOTIFICATION_CHANNEL_ID, getNotificationsModule } from '@/lib/notifications';
import { listLocalPending } from '@/services/people/people.local.store';

/**
 * Lembrete diário dos cadastros feitos sem conta e ainda não enviados (ficam só neste aparelho).
 * É uma notificação local: nada vai ao servidor. O texto nunca diz que algo foi enviado.
 */
const REMINDER_ID = 'pending-drafts';
const REMINDER_HOUR = 19;

/** Reagenda (ou cancela) o lembrete conforme a preferência e os rascunhos atuais. */
export async function syncPendingReminder(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
    const [prefs, drafts] = await Promise.all([loadNotificationPrefs(), listLocalPending()]);
    if (!prefs.pendingReminder || drafts.length === 0) return;
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: tr('Cadastro aguardando envio'),
        body:
          drafts.length === 1
            ? tr('Você tem 1 cadastro salvo neste aparelho. Ele só é enviado quando você revisa e confirma.')
            : tr('Você tem {count} cadastros salvos neste aparelho. Eles só são enviados quando você revisa e confirma.', {
                count: drafts.length,
              }),
        data: { type: 'pending-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: 0,
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });
  } catch {
    // Sem lembrete; os cadastros continuam salvos e visíveis em Meu perfil.
  }
}

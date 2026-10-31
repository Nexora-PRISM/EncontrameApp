import { type ArrivalCheck, parseArrivalCheck } from '@/lib/arrival-check-rules';
import { tr } from '@/lib/i18n';
import { getLocalItem, setLocalItem } from '@/lib/local-store';
import { NOTIFICATION_CHANNEL_ID, ensureNotificationPermission, getNotificationsModule } from '@/lib/notifications';

/**
 * Chegada segura neste aparelho: o trajeto fica salvo localmente e o lembrete é uma notificação local.
 * Nenhuma posição é lida durante o trajeto e nada vai ao servidor.
 */
const STORAGE_KEY = 'encontrame.arrival-check';
const NOTIFICATION_ID = 'arrival-check';

export type ArrivalReminderStatus = 'scheduled' | 'denied' | 'unsupported';

export async function loadArrivalCheck(): Promise<ArrivalCheck | null> {
  return parseArrivalCheck(await getLocalItem(STORAGE_KEY));
}

export async function saveArrivalCheck(check: ArrivalCheck | null): Promise<void> {
  await setLocalItem(STORAGE_KEY, check ? JSON.stringify(check) : '');
}

/** Agenda (ou reagenda) o "Você chegou bem?" para o horário combinado. Pede a permissão só aqui. */
export async function scheduleArrivalReminder(check: ArrivalCheck): Promise<ArrivalReminderStatus> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return 'unsupported';
  const permission = await ensureNotificationPermission();
  if (permission !== 'granted') return permission;
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_ID,
      // Texto genérico: a tela bloqueada não mostra destino nem nome.
      content: {
        title: tr('Você chegou bem?'),
        body: tr('Toque para confirmar. Se precisar, mande sua localização para quem você confia.'),
        data: { type: 'arrival-check' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(check.deadline),
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });
    return 'scheduled';
  } catch {
    return 'unsupported';
  }
}

export async function cancelArrivalReminder(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
  } catch {
    // Nada agendado.
  }
}

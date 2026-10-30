import { requireOptionalNativeModule } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import type { Href } from 'expo-router';
import { Platform } from 'react-native';

import { tr } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';

type NotificationsModule = typeof import('expo-notifications');

/**
 * Notificações do Encontra-me (lembretes locais e avisos vindos do servidor).
 *
 * O texto que aparece na tela bloqueada nunca traz nome, idade ou foto: só o tipo do aviso.
 * O toque abre a tela certa a partir de `data` (ids, nunca dados pessoais).
 */
export const NOTIFICATION_CHANNEL_ID = 'casos';
const CHANNEL_NAME = msg('Casos e lembretes');

export type NotificationPermission = 'granted' | 'denied' | 'unsupported';

export type NotificationType = 'nearby-case' | 'region-new-case' | 'followed-update' | 'pending-reminder';

export interface NotificationData {
  type?: NotificationType;
  personId?: string;
}

let cachedModule: NotificationsModule | null | undefined;

/**
 * Carrega o expo-notifications só quando o módulo nativo existe. Um app instalado antes desta
 * versão (ou o web) não tem o módulo, e o import direto derrubaria o app.
 */
export function getNotificationsModule(): NotificationsModule | null {
  if (cachedModule !== undefined) return cachedModule;
  if (Platform.OS === 'web' || !requireOptionalNativeModule('ExpoNotificationScheduler')) {
    cachedModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-notifications') as NotificationsModule;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

/** Lembretes locais (agendados neste aparelho). */
export function localNotificationsSupported(): boolean {
  return getNotificationsModule() != null;
}

/**
 * Avisos vindos do servidor: exigem aparelho físico e build próprio
 * (o Expo Go no Android não recebe push desde o SDK 53).
 */
export function pushNotificationsSupported(): boolean {
  return (
    localNotificationsSupported() &&
    Device.isDevice &&
    Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
  );
}

/** Comportamento com o app aberto e canal do Android. Chamar no boot, depois do idioma. */
export async function configureNotifications(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: tr(CHANNEL_NAME),
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  } catch {
    // Sem notificações neste aparelho; o resto do app segue normal.
  }
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return 'unsupported';
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    return granted ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

/**
 * Pede a permissão só quando a pessoa liga uma opção ou toca em "Acompanhar" — nunca ao abrir o app.
 * Se o sistema já recusou antes, devolve `denied` sem abrir outra janela.
 */
export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return 'unsupported';
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (!current.canAskAgain) return 'denied';
    const next = await Notifications.requestPermissionsAsync();
    return next.granted ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

/** Token do Expo Push deste aparelho; `null` quando não há suporte, permissão ou projeto EAS. */
export async function getPushToken(): Promise<string | null> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !pushNotificationsSupported()) return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data || null;
  } catch {
    return null;
  }
}

const PERSON_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** Lê `data` da notificação sem confiar no formato (pode vir de qualquer envio). */
export function parseNotificationData(raw: unknown): NotificationData {
  if (!raw || typeof raw !== 'object') return {};
  const { type, personId } = raw as Record<string, unknown>;
  const id = typeof personId === 'number' ? String(personId) : personId;
  return {
    type: isNotificationType(type) ? type : undefined,
    personId: typeof id === 'string' && PERSON_ID_PATTERN.test(id) ? id : undefined,
  };
}

/** Tela aberta pelo toque. Lembrete de cadastro vai ao perfil, onde fica o "Revisar e enviar". */
export function routeFromNotification(raw: unknown): Href | null {
  const data = parseNotificationData(raw);
  if (data.type === 'pending-reminder') return '/perfil' as Href;
  if (data.personId) return `/pessoa/${data.personId}` as Href;
  return null;
}

function isNotificationType(value: unknown): value is NotificationType {
  return (
    value === 'nearby-case' ||
    value === 'region-new-case' ||
    value === 'followed-update' ||
    value === 'pending-reminder'
  );
}

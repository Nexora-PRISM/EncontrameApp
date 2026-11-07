import { useMutation } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { env } from '@/lib/env';
import { getActiveLanguage } from '@/lib/i18n';
import { getLocalItem, setLocalItem } from '@/lib/local-store';
import { loadNotificationPrefs, saveNotificationPrefs, wantsRemoteNotifications } from '@/lib/notification-prefs';
import {
  ensureNotificationPermission,
  getNotificationPermission,
  getPushToken,
  pushNotificationsSupported,
} from '@/lib/notifications';
import { getSessionUser } from '@/lib/session';
import { useSessionUser } from '@/lib/use-session-user';
import { getNotificationsRepository } from '@/services/notifications/notifications.repository';

const REGISTERED_TOKEN_KEY = 'encontrame.push.registeredToken';

export type PushSyncResult =
  /** Aparelho registrado (ou atualizado) na API. */
  | 'registered'
  /** Nenhuma opção remota ligada: o aparelho foi removido da API. */
  | 'unregistered'
  /** Sem conta, recurso desligado (flag) ou web. */
  | 'skipped'
  /** Sem build com push, emulador ou Expo Go. */
  | 'unsupported'
  /** A pessoa não deu permissão de notificação. */
  | 'no-permission';

/**
 * Deixa a API em dia com este aparelho: registra quando há alguma opção remota ligada e remove
 * quando não há. Erros da API sobem para quem chamou (a tela avisa); o resto vira um resultado.
 */
export async function syncPushRegistration(): Promise<PushSyncResult> {
  if (!env.pushEnabled || Platform.OS === 'web' || getSessionUser() == null) return 'skipped';

  const prefs = await loadNotificationPrefs();
  if (!wantsRemoteNotifications(prefs)) {
    await unregisterPushDevice();
    return 'unregistered';
  }
  if (!pushNotificationsSupported()) return 'unsupported';
  if ((await getNotificationPermission()) !== 'granted') return 'no-permission';

  const token = await getPushToken();
  if (!token) return 'unsupported';

  const coords = await approximateLocation();
  await getNotificationsRepository().registerDevice({
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    language: getActiveLanguage(),
    ...(coords ? { approxLatitude: coords.latitude, approxLongitude: coords.longitude } : {}),
    preferences: {
      nearbyCases: prefs.nearbyCases,
      regionNewCases: prefs.regionNewCases,
      followedUpdates: prefs.followedUpdates,
    },
    ...(env.searchNetworkEnabled ? { nearbyRadiusKm: prefs.nearbyRadiusKm } : {}),
  });
  await setLocalItem(REGISTERED_TOKEN_KEY, token);
  return 'registered';
}

/**
 * Trajeto compartilhado: liga os avisos ("Você chegou?", atraso, Sinal de Alerta) ao começar a compartilhar ou
 * aceitar um convite. Pede a permissão do sistema aqui (é a hora em que faz sentido) e registra o aparelho.
 * Nunca lança erro: o trajeto funciona sem push (a tela mostra a situação ao abrir).
 */
export async function enableTripNotifications(): Promise<PushSyncResult> {
  try {
    if (!env.pushEnabled || Platform.OS === 'web' || getSessionUser() == null) return 'skipped';
    if (!pushNotificationsSupported()) return 'unsupported';
    if ((await ensureNotificationPermission()) !== 'granted') return 'no-permission';
    const prefs = await loadNotificationPrefs();
    if (!prefs.tripSharing) await saveNotificationPrefs({ ...prefs, tripSharing: true });
    return await syncPushRegistration();
  } catch {
    return 'skipped';
  }
}

/** Tira este aparelho da API. Chamar com a sessão ainda ativa (antes de apagar os tokens). */
export async function unregisterPushDevice(): Promise<void> {
  if (!env.pushEnabled) return;
  const token = await getLocalItem(REGISTERED_TOKEN_KEY);
  if (!token) return;
  try {
    await getNotificationsRepository().unregisterDevice(token);
  } catch {
    // O servidor também descarta tokens que o Expo devolve como inválidos.
  } finally {
    await setLocalItem(REGISTERED_TOKEN_KEY, '');
  }
}

/** Registra de novo a cada login (troca de conta neste aparelho) e na abertura do app. */
export function usePushRegistrationSync(): void {
  const userId = useSessionUser()?.id;

  useEffect(() => {
    if (!userId) return;
    void syncPushRegistration().catch(() => undefined);
  }, [userId]);
}

export function useSyncPushRegistrationMutation() {
  return useMutation({
    retry: false,
    mutationFn: () => syncPushRegistration(),
  });
}

/** Última posição conhecida, arredondada (~1 km). Nunca pede permissão de localização. */
async function approximateLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== 'granted') return null;
    const position = await Location.getLastKnownPositionAsync();
    if (!position) return null;
    return {
      latitude: roundCoord(position.coords.latitude),
      longitude: roundCoord(position.coords.longitude),
    };
  } catch {
    return null;
  }
}

function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

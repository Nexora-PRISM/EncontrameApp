import type { RemoteNotificationPref } from '@/lib/notification-prefs';

export type DevicePlatform = 'android' | 'ios';

export type RemoteNotificationPreferences = Record<RemoteNotificationPref, boolean>;

/**
 * Aparelho que recebe avisos do servidor. A localização é aproximada (2 casas decimais, ~1 km)
 * e só vai quando a permissão já foi dada — o registro nunca pede localização.
 */
export interface RegisterDevicePayload {
  /** Token do Expo Push (ExponentPushToken[...]). */
  token: string;
  platform: DevicePlatform;
  /** Idioma do app, para o servidor montar o texto da notificação. */
  language: string;
  approxLatitude?: number;
  approxLongitude?: number;
  preferences: RemoteNotificationPreferences;
  /** Rede de busca (evolução): distância escolhida para "Casos perto de mim". Proposta; a API ainda não usa. */
  nearbyRadiusKm?: number;
}

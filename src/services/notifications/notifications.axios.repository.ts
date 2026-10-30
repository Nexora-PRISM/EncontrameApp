import { api } from '@/lib/axios';
import type { NotificationsRepository } from '@/services/notifications/notifications.repository';
import type { RegisterDevicePayload } from '@/services/notifications/notifications.types';

/**
 * Implementação real (autenticada). Contrato proposto — os endpoints ainda precisam ser criados
 * na API; até lá o recurso fica desligado em produção (EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS).
 *
 * - `POST /Notification/device` — upsert pelo `token`, ligado à conta logada:
 *   `{ token, platform: 'android' | 'ios', language, approxLatitude?, approxLongitude?,
 *      preferences: { nearbyCases, regionNewCases, followedUpdates } }` → 204.
 * - `DELETE /Notification/device/{token}` — remove o aparelho → 204 (404 também serve).
 *
 * Envio (servidor → Expo Push): `data` só com `{ type, personId }`, sendo
 * `type` = 'nearby-case' | 'region-new-case' | 'followed-update'. Título e corpo sem nome,
 * idade ou foto (aparecem na tela bloqueada). Casos Pendente nunca geram aviso para terceiros.
 */
export const notificationsAxiosRepository: NotificationsRepository = {
  async registerDevice(payload: RegisterDevicePayload) {
    await api.post('/Notification/device', payload);
  },

  async unregisterDevice(token: string) {
    await api.delete(`/Notification/device/${encodeURIComponent(token)}`);
  },
};

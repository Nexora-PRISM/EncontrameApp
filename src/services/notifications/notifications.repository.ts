import { env } from '@/lib/env';
import { notificationsAxiosRepository } from '@/services/notifications/notifications.axios.repository';
import { notificationsMockRepository } from '@/services/notifications/notifications.mock.repository';
import type { RegisterDevicePayload } from '@/services/notifications/notifications.types';

/** Contrato comum aos repositórios de notificações (axios e mock). */
export interface NotificationsRepository {
  /** Cria ou atualiza o aparelho (token, idioma, região aproximada e preferências). */
  registerDevice(payload: RegisterDevicePayload): Promise<void>;
  /** Para de mandar avisos para este aparelho (logout ou tudo desligado). */
  unregisterDevice(token: string): Promise<void>;
}

export function getNotificationsRepository(): NotificationsRepository {
  return env.useMocks ? notificationsMockRepository : notificationsAxiosRepository;
}

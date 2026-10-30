import type { NotificationsRepository } from '@/services/notifications/notifications.repository';
import type { RegisterDevicePayload } from '@/services/notifications/notifications.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Só para desenvolvimento: guarda os aparelhos em memória. Nenhum aviso é enviado de verdade. */
const devices = new Map<string, RegisterDevicePayload>();

export const notificationsMockRepository: NotificationsRepository = {
  async registerDevice(payload: RegisterDevicePayload) {
    await delay(300);
    devices.set(payload.token, payload);
  },

  async unregisterDevice(token: string) {
    await delay(200);
    devices.delete(token);
  },
};

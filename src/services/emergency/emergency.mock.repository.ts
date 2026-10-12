import type { EmergencyRepository } from '@/services/emergency/emergency.repository';
import type { EmergencyAlertPayload } from '@/services/emergency/emergency.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Só para desenvolvimento (EXPO_PUBLIC_USE_MOCKS): devolve um comprovante marcado como
 * `simulated`, e a tela avisa que é um teste. Para testar a falha, use
 * EXPO_PUBLIC_MOCK_EMERGENCY_FAIL=true.
 */
export const emergencyMockRepository: EmergencyRepository = {
  async sendAlert(_payload: EmergencyAlertPayload) {
    await delay(900);
    if (process.env.EXPO_PUBLIC_MOCK_EMERGENCY_FAIL === 'true') {
      throw new Error('Falha simulada no envio do alerta.');
    }
    return {
      alertId: `TESTE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      receivedAt: new Date().toISOString(),
      simulated: true,
    };
  },
};

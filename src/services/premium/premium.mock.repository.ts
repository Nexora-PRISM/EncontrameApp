import type { PremiumRepository } from '@/services/premium/premium.repository';
import type { PremiumStatus } from '@/services/premium/premium.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const DAY = 24 * 60 * 60 * 1000;
const inDays = (days: number) => new Date(Date.now() + days * DAY).toISOString();

/**
 * Situação de teste da assinatura, conforme EXPO_PUBLIC_MOCK_PREMIUM (só no modo mock):
 * vazio = Premium ativo (para testar o cadastro de pets) · false = sem assinatura ·
 * trial · grace (pagamento recusado) · cancelled · expired.
 */
export function mockPremiumStatus(setting: string | undefined): PremiumStatus {
  switch ((setting ?? '').trim().toLowerCase()) {
    case 'false':
    case 'none':
      return { active: false, state: 'none', simulated: true };
    case 'trial':
      return { active: true, state: 'trial', plan: 'monthly', expiresAt: inDays(7), simulated: true };
    case 'grace':
      return { active: true, state: 'grace', plan: 'monthly', simulated: true };
    case 'cancelled':
      return { active: true, state: 'cancelled', plan: 'monthly', expiresAt: inDays(10), simulated: true };
    case 'expired':
      return { active: false, state: 'expired', plan: 'monthly', expiresAt: inDays(-3), simulated: true };
    default:
      return { active: true, state: 'active', plan: 'monthly', renewsAt: inDays(30), simulated: true };
  }
}

export const premiumMockRepository: PremiumRepository = {
  async getStatus() {
    await delay(200);
    return mockPremiumStatus(process.env.EXPO_PUBLIC_MOCK_PREMIUM);
  },
};

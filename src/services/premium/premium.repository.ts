import { env } from '@/lib/env';
import { premiumAxiosRepository } from '@/services/premium/premium.axios.repository';
import { premiumMockRepository } from '@/services/premium/premium.mock.repository';
import type { PremiumStatus } from '@/services/premium/premium.types';

/** Contrato comum aos repositórios de assinatura (axios e mock). */
export interface PremiumRepository {
  getStatus(): Promise<PremiumStatus>;
}

export function getPremiumRepository(): PremiumRepository {
  return env.useMocks ? premiumMockRepository : premiumAxiosRepository;
}

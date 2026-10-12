import { isAxiosError } from 'axios';

import { api } from '@/lib/axios';
import type { PremiumRepository } from '@/services/premium/premium.repository';
import {
  type PremiumStatus,
  SUBSCRIPTION_STATES,
  type SubscriptionPlan,
  type SubscriptionState,
} from '@/services/premium/premium.types';

/**
 * Resposta de GET /Subscription/me (contrato proposto — o endpoint ainda precisa existir na API).
 * `active` é obrigatório para dar acesso; o resto só descreve a situação na tela.
 */
interface ApiSubscriptionStatus {
  active?: boolean | null;
  /** none | trial | active | grace | cancelled | expired */
  status?: string | null;
  /** monthly | annual */
  plan?: string | null;
  renewsAt?: string | null;
  expiresAt?: string | null;
}

function isoOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return Number.isNaN(new Date(value).getTime()) ? undefined : value;
}

/** Converte a resposta da API. Sem `active: true`, a conta não tem acesso ao Premium. */
export function toPremiumStatus(data: ApiSubscriptionStatus | null | undefined): PremiumStatus {
  const active = data?.active === true;
  const raw = typeof data?.status === 'string' ? data.status.trim().toLowerCase() : '';
  let state: SubscriptionState = SUBSCRIPTION_STATES.includes(raw as SubscriptionState)
    ? (raw as SubscriptionState)
    : active
      ? 'active'
      : 'none';
  const expiresAt = isoOrUndefined(data?.expiresAt);
  const renewsAt = isoOrUndefined(data?.renewsAt);

  // O acesso manda: a tela nunca mostra "ativo" sem acesso, nem "sem assinatura" com acesso.
  if (!active && (state === 'active' || state === 'trial' || state === 'grace' || state === 'cancelled')) {
    state = expiresAt ? 'expired' : 'none';
  }
  if (active && (state === 'none' || state === 'expired')) state = 'active';

  const plan: SubscriptionPlan | undefined =
    data?.plan === 'monthly' || data?.plan === 'annual' ? data.plan : undefined;

  return {
    active,
    state,
    ...(plan ? { plan } : {}),
    ...(renewsAt ? { renewsAt } : {}),
    ...(expiresAt ? { expiresAt } : {}),
  };
}

export const premiumAxiosRepository: PremiumRepository = {
  async getStatus() {
    try {
      const { data } = await api.get<ApiSubscriptionStatus>('/Subscription/me');
      return toPremiumStatus(data);
    } catch (error) {
      // Enquanto a API não tiver assinaturas (404), ninguém tem Premium: plano gratuito.
      if (isAxiosError(error) && error.response?.status === 404) {
        return toPremiumStatus(null);
      }
      throw error;
    }
  },
};

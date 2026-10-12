import { type Href, useRouter } from 'expo-router';

import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import {
  annualPriceCents,
  describeSubscription,
  formatBRL,
  FREE_BENEFITS,
  PREMIUM_BENEFITS,
  PREMIUM_PLAN,
} from '@/lib/premium-plan';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import { usePremiumStatusQuery } from '@/services/premium/premium.service';

/**
 * Página do Premium: o que é grátis × Premium, preço de referência e a situação da assinatura.
 * Não há botão de compra: a venda só começa com a cobrança pela loja integrada (PREMIUM_PLAN.onSale).
 */
export function usePremiumController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/configuracoes' as Href);
  const user = useSessionUser();
  const statusQuery = usePremiumStatusQuery();
  const loggedIn = user != null;
  const annual = annualPriceCents();

  return {
    goBack,
    loggedIn,
    onSale: PREMIUM_PLAN.onSale,
    monthlyPrice: formatBRL(PREMIUM_PLAN.monthlyPriceCents),
    annualPrice: annual == null ? null : formatBRL(annual),
    annualDiscountPercent: PREMIUM_PLAN.annualDiscountPercent,
    trialDays: PREMIUM_PLAN.trialDays,
    statusLoading: loggedIn && statusQuery.isLoading,
    subscription: describeSubscription(statusQuery.data, loggedIn, t),
    freeBenefits: FREE_BENEFITS,
    premiumBenefits: PREMIUM_BENEFITS,
    petsEnabled: env.petsEnabled,
    goToPets: () => router.push('/pets' as Href),
    goToLogin: () => router.push({ pathname: '/login', params: { returnTo: '/premium' } } as Href),
    goToHelp: () => router.push({ pathname: '/ajuda', params: { categoria: 'premium' } } as Href),
  };
}

export type PremiumController = ReturnType<typeof usePremiumController>;

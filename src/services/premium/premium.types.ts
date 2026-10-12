/**
 * Situação da assinatura de uma conta, como a API informa.
 * - `none`: nunca assinou (ou sem conta conectada).
 * - `trial`: em período de teste (tem acesso).
 * - `active`: assinatura em dia (tem acesso).
 * - `grace`: pagamento recusado; a loja ainda está tentando cobrar (acesso mantido por um tempo).
 * - `cancelled`: cancelada; o acesso continua até `expiresAt`.
 * - `expired`: terminou; sem acesso.
 */
export type SubscriptionState = 'none' | 'trial' | 'active' | 'grace' | 'cancelled' | 'expired';

export type SubscriptionPlan = 'monthly' | 'annual';

/** Assinatura Premium da conta conectada. Quem decide o acesso é o servidor (`active`). */
export interface PremiumStatus {
  active: boolean;
  state: SubscriptionState;
  plan?: SubscriptionPlan;
  /** Próxima renovação (ISO), quando a assinatura está em dia. */
  renewsAt?: string;
  /** Fim do acesso (ISO): teste, cancelada ou expirada. */
  expiresAt?: string;
  /** true só no repositório de teste (modo mock). */
  simulated?: boolean;
}

export const SUBSCRIPTION_STATES: readonly SubscriptionState[] = [
  'none',
  'trial',
  'active',
  'grace',
  'cancelled',
  'expired',
];

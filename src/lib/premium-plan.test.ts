import { ptTranslate } from '@/lib/i18n';
import {
  PREMIUM_PLAN,
  annualPriceCents,
  canRegisterPets,
  describeSubscription,
  formatBRL,
  formatDay,
} from '@/lib/premium-plan';
import type { PremiumStatus } from '@/services/premium/premium.types';

function status(overrides: Partial<PremiumStatus>): PremiumStatus {
  return { active: true, state: 'active', ...overrides };
}

describe('plano Premium', () => {
  it('formata reais e deixa o anual vazio enquanto o desconto não existe', () => {
    expect(formatBRL(990)).toBe('R$ 9,90');
    expect(formatBRL(100000)).toBe('R$ 1.000,00');
    expect(formatBRL(-150)).toBe('-R$ 1,50');
    expect(annualPriceCents()).toBeNull();
    expect(annualPriceCents({ ...PREMIUM_PLAN, annualDiscountPercent: 10 })).toBe(10692);
    expect(annualPriceCents({ ...PREMIUM_PLAN, annualDiscountPercent: 150 })).toBe(0);
  });

  it('só libera o cadastro de pet com conta e, se a chave exigir, com Premium', () => {
    expect(canRegisterPets(false, true)).toBe(false);
    expect(canRegisterPets(true, false)).toBe(false);
    expect(canRegisterPets(true, true)).toBe(true);
    expect(canRegisterPets(true, false, { ...PREMIUM_PLAN, petAlertsRequirePremium: false })).toBe(true);
  });

  it('formata o dia e devolve vazio quando a data não existe', () => {
    expect(formatDay(undefined)).toBe('');
    expect(formatDay('não-é-data')).toBe('');
    expect(formatDay('2026-06-15T12:00:00.000Z')).toBe('15/06/2026');
  });

  it('descreve a assinatura em cada situação', () => {
    const day = '2026-06-15T12:00:00.000Z';
    expect(describeSubscription(undefined, false, ptTranslate).label).toBe('Gratuito');
    expect(describeSubscription(undefined, true, ptTranslate).label).toBe('—');

    expect(describeSubscription(status({ state: 'trial', expiresAt: day }), true, ptTranslate)).toMatchObject({
      label: 'Em teste',
      tone: 'success',
    });
    expect(describeSubscription(status({ state: 'trial' }), true, ptTranslate).description).toContain(
      'Período de teste ativo.',
    );

    const monthly = describeSubscription(
      status({ state: 'active', plan: 'monthly', renewsAt: day }),
      true,
      ptTranslate,
    );
    expect(monthly.label).toBe('Ativo');
    expect(monthly.description).toContain('mensal');
    expect(monthly.description).toContain('15/06/2026');

    expect(
      describeSubscription(status({ state: 'active', plan: 'annual' }), true, ptTranslate).description,
    ).toContain('anual');
    expect(describeSubscription(status({ state: 'active' }), true, ptTranslate).description).toContain(
      'Assinatura em dia.',
    );

    expect(describeSubscription(status({ state: 'grace', active: true }), true, ptTranslate)).toMatchObject({
      label: 'Pagamento pendente',
      tone: 'warning',
    });
    expect(describeSubscription(status({ state: 'cancelled', expiresAt: day }), true, ptTranslate).description).toContain(
      '15/06/2026',
    );
    expect(describeSubscription(status({ state: 'cancelled' }), true, ptTranslate).description).toContain(
      'não será renovada',
    );
    expect(describeSubscription(status({ state: 'expired', active: false, expiresAt: day }), true, ptTranslate).label).toBe(
      'Expirado',
    );
    expect(describeSubscription(status({ state: 'expired', active: false }), true, ptTranslate).description).toContain(
      'O Premium terminou.',
    );
    expect(describeSubscription(status({ state: 'none', active: false }), true, ptTranslate).label).toBe('Gratuito');
  });

  it('avisa quando a situação veio do modo de teste', () => {
    const summary = describeSubscription(
      status({ state: 'active', simulated: true }),
      true,
      ptTranslate,
    );
    expect(summary.description).toContain('Teste do modo de desenvolvimento');
  });
});

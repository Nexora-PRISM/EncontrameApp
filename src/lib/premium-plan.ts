import type { Translate } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import type { PremiumStatus } from '@/services/premium/premium.types';

/**
 * Plano Premium do Encontra-me — preço, condições e o que é grátis × Premium ficam SÓ aqui.
 *
 * Regras (decisão dos sócios):
 * - Busca de pessoas desaparecidas e funções de emergência nunca ficam atrás da assinatura.
 * - O app não vende nada enquanto `onSale` for false: o preço aparece como referência.
 * - Recurso "planejado" aparece como "Em breve" e nunca como botão que finge funcionar.
 */
export interface PremiumPlanConfig {
  /** Preço de referência mensal, em centavos de real. */
  monthlyPriceCents: number;
  /** Desconto do plano anual, em %. `null` = ainda não definido (o app não mostra plano anual). */
  annualDiscountPercent: number | null;
  /** Dias de teste grátis. `null` = sem período de teste. */
  trialDays: number | null;
  /**
   * A assinatura pode ser comprada no app? Só quando a cobrança pela loja (Google Play Billing)
   * e a API de assinaturas estiverem prontas e testadas.
   */
  onSale: boolean;
  /** Cadastrar pet desaparecido exige Premium? (`false` libera para qualquer conta conectada.) */
  petAlertsRequirePremium: boolean;
}

export const PREMIUM_PLAN: PremiumPlanConfig = {
  monthlyPriceCents: 990,
  annualDiscountPercent: null,
  trialDays: null,
  onSale: false,
  petAlertsRequirePremium: true,
};

/** Valor em reais no formato brasileiro ("R$ 9,90"), em qualquer idioma — o preço é em reais. */
export function formatBRL(cents: number): string {
  const value = Math.round(Math.abs(cents));
  const reais = String(Math.floor(value / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavos = String(value % 100).padStart(2, '0');
  return `${cents < 0 ? '-' : ''}R$ ${reais},${centavos}`;
}

/** Preço do plano anual com o desconto configurado; `null` enquanto o desconto não for definido. */
export function annualPriceCents(plan: PremiumPlanConfig = PREMIUM_PLAN): number | null {
  if (plan.annualDiscountPercent == null) return null;
  const discount = Math.min(Math.max(plan.annualDiscountPercent, 0), 100);
  return Math.round(plan.monthlyPriceCents * 12 * (1 - discount / 100));
}

/** Pode cadastrar pet desaparecido? (conta conectada + Premium, se a chave exigir). */
export function canRegisterPets(
  loggedIn: boolean,
  premiumActive: boolean,
  plan: PremiumPlanConfig = PREMIUM_PLAN,
): boolean {
  if (!loggedIn) return false;
  return plan.petAlertsRequirePremium ? premiumActive : true;
}

export type BenefitStatus = 'available' | 'planned';

export interface PlanBenefit {
  id: string;
  title: string;
  /** Detalhe ou limite técnico, quando ajuda a não prometer demais. */
  note?: string;
  status: BenefitStatus;
}

/** Sempre grátis — inclui tudo o que é busca de pessoas e emergência. */
export const FREE_BENEFITS: readonly PlanBenefit[] = [
  {
    id: 'casos',
    title: msg('Ver os casos de pessoas desaparecidas e o mapa'),
    status: 'available',
  },
  {
    id: 'cadastro',
    title: msg('Cadastrar uma pessoa desaparecida e enviar avistamentos'),
    status: 'available',
  },
  {
    id: 'emergencia',
    title: msg('Pedir ajuda: alerta de emergência e ligação para 190, 180, 100, 192 e 193'),
    status: 'available',
  },
  {
    id: 'localizacao',
    title: msg('Mandar sua localização atual aos contatos de confiança'),
    status: 'available',
  },
  {
    id: 'pets-ver',
    title: msg('Ver e divulgar pets desaparecidos'),
    status: 'available',
  },
  {
    id: 'apoio',
    title: msg('Central de Ajuda, Sofia e grupo de apoio'),
    status: 'available',
  },
  {
    id: 'alertas-regiao',
    title: msg('Alertas de desaparecimento na sua região'),
    status: 'planned',
  },
];

/** Recursos do Premium: o que já está pronto e o que está planejado. */
export const PREMIUM_BENEFITS: readonly PlanBenefit[] = [
  {
    id: 'pets-cadastro',
    title: msg('Cadastrar e divulgar pets desaparecidos'),
    status: 'available',
  },
  {
    id: 'trajetos',
    title: msg('Monitoramento ampliado de trajetos, com histórico e organização das rotas'),
    note: msg('Acompanhamento com o app aberto e em segundo plano, dentro das regras do Android.'),
    status: 'planned',
  },
  {
    id: 'tempo-real',
    title: msg('Localização em tempo real com contatos autorizados'),
    note: msg('Mandar a localização atual uma vez continua grátis.'),
    status: 'planned',
  },
  {
    id: 'circulo',
    title: msg('Círculo de proteção familiar'),
    note: msg('Só com convite e aceite de cada pessoa — nunca rastreamento escondido.'),
    status: 'planned',
  },
  {
    id: 'alertas-personalizados',
    title: msg('Alertas personalizados'),
    status: 'planned',
  },
  {
    id: 'pet-passeios',
    title: msg('Passeios de pets: trajeto, histórico e avisos de atraso e afastamento'),
    note: msg(
      'O celular do tutor registra o passeio enquanto está com ele. Sem rastreador no animal, o app não consegue localizá-lo sozinho.',
    ),
    status: 'planned',
  },
  {
    id: 'pet-perfis',
    title: msg('Organização avançada dos perfis dos seus animais'),
    status: 'planned',
  },
  {
    id: 'extras',
    title: msg('Ferramentas extras de segurança e conveniência'),
    status: 'planned',
  },
];

/** dd/mm/aaaa no horário do aparelho; vazio se a data for inválida. */
export function formatDay(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export type SubscriptionTone = 'neutral' | 'success' | 'warning';

export interface SubscriptionSummary {
  /** Texto curto (ex.: "Ativo", "Gratuito"). */
  label: string;
  description: string;
  tone: SubscriptionTone;
}

/**
 * Situação da assinatura em palavras, só com o que o servidor informou. Sem conta conectada,
 * o plano é o gratuito. Enquanto a venda não começa, mostra o preço como referência.
 */
export function describeSubscription(
  status: PremiumStatus | undefined,
  loggedIn: boolean,
  t: Translate,
  plan: PremiumPlanConfig = PREMIUM_PLAN,
): SubscriptionSummary {
  const price = formatBRL(plan.monthlyPriceCents);
  const freeDescription = plan.onSale
    ? t('Premium disponível por {price} por mês.', { price })
    : t('A venda ainda não começou e nada é cobrado no app. Preço de referência: {price} por mês.', {
        price,
      });

  if (!loggedIn) {
    return {
      label: t('Gratuito'),
      description: t('Entre na sua conta para ver a situação da sua assinatura.'),
      tone: 'neutral',
    };
  }
  if (!status) {
    return {
      label: '—',
      description: t('Não foi possível verificar a assinatura agora.'),
      tone: 'neutral',
    };
  }

  const test = status.simulated ? ` ${t('Teste do modo de desenvolvimento: nada foi cobrado.')}` : '';
  const renews = formatDay(status.renewsAt);
  const ends = formatDay(status.expiresAt);
  let summary: SubscriptionSummary;

  switch (status.state) {
    case 'trial':
      summary = {
        label: t('Em teste'),
        description: ends ? t('Teste grátis até {date}.', { date: ends }) : t('Período de teste ativo.'),
        tone: 'success',
      };
      break;
    case 'active': {
      let description: string;
      if (status.plan === 'monthly') {
        description = renews ? t('Plano mensal · renova em {date}.', { date: renews }) : t('Plano mensal.');
      } else if (status.plan === 'annual') {
        description = renews ? t('Plano anual · renova em {date}.', { date: renews }) : t('Plano anual.');
      } else {
        description = renews ? t('Renova em {date}.', { date: renews }) : t('Assinatura em dia.');
      }
      summary = { label: t('Ativo'), description, tone: 'success' };
      break;
    }
    case 'grace':
      summary = {
        label: t('Pagamento pendente'),
        description: t(
          'O pagamento foi recusado. Atualize a forma de pagamento na loja de aplicativos para continuar com o Premium.',
        ),
        tone: 'warning',
      };
      break;
    case 'cancelled':
      summary = {
        label: t('Cancelado'),
        description: ends
          ? t('O Premium continua até {date}.', { date: ends })
          : t('A assinatura não será renovada.'),
        tone: 'warning',
      };
      break;
    case 'expired':
      summary = {
        label: t('Expirado'),
        description: ends ? t('O Premium terminou em {date}.', { date: ends }) : t('O Premium terminou.'),
        tone: 'neutral',
      };
      break;
    default:
      summary = { label: t('Gratuito'), description: freeDescription, tone: 'neutral' };
  }
  return { ...summary, description: `${summary.description}${test}` };
}

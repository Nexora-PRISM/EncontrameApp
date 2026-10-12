import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { PremiumController } from '@/features/premium/premium.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: PremiumController };

/** Preço de referência e situação da assinatura da conta. */
export function PremiumHeroSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="star-four-points" size={16} color={brand.navy} />
          <Text style={styles.badgeText}>{t('Premium')}</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {t('Mais recursos de segurança e para pets')}
        </Text>
        <Text style={styles.lead}>
          {t('A busca de pessoas desaparecidas e as funções de emergência continuam grátis para todos.')}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{c.monthlyPrice}</Text>
          <Text style={styles.per}>{t('por mês')}</Text>
        </View>
        {c.annualPrice ? (
          <Text style={styles.extra}>
            {c.annualDiscountPercent
              ? t('ou {price} por ano ({discount}% de desconto)', {
                  price: c.annualPrice,
                  discount: c.annualDiscountPercent,
                })
              : t('ou {price} por ano', { price: c.annualPrice })}
          </Text>
        ) : null}
        {c.trialDays ? (
          <Text style={styles.extra}>{t('{days} dias grátis para testar', { days: c.trialDays })}</Text>
        ) : null}
        {c.onSale ? null : (
          <Text style={styles.note}>
            {t('Preço de referência. A venda ainda não começou e nada é cobrado no app.')}
          </Text>
        )}
      </View>

      <View style={styles.status} accessibilityLiveRegion="polite">
        <Text style={styles.statusTitle}>{t('Sua assinatura')}</Text>
        {c.statusLoading ? (
          <ActivityIndicator color={brand.blue} style={styles.loading} />
        ) : (
          <>
            <Text style={[styles.statusLabel, c.subscription.tone === 'warning' && styles.warning]}>
              {c.subscription.label}
            </Text>
            <Text style={styles.statusBody}>{c.subscription.description}</Text>
          </>
        )}
        {c.loggedIn ? null : (
          <BrandButton label={t('Entrar')} variant="outline" onPress={c.goToLogin} />
        )}
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    hero: {
      gap: 8,
      padding: 20,
      borderRadius: Radius.lg,
      backgroundColor: brand.navy,
    },
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.pill,
      backgroundColor: brand.cream,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.navy,
    },
    title: {
      marginTop: 4,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    lead: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.cream,
    },
    priceRow: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    price: {
      fontSize: 34,
      lineHeight: 38,
      fontWeight: '800',
      color: brand.orange,
    },
    per: {
      paddingBottom: 4,
      fontSize: 16,
      fontWeight: '600',
      color: brand.onPrimary,
    },
    extra: {
      fontSize: 14,
      fontWeight: '600',
      color: brand.onPrimary,
    },
    note: {
      fontSize: 13,
      lineHeight: 19,
      color: brand.cream,
    },
    status: {
      gap: 6,
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    statusTitle: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.label,
    },
    statusLabel: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    warning: {
      color: brand.orangeText,
    },
    statusBody: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
    loading: {
      alignSelf: 'flex-start',
      marginVertical: 6,
    },
  });
}

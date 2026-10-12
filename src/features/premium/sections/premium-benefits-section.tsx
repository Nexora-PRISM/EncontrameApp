import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import type { PremiumController } from '@/features/premium/premium.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import type { PlanBenefit } from '@/lib/premium-plan';

type Props = { controller: PremiumController };

/** Grátis × Premium: o que já funciona no app e o que ainda está em preparação ("Em breve"). */
export function PremiumBenefitsSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <BenefitGroup
        title={t('Sempre grátis')}
        icon="shield-check-outline"
        items={c.freeBenefits}
        styles={styles}
        brand={brand}
      />
      <BenefitGroup
        title={t('No Premium')}
        icon="star-four-points-outline"
        items={c.premiumBenefits}
        styles={styles}
        brand={brand}
      />
    </View>
  );
}

function BenefitGroup({
  title,
  icon,
  items,
  styles,
  brand,
}: {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  items: readonly PlanBenefit[];
  styles: ReturnType<typeof makeStyles>;
  brand: BrandColors;
}) {
  const t = useT();

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <MaterialCommunityIcons name={icon} size={22} color={brand.blue} />
        <Text style={styles.cardTitle} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {items.map((item) => {
        const ready = item.status === 'available';
        return (
          <View
            key={item.id}
            style={styles.row}
            accessible
            accessibilityLabel={[t(item.title), item.note ? t(item.note) : '', ready ? t('Disponível') : t('em breve')]
              .filter(Boolean)
              .join(', ')}
          >
            <MaterialCommunityIcons
              name={ready ? 'check-circle' : 'clock-outline'}
              size={20}
              color={ready ? brand.blue : brand.label}
            />
            <View style={styles.texts}>
              <Text style={[styles.itemTitle, !ready && styles.itemPlanned]}>{t(item.title)}</Text>
              {item.note ? <Text style={styles.itemNote}>{t(item.note)}</Text> : null}
            </View>
            {ready ? (
              <Text style={styles.readyText}>{t('Disponível')}</Text>
            ) : (
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>{t('Em breve')}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
    },
    card: {
      gap: 4,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    cardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: brand.textDark,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 8,
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    itemTitle: {
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '600',
      color: brand.textDark,
    },
    itemPlanned: {
      color: brand.textMuted,
    },
    itemNote: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    readyText: {
      fontSize: 12,
      fontWeight: '800',
      color: brand.textDark,
      paddingTop: 2,
    },
    soonBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.pill,
      backgroundColor: brand.fieldBackground,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    soonText: {
      fontSize: 12,
      fontWeight: '700',
      color: brand.textMuted,
    },
  });
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { RegrasController } from '@/features/regras/regras.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: RegrasController };

export function RegrasContentSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>{t(controller.intro)}</Text>

      {controller.sections.map((section) => (
        <View key={section.id} style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">
            {t(section.title)}
          </Text>
          {section.items.map((item) => (
            <View key={item} style={styles.item}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={brand.blue} />
              <Text style={styles.itemText}>{t(item)}</Text>
            </View>
          ))}
        </View>
      ))}

      <Text style={styles.note}>{t(controller.legalNote)}</Text>
      <BrandButton
        label={t('Ler a política de privacidade')}
        variant="blue"
        onPress={controller.openPrivacyPolicy}
      />
      <BrandButton
        label={t('Dúvidas sobre seus dados')}
        variant="outline"
        onPress={controller.goToPrivacyContact}
      />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 16,
    },
    intro: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textMuted,
    },
    card: {
      gap: 10,
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: brand.textDark,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    itemText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: brand.textDark,
    },
    note: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
  });
}

import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { type BrandColors } from '@/constants/brand';
import type { HomeController } from '@/features/home/home.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface HomeActionsSectionProps {
  controller: HomeController;
}

export function HomeActionsSection({ controller }: HomeActionsSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.actions}>
      <BrandButton label={t('Começar')} variant="orange" onPress={controller.goToSignup} />
      <Pressable onPress={controller.goToLogin} hitSlop={12}>
        <Text style={styles.loginLink}>{t('Já possuo uma conta ›')}</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    actions: {
      gap: 18,
      alignItems: 'center',
    },
    loginLink: {
      color: brand.cream,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}

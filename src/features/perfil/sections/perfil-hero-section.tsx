import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import type { PerfilController } from '@/features/perfil/perfil.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: PerfilController };

export function PerfilHeroSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.card}>
      <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
        <Text style={styles.avatarText}>{controller.initials}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={2} accessibilityRole="header">
          {controller.user?.name ?? t('Visitante')}
        </Text>
        {controller.user?.email ? (
          <Text style={styles.email} numberOfLines={1}>
            {controller.user.email}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={controller.goToSettings}
        style={styles.iconButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('Configurações')}
      >
        <MaterialCommunityIcons name="cog-outline" size={24} color={brand.onPrimary} />
      </Pressable>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 18,
      borderRadius: Radius.xl,
      backgroundColor: brand.navy,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.orange,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: 20,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    email: {
      fontSize: 14,
      color: brand.cream,
    },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.navyDeep,
    },
  });
}

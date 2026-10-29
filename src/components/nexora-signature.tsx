import { useMemo } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { type BrandColors } from '@/constants/brand';
import { AppInfo } from '@/lib/app-info';
import { useBrand } from '@/lib/brand-theme';
import { hexToRgba } from '@/lib/map-style';

type Props = {
  /** `onDark` para fundo marinho (abertura do app); `auto` segue o tema (menu, Sobre). */
  tone?: 'auto' | 'onDark';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

/**
 * Assinatura "Um produto da Nexora Prism" no rodapé, no estilo do "from Meta" dos apps da Meta:
 * linha pequena em cima e a logo da empresa embaixo. Marca: não traduzir.
 */
export function NexoraSignature({ tone = 'auto', size = 'md', style }: Props) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand, tone, size), [brand, tone, size]);

  return (
    <View
      style={[styles.wrap, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={AppInfo.companyLine}
    >
      <Text style={styles.from}>{AppInfo.companyFrom}</Text>
      <View style={styles.row}>
        <Image
          source={require('@/assets/images/nexora-prism-mark.png')}
          style={styles.mark}
          resizeMode="contain"
        />
        <Text style={styles.name}>Nexora Prism</Text>
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors, tone: 'auto' | 'onDark', size: 'sm' | 'md') {
  const onDark = tone === 'onDark';
  const scale = size === 'sm' ? 0.85 : 1;

  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      gap: 4 * scale,
    },
    from: {
      fontSize: 12 * scale,
      fontWeight: '600',
      letterSpacing: 0.3,
      color: onDark ? hexToRgba(brand.onPrimary, 0.62) : brand.textMuted,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6 * scale,
    },
    mark: {
      width: 24 * scale,
      height: 24 * scale,
    },
    name: {
      fontSize: 16 * scale,
      fontWeight: '800',
      letterSpacing: 0.3 * scale,
      color: onDark ? brand.onPrimary : brand.textDark,
    },
  });
}

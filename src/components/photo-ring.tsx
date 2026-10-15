import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useBrand } from '@/lib/brand-theme';

const RING = 3;
const GAP = 2;

type Props = {
  size: number;
  radius: number;
  /** Cor do anel comum (ex.: faixa de idade). */
  color: string;
  /** Caso em alerta: anel em degradê quente (creme → laranja → alerta) para chamar a atenção. */
  urgent?: boolean;
  children: ReactNode;
};

/**
 * Foto com anel e um respiro entre o anel e a imagem. Nos casos em alerta o anel ganha um
 * degradê nas cores da marca (inspirado nos destaques de redes sociais, sem copiar as cores delas).
 */
export function PhotoRing({ size, radius, color, urgent = false, children }: Props) {
  const brand = useBrand();
  const innerSize = size - RING * 2;
  const content = (
    <View
      style={[
        styles.gap,
        { width: innerSize, height: innerSize, borderRadius: radius - RING, backgroundColor: brand.surface },
      ]}
    >
      <View
        style={[
          styles.photo,
          { borderRadius: Math.max(radius - RING - GAP, 4), backgroundColor: brand.avatarBackground },
        ]}
      >
        {children}
      </View>
    </View>
  );

  if (urgent) {
    return (
      <LinearGradient
        colors={[brand.cream, brand.orange, brand.statusAlerta]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.ring, { width: size, height: size, borderRadius: radius }]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: radius, backgroundColor: color }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: RING,
  },
  gap: {
    padding: GAP,
  },
  photo: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NexoraSignature } from '@/components/nexora-signature';
import { type BrandColors } from '@/constants/brand';
import { AppInfo } from '@/lib/app-info';
import { useBrand } from '@/lib/brand-theme';
import { hexToRgba } from '@/lib/map-style';

/** Tempo mínimo na tela: o bastante para ler a marca, curto para não atrasar quem tem pressa. */
const MIN_VISIBLE_MS = 1100;
const FADE_MS = 320;

type Props = {
  /** O app já pode aparecer (sessão e idioma carregados). */
  ready: boolean;
  onDone: () => void;
};

/**
 * Abertura do app: logo do Encontra-me no centro e "Um produto da Nexora Prism" no rodapé,
 * como os apps da Meta. Continua a splash nativa (mesmo fundo marinho) e some com fade.
 */
export function BrandSplash({ ready, onDone }: Props) {
  const brand = useBrand();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const [minElapsed, setMinElapsed] = useState(false);
  const opacity = useSharedValue(1);
  const leaving = ready && minElapsed;

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
      if (finished) {
        runOnJS(onDone)();
      }
    });
  }, [leaving, onDone, opacity]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.root, fadeStyle]}
      pointerEvents={leaving ? 'none' : 'auto'}
      accessibilityLabel={AppInfo.name}
    >
      <View style={styles.center}>
        <View style={styles.markWrap}>
          <Image
            source={require('@/assets/images/logo-glow.png')}
            style={styles.glow}
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/images/encontrame-mark.png')}
            style={styles.mark}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.name}>{AppInfo.name}</Text>
        <Text style={styles.slogan}>{AppInfo.slogan}</Text>
      </View>
      <NexoraSignature tone="onDark" style={{ paddingBottom: insets.bottom + 28 }} />
    </Animated.View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFill,
      zIndex: 1000,
      elevation: 1000,
      backgroundColor: brand.navy,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    markWrap: {
      width: 120,
      height: 120,
    },
    glow: {
      position: 'absolute',
      top: -90,
      left: -90,
      width: 300,
      height: 300,
      opacity: 0.55,
    },
    mark: {
      width: 120,
      height: 120,
    },
    name: {
      marginTop: 18,
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: 0.4,
      color: brand.onPrimary,
    },
    slogan: {
      marginTop: 6,
      fontSize: 15,
      fontWeight: '500',
      textAlign: 'center',
      color: hexToRgba(brand.cream, 0.85),
    },
  });
}

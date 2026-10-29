import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { EmergencySheet } from '@/components/emergency-sheet';
import { Radius, type BrandColors } from '@/constants/brand';
import { brandTiming } from '@/constants/motion';
import { setBottomBarHeight } from '@/lib/bottom-bar-metrics';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useBottomSafeInset } from '@/lib/use-bottom-safe-inset';
import { useTimedOpacity } from '@/lib/use-brand-transition';
import { useKeyboardVisible } from '@/lib/use-keyboard-visible';
import { useWebShell } from '@/lib/use-web-shell';
import { useWideLayout } from '@/lib/use-wide-layout';

/** `phone` mantido por compatibilidade com telas antigas; hoje a ajuda é o botão central. */
type Tab = 'register' | 'home' | 'phone';

type Props = {
  /** Aba ativa ganha uma plataforma laranja abaixo do ícone; a cor do ícone não muda. */
  active?: Tab;
  /** Na home do celular, a aba da esquerda abre o menu em vez de "Início". */
  onMenuPress?: () => void;
  /** No desktop da home a fileira de botões fica na coluna do mapa. */
  hideWide?: boolean;
};

function BottomTab({
  icon,
  label,
  isActive,
  onPress,
  brand,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
  brand: BrandColors;
}) {
  const [highlighted, setHighlighted] = useState(false);
  const pressOpacity = useTimedOpacity(highlighted ? 0.85 : 1);

  // Sempre inicia em 0 para a transição rodar no mount (cada página remonta o footer).
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = brandTiming(isActive ? 1 : 0);
  }, [isActive, progress]);

  const platformStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.45 + progress.value * 0.55 }],
  }));

  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      onPressIn={() => setHighlighted(true)}
      onPressOut={() => setHighlighted(false)}
      onHoverIn={() => setHighlighted(true)}
      onHoverOut={() => setHighlighted(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      style={styles.tab}
    >
      <Animated.View style={[styles.iconWrap, pressOpacity]}>
        <MaterialCommunityIcons
          name={icon}
          size={26}
          color={isActive ? brand.textDark : brand.label}
        />
        <Text
          style={[styles.tabLabel, { color: isActive ? brand.textDark : brand.label }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Animated.View style={[styles.platform, { backgroundColor: brand.orange }, platformStyle]} />
      </Animated.View>
    </Pressable>
  );
}

/**
 * Navegação inferior com o botão "Pedir ajuda" no centro — a área mais fácil de
 * alcançar com o polegar. Em telas largas vira um botão flutuante no rodapé.
 * Some enquanto o teclado está aberto (no Android ela subia junto e cobria o campo).
 */
export function BottomBar({ active, onMenuPress, hideWide = false }: Props) {
  const t = useT();
  const brand = useBrand();
  const stylesBar = useMemo(() => makeBarStyles(brand), [brand]);
  const bottomInset = useBottomSafeInset();
  const router = useRouter();
  const { isWide } = useWideLayout();
  const inWebShell = useWebShell();
  const keyboardVisible = useKeyboardVisible();
  const [helpOpen, setHelpOpen] = useState(false);

  // "Início" volta para a tela inicial que já está na pilha (antes cada toque empilhava outra).
  const goHome = () => {
    if (active === 'home') return;
    router.dismissTo('/inicio');
  };
  const goRegister = () => {
    if (active === 'register') return;
    router.push('/cadastrar-pessoa');
  };

  // Na web em tela larga o "Pedir ajuda" fica no header fixo (WebShellFrame).
  if (isWide && (hideWide || inWebShell)) return null;

  const helpButton = (
    <Pressable
      onPress={() => setHelpOpen(true)}
      style={({ pressed }) => [
        isWide ? stylesBar.helpPill : stylesBar.helpButton,
        pressed && { backgroundColor: brand.emergencyDark },
      ]}
      accessibilityRole="button"
      accessibilityLabel={t('Pedir ajuda')}
      accessibilityHint={t('Mostra os números de emergência e como comunicar um desaparecimento')}
    >
      <MaterialCommunityIcons name="alarm-light-outline" size={isWide ? 22 : 26} color={brand.onEmergency} />
      <Text style={stylesBar.helpLabel}>{t('Pedir ajuda')}</Text>
    </Pressable>
  );

  return (
    <>
      {keyboardVisible ? null : isWide ? (
        <View style={[stylesBar.wideWrap, { bottom: bottomInset + 12 }]} pointerEvents="box-none">
          {helpButton}
        </View>
      ) : (
        <View
          style={[stylesBar.bar, { paddingBottom: bottomInset }]}
          onLayout={(event) => setBottomBarHeight(event.nativeEvent.layout.height)}
        >
          {onMenuPress ? (
            <BottomTab
              brand={brand}
              icon="menu"
              label={t('Menu')}
              isActive={false}
              onPress={onMenuPress}
            />
          ) : (
            <BottomTab
              brand={brand}
              icon="home-outline"
              label={t('Início')}
              isActive={active === 'home'}
              onPress={goHome}
            />
          )}
          <View style={styles.center}>{helpButton}</View>
          <BottomTab
            brand={brand}
            icon="account-plus-outline"
            label={t('Cadastrar')}
            isActive={active === 'register'}
            onPress={goRegister}
          />
        </View>
      )}
      <EmergencySheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

function makeBarStyles(brand: BrandColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: brand.fieldBorder,
      backgroundColor: brand.white,
      zIndex: 20,
    },
    helpButton: {
      minWidth: 128,
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 18,
      borderRadius: Radius.pill,
      backgroundColor: brand.emergency,
      shadowColor: brand.emergencyDark,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    helpPill: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 22,
      borderRadius: Radius.pill,
      backgroundColor: brand.emergency,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.3,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
    helpLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.onEmergency,
    },
    wideWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 40,
    },
  });
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  center: {
    paddingHorizontal: 8,
  },
  iconWrap: {
    minWidth: 64,
    alignItems: 'center',
    paddingTop: 2,
    paddingBottom: 2,
    gap: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  platform: {
    marginTop: 3,
    width: 28,
    height: 4,
    borderRadius: Radius.pill,
  },
});

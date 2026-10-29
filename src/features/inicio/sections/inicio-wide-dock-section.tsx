import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmergencySheet } from '@/components/emergency-sheet';
import { Radius } from '@/constants/brand';
import { WideDockHeight, wideDockBottom } from '@/constants/theme';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useBottomSafeInset } from '@/lib/use-bottom-safe-inset';
import { useKeyboardVisible } from '@/lib/use-keyboard-visible';
import { useWebShell } from '@/lib/use-web-shell';

/**
 * Fileira do rodapé do mapa no desktop: os botões dividem a mesma linha e o mesmo centro
 * da coluna do mapa. "Cadastrar pessoa" usa a cor primária para se destacar.
 */
export function InicioWideDockSection({ controller }: { controller: InicioController }) {
  const t = useT();
  const brand = useBrand();
  const router = useRouter();
  const bottomInset = useBottomSafeInset();
  const keyboardVisible = useKeyboardVisible();
  const inWebShell = useWebShell();
  const [helpOpen, setHelpOpen] = useState(false);
  const showAddNote = controller.showSafetyNotes && !controller.hasSelection;

  if (keyboardVisible) return null;

  return (
    <>
      <View
        style={[styles.anchor, { bottom: wideDockBottom(bottomInset) }]}
        pointerEvents="box-none"
      >
        <View style={styles.row}>
          {showAddNote ? (
            <DockButton
              icon="map-marker-plus-outline"
              iconColor={brand.safetyNote}
              label={t('Adicionar aviso')}
              background={brand.navy}
              color={brand.onPrimary}
              pressedBackground={brand.navyDeep}
              onPress={controller.goToNewSafetyNote}
              accessibilityLabel={t('Adicionar aviso de segurança')}
              accessibilityHint={t('Avise sobre uma rua ou lugar perigoso')}
            />
          ) : null}
          {/* Na web o "Pedir ajuda" fica no header fixo, à direita da busca. */}
          {inWebShell ? null : (
            <DockButton
              icon="alarm-light-outline"
              iconColor={brand.onEmergency}
              label={t('Pedir ajuda')}
              background={brand.emergency}
              color={brand.onEmergency}
              pressedBackground={brand.emergencyDark}
              onPress={() => setHelpOpen(true)}
              accessibilityLabel={t('Pedir ajuda')}
              accessibilityHint={t('Mostra os números de emergência e como comunicar um desaparecimento')}
            />
          )}
          <DockButton
            icon="account-plus"
            iconColor={brand.onPrimary}
            label={t('Cadastrar pessoa')}
            background={brand.orange}
            color={brand.onPrimary}
            pressedBackground={brand.orangeDark}
            onPress={() => router.push('/cadastrar-pessoa')}
            accessibilityLabel={t('Cadastrar uma pessoa')}
          />
        </View>
      </View>
      <EmergencySheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

function DockButton({
  icon,
  iconColor,
  label,
  background,
  color,
  pressedBackground,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  label: string;
  background: string;
  color: string;
  pressedBackground: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        stylesButton.pill,
        {
          backgroundColor: pressed ? pressedBackground : background,
          shadowColor: background,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      <Text style={[stylesButton.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 4,
    alignItems: 'center',
    paddingHorizontal: 88,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    maxWidth: '100%',
  },
});

const stylesButton = StyleSheet.create({
  pill: {
    height: WideDockHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    flexShrink: 1,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
  },
});

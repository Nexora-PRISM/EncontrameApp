import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { AppInfo } from '@/lib/app-info';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';

interface InicioHeaderSectionProps {
  controller: InicioController;
}

/**
 * Topo do Início (celular), sobre a faixa marinho da marca: "?" (passo a passo), logo e busca;
 * logo abaixo, a saudação que leva ao perfil — ou ao login, para quem ainda não entrou.
 */
export function InicioHeaderSection({ controller }: InicioHeaderSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const { loggedIn, userFirstName } = controller;

  const greeting = loggedIn
    ? userFirstName
      ? t('Olá, {name}!', { name: userFirstName })
      : t('Olá!')
    : t('Entre ou crie sua conta');
  const greetingHint = loggedIn ? t('Ver meu perfil') : t('Para cadastrar e acompanhar casos');

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <HeaderIconButton
          icon="help-circle-outline"
          label={t('Como usar o app')}
          onPress={controller.openTutorial}
          styles={styles}
          brand={brand}
        />
        <View style={styles.brandRow} accessibilityRole="header" accessibilityLabel={AppInfo.name}>
          <Image
            source={require('@/assets/images/encontrame-mark.png')}
            style={styles.mark}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>{AppInfo.name}</Text>
        </View>
        <HeaderIconButton
          icon="magnify"
          label={t('Buscar pessoas')}
          onPress={controller.goToAllPeople}
          styles={styles}
          brand={brand}
        />
      </View>

      <Pressable
        onPress={controller.goToProfileOrLogin}
        style={({ pressed }) => [styles.greeting, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${greeting}. ${greetingHint}`}
      >
        <View style={styles.avatar}>
          {loggedIn ? (
            <Text style={styles.avatarText}>{controller.userInitials}</Text>
          ) : (
            <MaterialCommunityIcons name="account" size={24} color={brand.navy} />
          )}
        </View>
        <View style={styles.greetingText}>
          <Text style={styles.greetingTitle} numberOfLines={1}>
            {greeting}
          </Text>
          <Text style={styles.greetingHint} numberOfLines={1}>
            {greetingHint}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={26} color={brand.cream} />
      </Pressable>
    </View>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
  styles,
  brand,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  brand: BrandColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon} size={26} color={brand.onPrimary} />
    </Pressable>
  );
}

function makeStyles(brand: BrandColors) {
  const glass = hexToRgba(brand.onPrimary, 0.12);
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: PageGutter - 8,
      gap: 10,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 52,
    },
    iconButton: {
      width: 46,
      height: 46,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: glass,
    },
    pressed: {
      opacity: 0.75,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    mark: {
      width: 34,
      height: 34,
    },
    brandName: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: 0.2,
      color: brand.onPrimary,
    },
    greeting: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 60,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: Radius.lg,
      backgroundColor: glass,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.cream,
      borderWidth: 2,
      borderColor: brand.orange,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.navy,
    },
    greetingText: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    greetingTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    greetingHint: {
      fontSize: 14,
      fontWeight: '600',
      color: hexToRgba(brand.cream, 0.85),
    },
  });
}

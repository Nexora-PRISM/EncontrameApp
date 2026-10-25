import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { useHomeChrome } from '@/features/inicio/home-chrome';
import { AppInfo } from '@/lib/app-info';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface InicioHeaderSectionProps {
  controller: InicioController;
}

/**
 * Topo do Início (celular): avatar da conta (abre o perfil, ou o login), logo e busca.
 * A faixa usa a cor do tema — ver `useHomeChrome`.
 */
export function InicioHeaderSection({ controller }: InicioHeaderSectionProps) {
  const t = useT();
  const brand = useBrand();
  const chrome = useHomeChrome();
  const styles = useMemo(() => makeStyles(brand, chrome.ink, chrome.glass), [brand, chrome.glass, chrome.ink]);
  const { loggedIn } = controller;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable
          onPress={controller.goToProfileOrLogin}
          hitSlop={6}
          style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={loggedIn ? t('Meu perfil') : t('Entrar')}
        >
          <View style={styles.avatar}>
            {loggedIn ? (
              <Text style={styles.avatarText}>{controller.userInitials}</Text>
            ) : (
              <MaterialCommunityIcons name="account" size={26} color={brand.navy} />
            )}
          </View>
        </Pressable>

        <View style={styles.brandRow} accessibilityRole="header" accessibilityLabel={AppInfo.name}>
          <Image
            source={require('@/assets/images/encontrame-mark.png')}
            style={styles.mark}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>{AppInfo.name}</Text>
        </View>

        <Pressable
          onPress={controller.goToAllPeople}
          hitSlop={6}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t('Buscar pessoas')}
        >
          <MaterialCommunityIcons name="magnify" size={26} color={chrome.ink} />
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors, ink: string, glass: string) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: PageGutter - 8,
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
      color: ink,
    },
    avatarButton: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.cream,
      borderWidth: 2,
      borderColor: brand.orange,
    },
    avatarText: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.navy,
    },
  });
}

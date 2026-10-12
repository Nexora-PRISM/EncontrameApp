import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsSegmented } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import { brandTiming } from '@/constants/motion';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { APPEARANCE_OPTIONS, useBrand } from '@/lib/brand-theme';
import { env } from '@/lib/env';
import { LANGUAGE_SHORT_OPTIONS, useT } from '@/lib/i18n';
import { useTimedColor } from '@/lib/use-brand-transition';
import { useWideLayout } from '@/lib/use-wide-layout';

const DRAWER_MAX_WIDTH = 320;
const DRAWER_SCREEN_RATIO = 0.86;

/** No menu o espaço é curto: rótulos curtos, com o nome completo para o leitor de tela. */
const MENU_THEME_OPTIONS = APPEARANCE_OPTIONS.map((option) =>
  option.value === 'system' ? { ...option, label: 'Auto', accessibilityLabel: option.label } : option,
);

interface InicioMenuDrawerSectionProps {
  controller: InicioController;
}

type MenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  danger?: boolean;
};

function MenuItemRow({
  item,
  brand,
  styles,
}: {
  item: MenuItem;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const [highlighted, setHighlighted] = useState(false);
  const bgStyle = useTimedColor(highlighted, 'transparent', brand.divider, 'backgroundColor');

  return (
    <Pressable
      onPress={item.onPress}
      onPressIn={() => setHighlighted(true)}
      onPressOut={() => setHighlighted(false)}
      onHoverIn={() => setHighlighted(true)}
      onHoverOut={() => setHighlighted(false)}
      android_ripple={{ color: brand.divider }}
    >
      <Animated.View style={[styles.menuItem, bgStyle]}>
        <MaterialCommunityIcons
          name={item.icon}
          size={22}
          color={item.danger ? brand.orangeDark : brand.blue}
        />
        <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/** Menu lateral da home. Fica sempre montado: no celular abre pelo rodapé, com a barra escondida. */
export function InicioMenuDrawerSection({ controller }: InicioMenuDrawerSectionProps) {
  const t = useT();
  const brand = useBrand();
  const insets = useSafeAreaInsets();
  const { isWide, width } = useWideLayout();
  const drawerWidth = Math.min(DRAWER_MAX_WIDTH, Math.round(width * DRAWER_SCREEN_RATIO));
  const styles = useMemo(() => makeStyles(brand, drawerWidth), [brand, drawerWidth]);
  const drawerProgress = useSharedValue(0);

  useEffect(() => {
    if (!controller.menuOpen) {
      drawerProgress.value = 0;
      return;
    }

    drawerProgress.value = 0;
    const frame = requestAnimationFrame(() => {
      drawerProgress.value = brandTiming(1);
    });
    return () => cancelAnimationFrame(frame);
  }, [controller.menuOpen, drawerProgress]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(drawerProgress.value, [0, 1], [-drawerWidth, 0]) }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: drawerProgress.value,
  }));

  const menuItems: MenuItem[] = [
    ...(isWide
      ? [
          {
            key: 'home',
            label: t('Início'),
            icon: 'home-outline' as const,
            onPress: controller.goToHomeFromMenu,
          },
        ]
      : []),
    {
      key: 'chat',
      label: t('Chat com a Sofia (IA)'),
      icon: 'robot-happy-outline',
      onPress: controller.goToChat,
    },
    {
      key: 'grupo-chat',
      label: t('Grupo de apoio'),
      icon: 'account-group-outline',
      onPress: controller.goToGroupChat,
    },
    {
      key: 'register',
      label: t('Cadastrar uma pessoa'),
      icon: 'account-plus-outline',
      onPress: controller.goToRegisterFromMenu,
    },
    {
      key: 'all-people',
      label: t('Pessoas desaparecidas'),
      icon: 'account-search-outline',
      onPress: controller.goToAllPeopleFromMenu,
    },
    ...(env.petsEnabled
      ? [
          {
            key: 'pets',
            label: t('Pets desaparecidos'),
            icon: 'paw' as const,
            onPress: controller.goToPetsFromMenu,
          },
        ]
      : []),
    {
      key: 'premium',
      label: t('Premium'),
      icon: 'star-four-points-outline',
      onPress: controller.goToPremiumFromMenu,
    },
    ...(controller.loggedIn
      ? [
          {
            key: 'profile',
            label: t('Meu perfil'),
            icon: 'account-circle-outline' as const,
            onPress: controller.goToProfile,
          },
        ]
      : []),
    {
      key: 'settings',
      label: t('Configurações'),
      icon: 'cog-outline',
      onPress: controller.goToSettings,
    },
    {
      key: 'help',
      label: t('Ajuda e suporte'),
      icon: 'help-circle-outline',
      onPress: controller.goToHelp,
    },
    controller.loggedIn
      ? {
          key: 'logout',
          label: t('Sair'),
          icon: 'logout' as const,
          onPress: controller.logout,
          danger: true,
        }
      : {
          key: 'login',
          label: t('Entrar'),
          icon: 'login' as const,
          onPress: controller.goToLogin,
        },
  ];

  const accountItem = menuItems[menuItems.length - 1];
  const navItems = menuItems.slice(0, -1);

  return (
    <Modal
      visible={controller.menuOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={controller.closeMenu}
    >
      <View style={styles.drawerRoot} pointerEvents="box-none">
        <Pressable
          style={styles.drawerScrimHit}
          onPress={controller.closeMenu}
          accessibilityRole="button"
          accessibilityLabel={t('Fechar menu')}
        >
          <Animated.View style={[styles.drawerScrim, scrimStyle]} />
        </Pressable>
        <Animated.View style={[styles.drawer, drawerStyle]} pointerEvents="auto">
          <View style={[styles.drawerHeader, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.menuTitle}>{t('Menu')}</Text>
            <Pressable
              onPress={controller.closeMenu}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('Fechar menu')}
            >
              <MaterialCommunityIcons name="close" size={24} color={brand.label} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.drawerScroll}
            contentContainerStyle={styles.drawerScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.drawerNav}>
              {navItems.map((item) => (
                <MenuItemRow key={item.key} item={item} brand={brand} styles={styles} />
              ))}
            </View>
            <View style={styles.themeBlock}>
              <Text style={styles.themeTitle}>{t('Tema do app')}</Text>
              <SettingsSegmented
                label={t('Tema do app')}
                options={MENU_THEME_OPTIONS}
                value={controller.appearance}
                onChange={controller.setAppearance}
              />
            </View>
            <View style={styles.themeBlock}>
              <View style={styles.themeTitleRow}>
                <MaterialCommunityIcons name="translate" size={16} color={brand.label} />
                <Text style={styles.themeTitle}>{t('Idioma')}</Text>
              </View>
              <SettingsSegmented
                label={t('Idioma')}
                options={LANGUAGE_SHORT_OPTIONS}
                value={controller.languagePreference}
                onChange={controller.setLanguagePreference}
              />
            </View>
          </ScrollView>
          {accountItem ? (
            <View style={[styles.drawerFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <MenuItemRow item={accountItem} brand={brand} styles={styles} />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

function makeStyles(brand: BrandColors, drawerWidth: number) {
  return StyleSheet.create({
    drawerRoot: {
      flex: 1,
    },
    drawerScrimHit: {
      ...StyleSheet.absoluteFill,
    },
    drawerScrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: brand.overlay,
    },
    drawer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 2,
      width: drawerWidth,
      backgroundColor: brand.surface,
      paddingHorizontal: 8,
      elevation: 16,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 8, height: 0 },
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    drawerScroll: {
      flex: 1,
    },
    drawerScrollContent: {
      flexGrow: 1,
    },
    drawerNav: {
      flexGrow: 1,
      gap: 2,
    },
    themeTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    themeBlock: {
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: brand.divider,
    },
    themeTitle: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.label,
    },
    drawerFooter: {
      borderTopWidth: 1,
      borderTopColor: brand.divider,
      paddingTop: 8,
      paddingHorizontal: 0,
    },
    menuTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: Radius.md,
    },
    menuLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: brand.textDark,
    },
    menuLabelDanger: {
      color: brand.orangeText,
    },
  });
}

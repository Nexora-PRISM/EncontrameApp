import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type ReactNode, useMemo, useState } from 'react';
import { Image, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { HomeShellController } from '@/features/inicio/home-shell.controller';
import { type HomeChrome, useHomeChrome } from '@/features/inicio/home-chrome';
import { AppInfo } from '@/lib/app-info';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';
import { useTimedOpacity } from '@/lib/use-brand-transition';
import { useWideLayout } from '@/lib/use-wide-layout';

interface InicioTopBarSectionProps {
  controller: HomeShellController;
  /** No celular o menu fica no rodapé. No layout largo o botão continua nesta barra. */
  showMenu?: boolean;
  /** Avatar, marca e nome sobre a faixa colorida do desktop. */
  showBrand?: boolean;
  /** Ícones e texto na cor da faixa do tema (fundo já vem do header). */
  onChrome?: boolean;
  /** Dentro de uma área que já tem a margem da página (lista da home recolhida). */
  embedded?: boolean;
  /** Quando definido, o campo filtra a lista em vez da busca do mapa. */
  browseQuery?: string;
  onBrowseQueryChange?: (value: string) => void;
  /** Na faixa do desktop: depois da busca, encostado à direita (filtros rápidos). */
  children?: ReactNode;
  /** Na faixa do desktop: no fim da linha (o "Pedir ajuda" da web). */
  trailing?: ReactNode;
}

export function InicioTopBarSection({
  controller,
  showMenu = true,
  showBrand = false,
  onChrome = false,
  embedded = false,
  browseQuery,
  onBrowseQueryChange,
  children,
  trailing,
}: InicioTopBarSectionProps) {
  const t = useT();
  const brand = useBrand();
  const chrome = useHomeChrome();
  const { isWide } = useWideLayout();
  const styles = useMemo(
    () => makeStyles(brand, isWide, embedded, onChrome, chrome),
    [brand, chrome, embedded, isWide, onChrome],
  );
  const ink = onChrome ? chrome.ink : brand.label;
  const browsing = onBrowseQueryChange != null;
  const { handleSearch, clearSearch } = controller;
  const searchValue = browsing ? (browseQuery ?? '') : controller.search;
  const [menuHighlighted, setMenuHighlighted] = useState(false);
  const [searchHighlighted, setSearchHighlighted] = useState(false);
  const menuOpacity = useTimedOpacity(menuHighlighted ? 0.85 : 1);
  const searchPressOpacity = useTimedOpacity(searchHighlighted ? 0.85 : 1);

  const handleOpenMenu = () => {
    controller.openMenu();
  };

  const submitSearch = () => {
    Keyboard.dismiss();
    if (browsing) {
      onBrowseQueryChange?.(searchValue.trim());
      return;
    }
    handleSearch();
  };

  const handleClear = () => {
    if (browsing) {
      onBrowseQueryChange?.('');
      return;
    }
    clearSearch();
  };

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.panel}>
        <View style={styles.brand}>
          {showMenu ? (
            <Pressable
              hitSlop={8}
              onPress={handleOpenMenu}
              onPressIn={() => setMenuHighlighted(true)}
              onPressOut={() => setMenuHighlighted(false)}
              onHoverIn={() => setMenuHighlighted(true)}
              onHoverOut={() => setMenuHighlighted(false)}
              accessibilityRole="button"
              accessibilityLabel={t('Menu')}
            >
              <Animated.View style={[styles.menuButton, menuOpacity]}>
                <MaterialCommunityIcons name="menu" size={26} color={ink} />
              </Animated.View>
            </Pressable>
          ) : null}

          {showBrand ? (
            <Pressable
              onPress={controller.goToProfileOrLogin}
              hitSlop={6}
              style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={controller.loggedIn ? t('Meu perfil') : t('Entrar')}
            >
              <View style={styles.avatar}>
                {controller.loggedIn ? (
                  <Text style={styles.avatarText}>{controller.userInitials}</Text>
                ) : (
                  <MaterialCommunityIcons name="account" size={22} color={brand.navy} />
                )}
              </View>
            </Pressable>
          ) : null}

          {showBrand ? (
            <Pressable
              onPress={controller.goToHome}
              hitSlop={6}
              style={({ pressed }) => [styles.logo, pressed && styles.pressed]}
              accessibilityRole="link"
              accessibilityLabel={t('{name}: voltar ao início', { name: AppInfo.name })}
            >
              <Image
                source={require('@/assets/images/encontrame-mark.png')}
                style={styles.mark}
                resizeMode="contain"
              />
              <Text style={styles.brandName} numberOfLines={1}>
                {AppInfo.name}
              </Text>
            </Pressable>
          ) : null}

          <View style={styles.searchCluster}>
            <View style={styles.searchField}>
              {onChrome ? (
                <Pressable
                  onPress={submitSearch}
                  onPressIn={() => setSearchHighlighted(true)}
                  onPressOut={() => setSearchHighlighted(false)}
                  onHoverIn={() => setSearchHighlighted(true)}
                  onHoverOut={() => setSearchHighlighted(false)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('Buscar')}
                >
                  <Animated.View style={searchPressOpacity}>
                    <MaterialCommunityIcons name="magnify" size={22} color={chrome.ink} />
                  </Animated.View>
                </Pressable>
              ) : null}
              <TextInput
                style={styles.searchInput}
                value={searchValue}
                onChangeText={browsing ? onBrowseQueryChange : controller.setSearch}
                placeholder={t('Nome, bairro ou cidade')}
                placeholderTextColor={onChrome ? chrome.muted : brand.placeholder}
                returnKeyType="search"
                onSubmitEditing={submitSearch}
                accessibilityLabel={t('Buscar pessoas')}
              />
              {searchValue.length > 0 ? (
                <Pressable
                  onPress={handleClear}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('Limpar busca')}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={onChrome ? chrome.muted : brand.placeholder}
                  />
                </Pressable>
              ) : null}
            </View>

            {onChrome ? null : (
              <Pressable
                onPress={submitSearch}
                onPressIn={() => setSearchHighlighted(true)}
                onPressOut={() => setSearchHighlighted(false)}
                onHoverIn={() => setSearchHighlighted(true)}
                onHoverOut={() => setSearchHighlighted(false)}
                accessibilityRole="button"
                accessibilityLabel={t('Buscar')}
              >
                <Animated.View style={[styles.searchButton, searchPressOpacity]}>
                  <MaterialCommunityIcons name="magnify" size={20} color={brand.orange} />
                </Animated.View>
              </Pressable>
            )}
          </View>

          {children}

          {trailing}
        </View>

        {controller.locationDenied ? (
          <Text style={[styles.locationHint, onChrome && { color: chrome.muted }]}>
            {t('Ative a localização para ver pessoas próximas.')}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(
  brand: BrandColors,
  isWide: boolean,
  embedded: boolean,
  onChrome: boolean,
  chrome: HomeChrome,
) {
  const { ink } = chrome;
  return StyleSheet.create({
    wrap: {
      flex: onChrome ? 1 : undefined,
      flexShrink: onChrome ? 1 : 0,
      minWidth: onChrome ? 0 : undefined,
      paddingHorizontal: onChrome ? 0 : isWide ? 4 : embedded ? 0 : PageGutter,
      paddingTop: onChrome ? 0 : isWide ? 4 : 8,
    },
    panel: {
      gap: 8,
      paddingVertical: onChrome ? 0 : isWide ? 6 : 10,
      paddingHorizontal: onChrome ? 0 : 12,
      borderRadius: Radius.lg,
      backgroundColor: isWide ? 'transparent' : brand.surface,
      shadowColor: brand.navyDeep,
      shadowOpacity: isWide ? 0 : 0.28,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: isWide ? 0 : 10,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: onChrome ? 14 : 8,
    },
    menuButton: {
      padding: 4,
    },
    searchCluster: {
      flexGrow: onChrome ? 0 : 1,
      // Na faixa do desktop a busca encolhe antes dos filtros quando a janela aperta.
      flexShrink: onChrome ? 3 : 1,
      width: onChrome ? 380 : undefined,
      minWidth: onChrome ? 200 : 0,
      marginLeft: onChrome ? 10 : undefined,
      flexDirection: 'row',
      alignItems: 'center',
      gap: onChrome ? 10 : 8,
    },
    searchField: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: onChrome ? 10 : 8,
      height: onChrome ? 44 : isWide ? 40 : 46,
      paddingHorizontal: 16,
      borderRadius: Radius.pill,
      // Na faixa colorida: o mesmo tom da faixa, só um pouco mais claro (contraste suave).
      backgroundColor: onChrome ? chrome.glass : brand.fieldBackground,
      borderWidth: 1,
      borderColor: onChrome ? hexToRgba(ink, 0.18) : brand.fieldBorder,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 0,
      fontSize: onChrome ? 15 : isWide ? 14 : 15,
      color: onChrome ? ink : brand.textDark,
    },
    searchButton: {
      width: onChrome ? 40 : isWide ? 40 : 46,
      height: onChrome ? 40 : isWide ? 40 : 46,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: onChrome ? brand.onPrimary : hexToRgba(brand.orange, 0.22),
      borderWidth: onChrome ? 1.5 : 0,
      borderColor: onChrome ? brand.softBorder : 'transparent',
    },
    pressed: {
      opacity: 0.75,
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: onChrome ? 0 : 1,
      gap: 8,
      minWidth: 0,
    },
    mark: {
      width: 32,
      height: 32,
    },
    brandName: {
      flexShrink: 1,
      fontSize: 18,
      fontWeight: '800',
      color: ink,
    },
    avatarButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.cream,
      borderWidth: 2,
      borderColor: brand.orange,
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '800',
      color: brand.navy,
    },
    locationHint: {
      color: brand.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
  });
}

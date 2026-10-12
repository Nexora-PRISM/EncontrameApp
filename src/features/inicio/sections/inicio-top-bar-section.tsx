import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';
import { useTimedOpacity } from '@/lib/use-brand-transition';
import { useWideLayout } from '@/lib/use-wide-layout';

interface InicioTopBarSectionProps {
  controller: InicioController;
  /** No celular o menu fica no rodapé. No layout largo o botão continua nesta barra. */
  showMenu?: boolean;
  /** Dentro de uma área que já tem a margem da página (lista da home recolhida). */
  embedded?: boolean;
  /** Quando definido, o campo filtra a lista em vez da busca do mapa. */
  browseQuery?: string;
  onBrowseQueryChange?: (value: string) => void;
}

export function InicioTopBarSection({
  controller,
  showMenu = true,
  embedded = false,
  browseQuery,
  onBrowseQueryChange,
}: InicioTopBarSectionProps) {
  const t = useT();
  const brand = useBrand();
  const { isWide } = useWideLayout();
  const styles = useMemo(
    () => makeStyles(brand, isWide, embedded),
    [brand, embedded, isWide],
  );
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
                <MaterialCommunityIcons name="menu" size={26} color={brand.label} />
              </Animated.View>
            </Pressable>
          ) : null}

          <View style={styles.searchField}>
            <TextInput
              style={styles.searchInput}
              value={searchValue}
              onChangeText={browsing ? onBrowseQueryChange : controller.setSearch}
              placeholder={t('Nome, bairro ou cidade')}
              placeholderTextColor={brand.placeholder}
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
                <MaterialCommunityIcons name="close-circle" size={20} color={brand.placeholder} />
              </Pressable>
            ) : null}
          </View>

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
              <MaterialCommunityIcons name="magnify" size={22} color={brand.orange} />
            </Animated.View>
          </Pressable>
        </View>

        {controller.locationDenied ? (
          <Text style={styles.locationHint}>{t('Ative a localização para ver pessoas próximas.')}</Text>
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors, isWide: boolean, embedded: boolean) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: isWide ? 4 : embedded ? 0 : PageGutter,
      paddingTop: isWide ? 4 : 8,
    },
    panel: {
      gap: 8,
      paddingVertical: isWide ? 6 : 10,
      paddingHorizontal: 12,
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
      gap: 8,
    },
    menuButton: {
      padding: 4,
    },
    searchField: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: isWide ? 38 : 46,
      paddingHorizontal: 16,
      borderRadius: Radius.pill,
      backgroundColor: brand.fieldBackground,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 0,
      fontSize: isWide ? 14 : 15,
      color: brand.textDark,
    },
    searchButton: {
      width: isWide ? 38 : 46,
      height: isWide ? 38 : 46,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(brand.orange, 0.22),
    },
    locationHint: {
      color: brand.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
  });
}

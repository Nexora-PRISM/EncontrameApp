import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import type { HomeShellController } from '@/features/inicio/home-shell.controller';
import { useHomeChrome } from '@/features/inicio/home-chrome';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { CATEGORY_FILTERS } from '@/lib/person-category';

/** Filtros rápidos por faixa de idade. No celular ficam sobre o mapa; no desktop, no header. */
export function InicioCategoryFilters({
  controller,
  style,
  tone = 'map',
}: {
  controller: HomeShellController;
  style?: StyleProp<ViewStyle>;
  /** `chrome`: transparentes sobre a faixa colorida. `map`: o estilo do celular. */
  tone?: 'map' | 'chrome';
}) {
  const t = useT();
  const brand = useBrand();
  const chrome = useHomeChrome();
  const onChrome = tone === 'chrome';
  const styles = useMemo(
    () => makeStyles(brand, onChrome, chrome.background),
    [brand, chrome.background, onChrome],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroller, style]}
      contentContainerStyle={styles.track}
      accessibilityLabel={t('Filtrar por faixa de idade')}
    >
      {CATEGORY_FILTERS.map((filter) => {
        const selected = controller.categoryFilter === filter.value;
        return (
          <Pressable
            key={filter.value}
            onPress={() => controller.setCategoryFilter(filter.value)}
            hitSlop={4}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t(filter.accessibilityLabel)}
            accessibilityState={{ selected }}
          >
            <MaterialCommunityIcons
              name={filter.icon}
              size={15}
              color={
                onChrome
                  ? selected
                    ? chrome.background
                    : brand.onPrimary
                  : selected
                    ? brand.onPrimary
                    : brand.orange
              }
            />
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {t(filter.label)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function makeStyles(brand: BrandColors, onChrome: boolean, chromeBackground: string) {
  const ink = brand.onPrimary;
  return StyleSheet.create({
    scroller: {
      flexGrow: 0,
      flexShrink: 1,
      minWidth: 0,
      height: onChrome ? 40 : 50,
    },
    track: {
      alignItems: 'center',
      gap: onChrome ? 10 : 6,
      paddingHorizontal: onChrome ? 0 : 12,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      height: onChrome ? 40 : 42,
      paddingHorizontal: onChrome ? 12 : 10,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: onChrome ? brand.softBorder : brand.orange,
      backgroundColor: onChrome ? 'transparent' : brand.surface,
    },
    chipSelected: {
      backgroundColor: onChrome ? ink : brand.orange,
      borderColor: onChrome ? brand.softBorder : brand.orange,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '800',
      color: onChrome ? ink : brand.orange,
    },
    chipTextSelected: {
      color: onChrome ? chromeBackground : brand.onPrimary,
    },
    pressed: {
      opacity: 0.8,
    },
  });
}

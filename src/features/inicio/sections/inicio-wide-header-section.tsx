import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { InicioController } from '@/features/inicio/inicio.controller';
import { useHomeChrome } from '@/features/inicio/home-chrome';
import { InicioCategoryFilters } from '@/features/inicio/sections/inicio-category-filters';
import { InicioTopBarSection } from '@/features/inicio/sections/inicio-top-bar-section';

/**
 * Faixa na cor do tema, acima do mapa no desktop: busca e filtros rápidos por idade.
 */
export function InicioWideHeaderSection({ controller }: { controller: InicioController }) {
  const chrome = useHomeChrome();
  const styles = useMemo(() => makeStyles(), []);

  return (
    <View style={[styles.band, { backgroundColor: chrome.background }]}>
      <SafeAreaView edges={['top']}>
        <View style={styles.row}>
          <InicioTopBarSection controller={controller} onChrome showBrand />
          <InicioCategoryFilters controller={controller} tone="chrome" style={styles.filters} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function makeStyles() {
  return StyleSheet.create({
    band: {
      zIndex: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 12,
      paddingRight: 16,
      paddingVertical: 10,
      gap: 16,
    },
    filters: {
      flexShrink: 1,
    },
  });
}

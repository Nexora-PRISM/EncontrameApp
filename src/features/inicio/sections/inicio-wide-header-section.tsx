import { useMemo } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmergencyHelpButton } from '@/components/emergency-help-button';
import type { HomeShellController } from '@/features/inicio/home-shell.controller';
import { useHomeChrome } from '@/features/inicio/home-chrome';
import { InicioCategoryFilters } from '@/features/inicio/sections/inicio-category-filters';
import { InicioTopBarSection } from '@/features/inicio/sections/inicio-top-bar-section';

/**
 * Faixa na cor do tema, acima do mapa no desktop: marca e filtros rápidos por idade à
 * esquerda, busca à direita.
 */
export function InicioWideHeaderSection({
  controller,
  onLayout,
  showHelp = false,
}: {
  controller: HomeShellController;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Header fixo da web: o "Pedir ajuda" fica aqui, à direita da busca. */
  showHelp?: boolean;
}) {
  const chrome = useHomeChrome();
  const styles = useMemo(() => makeStyles(), []);

  return (
    <View style={[styles.band, { backgroundColor: chrome.background }]} onLayout={onLayout}>
      <SafeAreaView edges={['top']}>
        <View style={styles.row}>
          <InicioTopBarSection
            controller={controller}
            onChrome
            showBrand
            trailing={showHelp ? <EmergencyHelpButton /> : null}
          >
            <InicioCategoryFilters controller={controller} tone="chrome" style={styles.filters} />
          </InicioTopBarSection>
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
    },
    filters: {
      flexShrink: 1,
      marginLeft: 10,
      marginRight: 24,
    },
  });
}

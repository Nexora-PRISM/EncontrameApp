import { type ReactNode, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { type BrandColors, type ColorSchemeName } from '@/constants/brand';
import { InicioSidebarWidth } from '@/constants/theme';
import { useHomeShellController } from '@/features/inicio/home-shell.controller';
import { InicioMenuDrawerSection } from '@/features/inicio/sections/inicio-menu-drawer-section';
import { InicioPeopleSidebarSection } from '@/features/inicio/sections/inicio-people-sidebar-section';
import { InicioWideHeaderSection } from '@/features/inicio/sections/inicio-wide-header-section';
import { useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { useWebShell } from '@/lib/use-web-shell';

/** Altura da faixa antes da primeira medição (uma linha de controles de 40 px). */
const HEADER_ESTIMATE = 60;

/**
 * Na web em tela larga, o header do Início e a lista de pessoas próximas ficam fixos e as
 * páginas abrem na área ao lado. A árvore é a mesma com ou sem eles, para a pilha de telas
 * não ser recriada quando a janela passa do limite de largura.
 */
export function WebShellFrame({ children }: { children: ReactNode }) {
  const enabled = useWebShell();
  const [headerHeight, setHeaderHeight] = useState(HEADER_ESTIMATE);

  return (
    <View style={frameStyles.fill}>
      <View
        style={[
          frameStyles.fill,
          enabled && { paddingTop: headerHeight, paddingLeft: InicioSidebarWidth },
        ]}
      >
        <View style={frameStyles.fill}>{children}</View>
      </View>
      {enabled ? (
        <WebShellChrome headerHeight={headerHeight} onHeaderHeight={setHeaderHeight} />
      ) : null}
    </View>
  );
}

function WebShellChrome({
  headerHeight,
  onHeaderHeight,
}: {
  headerHeight: number;
  onHeaderHeight: (height: number) => void;
}) {
  const brand = useBrand();
  const colorScheme = useBrandColorScheme();
  const styles = useMemo(() => makeStyles(brand, colorScheme), [brand, colorScheme]);
  const controller = useHomeShellController();

  return (
    <>
      <View style={styles.header}>
        <InicioWideHeaderSection
          controller={controller}
          onLayout={(event) => onHeaderHeight(Math.round(event.nativeEvent.layout.height))}
        />
      </View>
      <View style={[styles.sidebar, { top: headerHeight }]}>
        <InicioPeopleSidebarSection controller={controller} />
      </View>
      <InicioMenuDrawerSection controller={controller} />
    </>
  );
}

const frameStyles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

function makeStyles(brand: BrandColors, colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 4,
    },
    sidebar: {
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: InicioSidebarWidth,
      backgroundColor: colorScheme === 'dark' ? brand.white : brand.surface,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: brand.divider,
      zIndex: 3,
      shadowColor: brand.scrim,
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 8, height: 0 },
      elevation: 8,
    },
  });
}

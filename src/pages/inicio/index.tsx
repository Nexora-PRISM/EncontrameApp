import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { type BrandMapHandle } from '@/components/brand-map';
import { MapMyLocationFab } from '@/components/map-my-location-fab';
import { SofiaFab } from '@/components/sofia-fab';
import { type BrandColors, type ColorSchemeName } from '@/constants/brand';
import { InicioSidebarWidth, WideDockHeight, wideDockBottom, wideFabBottom } from '@/constants/theme';
import { useAlertsSheetGesture } from '@/features/inicio/alerts-sheet';
import { useHomeChrome } from '@/features/inicio/home-chrome';
import { useInicioController, type InicioController } from '@/features/inicio/inicio.controller';
import { InicioAlertsSection } from '@/features/inicio/sections/inicio-alerts-section';
import { InicioHeaderSection } from '@/features/inicio/sections/inicio-header-section';
import { InicioMapPreviewSection } from '@/features/inicio/sections/inicio-map-preview-section';
import { InicioMapSection, MAP_CARD_OVERLAP } from '@/features/inicio/sections/inicio-map-section';
import { InicioMenuDrawerSection } from '@/features/inicio/sections/inicio-menu-drawer-section';
import { InicioOnboardingSection } from '@/features/inicio/sections/inicio-onboarding-section';
import { InicioPeopleSidebarSection } from '@/features/inicio/sections/inicio-people-sidebar-section';
import { InicioWideDockSection } from '@/features/inicio/sections/inicio-wide-dock-section';
import { InicioWideHeaderSection } from '@/features/inicio/sections/inicio-wide-header-section';
import { useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { useBottomSafeInset } from '@/lib/use-bottom-safe-inset';
import { useWebShell } from '@/lib/use-web-shell';
import { useWideLayout } from '@/lib/use-wide-layout';

export default function InicioPage() {
  const { isWide } = useWideLayout();
  const controller = useInicioController();

  if (isWide) {
    return <WideInicio controller={controller} />;
  }

  return <PhoneInicio controller={controller} />;
}

function WideInicio({ controller }: { controller: InicioController }) {
  const brand = useBrand();
  const colorScheme = useBrandColorScheme();
  const chrome = useHomeChrome();
  // Na web o header, a lista lateral e o menu ficam fixos no layout raiz (WebShellFrame).
  const inWebShell = useWebShell();
  const styles = useMemo(() => makeWideStyles(brand, colorScheme), [brand, colorScheme]);
  const mapRef = useRef<BrandMapHandle>(null);
  const bottomInset = useBottomSafeInset();
  const fabBottom = wideFabBottom(bottomInset);
  const previewBottom = wideDockBottom(bottomInset) + WideDockHeight + 12;
  const [focused, setFocused] = useState(true);
  const mapPadding = useMemo(
    () => ({
      top: 16,
      right: 16,
      bottom: bottomInset + 96,
      left: 16,
    }),
    [bottomInset],
  );

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const overLightSheet = controller.onboardingVisible || controller.menuOpen;
  const statusStyle = overLightSheet && colorScheme !== 'dark' ? 'dark' : chrome.status;

  return (
    <View style={styles.container}>
      {focused ? <StatusBar style={statusStyle} /> : null}
      {inWebShell ? null : <InicioWideHeaderSection controller={controller} />}
      <View style={styles.body}>
        {inWebShell ? null : (
          <View style={styles.sidebar}>
            <InicioPeopleSidebarSection controller={controller} />
          </View>
        )}
        <View style={styles.mapColumn}>
          <InicioMapSection ref={mapRef} controller={controller} mapPadding={mapPadding} />
          {/* Cartão do pin tocado, sobre o mapa (no celular ele fica dentro do mapa). */}
          <View style={[styles.previewDock, { bottom: previewBottom }]} pointerEvents="box-none">
            <InicioMapPreviewSection controller={controller} />
          </View>
          <InicioWideDockSection controller={controller} />
        </View>
      </View>
      <BottomBar active="home" hideWide />
      {controller.hasSelection ? null : <SofiaFab onPress={controller.goToChat} />}
      {controller.hasSelection ? null : (
        <MapMyLocationFab
          onPress={() => mapRef.current?.recenterOnUser()}
          disabled={!controller.userLocation}
          style={{ bottom: fabBottom, right: 24, zIndex: 30, elevation: 12 }}
        />
      )}
      {inWebShell ? null : <InicioMenuDrawerSection controller={controller} />}
      <InicioOnboardingSection controller={controller} />
    </View>
  );
}

/**
 * Início no celular, de cima para baixo: faixa na cor do tema (avatar, logo e busca),
 * fotos dos alertas e mapa. Arrastar a borda do mapa para baixo abre a lista.
 * Barra inferior: Menu · Pedir ajuda · Cadastrar.
 */
function PhoneInicio({ controller }: { controller: InicioController }) {
  const brand = useBrand();
  const colorScheme = useBrandColorScheme();
  const chrome = useHomeChrome();
  const sheet = useAlertsSheetGesture();
  const styles = useMemo(() => makePhoneStyles(brand), [brand]);
  const [focused, setFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const overLightSheet = controller.onboardingVisible || controller.menuOpen;
  const statusStyle = overLightSheet && colorScheme !== 'dark' ? 'dark' : chrome.status;

  return (
    <View style={styles.container}>
      {focused ? <StatusBar style={statusStyle} /> : null}
      <View style={[styles.hero, { backgroundColor: chrome.background }]}>
        <SafeAreaView edges={['top']}>
          <InicioHeaderSection controller={controller} />
          <InicioAlertsSection
            controller={controller}
            expanded={sheet.expanded}
            collapsedHeight={sheet.collapsedHeight}
            openedHeight={sheet.openedHeight}
            view={sheet.view}
            onViewChange={sheet.setView}
          />
        </SafeAreaView>
      </View>
      <InicioMapSection
        variant="card"
        controller={controller}
        sheetGesture={sheet.gesture}
        sheetExpanded={sheet.expandedOn}
      />
      <BottomBar active="home" onMenuPress={controller.openMenu} />
      {/* O cartão do pin tocado ocupa o rodapé do mapa: a Sofia volta quando ele fecha. */}
      {controller.hasSelection ? null : <SofiaFab onPress={controller.goToChat} />}
      <InicioMenuDrawerSection controller={controller} />
      <InicioOnboardingSection controller={controller} />
    </View>
  );
}

function makeWideStyles(brand: BrandColors, colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: brand.mapBackground,
    },
    body: {
      flex: 1,
      flexDirection: 'row',
      minHeight: 0,
    },
    sidebar: {
      width: InicioSidebarWidth,
      backgroundColor: colorScheme === 'dark' ? brand.white : brand.surface,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: brand.divider,
      zIndex: 2,
      shadowColor: brand.scrim,
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 8, height: 0 },
      elevation: 8,
    },
    mapColumn: {
      flex: 1,
      minWidth: 0,
    },
    previewDock: {
      position: 'absolute',
      left: 16,
      width: 420,
      maxWidth: '94%',
      height: 0,
      zIndex: 6,
    },
  });
}

function makePhoneStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: brand.mapBackground,
    },
    hero: {
      paddingBottom: MAP_CARD_OVERLAP + 8,
      zIndex: 1,
    },
  });
}

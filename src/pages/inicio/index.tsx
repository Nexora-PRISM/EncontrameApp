import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { type BrandMapHandle } from '@/components/brand-map';
import { MapMyLocationFab } from '@/components/map-my-location-fab';
import { SofiaFab } from '@/components/sofia-fab';
import { Radius, type BrandColors } from '@/constants/brand';
import { InicioSidebarWidth, PageGutter } from '@/constants/theme';
import { useInicioController, type InicioController } from '@/features/inicio/inicio.controller';
import { InicioAlertsSection } from '@/features/inicio/sections/inicio-alerts-section';
import { InicioHeaderSection } from '@/features/inicio/sections/inicio-header-section';
import { InicioMapPreviewSection } from '@/features/inicio/sections/inicio-map-preview-section';
import { InicioMapSection, MAP_CARD_OVERLAP } from '@/features/inicio/sections/inicio-map-section';
import { InicioMenuDrawerSection } from '@/features/inicio/sections/inicio-menu-drawer-section';
import { InicioOnboardingSection } from '@/features/inicio/sections/inicio-onboarding-section';
import { InicioPeopleSidebarSection } from '@/features/inicio/sections/inicio-people-sidebar-section';
import { InicioTopBarSection } from '@/features/inicio/sections/inicio-top-bar-section';
import { useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { useBottomSafeInset } from '@/lib/use-bottom-safe-inset';
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
  const styles = useMemo(() => makeWideStyles(brand), [brand]);
  const mapRef = useRef<BrandMapHandle>(null);
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomSafeInset();
  const fabBottom = bottomInset + 8;
  const sidebarGap = 12;
  const mapPadding = useMemo(
    () => ({
      top: insets.top + 12,
      right: PageGutter,
      bottom: 16,
      left: sidebarGap + InicioSidebarWidth + 12,
    }),
    [insets.top],
  );

  return (
    <View style={styles.container}>
      <InicioMapSection ref={mapRef} controller={controller} mapPadding={mapPadding} />
      <View style={styles.overlay} pointerEvents="box-none">
        <SafeAreaView style={styles.overlayInner} edges={['top']} pointerEvents="box-none">
          <View style={styles.sidebar} pointerEvents="auto">
            <InicioTopBarSection controller={controller} />
            <InicioPeopleSidebarSection controller={controller} />
          </View>
          <View style={styles.overlayFill} pointerEvents="none" />
        </SafeAreaView>
      </View>
      {/* Cartão do pin tocado, ao lado da lista (no celular ele fica dentro do mapa). */}
      <View style={styles.previewDock} pointerEvents="box-none">
        <InicioMapPreviewSection controller={controller} />
      </View>
      <BottomBar active="home" />
      <SofiaFab onPress={controller.goToChat} />
      <MapMyLocationFab
        onPress={() => mapRef.current?.recenterOnUser()}
        disabled={!controller.userLocation}
        style={{ bottom: fabBottom, right: 24, zIndex: 30, elevation: 12 }}
      />
      <InicioMenuDrawerSection controller={controller} />
      <InicioOnboardingSection controller={controller} />
    </View>
  );
}

/**
 * Início no celular, de cima para baixo: faixa marinho com logo, saudação e alertas recentes;
 * mapa grande com filtros por idade; barra inferior (Menu · Pedir ajuda · Cadastrar).
 */
function PhoneInicio({ controller }: { controller: InicioController }) {
  const brand = useBrand();
  const colorScheme = useBrandColorScheme();
  const styles = useMemo(() => makePhoneStyles(brand), [brand]);
  const [focused, setFocused] = useState(true);

  // A faixa do topo é marinho: ícones claros na barra de status enquanto o Início está na frente.
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const overLightSheet = controller.onboardingVisible || controller.menuOpen;
  const statusStyle = overLightSheet && colorScheme !== 'dark' ? 'dark' : 'light';

  return (
    <View style={styles.container}>
      {focused ? <StatusBar style={statusStyle} /> : null}
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <InicioHeaderSection controller={controller} />
          <InicioAlertsSection controller={controller} />
        </SafeAreaView>
      </View>
      <InicioMapSection variant="card" controller={controller} />
      <BottomBar active="home" onMenuPress={controller.openMenu} />
      {/* O cartão do pin tocado ocupa o rodapé do mapa: a Sofia volta quando ele fecha. */}
      {controller.hasSelection ? null : <SofiaFab onPress={controller.goToChat} />}
      <InicioMenuDrawerSection controller={controller} />
      <InicioOnboardingSection controller={controller} />
    </View>
  );
}

function makeWideStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: brand.mapBackground,
    },
    overlay: {
      flex: 1,
      zIndex: 2,
    },
    overlayInner: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: InicioSidebarWidth,
      marginTop: 8,
      marginLeft: 12,
      marginBottom: 12,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      overflow: 'hidden',
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    overlayFill: {
      flex: 1,
    },
    previewDock: {
      position: 'absolute',
      left: InicioSidebarWidth + 28,
      bottom: 96,
      width: 440,
      height: 0,
      zIndex: 35,
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
      backgroundColor: brand.navy,
      paddingBottom: MAP_CARD_OVERLAP + 14,
      zIndex: 1,
    },
  });
}

import { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { type BrandMapHandle } from '@/components/brand-map';
import { MapMyLocationFab } from '@/components/map-my-location-fab';
import { SofiaFab } from '@/components/sofia-fab';
import { Radius, type BrandColors } from '@/constants/brand';
import { InicioSidebarWidth, PageGutter, Spacing } from '@/constants/theme';
import { useInicioController, type InicioController } from '@/features/inicio/inicio.controller';
import { InicioBrowseSection } from '@/features/inicio/sections/inicio-browse-section';
import { InicioMapSection, MAP_PEEK_HEIGHT } from '@/features/inicio/sections/inicio-map-section';
import { InicioMenuDrawerSection } from '@/features/inicio/sections/inicio-menu-drawer-section';
import { InicioOnboardingSection } from '@/features/inicio/sections/inicio-onboarding-section';
import { InicioPeopleCarouselSection } from '@/features/inicio/sections/inicio-people-carousel-section';
import { InicioPeopleSidebarSection } from '@/features/inicio/sections/inicio-people-sidebar-section';
import { InicioTopBarSection } from '@/features/inicio/sections/inicio-top-bar-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
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

function PhoneInicio({ controller }: { controller: InicioController }) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makePhoneStyles(brand), [brand]);
  const [bodyHeight, setBodyHeight] = useState(0);
  const [openTopHeight, setOpenTopHeight] = useState(0);
  const expandedHeight =
    bodyHeight > 0 && openTopHeight > 0
      ? Math.max(MAP_PEEK_HEIGHT, bodyHeight - openTopHeight)
      : MAP_PEEK_HEIGHT;

  return (
    <View style={styles.container}>
      <View
        style={styles.column}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          setBodyHeight((current) => (Math.abs(current - height) < 2 ? current : height));
        }}
      >
        <View style={styles.top}>
          {controller.mapCollapsed ? (
            <InicioBrowseSection controller={controller} />
          ) : (
            <View
              style={styles.openTop}
              onLayout={(event) => {
                const height = event.nativeEvent.layout.height;
                setOpenTopHeight((current) => (Math.abs(current - height) < 2 ? current : height));
              }}
            >
              <SafeAreaView edges={['top']}>
                <InicioPeopleCarouselSection controller={controller} />
                {controller.locationDenied ? (
                  <Text style={styles.locationHint}>
                    {t('Ative a localização para ver pessoas próximas.')}
                  </Text>
                ) : null}
              </SafeAreaView>
            </View>
          )}
        </View>
        <InicioMapSection
          variant="sheet"
          controller={controller}
          collapsed={controller.mapCollapsed}
          expandedHeight={expandedHeight}
          onCollapsedChange={controller.setMapCollapsed}
        />
      </View>
      <BottomBar active="home" onMenuPress={controller.openMenu} />
      <SofiaFab onPress={controller.goToChat} />
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
  });
}

function makePhoneStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: brand.white,
    },
    column: {
      flex: 1,
      minHeight: 0,
    },
    top: {
      flex: 1,
      minHeight: 0,
    },
    openTop: {
      paddingBottom: Spacing.three,
    },
    locationHint: {
      color: brand.textMuted,
      fontSize: 13,
      fontWeight: '600',
      paddingHorizontal: PageGutter,
      paddingBottom: 10,
    },
  });
}

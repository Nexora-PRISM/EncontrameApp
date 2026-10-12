import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type RefObject } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { BrandMap, type BrandMapHandle, type MapPadding } from '@/components/brand-map';
import { MapMyLocationFab } from '@/components/map-my-location-fab';
import { Radius, type BrandColors } from '@/constants/brand';
import { Motion } from '@/constants/motion';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** Faixa que sobra do mapa quando a pessoa puxa o painel para baixo. */
export const MAP_PEEK_HEIGHT = 150;
const SHEET_RADIUS = 32;
const HANDLE_HEIGHT = 44;

interface InicioMapSectionProps {
  controller: InicioController;
  mapPadding?: MapPadding;
  /** `overlay` cobre a tela (layout largo). `sheet` é o painel do celular. */
  variant?: 'overlay' | 'sheet';
  collapsed?: boolean;
  expandedHeight?: number;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const InicioMapSection = forwardRef<BrandMapHandle, InicioMapSectionProps>(
  function InicioMapSection(
    {
      controller,
      mapPadding,
      variant = 'overlay',
      collapsed = false,
      expandedHeight = MAP_PEEK_HEIGHT,
      onCollapsedChange,
    },
    ref,
  ) {
    const mapRef = useRef<BrandMapHandle>(null);
    useImperativeHandle(ref, () => ({
      recenterOnUser: () => mapRef.current?.recenterOnUser(),
    }));

    if (variant === 'sheet') {
      return (
        <MapSheet
          mapRef={mapRef}
          controller={controller}
          collapsed={collapsed}
          expandedHeight={expandedHeight}
          onCollapsedChange={onCollapsedChange}
        />
      );
    }

    return (
      <View style={[StyleSheet.absoluteFill, styles.wrapper]}>
        <BrandMap
          ref={mapRef}
          pins={controller.pins}
          userLocation={controller.userLocation}
          mapPadding={mapPadding}
          showLocationFab={false}
          style={styles.map}
        />
      </View>
    );
  },
);

function MapSheet({
  mapRef,
  controller,
  collapsed,
  expandedHeight,
  onCollapsedChange,
}: {
  mapRef: RefObject<BrandMapHandle | null>;
  controller: InicioController;
  collapsed: boolean;
  expandedHeight: number;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const brand = useBrand();
  const styles = useMemo(() => makeSheetStyles(brand), [brand]);
  const progress = useSharedValue(collapsed ? 1 : 0);
  const expandedSv = useSharedValue(Math.max(expandedHeight, MAP_PEEK_HEIGHT));

  useEffect(() => {
    expandedSv.value = Math.max(expandedHeight, MAP_PEEK_HEIGHT);
  }, [expandedHeight, expandedSv]);

  useEffect(() => {
    progress.value = withTiming(collapsed ? 1 : 0, { duration: Motion.durationMs });
  }, [collapsed, progress]);

  const heightStyle = useAnimatedStyle(() => {
    const expanded = Math.max(expandedSv.value, MAP_PEEK_HEIGHT);
    return {
      height: expanded + (MAP_PEEK_HEIGHT - expanded) * progress.value,
    };
  });

  return (
    <Animated.View style={[styles.sheetShadow, heightStyle]}>
      <View style={styles.sheetClip}>
        <BrandMap
          ref={mapRef}
          pins={controller.pins}
          userLocation={controller.userLocation}
          showLocationFab={false}
          style={styles.map}
        />
        <SheetHandle
          progress={progress}
          expandedSv={expandedSv}
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          handleStyle={styles.handle}
          grabberStyle={styles.grabber}
        />
        <MapMyLocationFab
          onPress={() => mapRef.current?.recenterOnUser()}
          disabled={!controller.userLocation}
          style={styles.locationFab}
        />
      </View>
    </Animated.View>
  );
}

function SheetHandle({
  progress,
  expandedSv,
  collapsed,
  onCollapsedChange,
  handleStyle,
  grabberStyle,
}: {
  progress: SharedValue<number>;
  expandedSv: SharedValue<number>;
  collapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  handleStyle: StyleProp<ViewStyle>;
  grabberStyle: StyleProp<ViewStyle>;
}) {
  const t = useT();
  const dragStart = useSharedValue(0);

  const commit = (next: boolean) => {
    if (next !== collapsed) {
      onCollapsedChange?.(next);
    }
  };

  const toggle = () => {
    onCollapsedChange?.(!collapsed);
  };

  const pan = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .onBegin(() => {
      dragStart.value = progress.value;
    })
    .onUpdate((event) => {
      const range = Math.max(expandedSv.value - MAP_PEEK_HEIGHT, 1);
      const next = dragStart.value + event.translationY / range;
      // Shared value do Reanimated: o gesto escreve o progresso do painel.
      // eslint-disable-next-line react-hooks/immutability
      progress.value = Math.min(1, Math.max(0, next));
    })
    .onEnd((event) => {
      const projected = progress.value + event.velocityY / 1600;
      const next = projected > 0.45;
      // eslint-disable-next-line react-hooks/immutability
      progress.value = withTiming(next ? 1 : 0, { duration: Motion.durationMs });
      runOnJS(commit)(next);
    });

  const label = collapsed ? t('Expandir mapa') : t('Recolher mapa');

  return (
    <GestureDetector gesture={pan}>
      <Pressable
        style={handleStyle}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={grabberStyle} />
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 0,
  },
  map: {
    flex: 1,
    borderWidth: 0,
  },
});

function makeSheetStyles(brand: BrandColors) {
  return StyleSheet.create({
    sheetShadow: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexShrink: 0,
      zIndex: 2,
      backgroundColor: brand.mapBackground,
      borderTopLeftRadius: SHEET_RADIUS,
      borderTopRightRadius: SHEET_RADIUS,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.22,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -6 },
      elevation: 12,
    },
    sheetClip: {
      flex: 1,
      overflow: 'hidden',
      borderTopLeftRadius: SHEET_RADIUS,
      borderTopRightRadius: SHEET_RADIUS,
      backgroundColor: brand.mapBackground,
    },
    map: {
      flex: 1,
      borderTopLeftRadius: SHEET_RADIUS,
      borderTopRightRadius: SHEET_RADIUS,
    },
    handle: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: HANDLE_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 4,
      elevation: 8,
    },
    grabber: {
      width: 42,
      height: 5,
      borderRadius: Radius.pill,
      backgroundColor: brand.onPrimary,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.4,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 3,
    },
    locationFab: {
      bottom: 12,
      right: 12,
      zIndex: 3,
      elevation: 6,
    },
  });
}

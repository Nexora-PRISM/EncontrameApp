import { MaterialCommunityIcons } from '@expo/vector-icons';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import MapView, { Callout, Circle, Marker, Polyline, type Region } from 'react-native-maps';

import { MapMyLocationFab } from '@/components/map-my-location-fab';
import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { brandMapStyle, hexToRgba } from '@/lib/map-style';
import { type UserLocation, userAccuracyRadius } from '@/lib/use-user-location';

export type MapPinTooltip = {
  title: string;
  subtitle: string;
};

export type MapPin = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  locked?: boolean;
  photoUri?: string;
  draggable?: boolean;
  opacity?: number;
  emphasized?: boolean;
  zIndex?: number;
  tooltip?: MapPinTooltip;
  /** Cor da borda do avatar (cor do status). Sem ela, a borda fica clara. */
  accentColor?: string;
  /** Pulso suave na borda — pessoa com status de busca ativa. */
  pulse?: boolean;
  /** `note`: aviso de segurança da comunidade (marcador âmbar com ícone, sem foto). */
  variant?: 'person' | 'note';
  /** Ícone do marcador `note` (no web o marcador usa sempre o "!"). */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
};

export type MapPolyline = {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
  dashed?: boolean;
};

export type MapPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type BrandMapHandle = {
  recenterOnUser: () => void;
};

type Props = {
  pins?: MapPin[];
  polylines?: MapPolyline[];
  userLocation?: UserLocation | null;
  onPress?: () => void;
  onMapPress?: (latitude: number, longitude: number) => void;
  onPinDragEnd?: (id: string, latitude: number, longitude: number) => void;
  rounded?: boolean;
  mapPadding?: MapPadding;
  showLocationFab?: boolean;
  /** Imagem de satélite com nomes de ruas (Google "hybrid"). */
  satellite?: boolean;
  style?: ViewStyle;
};

/** Centro padrão: Belo Horizonte (região dos mocks). */
const DEFAULT_REGION: Region = {
  latitude: -19.9167,
  longitude: -43.9345,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const USER_FOCUS_DELTA = 0.012;

/** Calcula a região do mapa a partir dos pins (sem a posição do usuário). */
function regionFromPins(pins: MapPin[]): Region {
  if (pins.length === 0) {
    return DEFAULT_REGION;
  }

  const latitudes = pins.map((point) => point.latitude);
  const longitudes = pins.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, pins.length === 1 ? 0.02 : 0.05),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, pins.length === 1 ? 0.02 : 0.05),
  };
}

function regionFromUser(user: UserLocation): Region {
  return {
    latitude: user.latitude,
    longitude: user.longitude,
    latitudeDelta: USER_FOCUS_DELTA,
    longitudeDelta: USER_FOCUS_DELTA,
  };
}

/**
 * Mapa nativo com pins por coordenada (react-native-maps).
 * Na web, o Metro resolve `brand-map.web.tsx` (sem importar esta lib).
 */
export const BrandMap = forwardRef<BrandMapHandle, Props>(function BrandMap(
  {
    pins = [],
    polylines = [],
    userLocation = null,
    onPress,
    onMapPress,
    onPinDragEnd,
    rounded = false,
    mapPadding,
    showLocationFab = true,
    satellite = false,
    style,
  },
  ref,
) {
  const t = useT();
  const brand = useBrand();
  const colorScheme = useBrandColorScheme();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const mapStyle = useMemo(() => brandMapStyle(brand, colorScheme), [brand, colorScheme]);
  const mapRef = useRef<MapView>(null);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const isPreview = Boolean(onPress);
  const region = regionFromPins(pins);
  const mapStyleName = [styles.map, rounded && styles.rounded, style];
  const flattened = StyleSheet.flatten(mapStyleName) as ViewStyle;
  const fillsParent = flattened.height == null && flattened.minHeight == null;

  const recenterOnUser = () => {
    if (!userLocation) {
      return;
    }
    mapRef.current?.animateToRegion(regionFromUser(userLocation), 400);
  };

  useImperativeHandle(ref, () => ({ recenterOnUser }));

  return (
    <View
      collapsable={false}
      style={[
        styles.map,
        fillsParent && styles.fill,
        rounded && styles.rounded,
        style,
        mapPadding && {
          paddingTop: mapPadding.top,
          paddingRight: mapPadding.right,
          paddingBottom: mapPadding.bottom,
          paddingLeft: mapPadding.left,
        },
      ]}
    >
      <MapView
        ref={mapRef}
        style={[styles.mapView, rounded && styles.roundedMap]}
        customMapStyle={satellite ? undefined : mapStyle}
        mapType={satellite ? 'hybrid' : 'standard'}
        initialRegion={region}
        userInterfaceStyle={colorScheme}
        onPress={(event) => {
          if (isPreview) {
            onPress?.();
            return;
          }
          setActivePinId(null);
          const coordinate = event.nativeEvent.coordinate;
          if (coordinate) {
            onMapPress?.(coordinate.latitude, coordinate.longitude);
          }
        }}
        scrollEnabled={!isPreview}
        zoomEnabled={!isPreview}
        zoomControlEnabled={false}
        pitchEnabled={!isPreview}
        rotateEnabled={!isPreview}
        toolbarEnabled={false}
      >
        {polylines.map((line) => (
          <Polyline
            key={line.id}
            coordinates={line.coordinates}
            strokeColor={brand.blue}
            strokeWidth={3}
            lineDashPattern={line.dashed ? [8, 6] : undefined}
            geodesic
            zIndex={0}
          />
        ))}
        {pins.map((pin) => (
          <PersonPinMarker
            key={pin.id}
            pin={pin}
            brand={brand}
            styles={styles}
            isPreview={isPreview}
            emphasized={Boolean(pin.emphasized) || activePinId === pin.id}
            onPreviewPress={onPress}
            onPinDragEnd={onPinDragEnd}
            onSelect={() => setActivePinId(pin.id)}
          />
        ))}
        {userLocation ? (
          <>
            <Circle
              center={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              radius={userAccuracyRadius(userLocation.accuracy)}
              fillColor={hexToRgba(brand.blue, 0.18)}
              strokeColor={hexToRgba(brand.blue, 0.4)}
              strokeWidth={1}
            />
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              zIndex={10}
              title={t('Você está aqui')}
              onPress={
                onPress
                  ? (event) => {
                      event.stopPropagation();
                      onPress();
                    }
                  : undefined
              }
            >
              <View style={styles.userDotOuter}>
                <View style={styles.userDot} />
              </View>
            </Marker>
          </>
        ) : null}
      </MapView>
      {isPreview || !showLocationFab ? null : (
        <MapMyLocationFab onPress={recenterOnUser} disabled={!userLocation} />
      )}
    </View>
  );
});

function PinRipple({ color, size, delay }: { color: string; size: number; delay: number }) {
  const progress = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      }),
    );
    const start = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(start);
      loop.stop();
    };
  }, [delay, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.85] });
  const opacity = progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.45, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

function PersonPinMarker({
  pin,
  brand,
  styles,
  isPreview,
  emphasized,
  onPreviewPress,
  onPinDragEnd,
  onSelect,
}: {
  pin: MapPin;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
  isPreview: boolean;
  emphasized: boolean;
  onPreviewPress?: () => void;
  onPinDragEnd?: (id: string, latitude: number, longitude: number) => void;
  onSelect: () => void;
}) {
  const [photoReady, setPhotoReady] = useState(!pin.photoUri);
  const statusRing =
    pin.variant !== 'note' && pin.accentColor
      ? { borderColor: pin.accentColor, borderWidth: emphasized ? 4 : 3 }
      : null;
  const faceSize = emphasized ? 48 : 36;
  const showRipple = Boolean(pin.pulse) && pin.variant !== 'note' && pin.accentColor;

  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      title={pin.tooltip ? undefined : pin.label}
      opacity={pin.opacity ?? 1}
      zIndex={pin.zIndex ?? 1}
      tracksViewChanges={!photoReady || emphasized || Boolean(showRipple)}
      draggable={!isPreview && Boolean(pin.draggable)}
      onDragEnd={(event) => {
        const coordinate = event.nativeEvent.coordinate;
        onPinDragEnd?.(pin.id, coordinate.latitude, coordinate.longitude);
      }}
      onPress={(event) => {
        event.stopPropagation();
        if (isPreview) {
          onPreviewPress?.();
          return;
        }
        onSelect();
        pin.onPress?.();
      }}
    >
      <View style={styles.pin}>
        {pin.variant === 'note' ? (
          <View
            style={[
              emphasized ? styles.noteBadgeLg : styles.noteBadge,
              { backgroundColor: pin.accentColor ?? brand.safetyNote },
            ]}
          >
            <View style={styles.noteIcon}>
              <MaterialCommunityIcons
                name={pin.icon ?? 'alert'}
                size={emphasized ? 22 : 16}
                color={brand.onSafetyNote}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.faceSlot, { width: faceSize, height: faceSize }]}>
            {showRipple ? (
              <>
                <PinRipple color={pin.accentColor!} size={faceSize} delay={0} />
                <PinRipple color={pin.accentColor!} size={faceSize} delay={1100} />
              </>
            ) : null}
            {pin.photoUri ? (
              <Image
                source={{ uri: pin.photoUri }}
                style={[emphasized ? styles.pinPhotoLg : styles.pinPhoto, statusRing]}
                onLoad={() => setPhotoReady(true)}
              />
            ) : (
              <View style={[emphasized ? styles.pinBadgeLg : styles.pinBadge, statusRing]}>
                <MaterialCommunityIcons
                  name={pin.locked ? 'lock' : 'account'}
                  size={emphasized ? 20 : 16}
                  color={brand.textMuted}
                />
              </View>
            )}
          </View>
        )}
        {pin.label && !pin.tooltip ? (
          <Text style={styles.pinLabel} numberOfLines={1}>
            {pin.label}
          </Text>
        ) : null}
      </View>
      {pin.tooltip ? (
        <Callout tooltip>
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>{pin.tooltip.title}</Text>
            <Text style={styles.tooltipSubtitle}>{pin.tooltip.subtitle}</Text>
          </View>
        </Callout>
      ) : null}
    </Marker>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    map: {
      position: 'relative',
      backgroundColor: brand.mapBackground,
      borderWidth: 1,
      borderColor: brand.mapStroke,
      overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
    },
    fill: {
      flex: 1,
    },
    mapView: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...(Platform.OS === 'android' ? { opacity: 0.99 } : {}),
    },
    rounded: {
      borderRadius: Radius.lg,
      overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
    },
    roundedMap: {
      borderRadius: Radius.lg,
    },
    pin: {
      alignItems: 'center',
    },
    faceSlot: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: brand.avatarBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: brand.onPrimary,
    },
    pinBadgeLg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: brand.avatarBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: brand.onPrimary,
    },
    noteBadge: {
      width: 30,
      height: 30,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2.5,
      borderColor: brand.onPrimary,
      transform: [{ rotate: '45deg' }],
    },
    noteBadgeLg: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: brand.orange,
      transform: [{ rotate: '45deg' }],
    },
    noteIcon: {
      transform: [{ rotate: '-45deg' }],
    },
    pinPhoto: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 3,
      borderColor: brand.onPrimary,
      backgroundColor: brand.avatarBackground,
    },
    pinPhotoLg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 3,
      borderColor: brand.orange,
      backgroundColor: brand.avatarBackground,
    },
    pinLabel: {
      marginTop: 2,
      maxWidth: 90,
      fontSize: 11,
      fontWeight: '700',
      color: brand.textDark,
    },
    tooltip: {
      maxWidth: 220,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: Radius.md,
      backgroundColor: brand.white,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    tooltipTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: brand.textDark,
    },
    tooltipSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: brand.textMuted,
    },
    userDotOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: brand.onPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: brand.blue,
    },
  });
}

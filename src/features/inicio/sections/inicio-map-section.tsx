import { MaterialCommunityIcons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useMemo, useRef, type RefObject } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandMap, type BrandMapHandle, type MapPadding } from '@/components/brand-map';
import { MapMyLocationFab } from '@/components/map-my-location-fab';
import { Radius, type BrandColors } from '@/constants/brand';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';
import { CATEGORY_FILTERS, categoryColor } from '@/lib/person-category';

const CARD_RADIUS = 28;
/** Quanto o mapa sobe por cima da faixa marinho do topo (efeito de cartão). */
export const MAP_CARD_OVERLAP = 18;

interface InicioMapSectionProps {
  controller: InicioController;
  mapPadding?: MapPadding;
  /** `overlay` cobre a tela (layout largo). `card` é o mapa grande do celular, com filtros. */
  variant?: 'overlay' | 'card';
}

export const InicioMapSection = forwardRef<BrandMapHandle, InicioMapSectionProps>(
  function InicioMapSection({ controller, mapPadding, variant = 'overlay' }, ref) {
    const mapRef = useRef<BrandMapHandle>(null);
    useImperativeHandle(ref, () => ({
      recenterOnUser: () => mapRef.current?.recenterOnUser(),
    }));

    if (variant === 'card') {
      return <MapCard mapRef={mapRef} controller={controller} />;
    }

    return (
      <View style={[StyleSheet.absoluteFill, overlayStyles.wrapper]}>
        <BrandMap
          ref={mapRef}
          pins={controller.pins}
          userLocation={controller.userLocation}
          mapPadding={mapPadding}
          showLocationFab={false}
          satellite={controller.satellite}
          style={overlayStyles.map}
        />
      </View>
    );
  },
);

/** Mapa grande do celular: filtros por idade no alto, satélite e "minha localização" à direita. */
function MapCard({
  mapRef,
  controller,
}: {
  mapRef: RefObject<BrandMapHandle | null>;
  controller: InicioController;
}) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeCardStyles(brand), [brand]);
  const showEmpty = !controller.showPeopleSkeleton && controller.pins.length === 0;

  return (
    <View style={styles.cardShadow}>
      <View style={styles.cardClip}>
        <BrandMap
          ref={mapRef}
          pins={controller.pins}
          userLocation={controller.userLocation}
          showLocationFab={false}
          satellite={controller.satellite}
          style={styles.map}
        />

        <CategoryChips controller={controller} brand={brand} styles={styles} />

        <Pressable
          onPress={controller.toggleSatellite}
          style={({ pressed }) => [
            styles.layerButton,
            controller.satellite && styles.layerButtonActive,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={controller.satellite ? t('Ver mapa comum') : t('Ver imagem de satélite')}
          accessibilityState={{ selected: controller.satellite }}
        >
          <MaterialCommunityIcons
            name={controller.satellite ? 'map-outline' : 'satellite-variant'}
            size={24}
            color={controller.satellite ? brand.onPrimary : brand.textDark}
          />
        </Pressable>

        {showEmpty ? (
          <View style={styles.emptyPill} pointerEvents="none">
            <Text style={styles.emptyText}>
              {controller.categoryFilter === 'all'
                ? t('Nenhuma pessoa no mapa por aqui.')
                : t('Nenhuma pessoa desta faixa de idade no mapa.')}
            </Text>
          </View>
        ) : null}

        <MapMyLocationFab
          onPress={() => mapRef.current?.recenterOnUser()}
          disabled={!controller.userLocation}
          style={styles.locationFab}
        />
      </View>
    </View>
  );
}

function CategoryChips({
  controller,
  brand,
  styles,
}: {
  controller: InicioController;
  brand: BrandColors;
  styles: CardStyles;
}) {
  const t = useT();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsScroller}
      contentContainerStyle={styles.chipsTrack}
      accessibilityLabel={t('Filtrar por faixa de idade')}
    >
      {CATEGORY_FILTERS.map((filter) => {
        const selected = controller.categoryFilter === filter.value;
        const color = categoryColor(brand, filter.value);
        return (
          <Pressable
            key={filter.value}
            onPress={() => controller.setCategoryFilter(filter.value)}
            hitSlop={4}
            style={({ pressed }) => [
              styles.chip,
              selected
                ? { backgroundColor: color, borderColor: color }
                : { borderColor: hexToRgba(color, 0.55) },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t(filter.accessibilityLabel)}
            accessibilityState={{ selected }}
          >
            <MaterialCommunityIcons
              name={filter.icon}
              size={17}
              color={selected ? brand.onCategory : color}
            />
            <Text style={[styles.chipText, selected && { color: brand.onCategory }]}>
              {t(filter.label)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const overlayStyles = StyleSheet.create({
  wrapper: {
    zIndex: 0,
  },
  map: {
    flex: 1,
    borderWidth: 0,
  },
});

type CardStyles = ReturnType<typeof makeCardStyles>;

function makeCardStyles(brand: BrandColors) {
  return StyleSheet.create({
    cardShadow: {
      flex: 1,
      minHeight: 0,
      marginTop: -MAP_CARD_OVERLAP,
      zIndex: 2,
      backgroundColor: brand.mapBackground,
      borderTopLeftRadius: CARD_RADIUS,
      borderTopRightRadius: CARD_RADIUS,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.25,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: -4 },
      elevation: 10,
    },
    cardClip: {
      flex: 1,
      overflow: 'hidden',
      borderTopLeftRadius: CARD_RADIUS,
      borderTopRightRadius: CARD_RADIUS,
      backgroundColor: brand.mapBackground,
    },
    map: {
      flex: 1,
      borderWidth: 0,
      borderTopLeftRadius: CARD_RADIUS,
      borderTopRightRadius: CARD_RADIUS,
    },
    chipsScroller: {
      position: 'absolute',
      top: 12,
      left: 0,
      right: 0,
      flexGrow: 0,
      zIndex: 3,
    },
    chipsTrack: {
      gap: 8,
      paddingHorizontal: 12,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 42,
      paddingHorizontal: 13,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      backgroundColor: brand.surface,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.18,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    chipText: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.textDark,
    },
    pressed: {
      opacity: 0.8,
    },
    layerButton: {
      position: 'absolute',
      top: 66,
      right: 12,
      zIndex: 3,
      width: 48,
      height: 48,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
    },
    layerButtonActive: {
      backgroundColor: brand.blue,
      borderColor: brand.blue,
    },
    emptyPill: {
      position: 'absolute',
      top: 70,
      left: 12,
      right: 72,
      alignItems: 'flex-start',
      zIndex: 3,
    },
    emptyText: {
      overflow: 'hidden',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: Radius.md,
      fontSize: 14,
      fontWeight: '700',
      color: brand.textDark,
      backgroundColor: brand.surface,
    },
    locationFab: {
      bottom: 14,
      right: 12,
      zIndex: 3,
      elevation: 6,
    },
  });
}

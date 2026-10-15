import { MaterialCommunityIcons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useMemo, useRef, type RefObject } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandMap, type BrandMapHandle, type MapPadding } from '@/components/brand-map';
import { MapMyLocationFab } from '@/components/map-my-location-fab';
import { Radius, type BrandColors } from '@/constants/brand';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { InicioMapPreviewSection } from '@/features/inicio/sections/inicio-map-preview-section';
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
          onMapPress={controller.clearSelection}
          style={overlayStyles.map}
        />
      </View>
    );
  },
);

/**
 * Mapa grande do celular: filtros por idade no alto; à direita, um grupo de controles (satélite e
 * avisos de segurança); embaixo, "Adicionar aviso" e "minha localização". Tocar num pin abre um
 * cartão flutuante com o resumo (tocar no mapa fecha).
 */
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
  const showEmpty =
    !controller.showPeopleSkeleton && !controller.hasSelection && controller.personPinsCount === 0;
  const showAddNote =
    controller.safetyNotesEnabled && controller.showSafetyNotes && !controller.hasSelection;

  return (
    <View style={styles.cardShadow}>
      <View style={styles.cardClip}>
        <BrandMap
          ref={mapRef}
          pins={controller.pins}
          userLocation={controller.userLocation}
          showLocationFab={false}
          satellite={controller.satellite}
          onMapPress={controller.clearSelection}
          style={styles.map}
        />

        <CategoryChips controller={controller} brand={brand} styles={styles} />

        <View style={styles.controls}>
          <ControlButton
            icon={controller.satellite ? 'map-outline' : 'satellite-variant'}
            label={controller.satellite ? t('Ver mapa comum') : t('Ver imagem de satélite')}
            active={controller.satellite}
            onPress={controller.toggleSatellite}
            brand={brand}
            styles={styles}
          />
          {controller.safetyNotesEnabled ? (
            <>
              <View style={styles.controlsDivider} />
              <ControlButton
                icon="shield-alert-outline"
                label={
                  controller.showSafetyNotes
                    ? t('Esconder avisos de segurança')
                    : t('Mostrar avisos de segurança')
                }
                active={controller.showSafetyNotes}
                activeColor={brand.safetyNote}
                activeIconColor={brand.onSafetyNote}
                badge={controller.showSafetyNotes ? controller.safetyNotesCount : 0}
                onPress={controller.toggleSafetyNotes}
                brand={brand}
                styles={styles}
              />
            </>
          ) : null}
        </View>

        {showEmpty ? (
          <View style={styles.emptyPill} pointerEvents="none">
            <Text style={styles.emptyText}>
              {controller.categoryFilter === 'all'
                ? t('Nenhuma pessoa no mapa por aqui.')
                : t('Nenhuma pessoa desta faixa de idade no mapa.')}
            </Text>
          </View>
        ) : null}

        {showAddNote ? (
          <View style={styles.addNoteAnchor} pointerEvents="box-none">
            <Pressable
              onPress={controller.goToNewSafetyNote}
              style={({ pressed }) => [styles.addNote, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t('Adicionar aviso de segurança')}
              accessibilityHint={t('Avise sobre uma rua ou lugar perigoso')}
            >
              <MaterialCommunityIcons name="map-marker-plus-outline" size={20} color={brand.safetyNote} />
              <Text style={styles.addNoteText}>{t('Adicionar aviso')}</Text>
            </Pressable>
          </View>
        ) : null}

        {controller.hasSelection ? null : (
          <MapMyLocationFab
            onPress={() => mapRef.current?.recenterOnUser()}
            disabled={!controller.userLocation}
            style={styles.locationFab}
          />
        )}

        <InicioMapPreviewSection controller={controller} />
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  active,
  activeColor,
  activeIconColor,
  badge = 0,
  onPress,
  brand,
  styles,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  active: boolean;
  activeColor?: string;
  activeIconColor?: string;
  badge?: number;
  onPress: () => void;
  brand: BrandColors;
  styles: CardStyles;
}) {
  const fill = activeColor ?? brand.blue;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.control,
        active && { backgroundColor: fill },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={active ? (activeIconColor ?? brand.onPrimary) : brand.textDark}
      />
      {badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
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
              size={16}
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
      gap: 6,
      paddingHorizontal: 10,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      height: 42,
      paddingHorizontal: 10,
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
      fontSize: 14,
      fontWeight: '800',
      color: brand.textDark,
    },
    pressed: {
      opacity: 0.8,
    },
    controls: {
      position: 'absolute',
      top: 64,
      right: 10,
      zIndex: 3,
      padding: 4,
      gap: 4,
      borderRadius: 30,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    controlsDivider: {
      height: 1,
      marginHorizontal: 8,
      backgroundColor: brand.divider,
    },
    control: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 5,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.navy,
      borderWidth: 2,
      borderColor: brand.surface,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    addNoteAnchor: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 16,
      alignItems: 'center',
      zIndex: 3,
    },
    addNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 48,
      paddingHorizontal: 18,
      borderRadius: Radius.pill,
      backgroundColor: brand.navy,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 5 },
      elevation: 8,
    },
    addNoteText: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.onPrimary,
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

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { BrandEnter, useEnterOnce } from '@/components/brand-enter';
import { PhotoRing } from '@/components/photo-ring';
import { StatusRipple } from '@/components/status-ripple';
import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import { SupportersSection } from '@/features/apoiadores/sections/supporters-section';
import { ALERTS_RIPPLE_ROOM, type AlertViewMode } from '@/features/inicio/alerts-sheet';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { useHomeChrome } from '@/features/inicio/home-chrome';
import { useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';
import {
  categoryColor,
  categoryIcon,
  personCategory,
  personCategoryLabel,
} from '@/lib/person-category';
import {
  isPersonAlertStatus,
  isPersonSearchingStatus,
  resolvePersonStatusBadge,
  resolvePersonStatusColor,
} from '@/lib/person-status';
import type { Person } from '@/services/people/people.types';

const CARD_WIDTH = 244;
const CARD_GAP = 12;
const PHOTO = 64;
const AVATAR = 64;
const AVATAR_GAP = 12;
const SKELETON_COUNT = 4;

interface InicioAlertsSectionProps {
  controller: InicioController;
  /** 0 = fileira; 1 = lista rolável. */
  expanded: SharedValue<number>;
  collapsedHeight: SharedValue<number>;
  openedHeight: SharedValue<number>;
  view: AlertViewMode;
  onViewChange: (view: AlertViewMode) => void;
}

/**
 * "Alertas recentes": fileira de fotos ou de cartões, escolhida pelos botões do título.
 * Arrastar o mapa para baixo abre a lista, que carrega mais pessoas ao rolar.
 */
export function InicioAlertsSection({
  controller,
  expanded,
  collapsedHeight,
  openedHeight,
  view,
  onViewChange,
}: InicioAlertsSectionProps) {
  const t = useT();
  const brand = useBrand();
  const chrome = useHomeChrome();
  const styles = useMemo(
    () => makeStyles(brand, chrome.ink, chrome.muted, chrome.glass),
    [brand, chrome.glass, chrome.ink, chrome.muted],
  );
  const { alertPeople, scrollPeople, showPeopleSkeleton, categoryFilter } = controller;
  const claimEnter = useEnterOnce();
  const [listOpen, setListOpen] = useState(false);

  useAnimatedReaction(
    () => expanded.value > 0.55,
    (next, prev) => {
      if (next !== prev) runOnJS(setListOpen)(next);
    },
  );

  const trackStyle = useAnimatedStyle(() => ({
    height: collapsedHeight.value + (openedHeight.value - collapsedHeight.value) * expanded.value,
  }));

  const emptyText =
    categoryFilter === 'all'
      ? t('Nenhuma pessoa próxima.')
      : t('Nenhum alerta nesta faixa de idade por aqui.');

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.accentBar} />
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {t('Alertas recentes')}
        </Text>
        <View style={styles.toggle}>
          <Pressable
            onPress={() => onViewChange('avatar')}
            hitSlop={4}
            style={[styles.toggleBtn, view === 'avatar' && styles.toggleBtnOn]}
            accessibilityRole="button"
            accessibilityLabel={t('Ver só as fotos')}
            accessibilityState={{ selected: view === 'avatar' }}
          >
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={20}
              color={view === 'avatar' ? brand.orangeDark : chrome.ink}
            />
          </Pressable>
          <Pressable
            onPress={() => onViewChange('card')}
            hitSlop={4}
            style={[styles.toggleBtn, view === 'card' && styles.toggleBtnOn]}
            accessibilityRole="button"
            accessibilityLabel={t('Ver cartões com detalhes')}
            accessibilityState={{ selected: view === 'card' }}
          >
            <MaterialCommunityIcons
              name="card-text-outline"
              size={20}
              color={view === 'card' ? brand.orangeDark : chrome.ink}
            />
          </Pressable>
        </View>
        <Pressable
          onPress={controller.goToAllPeople}
          hitSlop={10}
          style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t('Ver todas as pessoas desaparecidas')}
        >
          <Text style={styles.seeAllText}>{t('Ver todos')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={chrome.ink} />
        </Pressable>
      </View>

      <Animated.View style={[styles.stage, trackStyle]}>
        {showPeopleSkeleton ? (
          view === 'avatar' ? (
            <AvatarSkeletonRow styles={styles} />
          ) : (
            <CardSkeletonRow styles={styles} />
          )
        ) : (listOpen ? scrollPeople : alertPeople).length === 0 ? (
          <BrandEnter from="fade" style={styles.empty}>
            <MaterialCommunityIcons name="map-search-outline" size={22} color={chrome.ink} />
            <Text style={styles.emptyText}>{emptyText}</Text>
          </BrandEnter>
        ) : listOpen ? (
          <FlatList
            key={view}
            data={scrollPeople}
            keyExtractor={(person) => person.id}
            numColumns={view === 'avatar' ? 4 : 1}
            style={styles.list}
            contentContainerStyle={view === 'avatar' ? styles.gridContent : styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={controller.loadMoreAlerts}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              controller.alertsLoadingMore ? (
                <ActivityIndicator color={chrome.ink} style={styles.footer} />
              ) : (
                <SupportersSection spaced />
              )
            }
            renderItem={({ item }) =>
              view === 'avatar' ? (
                <View style={styles.gridCell}>
                  <AlertAvatar person={item} controller={controller} brand={brand} styles={styles} />
                </View>
              ) : (
                <AlertCard person={item} controller={controller} brand={brand} styles={styles} wide />
              )
            }
          />
        ) : view === 'avatar' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scroller}
            contentContainerStyle={styles.avatarTrack}
            accessibilityLabel={t('Pessoas desaparecidas. Deslize para o lado para ver mais.')}
          >
            {alertPeople.map((person) => (
              <AlertAvatar key={person.id} person={person} controller={controller} brand={brand} styles={styles} />
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            style={styles.scroller}
            contentContainerStyle={styles.cardTrack}
            accessibilityLabel={t('Pessoas desaparecidas. Deslize para o lado para ver mais.')}
          >
            {alertPeople.map((person, index) => (
              <BrandEnter key={person.id} from="right" index={Math.min(index, 4)} skip={!claimEnter(person.id)}>
                <AlertCard person={person} controller={controller} brand={brand} styles={styles} />
              </BrandEnter>
            ))}
          </ScrollView>
        )}
      </Animated.View>

      {controller.locationDenied ? (
        <Text style={styles.hint}>{t('Ative a localização para ver pessoas próximas.')}</Text>
      ) : null}
    </View>
  );
}

function firstNameOf(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || fullName;
}

function AlertAvatar({
  person,
  controller,
  brand,
  styles,
}: {
  person: Person;
  controller: InicioController;
  brand: BrandColors;
  styles: Styles;
}) {
  const t = useT();
  const category = personCategory(person);
  const statusColor = resolvePersonStatusColor(brand, person.statusId, person.statusDescription);

  return (
    <Pressable
      onPress={() => controller.goToPerson(person.id)}
      style={({ pressed }) => [styles.avatarItem, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={t('Ver detalhes de {fullName}', { fullName: person.fullName })}
    >
      <StatusRipple
        active={isPersonSearchingStatus(person.statusId, person.statusDescription)}
        color={statusColor}
        size={AVATAR}
        radius={AVATAR / 2}
      >
        <View style={[styles.avatar, { borderColor: statusColor }]}>
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name={categoryIcon(category)} size={28} color={brand.avatarIcon} />
          )}
        </View>
      </StatusRipple>
      <Text style={styles.avatarName} numberOfLines={1}>
        {firstNameOf(person.fullName)}
      </Text>
    </Pressable>
  );
}

function AlertCard({
  person,
  controller,
  brand,
  styles,
  wide = false,
}: {
  person: Person;
  controller: InicioController;
  brand: BrandColors;
  styles: Styles;
  wide?: boolean;
}) {
  const t = useT();
  const colorScheme = useBrandColorScheme();
  const category = personCategory(person);
  const categoryLabel = personCategoryLabel(person);
  const accent = category ? categoryColor(brand, category) : brand.divider;
  const statusBadge = resolvePersonStatusBadge(
    brand,
    colorScheme,
    person.statusId,
    person.statusDescription,
  );
  const place = person.city || person.neighborhood || person.lastSeen || person.location || '';
  const meta = [person.age != null ? t('{age} anos', { age: person.age }) : null, place]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={() => controller.goToPerson(person.id)}
      style={({ pressed }) => [styles.card, wide && styles.cardWide, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={t('Ver detalhes de {fullName}', { fullName: person.fullName })}
    >
      <StatusRipple
        active={isPersonSearchingStatus(person.statusId, person.statusDescription)}
        color={resolvePersonStatusColor(brand, person.statusId, person.statusDescription)}
        size={PHOTO}
        radius={Radius.md + 2}
      >
        <PhotoRing
          size={PHOTO}
          radius={Radius.md + 2}
          color={accent}
          urgent={isPersonAlertStatus(person.statusId, person.statusDescription)}
        >
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name={categoryIcon(category)} size={28} color={brand.avatarIcon} />
          )}
        </PhotoRing>
      </StatusRipple>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {person.fullName}
        </Text>
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
        <View style={styles.tags}>
          {categoryLabel ? (
            <View style={[styles.tag, { backgroundColor: hexToRgba(accent, 0.14) }]}>
              <MaterialCommunityIcons name={categoryIcon(category)} size={13} color={accent} />
              <Text style={[styles.tagText, { color: accent }]}>{t(categoryLabel)}</Text>
            </View>
          ) : null}
          {person.statusDescription ? (
            <View style={[styles.tag, { backgroundColor: statusBadge.backgroundColor }]}>
              <Text style={[styles.tagText, { color: statusBadge.color }]}>
                {t(person.statusDescription)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function AvatarSkeletonRow({ styles }: { styles: Styles }) {
  return (
    <View style={styles.avatarTrack}>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <CircleSkeleton key={index} index={index} styles={styles} />
      ))}
    </View>
  );
}

function CardSkeletonRow({ styles }: { styles: Styles }) {
  return (
    <View style={styles.cardTrack}>
      {Array.from({ length: 3 }, (_, index) => (
        <CardSkeleton key={index} index={index} styles={styles} />
      ))}
    </View>
  );
}

function CircleSkeleton({ index, styles }: { index: number; styles: Styles }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      index * 90,
      withRepeat(withTiming(0.8, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [index, opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.avatar, styles.skeletonCircle, pulseStyle]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function CardSkeleton({ index, styles }: { index: number; styles: Styles }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      index * 90,
      withRepeat(withTiming(0.8, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [index, opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.card, styles.skeleton, pulseStyle]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

type Styles = ReturnType<typeof makeStyles>;

function makeStyles(brand: BrandColors, ink: string, muted: string, glass: string) {
  return StyleSheet.create({
    wrap: {
      gap: 8,
      paddingTop: 8,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: PageGutter - 8,
    },
    accentBar: {
      width: 4,
      height: 18,
      borderRadius: 2,
      backgroundColor: brand.orange,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: ink,
    },
    toggle: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 2,
      borderRadius: Radius.pill,
      backgroundColor: glass,
    },
    toggleBtn: {
      width: 34,
      height: 30,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleBtnOn: {
      backgroundColor: brand.surface,
    },
    seeAll: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 36,
    },
    seeAllText: {
      fontSize: 15,
      fontWeight: '700',
      color: ink,
    },
    pressed: {
      opacity: 0.8,
    },
    stage: {
      overflow: 'hidden',
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: PageGutter - 8,
      paddingBottom: 8,
    },
    gridContent: {
      paddingHorizontal: PageGutter - 8,
      paddingTop: ALERTS_RIPPLE_ROOM,
      paddingBottom: 8,
    },
    gridCell: {
      flex: 1,
      alignItems: 'center',
      marginBottom: 10,
    },
    footer: {
      marginVertical: 12,
    },
    scroller: {
      flex: 1,
    },
    avatarTrack: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: AVATAR_GAP,
      paddingHorizontal: PageGutter - 8,
      paddingTop: ALERTS_RIPPLE_ROOM,
      flexGrow: 1,
    },
    avatarItem: {
      width: 76,
      alignItems: 'center',
    },
    avatarName: {
      marginTop: 4,
      width: '100%',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
      textAlign: 'center',
      color: ink,
    },
    cardTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: CARD_GAP,
      paddingHorizontal: PageGutter - 8,
      flexGrow: 1,
    },
    avatar: {
      width: AVATAR,
      height: AVATAR,
      borderRadius: AVATAR / 2,
      borderWidth: 3,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.avatarBackground,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    skeletonCircle: {
      borderColor: 'transparent',
      backgroundColor: hexToRgba(ink, 0.16),
    },
    card: {
      width: CARD_WIDTH,
      minHeight: PHOTO + 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
    },
    cardWide: {
      width: '100%',
      marginBottom: 10,
    },
    skeleton: {
      backgroundColor: hexToRgba(ink, 0.16),
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    info: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    name: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    meta: {
      fontSize: 14,
      fontWeight: '500',
      color: brand.textMuted,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 2,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: Radius.pill,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '800',
    },
    empty: {
      marginHorizontal: PageGutter - 8,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: hexToRgba(muted, 0.55),
    },
    emptyText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: ink,
    },
    hint: {
      paddingHorizontal: PageGutter - 8,
      fontSize: 14,
      fontWeight: '600',
      color: muted,
    },
  });
}

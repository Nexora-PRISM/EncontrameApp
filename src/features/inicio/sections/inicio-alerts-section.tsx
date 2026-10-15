import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BrandEnter, useEnterOnce } from '@/components/brand-enter';
import { PhotoRing } from '@/components/photo-ring';
import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';
import {
  categoryColor,
  categoryIcon,
  personCategory,
  personCategoryLabel,
} from '@/lib/person-category';
import { isPersonAlertStatus, resolvePersonStatusColor } from '@/lib/person-status';
import type { Person } from '@/services/people/people.types';

const CARD_WIDTH = 244;
const CARD_GAP = 12;
const PHOTO = 64;
const SKELETON_COUNT = 3;

interface InicioAlertsSectionProps {
  controller: InicioController;
}

/**
 * "Alertas recentes": cartões grandes e fáceis de tocar com foto, idade, cidade, faixa de idade
 * (com cor) e situação do caso. Primeiro quem está perto; depois os casos mais recentes.
 */
export function InicioAlertsSection({ controller }: InicioAlertsSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const { alertPeople, showPeopleSkeleton, categoryFilter } = controller;
  const claimEnter = useEnterOnce();

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.accentBar} />
        <Text style={styles.title} accessibilityRole="header">
          {t('Alertas recentes')}
        </Text>
        <Pressable
          onPress={controller.goToAllPeople}
          hitSlop={10}
          style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t('Ver todas as pessoas desaparecidas')}
        >
          <Text style={styles.seeAllText}>{t('Ver todos')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={brand.cream} />
        </Pressable>
      </View>

      {showPeopleSkeleton ? (
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.track}
        >
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <CardSkeleton key={index} index={index} styles={styles} />
          ))}
        </ScrollView>
      ) : alertPeople.length === 0 ? (
        <BrandEnter from="fade" style={styles.empty}>
          <MaterialCommunityIcons name="map-search-outline" size={24} color={brand.cream} />
          <Text style={styles.emptyText}>
            {categoryFilter === 'all'
              ? t('Nenhuma pessoa próxima.')
              : t('Nenhum alerta nesta faixa de idade por aqui.')}
          </Text>
        </BrandEnter>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={styles.track}
          accessibilityLabel={t('Pessoas desaparecidas. Deslize para o lado para ver mais.')}
        >
          {alertPeople.map((person, index) => (
            <BrandEnter
              key={person.id}
              from="right"
              index={Math.min(index, 4)}
              skip={!claimEnter(person.id)}
            >
              <AlertCard person={person} controller={controller} brand={brand} styles={styles} />
            </BrandEnter>
          ))}
        </ScrollView>
      )}

      {controller.locationDenied ? (
        <Text style={styles.hint}>{t('Ative a localização para ver pessoas próximas.')}</Text>
      ) : null}
    </View>
  );
}

function AlertCard({
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
  const categoryLabel = personCategoryLabel(person);
  const accent = category ? categoryColor(brand, category) : brand.divider;
  const statusColor = resolvePersonStatusColor(brand, person.statusId, person.statusDescription);
  const place = person.city || person.neighborhood || person.lastSeen || person.location || '';
  const meta = [person.age != null ? t('{age} anos', { age: person.age }) : null, place]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={() => controller.goToPerson(person.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={t('Ver detalhes de {fullName}', { fullName: person.fullName })}
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
            <View style={[styles.tag, { backgroundColor: statusColor }]}>
              <Text style={[styles.tagText, { color: brand.onStatusBadge }]}>
                {t(person.statusDescription)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
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

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 10,
      paddingTop: 14,
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
      color: brand.onPrimary,
    },
    seeAll: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 36,
    },
    seeAllText: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.cream,
    },
    pressed: {
      opacity: 0.8,
    },
    track: {
      gap: CARD_GAP,
      paddingHorizontal: PageGutter - 8,
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
    skeleton: {
      backgroundColor: hexToRgba(brand.onPrimary, 0.16),
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
      minHeight: PHOTO + 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: hexToRgba(brand.cream, 0.4),
    },
    emptyText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: brand.cream,
    },
    hint: {
      paddingHorizontal: PageGutter - 8,
      fontSize: 14,
      fontWeight: '600',
      color: hexToRgba(brand.cream, 0.85),
    },
  });
}

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
import { PersonAlertIcon } from '@/components/person-alert-icon';
import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { AppInfo } from '@/lib/app-info';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { resolvePersonStatusColor } from '@/lib/person-status';
import { useWideLayout } from '@/lib/use-wide-layout';
import type { Person } from '@/services/people/people.types';

interface InicioPeopleCarouselSectionProps {
  controller: InicioController;
}

/**
 * Carrossel de pessoas no topo do Início, sobre o fundo da tela. Fotos redondas e ponto na
 * cor da situação. A fila desliza no estilo Stories e encaixa no próximo item, com a
 * mesma margem dos dois lados.
 */
const CARD_GAP = 12;
const CARD_MAX_WIDTH = 76;
const NAME_GAP = 6;
const NAME_FONT = 12;
const NAME_LINE_HEIGHT = 15;
const NAME_PAD_V = 2;
const NAME_HEIGHT = NAME_LINE_HEIGHT + NAME_PAD_V * 2;
const SKELETON_COUNT = 4;
const STATUS_DOT = 8;

export function InicioPeopleCarouselSection({ controller }: InicioPeopleCarouselSectionProps) {
  const t = useT();
  const brand = useBrand();
  const { width, isWide } = useWideLayout();
  const visibleCards = isWide ? 5.5 : 3.6;
  const cardWidth = Math.min(CARD_MAX_WIDTH, (width - PageGutter * 2 - CARD_GAP) / visibleCards);
  const itemHeight = cardWidth + NAME_GAP + NAME_HEIGHT;
  const styles = useMemo(
    () => makeStyles(brand, cardWidth, itemHeight),
    [brand, cardWidth, itemHeight],
  );
  const { carouselPeople, showPeopleSkeleton } = controller;
  const claimEnter = useEnterOnce();

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Text style={styles.brand} accessibilityRole="header">
        {AppInfo.name}
      </Text>
      {showPeopleSkeleton ? (
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scroller}
          contentContainerStyle={styles.track}
        >
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <PersonCardSkeleton key={index} index={index} brand={brand} styles={styles} />
          ))}
        </ScrollView>
      ) : carouselPeople.length === 0 ? (
        <BrandEnter from="fade" style={styles.empty}>
          <Text style={styles.emptyText}>{t('Nenhuma pessoa próxima.')}</Text>
        </BrandEnter>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + CARD_GAP}
          snapToAlignment="start"
          decelerationRate="fast"
          style={styles.scroller}
          contentContainerStyle={styles.track}
          accessibilityLabel={t('Pessoas desaparecidas. Deslize para o lado para ver mais.')}
        >
          {carouselPeople.map((person, index) => (
            <CarouselCard
              key={person.id}
              person={person}
              index={index}
              skip={!claimEnter(person.id)}
              controller={controller}
              brand={brand}
              styles={styles}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function CarouselCard({
  person,
  index,
  skip,
  controller,
  brand,
  styles,
}: {
  person: Person;
  index: number;
  skip: boolean;
  controller: InicioController;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const t = useT();
  const statusColor = resolvePersonStatusColor(brand, person.statusId, person.statusDescription);

  return (
    <BrandEnter from="right" index={Math.min(index, 6)} skip={skip}>
      <Pressable
        style={styles.item}
        onPress={() => controller.goToPerson(person.id)}
        accessibilityRole="button"
        accessibilityLabel={t('Ver detalhes de {fullName}', { fullName: person.fullName })}
      >
        <View style={styles.card}>
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="account" size={28} color={brand.avatarIcon} />
          )}
        </View>
        <View style={styles.nameRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {person.fullName}
          </Text>
          <PersonAlertIcon
            statusId={person.statusId}
            statusDescription={person.statusDescription}
            size={12}
          />
        </View>
      </Pressable>
    </BrandEnter>
  );
}

function PersonCardSkeleton({
  index,
  brand,
  styles,
}: {
  index: number;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withDelay(
      index * 90,
      withRepeat(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
  }, [index, opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.item} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.card, { backgroundColor: brand.avatarBackground }, pulseStyle]} />
      <Animated.View style={[styles.skeletonName, pulseStyle]} />
    </View>
  );
}

function makeStyles(brand: BrandColors, cardWidth: number, itemHeight: number) {
  return StyleSheet.create({
    wrapper: {
      flexGrow: 0,
      flexShrink: 0,
      gap: 8,
      paddingHorizontal: PageGutter,
      paddingTop: 4,
    },
    brand: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    scroller: {
      flexGrow: 0,
      height: itemHeight,
    },
    track: {
      gap: CARD_GAP,
      alignItems: 'flex-start',
    },
    item: {
      width: cardWidth,
      height: itemHeight,
      alignItems: 'center',
      gap: NAME_GAP,
    },
    card: {
      width: cardWidth,
      height: cardWidth,
      borderRadius: cardWidth / 2,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.avatarBackground,
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    nameRow: {
      maxWidth: '100%',
      height: NAME_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      overflow: 'hidden',
    },
    statusDot: {
      width: STATUS_DOT,
      height: STATUS_DOT,
      borderRadius: Radius.pill,
      flexShrink: 0,
    },
    name: {
      flexShrink: 1,
      color: brand.textDark,
      fontSize: NAME_FONT,
      lineHeight: NAME_LINE_HEIGHT,
      fontWeight: '700',
      textAlign: 'center',
    },
    skeletonName: {
      width: '72%',
      height: NAME_HEIGHT,
      borderRadius: Radius.pill,
      backgroundColor: brand.divider,
    },
    empty: {
      minHeight: itemHeight,
      borderRadius: Radius.xl,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    emptyText: {
      color: brand.textMuted,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}

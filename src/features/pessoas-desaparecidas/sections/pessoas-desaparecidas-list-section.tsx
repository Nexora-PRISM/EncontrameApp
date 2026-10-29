import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, type ReactElement } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { BrandEnter, useEnterOnce } from '@/components/brand-enter';
import { PersonAlertIcon } from '@/components/person-alert-icon';
import { Radius, type BrandColors } from '@/constants/brand';
import { WideLayoutBreakpoint } from '@/constants/theme';
import type { PessoasDesaparecidasController } from '@/features/pessoas-desaparecidas/pessoas-desaparecidas.controller';
import { useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { resolvePersonStatusBadge } from '@/lib/person-status';
import { useWideLayout } from '@/lib/use-wide-layout';
import type { Person } from '@/services/people/people.types';

interface PessoasDesaparecidasListSectionProps {
  controller: PessoasDesaparecidasController;
  header?: ReactElement;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function PessoasDesaparecidasListSection({
  controller,
  header,
  style,
  contentContainerStyle,
}: PessoasDesaparecidasListSectionProps) {
  const t = useT();
  const brand = useBrand();
  const { width, isWide } = useWideLayout();
  const columns = listingColumns(controller.view, width);
  const styles = useMemo(() => makeStyles(brand, columns, isWide), [brand, columns, isWide]);
  const claimEnter = useEnterOnce();

  const renderItem = ({ item, index }: { item: Person; index: number }) =>
    controller.view === 'photo' ? (
      <PhotoTile
        person={item}
        index={index}
        skip={!claimEnter(item.id)}
        controller={controller}
        brand={brand}
        styles={styles}
      />
    ) : (
      <DetailCard
        person={item}
        index={index}
        skip={!claimEnter(item.id)}
        controller={controller}
        brand={brand}
        styles={styles}
        isWide={isWide}
      />
    );

  return (
    <FlatList
      style={style}
      data={controller.people}
      key={`${controller.view}-${columns}`}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? styles.row : undefined}
      contentContainerStyle={[styles.list, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReached={controller.loadMore}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={header}
      ListEmptyComponent={
        controller.loading ? (
          <ActivityIndicator color={brand.blue} style={styles.empty} />
        ) : (
          <BrandEnter from="fade">
            <Text style={styles.emptyText}>{t('Nenhuma pessoa encontrada com esses filtros.')}</Text>
          </BrandEnter>
        )
      }
      ListFooterComponent={
        controller.fetchingMore ? <ActivityIndicator color={brand.blue} style={styles.footer} /> : null
      }
    />
  );
}

function DetailCard({
  person,
  index,
  skip,
  controller,
  brand,
  styles,
  isWide,
}: {
  person: Person;
  index: number;
  skip: boolean;
  controller: PessoasDesaparecidasController;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
  isWide: boolean;
}) {
  const t = useT();
  const colorScheme = useBrandColorScheme();
  const statusLabel = person.statusDescription ? t(person.statusDescription) : '—';
  const statusBadge = resolvePersonStatusBadge(
    brand,
    colorScheme,
    person.statusId,
    person.statusDescription,
  );
  const location = controller.locationLine(person);

  return (
    <BrandEnter from="up" index={index} skip={skip} style={styles.cell}>
      <Pressable
        style={styles.card}
        onPress={() => controller.goToPerson(person.id)}
        accessibilityRole="button"
        accessibilityLabel={t('Ver detalhes de {fullName}', { fullName: person.fullName })}
      >
        <View style={styles.cardPhoto}>
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="account" size={isWide ? 56 : 48} color={brand.avatarIcon} />
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {person.fullName}
            </Text>
            <PersonAlertIcon
              statusId={person.statusId}
              statusDescription={person.statusDescription}
              size={16}
            />
          </View>
          <Text style={styles.meta}>{t('Idade: {value}', { value: person.age ?? '—' })}</Text>
          {location ? (
            <Text style={styles.meta} numberOfLines={2}>
              {location}
            </Text>
          ) : null}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.backgroundColor }]}>
              <Text style={[styles.statusBadgeText, { color: statusBadge.color }]} numberOfLines={1}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </BrandEnter>
  );
}

function PhotoTile({
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
  controller: PessoasDesaparecidasController;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const t = useT();

  return (
    <BrandEnter from="up" index={index} skip={skip} style={styles.cell}>
      <Pressable
        style={styles.tile}
        onPress={() => controller.goToPerson(person.id)}
        accessibilityRole="button"
        accessibilityLabel={t('Ver detalhes de {fullName}', { fullName: person.fullName })}
      >
        <View style={styles.tilePhoto}>
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="account" size={32} color={brand.avatarIcon} />
          )}
        </View>
        <Text style={styles.tileName} numberOfLines={2}>
          {person.fullName}
        </Text>
      </Pressable>
    </BrandEnter>
  );
}

/** Mais colunas conforme a janela cresce, para o espaço extra virar conteúdo. */
function listingColumns(view: 'card' | 'photo', width: number): number {
  if (view === 'card') {
    if (width >= 1500) return 3;
    if (width >= WideLayoutBreakpoint) return 2;
    return 1;
  }
  if (width >= 1700) return 8;
  if (width >= 1400) return 6;
  if (width >= WideLayoutBreakpoint) return 5;
  return 3;
}

function makeStyles(brand: BrandColors, columns: number, isWide: boolean) {
  const cellWidth = `${100 / columns}%` as const;
  return StyleSheet.create({
    list: {
      paddingBottom: 96,
      flexGrow: 1,
    },
    row: {
      alignItems: 'stretch',
    },
    cell: {
      width: cellWidth,
      paddingHorizontal: 6,
      paddingBottom: 12,
    },
    card: {
      flex: 1,
      flexDirection: 'row',
      minHeight: 112,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: brand.cardInfo,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: brand.divider,
    },
    cardPhoto: {
      width: isWide ? 120 : 96,
      alignSelf: 'stretch',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.avatarBackground,
    },
    tile: {
      alignItems: 'center',
      gap: 6,
    },
    tilePhoto: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: Radius.sm,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.avatarBackground,
    },
    tileName: {
      width: '100%',
      textAlign: 'center',
      color: brand.textDark,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: '700',
    },
    photoImage: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    info: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 4,
      maxWidth: '100%',
    },
    name: {
      flexShrink: 1,
      color: brand.textDark,
      fontSize: isWide ? 16 : 15,
      fontWeight: '800',
    },
    meta: {
      color: brand.textDark,
      fontSize: 13,
      fontWeight: '600',
    },
    statusRow: {
      flexDirection: 'row',
      marginTop: 4,
    },
    statusBadge: {
      borderRadius: Radius.pill,
      paddingHorizontal: 8,
      paddingVertical: 3,
      maxWidth: '100%',
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    empty: {
      marginTop: 32,
    },
    emptyText: {
      marginTop: 32,
      textAlign: 'center',
      color: brand.textMuted,
      fontWeight: '600',
    },
    footer: {
      marginVertical: 16,
    },
  });
}

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
import type { PessoasDesaparecidasController } from '@/features/pessoas-desaparecidas/pessoas-desaparecidas.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { resolvePersonStatusColor, resolvePersonStatusOnColor } from '@/lib/person-status';
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
  const { isWide } = useWideLayout();
  const styles = useMemo(() => makeStyles(brand, isWide), [brand, isWide]);
  const claimEnter = useEnterOnce();

  const renderItem = ({ item, index }: { item: Person; index: number }) => (
    <PersonCard
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
      key={isWide ? 'wide' : 'narrow'}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={isWide ? 2 : 1}
      columnWrapperStyle={isWide ? styles.row : undefined}
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

function PersonCard({
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
  const statusLabel = person.statusDescription ? t(person.statusDescription) : '—';
  const badgeColor = resolvePersonStatusColor(brand, person.statusId, person.statusDescription);
  const badgeTextColor = resolvePersonStatusOnColor(brand);
  const location = controller.locationLine(person);

  return (
    <BrandEnter from="up" index={index} skip={skip} style={isWide ? styles.cardWrap : undefined}>
    <Pressable
      style={styles.card}
      onPress={() => controller.goToPerson(person.id)}
      accessibilityRole="button"
      accessibilityLabel={t('Ver detalhes de {fullName}', { fullName: person.fullName })}
    >
      <View style={styles.photo}>
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
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.statusBadgeText, { color: badgeTextColor }]} numberOfLines={1}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
    </BrandEnter>
  );
}

function makeStyles(brand: BrandColors, isWide: boolean) {
  return StyleSheet.create({
    list: {
      gap: 12,
      paddingBottom: 96,
      flexGrow: 1,
    },
    row: {
      gap: 12,
    },
    cardWrap: {
      flex: 1,
    },
    card: {
      flex: isWide ? 1 : undefined,
      flexDirection: 'row',
      minHeight: 112,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: brand.cardInfo,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: brand.divider,
    },
    photo: {
      width: isWide ? 120 : 96,
      alignSelf: 'stretch',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.avatarBackground,
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
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
      justifyContent: 'center',
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

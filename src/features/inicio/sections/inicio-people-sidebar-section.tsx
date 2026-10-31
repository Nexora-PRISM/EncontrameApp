import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandEnter, useEnterOnce } from '@/components/brand-enter';
import { PersonAlertIcon } from '@/components/person-alert-icon';
import { StatusRipple } from '@/components/status-ripple';
import { Radius, type BrandColors, type ColorSchemeName } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { SupportersSection } from '@/features/apoiadores/sections/supporters-section';
import type { HomeShellController } from '@/features/inicio/home-shell.controller';
import { useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { matchesCategory } from '@/lib/person-category';
import {
  isPersonSearchingStatus,
  resolvePersonStatusBadge,
  resolvePersonStatusColor,
} from '@/lib/person-status';
import type { Person } from '@/services/people/people.types';

const PHOTO = 56;

interface InicioPeopleSidebarSectionProps {
  controller: HomeShellController;
}

/** Lista lateral da home no desktop: linhas com um traço embaixo, no formato do Maps. */
export function InicioPeopleSidebarSection({ controller }: InicioPeopleSidebarSectionProps) {
  const t = useT();
  const brand = useBrand();
  const colorScheme = useBrandColorScheme();
  const styles = useMemo(() => makeStyles(brand, colorScheme), [brand, colorScheme]);
  const people = useMemo(
    () => controller.people.filter((person) => matchesCategory(person, controller.categoryFilter)),
    [controller.categoryFilter, controller.people],
  );
  const { showPeopleSkeleton, categoryFilter } = controller;
  const claimEnter = useEnterOnce();

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('Pessoas próximas')}</Text>
        <Pressable
          onPress={controller.goToAllPeople}
          style={styles.allLink}
          accessibilityRole="button"
        >
          <Text style={styles.allLinkText}>{t('Ver todas')}</Text>
        </Pressable>
      </View>

      {showPeopleSkeleton ? (
        <View style={styles.center}>
          <ActivityIndicator color={brand.blue} />
        </View>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SidebarPersonRow
              person={item}
              index={index}
              skip={!claimEnter(item.id)}
              controller={controller}
              brand={brand}
              styles={styles}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<SupportersSection spaced />}
          ListEmptyComponent={
            <BrandEnter from="fade">
              <Text style={styles.emptyText}>
                {categoryFilter === 'all'
                  ? t('Nenhuma pessoa próxima.')
                  : t('Nenhum alerta nesta faixa de idade por aqui.')}
              </Text>
            </BrandEnter>
          }
        />
      )}
    </View>
  );
}

function SidebarPersonRow({
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
  controller: HomeShellController;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const t = useT();
  const [hovered, setHovered] = useState(false);
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
    <BrandEnter from="up" index={index} skip={skip}>
      <Pressable
        onPress={() => controller.goToPerson(person.id)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [styles.row, (pressed || hovered) && styles.rowActive]}
        accessibilityRole="button"
        accessibilityLabel={t('Ver detalhes de {fullName}', { fullName: person.fullName })}
      >
        <StatusRipple
          active={isPersonSearchingStatus(person.statusId, person.statusDescription)}
          color={resolvePersonStatusColor(brand, person.statusId, person.statusDescription)}
          size={PHOTO}
          radius={Radius.sm}
          spread={1.25}
        >
          <View style={styles.photo}>
            {person.photoUri ? (
              <Image source={{ uri: person.photoUri }} style={styles.photoImage} resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name="account" size={26} color={brand.avatarIcon} />
            )}
          </View>
        </StatusRipple>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {person.fullName}
            </Text>
            <PersonAlertIcon
              statusId={person.statusId}
              statusDescription={person.statusDescription}
            />
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {t('Idade: {age}', { age: person.age ?? '—' })}
            {location ? ` · ${location}` : ''}
          </Text>
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

function makeStyles(brand: BrandColors, colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    panel: {
      flex: 1,
      minHeight: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.three,
      paddingTop: 14,
      paddingBottom: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    allLink: {
      paddingVertical: 4,
    },
    allLinkText: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.blue,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 96,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: brand.divider,
    },
    rowActive: {
      backgroundColor: colorScheme === 'dark' ? brand.surface : brand.white,
    },
    photo: {
      width: PHOTO,
      height: PHOTO,
      borderRadius: Radius.sm,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.avatarBackground,
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    info: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      maxWidth: '100%',
    },
    name: {
      flexShrink: 1,
      color: brand.textDark,
      fontSize: 14,
      fontWeight: '800',
    },
    meta: {
      color: brand.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    statusRow: {
      flexDirection: 'row',
      marginTop: 2,
    },
    statusBadge: {
      borderRadius: Radius.pill,
      paddingHorizontal: 7,
      paddingVertical: 2,
      maxWidth: '100%',
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      marginTop: 24,
      textAlign: 'center',
      color: brand.textMuted,
      fontWeight: '600',
      fontSize: 13,
    },
  });
}

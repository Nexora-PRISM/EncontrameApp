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
} from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { formatPetDate, petDescription, petPlace } from '@/features/pets/pet-share';
import type { PetsController } from '@/features/pets/pets.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import type { Pet } from '@/services/pets/pets.types';

type Props = {
  controller: PetsController;
  header?: ReactElement;
};

/** Cartões no mesmo padrão da lista de pessoas, com "Divulgar" e "Ligar para o tutor". */
export function PetsListSection({ controller, header }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <FlatList
      data={controller.pets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PetCard pet={item} controller={controller} brand={brand} styles={styles} />
      )}
      contentContainerStyle={styles.list}
      ListHeaderComponent={header}
      onRefresh={controller.refresh}
      refreshing={controller.refreshing}
      ListEmptyComponent={
        controller.loading ? (
          <ActivityIndicator color={brand.blue} style={styles.empty} />
        ) : controller.error ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('Não foi possível carregar os pets agora.')}</Text>
            <Pressable onPress={controller.refresh} style={styles.retry} accessibilityRole="button">
              <Text style={styles.retryText}>{t('Tentar de novo')}</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.emptyText}>{t('Nenhum pet desaparecido publicado.')}</Text>
        )
      }
    />
  );
}

function PetCard({
  pet,
  controller,
  brand,
  styles,
}: {
  pet: Pet;
  controller: PetsController;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const t = useT();
  const date = formatPetDate(pet.dtLastSeen);
  const place = petPlace(pet);
  const found = pet.status === 'encontrado';

  return (
    <View style={styles.card}>
      <View style={styles.photo}>
        {pet.photoUri ? (
          <Image source={{ uri: pet.photoUri }} style={styles.photoImage} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="paw" size={44} color={brand.avatarIcon} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {pet.name}
        </Text>
        <Text style={styles.meta} numberOfLines={2}>
          {petDescription(pet, t)}
        </Text>
        {place ? (
          <Text style={styles.meta} numberOfLines={2}>
            {place}
            {date ? t(' · visto em {date}', { date }) : ''}
          </Text>
        ) : null}
        {pet.marks ? (
          <Text style={styles.marks} numberOfLines={2}>
            {t('Sinais: {marks}', { marks: pet.marks })}
          </Text>
        ) : null}
        <View
          style={[
            styles.badge,
            { backgroundColor: found ? brand.statusEncontrado : brand.statusProcurando },
          ]}
        >
          <Text style={[styles.badgeText, { color: brand.onStatusBadge }]}>
            {found ? t('Encontrado') : t('Perdido')}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => controller.share(pet)}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel={t('Divulgar {name}', { name: pet.name })}
          >
            <MaterialCommunityIcons name="share-variant" size={18} color={brand.blue} />
            <Text style={styles.actionText}>{t('Divulgar')}</Text>
          </Pressable>
          {pet.contactPhone ? (
            <Pressable
              onPress={() => controller.callOwner(pet)}
              style={styles.action}
              accessibilityRole="button"
              accessibilityLabel={t('Ligar para o tutor de {name}', { name: pet.name })}
            >
              <MaterialCommunityIcons name="phone" size={18} color={brand.blue} />
              <Text style={styles.actionText}>{t('Ligar para o tutor')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    list: {
      gap: 12,
      paddingBottom: 96,
      flexGrow: 1,
    },
    card: {
      flexDirection: 'row',
      minHeight: 132,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: brand.cardInfo,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: brand.divider,
    },
    photo: {
      width: 104,
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
    },
    name: {
      color: brand.textDark,
      fontSize: 16,
      fontWeight: '800',
    },
    meta: {
      color: brand.textDark,
      fontSize: 13,
      fontWeight: '600',
    },
    marks: {
      color: brand.textMuted,
      fontSize: 13,
    },
    badge: {
      alignSelf: 'flex-start',
      marginTop: 2,
      borderRadius: Radius.pill,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 6,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minHeight: 40,
      paddingHorizontal: 12,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: brand.blue,
      backgroundColor: brand.surface,
    },
    actionText: {
      color: brand.blue,
      fontSize: 14,
      fontWeight: '700',
    },
    empty: {
      marginTop: 32,
    },
    emptyBox: {
      marginTop: 32,
      alignItems: 'center',
      gap: 12,
    },
    emptyText: {
      marginTop: 32,
      textAlign: 'center',
      color: brand.textMuted,
      fontWeight: '600',
    },
    retry: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: brand.blue,
    },
    retryText: {
      color: brand.blue,
      fontWeight: '700',
    },
  });
}

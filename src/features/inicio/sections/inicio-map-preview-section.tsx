import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandEnter } from '@/components/brand-enter';
import { PhotoRing } from '@/components/photo-ring';
import { Radius, type BrandColors } from '@/constants/brand';
import type { InicioController } from '@/features/inicio/inicio.controller';
import { useBrand, useBrandColorScheme } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';
import {
  categoryColor,
  categoryIcon,
  personCategory,
  personCategoryLabel,
} from '@/lib/person-category';
import { isPersonAlertStatus, resolvePersonStatusBadge } from '@/lib/person-status';
import {
  publishedAgo,
  safetyNoteCategoryInfo,
  safetyNotePeriodInfo,
} from '@/lib/safety-notes';
import type { Person } from '@/services/people/people.types';
import type { SafetyNote } from '@/services/safety-notes/safety-notes.types';

interface Props {
  controller: InicioController;
}

/**
 * Cartão flutuante sobre o mapa ao tocar num pin: resumo e ações, sem tirar a pessoa da tela.
 * Pessoa → "Ver detalhes". Aviso → tipo, horário, referência e "Continua assim" / "Não está mais assim".
 */
export function InicioMapPreviewSection({ controller }: Props) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const { selectedPerson, selectedNote } = controller;

  if (!selectedPerson && !selectedNote) return null;

  return (
    <BrandEnter
      key={selectedPerson?.id ?? selectedNote?.id}
      from="down"
      style={styles.anchor}
    >
      <View style={styles.card}>
        {selectedPerson ? (
          <PersonPreview person={selectedPerson} controller={controller} brand={brand} styles={styles} />
        ) : selectedNote ? (
          <NotePreview note={selectedNote} controller={controller} brand={brand} styles={styles} />
        ) : null}
      </View>
    </BrandEnter>
  );
}

function CloseButton({ controller, brand, styles }: PreviewProps) {
  const t = useT();
  return (
    <Pressable
      onPress={controller.clearSelection}
      hitSlop={10}
      style={styles.close}
      accessibilityRole="button"
      accessibilityLabel={t('Fechar')}
    >
      <MaterialCommunityIcons name="close" size={20} color={brand.textMuted} />
    </Pressable>
  );
}

type PreviewProps = { controller: InicioController; brand: BrandColors; styles: Styles };

function PersonPreview({ person, ...props }: PreviewProps & { person: Person }) {
  const t = useT();
  const colorScheme = useBrandColorScheme();
  const { controller, brand, styles } = props;
  const category = personCategory(person);
  const categoryLabel = personCategoryLabel(person);
  const accent = category ? categoryColor(brand, category) : brand.divider;
  const statusBadge = resolvePersonStatusBadge(
    brand,
    colorScheme,
    person.statusId,
    person.statusDescription,
  );
  const place = [person.neighborhood, person.city].filter(Boolean).join(', ') || person.lastSeen || '';
  const meta = [person.age != null ? t('{age} anos', { age: person.age }) : null, place]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <View style={styles.row}>
        <PhotoRing
          size={64}
          radius={16}
          urgent={isPersonAlertStatus(person.statusId, person.statusDescription)}
          color={accent}
        >
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name={categoryIcon(category)} size={30} color={brand.avatarIcon} />
          )}
        </PhotoRing>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {person.fullName}
          </Text>
          {meta ? (
            <Text style={styles.meta} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
          <View style={styles.tags}>
            {categoryLabel ? (
              <View style={[styles.tag, { backgroundColor: hexToRgba(accent, 0.14) }]}>
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
        <CloseButton {...props} />
      </View>
      <BrandButton
        label={t('Ver detalhes')}
        trailingIcon="arrow-right"
        onPress={() => controller.goToPerson(person.id)}
      />
      <Text style={styles.footnote}>{t('Na página da pessoa você pode avisar que a viu por perto.')}</Text>
    </>
  );
}

function NotePreview({ note, ...props }: PreviewProps & { note: SafetyNote }) {
  const t = useT();
  const { controller, brand, styles } = props;
  const info = safetyNoteCategoryInfo(note.category);
  const period = safetyNotePeriodInfo(note.period);
  const confirmed = note.myVote === 'confirm';
  const outdated = note.myVote === 'outdated';

  return (
    <>
      <View style={styles.row}>
        <View style={styles.noteIcon}>
          <MaterialCommunityIcons name={info.icon} size={28} color={brand.onSafetyNote} />
        </View>
        <View style={styles.info}>
          <Text style={styles.kicker}>{t('Aviso da comunidade')}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {t(info.label)}
          </Text>
          <View style={styles.tags}>
            <View style={[styles.tag, styles.periodTag]}>
              <MaterialCommunityIcons name="clock-outline" size={13} color={brand.textDark} />
              <Text style={[styles.tagText, { color: brand.textDark }]}>
                {period.hint ? `${t(period.label)} · ${period.hint}` : t(period.label)}
              </Text>
            </View>
          </View>
        </View>
        <CloseButton {...props} />
      </View>

      <View style={styles.placeRow}>
        <MaterialCommunityIcons name="map-marker-outline" size={18} color={brand.textMuted} />
        <Text style={styles.place}>{note.reference}</Text>
      </View>
      {note.note ? <Text style={styles.quote}>“{note.note}”</Text> : null}
      <Text style={styles.meta}>
        {publishedAgo(note.createdAt, t)} ·{' '}
        {t(note.confirmations === 1 ? '{count} confirmação' : '{count} confirmações', {
          count: note.confirmations,
        })}
      </Text>

      <View style={styles.actions}>
        <VoteButton
          icon="check-circle-outline"
          label={t('Continua assim')}
          active={confirmed}
          disabled={controller.votingSafetyNote}
          onPress={() => controller.voteSafetyNote('confirm')}
          brand={brand}
          styles={styles}
        />
        <VoteButton
          icon="close-circle-outline"
          label={t('Não está mais assim')}
          active={outdated}
          disabled={controller.votingSafetyNote}
          onPress={() => controller.voteSafetyNote('outdated')}
          brand={brand}
          styles={styles}
        />
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.footnote, styles.footnoteFlex]}>
          {t('Relato da comunidade, não verificado. Em perigo, use "Pedir ajuda".')}
        </Text>
        <Pressable
          onPress={controller.reportSafetyNote}
          hitSlop={8}
          style={styles.report}
          accessibilityRole="button"
          accessibilityLabel={t('Denunciar este aviso')}
        >
          <MaterialCommunityIcons name="flag-outline" size={16} color={brand.textMuted} />
          <Text style={styles.reportText}>{t('Denunciar')}</Text>
        </Pressable>
      </View>
    </>
  );
}

function VoteButton({
  icon,
  label,
  active,
  disabled,
  onPress,
  brand,
  styles,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
  brand: BrandColors;
  styles: Styles;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.vote,
        active && styles.voteActive,
        (pressed || disabled) && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={active ? brand.onPrimary : brand.blue} />
      <Text style={[styles.voteText, active && styles.voteTextActive]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

type Styles = ReturnType<typeof makeStyles>;

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    anchor: {
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 10,
      zIndex: 6,
      elevation: 14,
    },
    card: {
      gap: 10,
      padding: 14,
      borderRadius: Radius.xl,
      backgroundColor: brand.surface,
      shadowColor: brand.navyDeep,
      shadowOpacity: 0.28,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 14,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    info: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    kicker: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.safetyNoteText,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    meta: {
      fontSize: 14,
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
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.pill,
    },
    periodTag: {
      backgroundColor: brand.divider,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '800',
    },
    close: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.white,
    },
    noteIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.safetyNote,
    },
    placeRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    place: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: brand.textDark,
    },
    quote: {
      fontSize: 15,
      lineHeight: 21,
      fontStyle: 'italic',
      color: brand.textDark,
      paddingLeft: 10,
      borderLeftWidth: 3,
      borderLeftColor: hexToRgba(brand.safetyNote, 0.6),
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    vote: {
      flex: 1,
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 10,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      borderColor: brand.blue,
      backgroundColor: brand.surface,
    },
    voteActive: {
      backgroundColor: brand.blue,
    },
    voteText: {
      flexShrink: 1,
      fontSize: 14,
      fontWeight: '800',
      color: brand.blue,
      textAlign: 'center',
    },
    voteTextActive: {
      color: brand.onPrimary,
    },
    pressed: {
      opacity: 0.75,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    footnote: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    footnoteFlex: {
      flex: 1,
    },
    report: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minHeight: 36,
    },
    reportText: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.textMuted,
    },
  });
}

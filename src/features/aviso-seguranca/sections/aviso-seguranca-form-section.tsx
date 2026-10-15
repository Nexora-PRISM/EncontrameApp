import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { BrandMap, type MapPin } from '@/components/brand-map';
import { Radius, type BrandColors } from '@/constants/brand';
import type { AvisoSegurancaController } from '@/features/aviso-seguranca/aviso-seguranca.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { hexToRgba } from '@/lib/map-style';
import {
  SAFETY_NOTE_CATEGORIES,
  SAFETY_NOTE_PERIODS,
  SAFETY_NOTE_REFERENCE_MAX,
  SAFETY_NOTE_TEXT_MAX,
  SAFETY_NOTE_VALID_DAYS,
  safetyNoteCategoryInfo,
} from '@/lib/safety-notes';

type Props = { controller: AvisoSegurancaController };

/** Formulário em 4 passos curtos: onde, o quê, quando e referência — mais as regras e a declaração. */
export function AvisoSegurancaFormSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  const pins: MapPin[] = c.point
    ? [
        {
          id: 'novo-aviso',
          latitude: c.point.latitude,
          longitude: c.point.longitude,
          variant: 'note',
          icon: c.category ? safetyNoteCategoryInfo(c.category).icon : 'map-marker-alert-outline',
          draggable: true,
          emphasized: true,
          label: t('Local do aviso'),
        },
      ]
    : [];

  return (
    <View style={styles.wrap}>
      <View style={styles.intro}>
        <MaterialCommunityIcons name="shield-alert-outline" size={28} color={brand.safetyNote} />
        <View style={styles.introText}>
          <Text style={styles.introTitle}>{t('Ajude quem passa por aqui')}</Text>
          <Text style={styles.introBody}>
            {t('Avise sobre um lugar, não sobre pessoas. É um relato da comunidade e não substitui a polícia: em perigo, use "Pedir ajuda".')}
          </Text>
        </View>
      </View>

      <Step number={1} title={t('Onde?')} styles={styles}>
        <BrandMap
          pins={pins}
          showLocationFab={false}
          rounded
          onMapPress={c.choosePoint}
          onPinDragEnd={(_, latitude, longitude) => c.choosePoint(latitude, longitude)}
          style={styles.map}
        />
        <Text style={styles.hint}>
          {c.point ? t('Toque no mapa ou arraste o marcador para ajustar.') : t('Toque no mapa para marcar o lugar.')}
        </Text>
        <BrandButton
          label={t('Usar minha localização')}
          variant="outline"
          trailingIcon="crosshairs-gps"
          onPress={c.centerOnMyLocation}
        />
        {c.errors.point ? <Text style={styles.error}>{c.errors.point}</Text> : null}
      </Step>

      <Step number={2} title={t('O que acontece neste lugar?')} styles={styles}>
        <View style={styles.categoryGrid}>
          {SAFETY_NOTE_CATEGORIES.map((item) => {
            const selected = c.category === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => c.setCategory(item.value)}
                style={({ pressed }) => [
                  styles.category,
                  selected && styles.categorySelected,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${t(item.label)}. ${t(item.description)}`}
              >
                <View style={[styles.categoryIcon, selected && styles.categoryIconSelected]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={selected ? brand.onSafetyNote : brand.safetyNote}
                  />
                </View>
                <Text style={styles.categoryLabel}>{t(item.label)}</Text>
                <Text style={styles.categoryDescription}>{t(item.description)}</Text>
              </Pressable>
            );
          })}
        </View>
        {c.errors.category ? <Text style={styles.error}>{c.errors.category}</Text> : null}
      </Step>

      <Step number={3} title={t('Em que horário?')} styles={styles}>
        <View style={styles.periodRow}>
          {SAFETY_NOTE_PERIODS.map((item) => {
            const selected = c.period === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => c.setPeriod(item.value)}
                style={({ pressed }) => [
                  styles.period,
                  selected && styles.periodSelected,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={item.hint ? `${t(item.label)}, ${item.hint}` : t(item.label)}
              >
                <Text style={[styles.periodLabel, selected && styles.periodLabelSelected]}>
                  {t(item.label)}
                </Text>
                {item.hint ? (
                  <Text style={[styles.periodHint, selected && styles.periodLabelSelected]}>
                    {item.hint}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Step>

      <Step number={4} title={t('Referência do local')} styles={styles}>
        <BrandField
          label={t('Rua, praça ou ponto conhecido')}
          value={c.reference}
          onChangeText={c.setReference}
          placeholder={t('Ex.: Rua das Flores, perto da praça')}
          required
          maxLength={SAFETY_NOTE_REFERENCE_MAX}
          error={c.errors.reference}
        />
        <Text style={styles.fieldLabel}>{t('Observação (opcional)')}</Text>
        <TextInput
          value={c.note}
          onChangeText={c.setNote}
          placeholder={t('Ex.: Prefira a avenida depois das 20h.')}
          placeholderTextColor={brand.placeholder}
          multiline
          maxLength={SAFETY_NOTE_TEXT_MAX}
          style={[styles.textArea, c.errors.note ? styles.textAreaError : null]}
          accessibilityLabel={t('Observação (opcional)')}
        />
        <View style={styles.counterRow}>
          {c.errors.note ? <Text style={styles.error}>{c.errors.note}</Text> : <View />}
          <Text style={styles.counter}>
            {c.note.length}/{SAFETY_NOTE_TEXT_MAX}
          </Text>
        </View>
      </Step>

      <View style={styles.rules}>
        <Text style={styles.rulesTitle}>{t('Antes de publicar')}</Text>
        {[
          t('Fale do lugar, não de pessoas: sem nomes, placas, telefones ou aparência de ninguém.'),
          t('Seu nome não aparece no mapa, mas o aviso fica ligado à sua conta. Não é anônimo.'),
          t('O aviso some em {days} dias se ninguém confirmar. Quem passar por lá pode marcar "Não está mais assim".', {
            days: SAFETY_NOTE_VALID_DAYS,
          }),
          t('Avisos falsos, ofensivos ou preconceituosos violam as regras de uso e podem ser removidos.'),
        ].map((line) => (
          <View key={line} style={styles.ruleRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={18} color={brand.blue} />
            <Text style={styles.ruleText}>{line}</Text>
          </View>
        ))}
        <Pressable onPress={c.goToRules} hitSlop={8} accessibilityRole="link">
          <Text style={styles.rulesLink}>{t('Ler as regras de uso')}</Text>
        </Pressable>
      </View>

      <BrandCheckbox
        checked={c.declared}
        onToggle={c.toggleDeclared}
        error={c.errors.declaration}
        accessibilityLabel={t('Declaro que este aviso é verdadeiro, fala só do lugar e não cita pessoas.')}
      >
        {t('Declaro que este aviso é verdadeiro, fala só do lugar e não cita pessoas.')}
      </BrandCheckbox>

      <BrandButton
        label={t('Publicar aviso')}
        onPress={c.submit}
        loading={c.submitting}
        trailingIcon="send"
      />
    </View>
  );
}

function Step({
  number,
  title,
  styles,
  children,
}: {
  number: number;
  title: string;
  styles: ReturnType<typeof makeStyles>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepHead}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <Text style={styles.stepTitle} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  const soft = hexToRgba(brand.safetyNote, 0.12);
  return StyleSheet.create({
    wrap: {
      gap: 22,
      paddingTop: 12,
    },
    intro: {
      flexDirection: 'row',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: soft,
      borderWidth: 1,
      borderColor: hexToRgba(brand.safetyNote, 0.35),
    },
    introText: {
      flex: 1,
      gap: 4,
    },
    introTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: brand.textDark,
    },
    introBody: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textMuted,
    },
    step: {
      gap: 10,
    },
    stepHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    stepNumber: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.navy,
    },
    stepNumberText: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    stepTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    map: {
      height: 240,
    },
    hint: {
      fontSize: 14,
      color: brand.textMuted,
    },
    error: {
      fontSize: 14,
      fontWeight: '600',
      color: brand.error,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    category: {
      flexBasis: '47%',
      flexGrow: 1,
      gap: 6,
      padding: 12,
      borderRadius: Radius.lg,
      borderWidth: 1.5,
      borderColor: brand.fieldBorder,
      backgroundColor: brand.surface,
    },
    categorySelected: {
      borderColor: brand.safetyNote,
      borderWidth: 2.5,
      backgroundColor: soft,
    },
    pressed: {
      opacity: 0.85,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: soft,
    },
    categoryIconSelected: {
      backgroundColor: brand.safetyNote,
    },
    categoryLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.textDark,
    },
    categoryDescription: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    periodRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    period: {
      minHeight: 48,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      borderColor: brand.fieldBorder,
      backgroundColor: brand.surface,
      justifyContent: 'center',
    },
    periodSelected: {
      borderColor: brand.blue,
      backgroundColor: brand.blue,
    },
    periodLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.textDark,
    },
    periodHint: {
      fontSize: 12,
      color: brand.textMuted,
    },
    periodLabelSelected: {
      color: brand.onPrimary,
    },
    fieldLabel: {
      marginTop: 6,
      fontSize: 14,
      fontWeight: '600',
      color: brand.label,
    },
    textArea: {
      minHeight: 96,
      padding: 14,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
      backgroundColor: brand.fieldBackground,
      fontSize: 16,
      lineHeight: 22,
      color: brand.textDark,
      textAlignVertical: 'top',
    },
    textAreaError: {
      borderColor: brand.error,
    },
    counterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    },
    counter: {
      fontSize: 13,
      color: brand.textMuted,
    },
    rules: {
      gap: 8,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    rulesTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    ruleRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
    },
    ruleText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
    rulesLink: {
      marginTop: 2,
      fontSize: 15,
      fontWeight: '700',
      color: brand.blue,
    },
  });
}

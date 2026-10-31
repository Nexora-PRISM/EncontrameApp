import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { BrandSelect } from '@/components/brand-select';
import { FormRow } from '@/components/form-row';
import { Radius, type BrandColors } from '@/constants/brand';
import { BUILD_OPTIONS, ETHNICITY_OPTIONS } from '@/features/cadastrar-pessoa/cadastrar-pessoa.controller';
import type { FichaFormController } from '@/features/ficha/ficha-form.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: FichaFormController };

export function FichaFormSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const { form, errors } = c;

  if (c.loading) return <ActivityIndicator size="large" color={brand.orange} />;
  if (c.notFound) return <Text style={styles.muted}>{t('Ficha não encontrada neste aparelho.')}</Text>;

  return (
    <View style={styles.wrap}>
      {!c.isNew ? (
        <View style={styles.actions}>
          <BrandButton label={t('Mostrar para a polícia')} variant="blue" trailingIcon="card-account-details-outline" onPress={c.show} />
          <BrandButton label={t('Comunicar desaparecimento')} variant="orange" onPress={c.report} />
        </View>
      ) : null}

      <PhotoBlock
        title={t('Foto do rosto')}
        hint={t('Recente, de frente e nítida. Para crianças, atualize a cada 6 meses.')}
        preview={c.facePreview}
        onPick={c.pickFace}
        onRemove={c.removeFace}
        styles={styles}
        brand={brand}
      />
      {c.faceNeedsUpdate ? <Text style={styles.warn}>{t('Esta foto tem mais de 6 meses. Crianças mudam rápido: tire uma nova.')}</Text> : null}

      <BrandField label={t('Nome completo')} value={form.name} onChangeText={c.setName} autoCapitalize="words" required maxLength={c.limits.name} error={errors.name} />
      <FormRow>
        <BrandField label={t('Apelido')} value={form.nickname} onChangeText={c.setNickname} autoCapitalize="words" maxLength={c.limits.name} />
        <BrandField
          label={t('Data de nascimento')}
          value={form.birthDate}
          onChangeText={c.setBirthDate}
          placeholder="dd/mm/aaaa"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.birthDate}
        />
      </FormRow>
      {c.ageLabel ? <Text style={styles.muted}>{c.ageLabel}</Text> : null}
      <FormRow>
        <BrandField label={t('Altura (cm)')} value={form.heightCm} onChangeText={c.setHeightCm} keyboardType="number-pad" maxLength={3} />
        <BrandSelect label={t('Porte físico')} value={form.build} options={BUILD_OPTIONS} onSelect={c.setBuild} />
      </FormRow>
      <BrandSelect label={t('Cor/Etnia')} value={form.ethnicity} options={ETHNICITY_OPTIONS} onSelect={c.setEthnicity} />
      <FormRow>
        <BrandField label={t('Cabelo')} value={form.hair} onChangeText={c.setHair} maxLength={c.limits.text} />
        <BrandField label={t('Olhos')} value={form.eyes} onChangeText={c.setEyes} maxLength={c.limits.text} />
      </FormRow>
      <BrandField
        label={t('Sinais particulares')}
        value={form.marks}
        onChangeText={c.setMarks}
        placeholder={t('Pintas, cicatrizes, tatuagens, aparelho nos dentes…')}
        multiline
        maxLength={c.limits.text}
      />
      <View style={styles.sensitive}>
        <BrandField
          label={t('Saúde e comunicação')}
          value={form.healthNotes}
          onChangeText={c.setHealthNotes}
          placeholder={t('Ex.: tem Alzheimer e pode não saber o próprio nome; é autista e não fala; usa insulina.')}
          multiline
          maxLength={c.limits.health}
        />
        <Text style={styles.muted}>
          {t('Só aparece na ficha que você mostra à polícia. Nunca vai para o cadastro público.')}
        </Text>
      </View>
      <BrandField
        label={t('Telefone de quem cuida')}
        value={form.contactPhone}
        onChangeText={c.setContactPhone}
        placeholder="(31) 99999-9999"
        keyboardType="phone-pad"
        error={errors.contactPhone}
      />

      <View style={styles.dayBox}>
        <PhotoBlock
          title={t('Foto do dia (opcional)')}
          hint={t('Antes de um passeio, evento ou viagem, fotografe a roupa de hoje. A foto some sozinha em 24 horas.')}
          preview={c.dayPreview}
          onPick={c.pickDay}
          onRemove={c.removeDay}
          styles={styles}
          brand={brand}
        />
        {c.dayPreview ? (
          <>
            {c.dayUntil ? <Text style={styles.ok}>{t('Vale até {time}.', { time: c.dayUntil })}</Text> : null}
            <BrandField
              label={t('Roupa de hoje')}
              value={form.dayClothes}
              onChangeText={c.setDayClothes}
              placeholder={t('Ex.: camiseta amarela, bermuda jeans, tênis azul')}
              maxLength={c.limits.text}
            />
          </>
        ) : null}
      </View>

      <BrandButton label={c.isNew ? t('Salvar ficha') : t('Salvar alterações')} variant="blue" loading={c.saving} onPress={c.save} />
      {!c.isNew ? <BrandButton label={t('Apagar ficha')} variant="outline" onPress={c.remove} /> : null}
    </View>
  );
}

function PhotoBlock({
  title,
  hint,
  preview,
  onPick,
  onRemove,
  styles,
  brand,
}: {
  title: string;
  hint: string;
  preview: string;
  onPick: () => void;
  onRemove: () => void;
  styles: ReturnType<typeof makeStyles>;
  brand: BrandColors;
}) {
  const t = useT();
  return (
    <View style={styles.photoBlock}>
      <Text style={styles.label}>{title}</Text>
      {preview ? (
        <View style={styles.photoRow}>
          <Image source={{ uri: preview }} style={styles.photo} contentFit="cover" accessibilityLabel={title} />
          <View style={styles.photoActions}>
            <BrandButton label={t('Trocar foto')} variant="outline" onPress={onPick} />
            <BrandButton label={t('Remover foto')} variant="outline" onPress={onRemove} />
          </View>
        </View>
      ) : (
        <Pressable style={styles.photoEmpty} onPress={onPick} accessibilityRole="button" accessibilityLabel={title}>
          <MaterialCommunityIcons name="camera" size={26} color={brand.blue} />
          <Text style={styles.photoEmptyText}>{t('Adicionar foto')}</Text>
        </Pressable>
      )}
      <Text style={styles.muted}>{hint}</Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 16 },
    actions: { gap: 10 },
    label: { fontSize: 14, fontWeight: '700', color: brand.label },
    muted: { fontSize: 13, lineHeight: 18, color: brand.textMuted },
    ok: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.statusEncontrado },
    warn: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.orangeText },
    sensitive: { gap: 6 },
    photoBlock: { gap: 8 },
    photoRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 },
    photo: { width: 112, height: 112, borderRadius: Radius.md, backgroundColor: brand.avatarBackground },
    photoActions: { flexGrow: 1, minWidth: 160, gap: 8 },
    photoEmpty: {
      minHeight: 64,
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.md,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: brand.fieldBorder,
      backgroundColor: brand.fieldBackground,
    },
    photoEmptyText: { fontSize: 15, fontWeight: '700', color: brand.blue },
    dayBox: {
      gap: 10,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
  });
}

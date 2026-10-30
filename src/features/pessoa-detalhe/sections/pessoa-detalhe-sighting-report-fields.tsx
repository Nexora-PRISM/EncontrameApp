import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import type { PessoaDetalheController } from '@/features/pessoa-detalhe/pessoa-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SIGHTING_TEXT_LIMITS } from '@/lib/sighting-report-rules';
import { useWideLayout } from '@/lib/use-wide-layout';

type Props = { controller: PessoaDetalheController };

/** Topo do relato: qual caso é e o aviso de segurança (ver e avisar, nunca abordar). */
export function SightingReportIntro({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand, false), [brand]);
  const name = controller.person?.nickname ?? controller.person?.fullName ?? '';

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {t('Relato de avistamento')}
      </Text>
      <Text style={styles.caseLine}>{t('Caso: {name} · nº {id}', { name, id: controller.id })}</Text>
      <View style={styles.noteRow}>
        <MaterialCommunityIcons name="shield-alert-outline" size={22} color={brand.orangeText} />
        <Text style={styles.noteText}>
          {t('Se a pessoa parece estar em perigo agora, ligue 190 antes de preencher. Não aborde nem siga a pessoa.')}
        </Text>
      </View>
    </View>
  );
}

/** Ponto de referência, logo abaixo do mapa. */
export function SightingReportReferenceField({ controller }: Props) {
  const t = useT();
  const report = controller.report;
  return (
    <BrandField
      label={t('Ponto de referência')}
      value={report.reference}
      onChangeText={report.setReference}
      placeholder={t('Ex.: em frente à farmácia')}
      maxLength={SIGHTING_TEXT_LIMITS.shortMax}
      error={report.errors.reference}
    />
  );
}

/** Quando, o que viu, foto e informações complementares. */
export function SightingReportFields({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const { isWide } = useWideLayout();
  const styles = useMemo(() => makeStyles(brand, isWide), [brand, isWide]);
  const report = controller.report;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <BrandField
            label={t('Data')}
            value={report.seenDate}
            onChangeText={report.setSeenDate}
            placeholder={t('dd/mm/aaaa')}
            keyboardType="number-pad"
            maxLength={10}
            required
            error={report.errors.seenDate}
          />
        </View>
        <View style={styles.flex}>
          <BrandField
            label={t('Horário')}
            value={report.seenTime}
            onChangeText={report.setSeenTime}
            placeholder={t('hh:mm')}
            keyboardType="number-pad"
            maxLength={5}
            required
            error={report.errors.seenTime}
          />
        </View>
      </View>
      <Pressable
        onPress={report.toggleTimeIsApproximate}
        style={styles.checkRow}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: report.timeIsApproximate }}
      >
        <MaterialCommunityIcons
          name={report.timeIsApproximate ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={26}
          color={brand.blue}
        />
        <Text style={styles.checkLabel}>{t('O horário é aproximado')}</Text>
      </Pressable>

      <BrandField
        label={t('O que você viu?')}
        value={report.description}
        onChangeText={report.setDescription}
        placeholder={t('Ex.: estava sentada no ponto de ônibus e parecia confusa.')}
        maxLength={SIGHTING_TEXT_LIMITS.descriptionMax}
        multiline
        required
        error={report.errors.description}
      />
      <BrandField
        label={t('Roupa que a pessoa usava')}
        value={report.clothes}
        onChangeText={report.setClothes}
        placeholder={t('Ex.: casaco azul e calça jeans')}
        maxLength={SIGHTING_TEXT_LIMITS.shortMax}
        error={report.errors.clothes}
      />
      <BrandField
        label={t('Características visíveis')}
        value={report.features}
        onChangeText={report.setFeatures}
        placeholder={t('Ex.: cabelo preso, mochila vermelha')}
        maxLength={SIGHTING_TEXT_LIMITS.shortMax}
        error={report.errors.features}
      />
      <BrandField
        label={t('Para onde a pessoa seguia')}
        value={report.direction}
        onChangeText={report.setDirection}
        placeholder={t('Ex.: a pé, em direção ao centro')}
        maxLength={SIGHTING_TEXT_LIMITS.shortMax}
        error={report.errors.direction}
      />

      <View style={styles.photoBlock}>
        <Text style={styles.blockLabel}>{t('Foto (opcional)')}</Text>
        {report.photoUri ? (
          <View style={styles.photoRow}>
            <Image
              source={{ uri: report.photoUri }}
              style={styles.photo}
              accessibilityLabel={t('Foto anexada ao relato')}
            />
            <BrandButton label={t('Remover foto')} variant="outline" onPress={report.removePhoto} />
          </View>
        ) : (
          <BrandButton
            label={t('Adicionar foto')}
            variant="outline"
            trailingIcon="camera-outline"
            onPress={report.pickPhoto}
            containerStyle={isWide ? styles.actionSlot : undefined}
          />
        )}
        <Text style={styles.hint}>
          {t('A foto vai só para a equipe de análise e não é publicada. Não se aproxime nem se arrisque para fotografar.')}
        </Text>
      </View>

      <BrandField
        label={t('Informações complementares')}
        value={report.details}
        onChangeText={report.setDetails}
        placeholder={t('Algo mais que possa ajudar a análise')}
        maxLength={SIGHTING_TEXT_LIMITS.detailsMax}
        multiline
        error={report.errors.details}
      />

      <View style={styles.noteRow}>
        <MaterialCommunityIcons name="lock-outline" size={22} color={brand.textMuted} />
        <Text style={styles.noteMuted}>
          {t('Seu relato não é publicado. Ele fica ligado à sua conta e passa por análise antes de qualquer mudança no caso. O local exato não aparece para outras pessoas.')}
        </Text>
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors, isWide: boolean) {
  return StyleSheet.create({
    wrap: {
      gap: 16,
    },
    card: {
      gap: 8,
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    caseLine: {
      fontSize: 15,
      fontWeight: '600',
      color: brand.textMuted,
    },
    noteRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginTop: 4,
    },
    noteText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '600',
      color: brand.textDark,
    },
    noteMuted: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    flex: {
      flex: 1,
    },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 10,
      minHeight: 44,
    },
    checkLabel: {
      fontSize: 16,
      color: brand.textDark,
    },
    photoBlock: {
      gap: 10,
    },
    blockLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.label,
    },
    photoRow: {
      flexDirection: isWide ? 'row' : 'column',
      alignItems: isWide ? 'center' : 'stretch',
      gap: 12,
    },
    photo: {
      width: 120,
      height: 120,
      borderRadius: Radius.md,
      backgroundColor: brand.mapBackground,
    },
    actionSlot: {
      alignSelf: 'flex-start',
    },
    hint: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
  });
}

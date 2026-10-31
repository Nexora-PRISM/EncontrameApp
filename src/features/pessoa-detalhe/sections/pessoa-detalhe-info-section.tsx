import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { type BrandColors } from '@/constants/brand';
import type { PessoaDetalheController } from '@/features/pessoa-detalhe/pessoa-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

interface PessoaDetalheInfoSectionProps {
  controller: PessoaDetalheController;
}

export function PessoaDetalheInfoSection({ controller }: PessoaDetalheInfoSectionProps) {
  const t = useT();
  const brand = useBrand();
  const { isWide } = useWideLayout();
  const styles = useMemo(() => makeStyles(brand, isWide), [brand, isWide]);
  const { person } = controller;
  if (!person) {
    return null;
  }

  const lastWhen = formatLastSeenDate(person.dtLastSeen);

  const rows = [
    { label: t('Último local'), value: person.lastSeen || person.location },
    { label: t('Visto em'), value: lastWhen },
    { label: t('Altura'), value: person.heightCm ? `${person.heightCm} cm` : undefined },
    // Etnia e porte vêm das opções do cadastro (em português): traduzidos na tela.
    { label: t('Etnia'), value: person.ethnicity ? t(person.ethnicity) : undefined },
    { label: t('Porte físico'), value: person.build ? t(person.build) : undefined },
    { label: t('Roupas'), value: person.clothes },
    { label: t('Cabelo'), value: person.hair },
    { label: t('Olhos'), value: person.eyes },
    { label: t('Tatuagem'), value: person.tattoo },
    { label: t('Acessórios'), value: person.accessories },
  ].filter((row) => Boolean(row.value));

  return (
    <View style={styles.list}>
      {controller.isMinorCase ? (
        <View style={styles.minor} accessibilityRole="alert">
          <Text style={styles.minorTitle}>{t('Criança ou adolescente: prioridade')}</Text>
          <Text style={styles.minorText}>{t('Se você vir esta criança ou adolescente, ligue 190 e depois avise pelo app.')}</Text>
        </View>
      ) : null}
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
      {/* Botões em grupos curtos, com um título cada, para ficar fácil de achar (pensado também para idosos). */}
      <View style={styles.group}>
        <Text style={styles.groupTitle} accessibilityRole="header">
          {t('Saiba mais sobre o caso')}
        </Text>
        <View style={styles.actions}>
          {controller.isLocalPerson ? null : (
            <BrandButton
              label={t('Linha do tempo do caso')}
              variant="outline"
              trailingIcon="timeline-clock-outline"
              onPress={controller.openTimeline}
              containerStyle={isWide ? styles.actionSlot : styles.actionFull}
              style={isWide ? undefined : styles.actionFull}
            />
          )}
          <BrandButton
            label={t('Histórico de avistamentos')}
            variant="outline"
            trailingIcon="map-marker-path"
            onPress={controller.openHistory}
            containerStyle={isWide ? styles.actionSlot : styles.actionFull}
            style={isWide ? undefined : styles.actionFull}
          />
        </View>
      </View>
      {controller.isLocalPerson ? null : (
        <View style={styles.group}>
          <Text style={styles.groupTitle} accessibilityRole="header">
            {t('Ajude a divulgar')}
          </Text>
          <View style={styles.actions}>
            <BrandButton
              label={t('Divulgar este caso')}
              variant="outline"
              trailingIcon="share-variant-outline"
              onPress={controller.shareCase}
              containerStyle={isWide ? styles.actionSlot : styles.actionFull}
              style={isWide ? undefined : styles.actionFull}
            />
            {controller.canSuggestRegion ? (
              <BrandButton
                label={t('Sugerir onde divulgar')}
                variant="outline"
                trailingIcon="map-marker-plus-outline"
                onPress={controller.openRegionSuggestion}
                containerStyle={isWide ? styles.actionSlot : styles.actionFull}
                style={isWide ? undefined : styles.actionFull}
              />
            ) : null}
            <BrandButton
              label={t('Cartaz com QR Code')}
              variant="outline"
              trailingIcon="qrcode"
              onPress={controller.openPoster}
              containerStyle={isWide ? styles.actionSlot : styles.actionFull}
              style={isWide ? undefined : styles.actionFull}
            />
            {controller.canFollow ? (
              <BrandButton
                label={controller.following ? t('Acompanhando este caso') : t('Acompanhar este caso')}
                variant="outline"
                trailingIcon={controller.following ? 'bell-check-outline' : 'bell-outline'}
                loading={controller.followBusy}
                onPress={controller.toggleFollow}
                containerStyle={isWide ? styles.actionSlot : styles.actionFull}
                style={isWide ? undefined : styles.actionFull}
              />
            ) : null}
          </View>
        </View>
      )}
      {controller.canSendConfidential ? (
        <View style={styles.group}>
          <Text style={styles.groupTitle} accessibilityRole="header">
            {t('Informação sensível')}
          </Text>
          <View style={styles.actions}>
            <BrandButton
              label={t('Enviar informação confidencial')}
              variant="outline"
              trailingIcon="shield-lock-outline"
              onPress={controller.openConfidentialTip}
              containerStyle={isWide ? styles.actionSlot : styles.actionFull}
              style={isWide ? undefined : styles.actionFull}
            />
          </View>
        </View>
      ) : null}
      {controller.sightingBlockedMessage ? null : (
        <View style={styles.actions}>
          <BrandButton
            label={t('Vi essa pessoa por perto')}
            variant="orange"
            onPress={controller.openSightingForm}
            containerStyle={isWide ? styles.actionSlot : styles.actionFull}
            style={isWide ? undefined : styles.actionFull}
          />
        </View>
      )}
    </View>
  );
}

function formatLastSeenDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function makeStyles(brand: BrandColors, isWide: boolean) {
  return StyleSheet.create({
    list: {
      gap: 14,
    },
    actions: {
      flexDirection: isWide ? 'row' : 'column',
      flexWrap: isWide ? 'wrap' : 'nowrap',
      alignItems: isWide ? 'center' : 'stretch',
      alignSelf: 'stretch',
      gap: isWide ? 10 : 14,
    },
    actionFull: {
      width: '100%',
      alignSelf: 'stretch',
    },
    actionSlot: {
      alignSelf: 'flex-start',
      flexGrow: 0,
      flexShrink: 1,
      maxWidth: '100%',
    },
    group: {
      gap: 10,
      marginTop: 6,
    },
    minor: {
      gap: 4,
      padding: 14,
      borderRadius: 12,
      backgroundColor: brand.cream,
    },
    minorTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: brand.navy,
    },
    minorText: {
      fontSize: 15,
      lineHeight: 21,
      color: brand.navy,
    },
    groupTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: brand.textMuted,
    },
    row: {
      gap: 2,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: brand.label,
      textTransform: 'uppercase',
    },
    value: {
      fontSize: 16,
      color: brand.textDark,
    },
  });
}

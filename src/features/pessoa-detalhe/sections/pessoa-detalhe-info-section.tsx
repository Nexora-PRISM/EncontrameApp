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
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
      <View style={styles.actions}>
        <BrandButton
          label={t('Histórico de avistamentos')}
          variant="outline"
          onPress={controller.openHistory}
          containerStyle={isWide ? styles.actionSlot : styles.actionFull}
          style={isWide ? undefined : styles.actionFull}
        />
        {controller.isLocalPerson ? null : (
          <BrandButton
            label={t('Linha do tempo do caso')}
            variant="outline"
            onPress={controller.openTimeline}
            containerStyle={isWide ? styles.actionSlot : styles.actionFull}
            style={isWide ? undefined : styles.actionFull}
          />
        )}
        {controller.isLocalPerson ? null : (
          <BrandButton
            label={t('Divulgar este caso')}
            variant="outline"
            onPress={controller.shareCase}
            containerStyle={isWide ? styles.actionSlot : styles.actionFull}
            style={isWide ? undefined : styles.actionFull}
          />
        )}
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
        {controller.sightingBlockedMessage ? null : (
          <BrandButton
            label={t('Vi essa pessoa por perto')}
            variant="orange"
            onPress={controller.openSightingForm}
            containerStyle={isWide ? styles.actionSlot : styles.actionFull}
            style={isWide ? undefined : styles.actionFull}
          />
        )}
      </View>
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

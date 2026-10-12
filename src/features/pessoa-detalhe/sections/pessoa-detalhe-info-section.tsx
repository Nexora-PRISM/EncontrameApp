import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { type BrandColors } from '@/constants/brand';
import type { PessoaDetalheController } from '@/features/pessoa-detalhe/pessoa-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface PessoaDetalheInfoSectionProps {
  controller: PessoaDetalheController;
}

export function PessoaDetalheInfoSection({ controller }: PessoaDetalheInfoSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
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
      <BrandButton
        label={t('Histórico de avistamentos')}
        variant="outline"
        onPress={controller.openHistory}
      />
      {controller.isLocalPerson ? null : (
        <BrandButton label={t('Divulgar este caso')} variant="outline" onPress={controller.shareCase} />
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

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    list: {
      gap: 14,
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

import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandMap } from '@/components/brand-map';
import { Radius, type BrandColors } from '@/constants/brand';
import type { TrajetoDetalheController } from '@/features/trajeto-detalhe/trajeto-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: TrajetoDetalheController;
}

export function TrajetoDetalheSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (c.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  }

  if (!c.available) {
    return <Text style={styles.text}>{t('Compartilhar trajetos ainda não está disponível. Tente de novo mais tarde.')}</Text>;
  }

  if (c.notFound) {
    return (
      <Text style={styles.text}>
        {t('Este trajeto não está mais disponível: ele terminou ou vocês não estão mais no mesmo círculo.')}
      </Text>
    );
  }

  if (c.loadError || !c.trip) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.error}>{t('Não foi possível carregar.')}</Text>
        <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        {c.trip.destination
          ? t('{name} → {destination}', { name: c.trip.name, destination: c.trip.destination })
          : c.trip.name}
      </Text>
      <Text style={[styles.text, c.trip.overdue && styles.late]}>{c.statusText}</Text>
      {c.active ? (
        <>
          <BrandMap pins={c.pins} polylines={c.polylines} focus={c.focus} rounded style={styles.map} />
          <Text style={styles.hint}>{c.lastPointText}</Text>
          {c.trip.overdue ? (
            <View style={styles.box}>
              <Text style={styles.text}>
                {t('Passou do horário previsto. Tente falar com a pessoa. Se achar que ela corre perigo, ligue 190 — o app não avisa a polícia.')}
              </Text>
            </View>
          ) : null}
          <Text style={styles.hint}>{t('A tela atualiza sozinha a cada 30 segundos.')}</Text>
        </>
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    center: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    wrap: {
      gap: 14,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: brand.textDark,
    },
    map: {
      height: 300,
    },
    box: {
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    text: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textDark,
    },
    late: {
      color: brand.error,
      fontWeight: '700',
    },
    hint: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    error: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.error,
    },
  });
}

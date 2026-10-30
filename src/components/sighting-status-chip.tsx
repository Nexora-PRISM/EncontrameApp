import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SIGHTING_STATUS_META } from '@/lib/sighting-report';
import type { SightingStatus } from '@/lib/sighting-report-rules';

type Props = { status: SightingStatus };

/** Selo com a situação de um relato de avistamento (nunca em vermelho: vermelho é só do "Pedir ajuda"). */
export function SightingStatusChip({ status }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const meta = SIGHTING_STATUS_META[status];
  const color = statusColor(brand, status);
  const label = t(meta.label);

  return (
    <View
      style={[styles.chip, { borderColor: color }]}
      accessible
      accessibilityLabel={t('Situação: {status}', { status: label })}
    >
      <MaterialCommunityIcons name={meta.icon} size={16} color={color} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

function statusColor(brand: BrandColors, status: SightingStatus): string {
  switch (status) {
    case 'received':
      return brand.blue;
    case 'pending_review':
      return brand.orangeText;
    case 'in_review':
      return brand.statusProcurando;
    case 'relevant':
      return brand.categoryAdult;
    case 'not_confirmed':
      return brand.textMuted;
    case 'closed':
      return brand.statusCancelado;
  }
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      backgroundColor: brand.surface,
    },
    text: {
      fontSize: 13,
      fontWeight: '700',
    },
  });
}

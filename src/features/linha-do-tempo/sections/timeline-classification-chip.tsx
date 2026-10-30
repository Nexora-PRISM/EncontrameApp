import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { TIMELINE_CLASSIFICATION_META, timelineClassificationColor } from '@/lib/case-timeline';
import type { TimelineClassification } from '@/lib/case-timeline-rules';
import { useT } from '@/lib/i18n';

type Props = { classification: TimelineClassification };

/** Selo da classificação de uma informação da linha do tempo. */
export function TimelineClassificationChip({ classification }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const color = timelineClassificationColor(brand, classification);
  const label = t(TIMELINE_CLASSIFICATION_META[classification].label);

  return (
    <View
      style={[styles.chip, { borderColor: color }]}
      accessible
      accessibilityLabel={t('Classificação: {label}', { label })}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      backgroundColor: brand.surface,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    text: {
      fontSize: 13,
      fontWeight: '700',
    },
  });
}

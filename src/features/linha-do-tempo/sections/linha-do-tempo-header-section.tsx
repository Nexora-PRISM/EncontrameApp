import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import type { LinhaDoTempoController } from '@/features/linha-do-tempo/linha-do-tempo.controller';
import { TimelineClassificationChip } from '@/features/linha-do-tempo/sections/timeline-classification-chip';
import { useBrand } from '@/lib/brand-theme';
import { TIMELINE_CLASSIFICATION_META, TIMELINE_CLASSIFICATION_ORDER } from '@/lib/case-timeline';
import { useT } from '@/lib/i18n';

type Props = { controller: LinhaDoTempoController };

/** Qual é o caso, de onde vêm as informações e o que cada classificação quer dizer. */
export function LinhaDoTempoHeaderSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const name = controller.person?.nickname ?? controller.person?.fullName;
  const present = TIMELINE_CLASSIFICATION_ORDER.filter((key) => controller.counts[key] > 0);

  return (
    <View style={styles.wrap}>
      {name ? (
        <Text style={styles.caseLine}>
          {t('Caso: {name} · nº {id}', { name, id: controller.id })}
          {controller.person?.statusDescription ? ` · ${t(controller.person.statusDescription)}` : ''}
        </Text>
      ) : null}

      {controller.source ? (
        <View style={styles.sourceCard}>
          <MaterialCommunityIcons
            name={controller.source === 'api' ? 'shield-check-outline' : 'information-outline'}
            size={22}
            color={brand.blue}
          />
          <Text style={styles.sourceText}>
            {controller.source === 'api'
              ? t('Organizada pela equipe a partir do cadastro, dos relatos analisados e das mudanças de situação. Só aparece o que pode ser público.')
              : t('Montada com os dados do cadastro e os avistamentos informados. Os avistamentos ainda não passam por análise e não confirmam onde a pessoa está.')}
          </Text>
        </View>
      ) : null}

      {present.length > 0 ? (
        <View style={styles.legend}>
          {present.map((key) => (
            <View key={key} style={styles.legendRow}>
              <TimelineClassificationChip classification={key} />
              <Text style={styles.legendText}>{t(TIMELINE_CLASSIFICATION_META[key].description)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 14,
    },
    caseLine: {
      fontSize: 16,
      fontWeight: '700',
      color: brand.textDark,
    },
    sourceCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    sourceText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 21,
      color: brand.textDark,
    },
    legend: {
      gap: 10,
    },
    legendRow: {
      gap: 4,
    },
    legendText: {
      fontSize: 14,
      lineHeight: 19,
      color: brand.textMuted,
    },
  });
}

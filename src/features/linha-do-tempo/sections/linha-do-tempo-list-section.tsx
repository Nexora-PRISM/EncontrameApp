import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { LinhaDoTempoController } from '@/features/linha-do-tempo/linha-do-tempo.controller';
import { TimelineClassificationChip } from '@/features/linha-do-tempo/sections/timeline-classification-chip';
import { useBrand } from '@/lib/brand-theme';
import { TIMELINE_ACTOR_LABEL, TIMELINE_TYPE_META, timelineClassificationColor } from '@/lib/case-timeline';
import { useT } from '@/lib/i18n';

type Props = { controller: LinhaDoTempoController };

/** Os acontecimentos, do mais antigo para o mais recente, ligados por uma linha vertical. */
export function LinhaDoTempoListSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (controller.isLocal) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {t('Este cadastro ainda está só neste aparelho. A linha do tempo aparece depois que ele for enviado.')}
        </Text>
      </View>
    );
  }

  if (controller.loading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  }

  if (controller.error) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="cloud-off-outline" size={40} color={brand.textMuted} />
        <Text style={styles.emptyText}>{t('Não foi possível carregar a linha do tempo.')}</Text>
        <BrandButton
          label={t('Tentar de novo')}
          variant="outline"
          loading={controller.refreshing}
          onPress={controller.refresh}
        />
      </View>
    );
  }

  if (controller.events.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="timeline-clock-outline" size={40} color={brand.textMuted} />
        <Text style={styles.emptyText}>{t('Ainda não há acontecimentos registrados neste caso.')}</Text>
      </View>
    );
  }

  const lastIndex = controller.events.length - 1;

  return (
    <View>
      {controller.events.map((event, index) => {
        const meta = TIMELINE_TYPE_META[event.type];
        const color = timelineClassificationColor(brand, event.classification);
        const change = controller.statusChange(event);
        return (
          <View key={event.id} style={styles.item}>
            <View style={styles.rail}>
              <View style={[styles.node, { borderColor: color }]}>
                <MaterialCommunityIcons name={meta.icon} size={18} color={color} />
              </View>
              {index < lastIndex ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.card}>
              <Text style={styles.when}>{controller.formatWhen(event)}</Text>
              <Text style={styles.title} accessibilityRole="header">
                {t(meta.label)}
              </Text>
              <TimelineClassificationChip classification={event.classification} />
              {change ? <Text style={styles.detail}>{change}</Text> : null}
              {event.place ? <Text style={styles.detail}>{t('Local: {place}', { place: event.place })}</Text> : null}
              {event.note ? <Text style={styles.note}>“{event.note}”</Text> : null}
              {event.actor ? (
                <Text style={styles.actor}>{t('Por: {actor}', { actor: t(TIMELINE_ACTOR_LABEL[event.actor]) })}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
      <Text style={styles.footer}>
        {t('Avistamentos são informações da comunidade e não confirmam onde a pessoa está. Em urgência, ligue 190. A linha do tempo não substitui a investigação das autoridades.')}
      </Text>
    </View>
  );
}

const NODE = 36;

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    item: {
      flexDirection: 'row',
      gap: 12,
    },
    rail: {
      width: NODE,
      alignItems: 'center',
    },
    node: {
      width: NODE,
      height: NODE,
      borderRadius: NODE / 2,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.surface,
    },
    line: {
      flex: 1,
      width: 2,
      marginVertical: 4,
      backgroundColor: brand.divider,
    },
    card: {
      flex: 1,
      gap: 6,
      marginBottom: 16,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    when: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.textMuted,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: brand.textDark,
    },
    detail: {
      fontSize: 15,
      lineHeight: 21,
      color: brand.textDark,
    },
    note: {
      fontSize: 15,
      lineHeight: 21,
      fontStyle: 'italic',
      color: brand.textDark,
    },
    actor: {
      fontSize: 13,
      color: brand.textMuted,
    },
    footer: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    empty: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 40,
      paddingHorizontal: 8,
    },
    emptyText: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      color: brand.textMuted,
    },
  });
}

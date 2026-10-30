import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { SettingsRow } from '@/components/settings-list';
import { SightingStatusChip } from '@/components/sighting-status-chip';
import type { EquipeCasoController } from '@/features/equipe/equipe-caso.controller';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SIGHTING_STATUS_META } from '@/lib/sighting-report';
import type { SightingStatus } from '@/lib/sighting-report-rules';

const DECISIONS: SightingStatus[] = ['in_review', 'relevant', 'not_confirmed', 'closed'];

/** Relatos de avistamento aguardando a equipe. A localização exata fica só aqui, nunca no app público. */
export function EquipeCasoSightingsSection({ controller: c }: { controller: EquipeCasoController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Relatos para análise')}
      </Text>
      {!c.sightingsEnabled ? (
        <SettingsRow icon="eye-outline" label={t('Relatos para análise')} unavailable />
      ) : c.sightingsLoading ? (
        <ActivityIndicator color={brand.orange} />
      ) : c.sightings.length === 0 ? (
        <Text style={s.muted}>{t('Nenhum relato aguardando análise.')}</Text>
      ) : (
        c.sightings.map((report) => (
          <View key={report.reportId} style={s.card}>
            <Text style={s.cardTitle}>{t('Relato nº {id}', { id: report.reportId })}</Text>
            <SightingStatusChip status={report.status} />
            <Text style={s.text}>{report.description}</Text>
            {report.clothes ? <Text style={s.muted}>{t('Roupas: {value}', { value: report.clothes })}</Text> : null}
            {report.direction ? <Text style={s.muted}>{t('Direção: {value}', { value: report.direction })}</Text> : null}
            {report.place ? <Text style={s.muted}>{t('Local: {place}', { place: report.place })}</Text> : null}
            <Text style={s.muted}>
              {t('Visto em {date}', { date: c.formatDate(report.seenAt) })}
              {report.hasPhoto ? ` · ${t('com foto')}` : ''}
            </Text>
            <View style={s.row}>
              {DECISIONS.filter((status) => status !== report.status).map((status) => (
                <BrandButton
                  key={status}
                  label={t(SIGHTING_STATUS_META[status].label)}
                  variant="outline"
                  loading={c.busy}
                  onPress={() => c.decideSighting(report.reportId, status, t(SIGHTING_STATUS_META[status].label))}
                />
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

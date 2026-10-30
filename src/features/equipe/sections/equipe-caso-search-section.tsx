import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandMap } from '@/components/brand-map';
import { SettingsChoiceList, SettingsRow } from '@/components/settings-list';
import type { EquipeCasoController } from '@/features/equipe/equipe-caso.controller';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { CONNECTION_STATUS_LABEL, NODE_KIND_LABEL, nodeColor } from '@/lib/team-labels';

/** Acompanhamento da busca: números, teia no mapa, ampliação e pausa dos alertas. */
export function EquipeCasoSearchSection({ controller: c }: { controller: EquipeCasoController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const o = c.overview;

  if (!c.searchEnabled) {
    return (
      <View style={s.section}>
        <Text style={s.title} accessibilityRole="header">
          {t('Acompanhamento da busca')}
        </Text>
        <SettingsRow icon="map-marker-radius-outline" label={t('Acompanhamento da busca')} unavailable />
      </View>
    );
  }

  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Acompanhamento da busca')}
      </Text>
      {c.searchLoading ? (
        <ActivityIndicator color={brand.orange} />
      ) : c.searchError || !o ? (
        <Text style={s.muted}>{t('Não foi possível carregar o acompanhamento da busca.')}</Text>
      ) : (
        <>
          <View style={s.metrics}>
            <View style={s.metric}>
              <Text style={s.metricValue}>{c.levelLabel(o.level)}</Text>
              <Text style={s.metricLabel}>
                {o.radiusKm != null ? t('Alcance atual · {km} km', { km: o.radiusKm }) : t('Alcance atual')}
              </Text>
            </View>
            <View style={s.metric}>
              <Text style={s.metricValue}>{c.formatNumber(o.notificationsSent)}</Text>
              <Text style={s.metricLabel}>{t('Alertas enviados')}</Text>
            </View>
            <View style={s.metric}>
              <Text style={s.metricValue}>
                {o.notificationsDelivered == null ? '—' : c.formatNumber(o.notificationsDelivered)}
              </Text>
              <Text style={s.metricLabel}>
                {o.notificationsDelivered == null ? t('Entregues: não informado') : t('Alertas entregues')}
              </Text>
            </View>
            <View style={s.metric}>
              <Text style={s.metricValue}>{c.formatNumber(o.reportsReceived)}</Text>
              <Text style={s.metricLabel}>{t('Relatos recebidos')}</Text>
            </View>
          </View>
          <Text style={s.muted}>
            {t('Alertas enviados ou entregues não são pessoas mobilizadas: são só avisos que chegaram aos aparelhos.')}
          </Text>
          {o.paused ? <Text style={s.cardTitle}>{t('Alertas pausados')}</Text> : null}

          <Text style={s.cardTitle}>{t('Teia do caso')}</Text>
          <View style={s.map}>
            <BrandMap pins={c.networkPins} polylines={c.networkLines} rounded style={s.map} />
          </View>
          <View style={s.row}>
            {(['origin', 'region', 'report'] as const).map((kind) => (
              <View key={kind} style={[s.chip, { borderColor: nodeColor(brand, kind) }]}>
                <Text style={[s.chipText, { color: nodeColor(brand, kind) }]}>{t(NODE_KIND_LABEL[kind])}</Text>
              </View>
            ))}
          </View>
          <Text style={s.muted}>{t('Linha contínua: validada por uma pessoa. Tracejada: sugerida ou aguardando análise.')}</Text>
          {o.connections.map((link) => (
            <View key={link.id} style={s.card}>
              <View style={[s.chip, { borderColor: c.connectionColor(link.status) }]}>
                <Text style={[s.chipText, { color: c.connectionColor(link.status) }]}>
                  {t(CONNECTION_STATUS_LABEL[link.status])}
                </Text>
              </View>
              <Text style={s.text}>
                {(o.nodes.find((node) => node.id === link.from)?.label ?? link.from) +
                  ' → ' +
                  (o.nodes.find((node) => node.id === link.to)?.label ?? link.to)}
              </Text>
              {link.reason ? <Text style={s.muted}>{link.reason}</Text> : null}
            </View>
          ))}

          {o.activeRegions.length > 0 ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>{t('Regiões com mais atividade')}</Text>
              {o.activeRegions.map((region) => (
                <Text key={region.label} style={s.bullet}>
                  {t('{region}: {count} relatos', { region: region.label, count: region.reports })}
                </Text>
              ))}
            </View>
          ) : null}
          {o.lastUpdates.length > 0 ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>{t('Últimas atualizações')}</Text>
              {o.lastUpdates.map((item) => (
                <Text key={item.at + item.text} style={s.bullet}>
                  {c.formatDate(item.at)} · {item.text}
                </Text>
              ))}
            </View>
          ) : null}

          <Text style={s.cardTitle}>{t('Ampliar a busca')}</Text>
          {o.expansions.map((item) => (
            <Text key={item.id} style={s.muted}>
              {c.formatDate(item.createdAt)} · {c.levelLabel(item.from)} → {c.levelLabel(item.to)} · {item.justification}
            </Text>
          ))}
          {c.levels.length === 0 ? (
            <Text style={s.muted}>{t('A busca já está no alcance máximo.')}</Text>
          ) : (
            <>
              <SettingsChoiceList
                label={t('Novo alcance')}
                options={c.levels.map((level) => ({ value: level, label: c.levelLabel(level) }))}
                value={c.chosenLevel ?? c.levels[0]}
                onChange={c.setNextLevel}
              />
              <BrandButton label={t('Ampliar a busca')} variant="blue" loading={c.busy} onPress={c.expand} />
            </>
          )}
          <BrandButton
            label={o.paused ? t('Retomar os alertas') : t('Pausar os alertas')}
            variant="outline"
            loading={c.busy}
            onPress={c.togglePause}
          />
        </>
      )}
    </View>
  );
}

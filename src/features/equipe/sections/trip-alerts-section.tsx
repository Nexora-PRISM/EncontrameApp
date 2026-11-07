import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandMap } from '@/components/brand-map';
import { SettingsGroup, SettingsRow, SettingsSegmented } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import { JustificationField } from '@/features/equipe/sections/justification-field';
import type { TripAlertsController } from '@/features/equipe/trip-alerts.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import type { StaffTripAlert } from '@/services/trips/trips.types';

type Props = { controller: TripAlertsController };

export function TripAlertsSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.enabled) {
    return (
      <SettingsGroup title={t('Sinais de Alerta de trajeto')}>
        <SettingsRow icon="bell-alert-outline" label={t('Sinais de Alerta de trajeto')} unavailable />
      </SettingsGroup>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.lead}>
        {t('Um contato de confiança não conseguiu falar com a pessoa depois de um atraso ou da falta de sinal. Atraso não é desaparecimento: confira o histórico antes de decidir. Nada aqui é publicado.')}
      </Text>
      <SettingsSegmented label={t('Situação dos alertas')} options={c.filterOptions} value={c.closed ? 'closed' : 'open'} onChange={c.setClosed} />
      {!c.closed ? <JustificationField justification={c.justification} /> : null}
      {c.loading ? (
        <ActivityIndicator size="large" color={brand.orange} />
      ) : c.error ? (
        <View style={styles.card}>
          <Text style={styles.muted}>{t('Não foi possível carregar os alertas.')}</Text>
          <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
        </View>
      ) : c.alerts.length === 0 ? (
        <Text style={styles.muted}>{c.closed ? t('Nenhum alerta encerrado.') : t('Nenhum alerta aberto.')}</Text>
      ) : (
        c.alerts.map((alert) => <AlertCard key={alert.id} alert={alert} controller={c} styles={styles} />)
      )}
    </View>
  );
}

function AlertCard({ alert, controller: c, styles }: { alert: StaffTripAlert; controller: TripAlertsController; styles: ReturnType<typeof makeStyles> }) {
  const t = useT();
  const pins = c.mapPins(alert);
  const lines = c.mapLines(alert);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('Alerta nº {id}', { id: alert.id })} · {c.statusLabel(alert)}</Text>
      <Text style={styles.line}>{c.reasonLabel(alert)}</Text>
      {alert.trip ? (
        <>
          <Text style={styles.line}>
            {t('{name}: de {origin} para {destination}', { name: alert.trip.ownerName, origin: alert.trip.originLabel, destination: alert.trip.destinationLabel })}
          </Text>
          <Text style={styles.muted}>
            {t('Saída {start} · chegada prevista {arrival} · {phase}', {
              start: c.dateTime(alert.trip.startedAt),
              arrival: c.dateTime(alert.trip.expectedArrivalAt),
              phase: c.phaseLabel(alert),
            })}
          </Text>
          {alert.trip.watcherNames.length > 0 ? (
            <Text style={styles.muted}>{t('Acompanhando: {names}.', { names: alert.trip.watcherNames.join(', ') })}</Text>
          ) : null}
        </>
      ) : null}
      <Text style={styles.muted}>
        {alert.lastPoint
          ? t('Última localização registrada em {when}.', { when: c.dateTime(alert.lastPoint.recordedAt) })
          : t('Nenhuma localização registrada.')}
      </Text>
      {pins.length > 0 ? (
        <View style={styles.mapBox}>
          <BrandMap pins={pins} polylines={lines} rounded style={styles.map} />
        </View>
      ) : null}
      <Text style={styles.label}>{t('Acionado por {name} em {when}', { name: alert.raisedByName, when: c.dateTime(alert.raisedAt) })}</Text>
      <Text style={styles.quote}>{alert.contactAttempt}</Text>
      {alert.events.length > 1 ? (
        <View style={styles.events}>
          {alert.events.slice(1).map((event, index) => (
            <Text key={`${event.at}-${index}`} style={styles.muted}>
              {c.dateTime(event.at)} · {c.eventLabel(event.kind)}
              {event.name ? ` · ${event.name}` : ''}
              {event.note ? `: ${event.note}` : ''}
            </Text>
          ))}
        </View>
      ) : null}
      {alert.missingPersonId ? (
        <BrandButton label={t('Ver o cadastro nº {id}', { id: alert.missingPersonId })} variant="outline" onPress={() => c.openCase(alert.missingPersonId as string)} />
      ) : null}
      {c.isOpen(alert) ? (
        <View style={styles.row}>
          {alert.status === 'open' ? <BrandButton label={t('Em acompanhamento')} variant="outline" loading={c.busy} onPress={() => c.monitor(alert)} /> : null}
          <BrandButton label={t('Pessoa localizada')} variant="blue" loading={c.busy} onPress={() => c.found(alert)} />
          <BrandButton label={t('Sem fundamento')} variant="outline" loading={c.busy} onPress={() => c.unfounded(alert)} />
        </View>
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 14 },
    lead: { fontSize: 15, lineHeight: 22, color: brand.textDark },
    card: {
      gap: 6,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    title: { fontSize: 17, fontWeight: '800', color: brand.textDark },
    line: { fontSize: 15, color: brand.textDark },
    label: { fontSize: 14, fontWeight: '700', color: brand.label, marginTop: 4 },
    quote: { fontSize: 15, lineHeight: 22, fontStyle: 'italic', color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    events: { gap: 4, marginTop: 4 },
    mapBox: { borderRadius: Radius.md, overflow: 'hidden' },
    map: { height: 200 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  });
}

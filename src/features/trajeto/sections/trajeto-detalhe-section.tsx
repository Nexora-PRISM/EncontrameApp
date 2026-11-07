import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { BrandMap } from '@/components/brand-map';
import { SettingsGroup, SettingsRow, SettingsSegmented } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { TrajetoDetalheController } from '@/features/trajeto/trajeto-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: TrajetoDetalheController };
type Styles = ReturnType<typeof makeStyles>;

export function TrajetoDetalheSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.enabled) {
    return (
      <SettingsGroup title={t('Compartilhar meu trajeto')}>
        <SettingsRow icon="map-marker-path" label={t('Compartilhar meu trajeto')} unavailable />
      </SettingsGroup>
    );
  }
  if (c.loading) return <ActivityIndicator size="large" color={brand.orange} />;
  if (c.notFound) {
    return (
      <Text style={styles.text}>
        {t('Este trajeto não está disponível para você. Ele pode ter terminado, ou o vínculo de confiança foi desfeito.')}
      </Text>
    );
  }
  if (c.error || !c.trip) {
    return (
      <View style={styles.block}>
        <Text style={styles.text}>{t('Não foi possível carregar o trajeto. Confira sua conexão.')}</Text>
        <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
      </View>
    );
  }

  const trip = c.trip;
  return (
    <View style={styles.wrap}>
      <View style={styles.summary} accessible accessibilityRole="summary">
        <Text style={styles.title}>
          {c.isOwner ? t('Seu trajeto para {place}', { place: trip.destinationLabel }) : t('Trajeto de {name} para {place}', { name: trip.ownerName, place: trip.destinationLabel })}
        </Text>
        <Text style={styles.phase}>{c.phaseLabel}</Text>
        <Text style={styles.text}>{c.timing}</Text>
        <Text style={styles.muted}>{t('Saída: {place}', { place: trip.originLabel })}</Text>
      </View>

      {c.alertOpen ? <AlertBanner controller={c} styles={styles} /> : null}

      {trip.locationVisible && (c.pins.length > 0 || c.polylines.length > 0) ? (
        <View style={styles.mapBox}>
          <BrandMap pins={c.pins} polylines={c.polylines} rounded style={styles.map} />
        </View>
      ) : null}
      <Text style={c.signalStale ? styles.warn : styles.muted}>{c.lastUpdate}</Text>
      {c.signalStale && !c.isOwner && trip.status === 'active' ? (
        <Text style={styles.warn}>
          {t('Sem atualização recente. Pode ser bateria, internet ou o celular desligado: tente falar com {name}.', { name: trip.ownerName })}
        </Text>
      ) : null}

      {c.isOwner ? <OwnerBlock controller={c} styles={styles} /> : <WatcherBlock controller={c} styles={styles} />}

      {c.events.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.heading} accessibilityRole="header">
            {t('Histórico do Sinal de Alerta')}
          </Text>
          {c.events.map((event) => (
            <View key={event.key} style={styles.event}>
              <Text style={styles.eventLabel}>{event.label}</Text>
              <Text style={styles.muted}>
                {event.when}
                {event.who ? ` · ${event.who}` : ''}
              </Text>
              {event.note ? <Text style={styles.text}>{event.note}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AlertBanner({ controller: c, styles }: { controller: TrajetoDetalheController; styles: Styles }) {
  const t = useT();
  const brand = useBrand();
  const alert = c.trip?.alert;
  if (!alert) return null;
  return (
    <View style={styles.alertBox} accessible accessibilityRole="alert">
      <View style={styles.row}>
        <MaterialCommunityIcons name="bell-alert-outline" size={22} color={brand.orangeText} />
        <Text style={styles.alertTitle}>{c.alertStatusLabel}</Text>
      </View>
      <Text style={styles.text}>{c.alertReasonLabel}</Text>
      <Text style={styles.muted}>
        {t('Acionado por {name} em {when}', { name: alert.raisedByName, when: c.format.dateTime(alert.raisedAt) })}
      </Text>
      {c.isOwner ? (
        <>
          <Text style={styles.text}>{t('Seus contatos não conseguiram falar com você. Se está tudo bem, avise agora.')}</Text>
          <BrandButton label={t('Estou bem')} variant="blue" loading={c.busy} onPress={c.ownerOk} />
        </>
      ) : null}
    </View>
  );
}

function OwnerBlock({ controller: c, styles }: { controller: TrajetoDetalheController; styles: Styles }) {
  const t = useT();
  const trip = c.trip;
  if (!trip) return null;
  const active = trip.status === 'active';
  return (
    <View style={styles.block}>
      {trip.watcherNames && trip.watcherNames.length > 0 ? (
        <Text style={styles.muted}>{t('Acompanhando: {names}.', { names: trip.watcherNames.join(', ') })}</Text>
      ) : null}

      {active ? (
        <>
          <TrackingStatus controller={c} styles={styles} />
          <BrandButton label={t('Sim, cheguei em segurança')} variant="blue" trailingIcon="check-circle-outline" loading={c.busy} onPress={c.arrived} />
          <BrandButton label={t('Ainda estou em deslocamento (+15 min)')} variant="outline" loading={c.busy} onPress={c.extend} />
          {c.editing ? (
            <View style={styles.editBox}>
              <BrandField label={t('Novo destino')} value={c.newDestination} onChangeText={c.setNewDestination} error={c.destinationProblem} />
              <Text style={styles.label}>{t('Nova previsão de chegada, a partir de agora')}</Text>
              <SettingsSegmented label={t('Nova previsão de chegada, a partir de agora')} options={c.newArrivalOptions} value={c.newArrival} onChange={c.setNewArrival} />
              <BrandButton label={t('Salvar mudança')} variant="blue" loading={c.busy} onPress={c.saveDestination} />
              <BrandButton label={t('Cancelar')} variant="outline" onPress={c.stopEditing} />
            </View>
          ) : (
            <BrandButton label={t('Mudar destino ou horário')} variant="outline" onPress={c.startEditing} />
          )}
          <BrandButton label={t('Encerrar compartilhamento')} variant="outline" loading={c.busy} onPress={c.cancel} />
        </>
      ) : (
        <Text style={styles.text}>{t('Este compartilhamento terminou. Seus contatos não veem mais sua localização.')}</Text>
      )}
    </View>
  );
}

function TrackingStatus({ controller: c, styles }: { controller: TrajetoDetalheController; styles: Styles }) {
  const t = useT();
  if (!c.sendingFromThisDevice) {
    return (
      <View style={styles.block}>
        <Text style={styles.warn}>{t('Este aparelho não está enviando sua localização para este trajeto.')}</Text>
        <BrandButton label={t('Enviar a localização deste aparelho')} variant="outline" trailingIcon="crosshairs-gps" loading={c.busy} onPress={c.startHere} />
      </View>
    );
  }
  if (c.tracking === 'background') {
    return <Text style={styles.muted}>{t('Enviando sua localização, inclusive com a tela desligada (aviso fixo na barra do celular).')}</Text>;
  }
  if (c.tracking === 'foreground') {
    return (
      <View style={styles.block}>
        <Text style={styles.warn}>
          {t('Enviando sua localização só com o app aberto. Com a tela desligada, seus contatos podem ver "sem atualização recente".')}
        </Text>
        {c.backgroundAvailable ? (
          <BrandButton label={t('Enviar também com a tela desligada')} variant="outline" loading={c.busy} onPress={c.enableBackground} />
        ) : null}
      </View>
    );
  }
  return (
    <View style={styles.block}>
      <Text style={styles.warn}>{t('Sem permissão de localização: seus contatos só veem o horário previsto e os avisos.')}</Text>
      <BrandButton label={t('Permitir localização')} variant="outline" loading={c.busy} onPress={c.startHere} />
    </View>
  );
}

function WatcherBlock({ controller: c, styles }: { controller: TrajetoDetalheController; styles: Styles }) {
  const t = useT();
  const trip = c.trip;
  if (!trip) return null;
  return (
    <View style={styles.block}>
      {c.otherWatchersLabel ? <Text style={styles.muted}>{c.otherWatchersLabel}</Text> : null}
      {trip.lastPoint ? <BrandButton label={t('Abrir a última localização no mapa')} variant="outline" trailingIcon="map-outline" onPress={c.openInMaps} /> : null}

      {c.alertOpen ? (
        <>
          <Text style={styles.text}>
            {t('A equipe do Encontra-me está com o alerta. Se você conseguir falar com {name}, ou se a pessoa for localizada, avise aqui.', { name: trip.ownerName })}
          </Text>
          <BrandButton label={t('A pessoa foi localizada')} variant="blue" loading={c.busy} onPress={c.markFound} />
          {trip.alert?.missingPersonId ? (
            <Text style={styles.muted}>{t('Cadastro de desaparecimento nº {id} ligado a este alerta.', { id: trip.alert.missingPersonId })}</Text>
          ) : (
            <>
              <Text style={styles.muted}>
                {t('Se for preciso, faça o cadastro de desaparecimento. Ele passa pela análise da equipe antes de aparecer no app.')}
              </Text>
              <BrandButton label={t('Comunicar desaparecimento')} variant="outline" onPress={c.registerCase} />
            </>
          )}
          <BrandButton label={t('Ligar 190')} variant="outline" trailingIcon="phone" onPress={c.call190} />
        </>
      ) : c.trip?.canRaiseAlert ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>{c.canRaiseReasonLabel}</Text>
          <Text style={styles.text}>
            {t('Tente falar com {name} primeiro. Se não conseguir, acione o Sinal de Alerta: a equipe do Encontra-me recebe a última localização e o horário para analisar.', { name: trip.ownerName })}
          </Text>
          <BrandButton label={t('Acionar sinal de alerta')} variant="blue" trailingIcon="bell-alert-outline" onPress={c.goToAlert} />
          <BrandButton label={t('Ligar 190')} variant="outline" trailingIcon="phone" onPress={c.call190} />
        </View>
      ) : trip.status === 'active' ? (
        <Text style={styles.muted}>
          {t('O Sinal de Alerta fica disponível se passar do horário com a tolerância sem confirmação, ou se a localização parar de atualizar.')}
        </Text>
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 16 },
    block: { gap: 10 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    summary: {
      gap: 4,
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    title: { fontSize: 19, fontWeight: '900', color: brand.textDark },
    phase: { fontSize: 16, fontWeight: '800', color: brand.navy },
    heading: { fontSize: 17, fontWeight: '900', color: brand.textDark },
    label: { fontSize: 14, fontWeight: '700', color: brand.label },
    text: { fontSize: 15, lineHeight: 22, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    warn: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.orangeText },
    mapBox: { borderRadius: Radius.lg, overflow: 'hidden' },
    map: { height: 240 },
    alertBox: {
      gap: 8,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.attentionSoft,
      borderWidth: 1,
      borderColor: brand.attentionBorder,
    },
    alertTitle: { flex: 1, fontSize: 16, fontWeight: '900', color: brand.textDark },
    editBox: { gap: 10, padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: brand.divider },
    event: { gap: 2, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: brand.divider },
    eventLabel: { fontSize: 15, fontWeight: '800', color: brand.textDark },
  });
}

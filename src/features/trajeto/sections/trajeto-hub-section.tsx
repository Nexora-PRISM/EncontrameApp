import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { TrajetoController } from '@/features/trajeto/trajeto.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { TRIP_ALERT_STATUS_LABEL, TRIP_PHASE_LABEL } from '@/lib/trip-labels';
import type { TripWatchingItem } from '@/services/trips/trips.types';

type Props = { controller: TrajetoController };

export function TrajetoHubSection({ controller: c }: Props) {
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

  return (
    <View style={styles.wrap}>
      <View style={styles.notice} accessible accessibilityRole="summary">
        <MaterialCommunityIcons name="shield-account-outline" size={24} color={brand.blue} />
        <Text style={styles.noticeText}>
          {t('Você escolhe quem acompanha, por quanto tempo, e pode encerrar quando quiser. Ninguém começa a acompanhar você sozinho, e sua localização nunca aparece para o público.')}
        </Text>
      </View>

      {c.loading ? <ActivityIndicator size="large" color={brand.orange} /> : null}
      {c.error ? (
        <View style={styles.block}>
          <Text style={styles.muted}>{t('Não foi possível carregar os trajetos. Confira sua conexão.')}</Text>
          <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
        </View>
      ) : null}

      <Text style={styles.heading} accessibilityRole="header">
        {t('Meus trajetos ativos')}
      </Text>
      {c.activeTrip ? (
        <Pressable
          style={styles.card}
          onPress={() => c.activeTrip && c.openTrip(c.activeTrip.id)}
          accessibilityRole="button"
          accessibilityLabel={t('Abrir meu trajeto para {place}', { place: c.activeTrip.destinationLabel })}
        >
          <View style={styles.cardTop}>
            <MaterialCommunityIcons name="map-marker-path" size={22} color={brand.blue} />
            <Text style={styles.cardTitle}>{t('Para {place}', { place: c.activeTrip.destinationLabel })}</Text>
          </View>
          <Text style={styles.line}>{t(TRIP_PHASE_LABEL[c.activeTrip.phase])}</Text>
          <Text style={styles.muted}>
            {t('Chegada prevista às {clock} · {count} acompanhando', {
              clock: c.format.clock(c.activeTrip.expectedArrivalAt),
              count: c.activeTrip.watchersCount,
            })}
          </Text>
          <Text style={c.tracking === 'none' ? styles.warn : styles.muted}>
            {c.tracking === 'background'
              ? t('Este aparelho envia sua localização, inclusive com a tela desligada.')
              : c.tracking === 'foreground'
                ? t('Este aparelho envia sua localização com o app aberto.')
                : t('Este aparelho não está enviando sua localização. Abra o trajeto para resolver.')}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.block}>
          <Text style={styles.muted}>{t('Nenhum trajeto sendo compartilhado agora.')}</Text>
          <BrandButton label={t('Compartilhar trajeto')} variant="blue" trailingIcon="map-marker-path" onPress={c.startNew} />
        </View>
      )}

      {c.attention.length > 0 ? (
        <>
          <Text style={styles.heading} accessibilityRole="header">
            {t('Alertas de não chegada')}
          </Text>
          {c.attention.map((item) => (
            <WatchingCard key={item.id} item={item} controller={c} styles={styles} attention />
          ))}
        </>
      ) : null}

      <Text style={styles.heading} accessibilityRole="header">
        {t('Pessoas compartilhando comigo')}
      </Text>
      {c.calm.length === 0 && c.attention.length === 0 ? (
        <Text style={styles.muted}>
          {t('Quando alguém que confia em você compartilhar um trajeto, ele aparece aqui. Você só acompanha quem enviou um convite e foi aceito por você.')}
        </Text>
      ) : (
        c.calm.map((item) => <WatchingCard key={item.id} item={item} controller={c} styles={styles} />)
      )}

      <SettingsGroup title={t('Contatos e convites')}>
        <SettingsRow
          icon="account-heart-outline"
          label={t('Quem acompanha meus trajetos')}
          value={c.watchersCount == null ? undefined : String(c.watchersCount)}
          onPress={c.goToContacts}
        />
        <SettingsRow
          icon="account-eye-outline"
          label={t('Quem compartilha comigo')}
          value={c.sharingWithMeCount == null ? undefined : String(c.sharingWithMeCount)}
          onPress={c.goToContacts}
        />
        <SettingsRow
          icon="timer-sand"
          label={t('Chegada segura (só lembrete)')}
          description={t('O app só pergunta se você chegou, sem enviar sua localização a ninguém.')}
          onPress={c.goToSafeArrival}
        />
      </SettingsGroup>

      {c.history.length > 0 ? (
        <SettingsGroup title={t('Trajetos recentes')}>
          {c.history.map((trip) => (
            <SettingsRow
              key={trip.id}
              icon="history"
              label={t('Para {place}', { place: trip.destinationLabel })}
              description={`${t(TRIP_PHASE_LABEL[trip.phase])} · ${c.format.dateTime(trip.startedAt)}`}
              onPress={() => c.openTrip(trip.id)}
            />
          ))}
        </SettingsGroup>
      ) : null}
    </View>
  );
}

function WatchingCard({
  item,
  controller: c,
  styles,
  attention = false,
}: {
  item: TripWatchingItem;
  controller: TrajetoController;
  styles: ReturnType<typeof makeStyles>;
  attention?: boolean;
}) {
  const t = useT();
  const brand = useBrand();
  return (
    <Pressable
      style={[styles.card, attention && styles.cardAttention]}
      onPress={() => c.openTrip(item.id)}
      accessibilityRole="button"
      accessibilityLabel={t('Abrir o trajeto de {name}', { name: item.ownerName })}
    >
      <View style={styles.cardTop}>
        <MaterialCommunityIcons name={attention ? 'clock-alert-outline' : 'account-arrow-right-outline'} size={22} color={attention ? brand.orangeText : brand.blue} />
        <Text style={styles.cardTitle}>{item.ownerName}</Text>
      </View>
      <Text style={styles.line}>
        {t('Para {place}', { place: item.destinationLabel })} · {t(TRIP_PHASE_LABEL[item.phase])}
      </Text>
      <Text style={styles.muted}>
        {item.lastPointAt
          ? t('Última localização {ago}', { ago: c.format.ago(item.lastPointAt, c.now) })
          : t('Sem localização recebida')}
        {item.signal === 'stale' ? ` · ${t('sem atualização recente')}` : ''}
      </Text>
      {item.alertStatus ? <Text style={styles.warn}>{t(TRIP_ALERT_STATUS_LABEL[item.alertStatus])}</Text> : null}
    </Pressable>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 14 },
    notice: {
      flexDirection: 'row',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    noticeText: { flex: 1, fontSize: 14, lineHeight: 20, color: brand.textMuted },
    heading: { fontSize: 18, fontWeight: '900', color: brand.textDark, marginTop: 6 },
    block: { gap: 10 },
    card: {
      gap: 4,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    cardAttention: { borderColor: brand.attentionBorder, backgroundColor: brand.attentionSoft },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: brand.textDark },
    line: { fontSize: 15, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    warn: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.orangeText },
  });
}

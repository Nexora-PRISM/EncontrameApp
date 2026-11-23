import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { BrandMap } from '@/components/brand-map';
import { Radius, type BrandColors } from '@/constants/brand';
import type { TrajetoController } from '@/features/trajeto/trajeto.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: TrajetoController;
}

export function TrajetoSection({ controller: c }: Props) {
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

  if (c.loadError) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.error}>{t('Não foi possível carregar.')}</Text>
        <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {c.myTrip ? (
        <View style={styles.wrap}>
          <View style={styles.statusRow}>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>{t('Compartilhando com o seu círculo')}</Text>
          </View>
          {c.myTrip.destination ? (
            <Text style={styles.title}>{t('Indo para {destination}', { destination: c.myTrip.destination })}</Text>
          ) : null}
          <Text style={styles.text}>{c.myArrival}</Text>
          <BrandMap
            pins={c.myTrip.pins}
            polylines={c.myTrip.polylines}
            userLocation={c.userLocation}
            focus={c.myTrip.focus}
            rounded
            style={styles.map}
          />
          {c.locationDenied ? (
            <Text style={styles.warn}>
              {t('Sem permissão de localização: o círculo vê só o horário previsto. Libere a localização nos ajustes do aparelho.')}
            </Text>
          ) : c.locationUnavailable ? (
            <Pressable onPress={c.retryLocation} accessibilityRole="button">
              <Text style={styles.warn}>{t('O GPS não respondeu. Tocar para tentar de novo.')}</Text>
            </Pressable>
          ) : c.sendFailing ? (
            <Text style={styles.warn}>{t('Sem conexão: os pontos vão quando a internet voltar.')}</Text>
          ) : c.lastSentLabel ? (
            <Text style={styles.hint}>{c.lastSentLabel}</Text>
          ) : null}
          <View style={styles.box}>
            <Text style={styles.hint}>
              {t('Mantenha esta tela aberta: com o app fechado ou em segundo plano a posição para de ser enviada. Se passar do horário previsto, o círculo recebe um aviso.')}
            </Text>
          </View>
          <BrandButton label={t('Cheguei')} variant="orange" loading={c.ending} onPress={c.arrive} />
          <BrandButton label={t('Parar de compartilhar')} variant="outline" disabled={c.ending} onPress={c.stop} />
        </View>
      ) : !c.hasCircle ? (
        <View style={styles.wrap}>
          <Text style={styles.text}>
            {t('Para compartilhar um trajeto, primeiro chame alguém de confiança para o seu círculo familiar.')}
          </Text>
          <BrandButton label={t('Abrir o círculo familiar')} variant="orange" onPress={c.goToCircle} />
        </View>
      ) : (
        <View style={styles.wrap}>
          <Text style={styles.text}>
            {t('Seu círculo acompanha o caminho até você chegar. Você liga e desliga; quando termina, o caminho é apagado.')}
          </Text>
          <BrandField
            label={t('Para onde você vai? (opcional)')}
            value={c.destination}
            onChangeText={c.setDestination}
            placeholder={t('Ex.: casa, escola, trabalho')}
            maxLength={120}
          />
          <Text style={styles.label}>{t('Em quanto tempo você chega?')}</Text>
          <View style={styles.chips}>
            {c.durationOptions.map((option) => (
              <Pressable
                key={option.minutes}
                onPress={option.select}
                style={[styles.chip, option.selected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: option.selected }}
              >
                <Text style={[styles.chipText, option.selected && styles.chipTextSelected]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          {c.formError ? <Text style={styles.error}>{c.formError}</Text> : null}
          <BrandButton label={t('Começar a compartilhar')} variant="orange" loading={c.starting} onPress={c.start} />
        </View>
      )}

      <Text style={styles.heading}>{t('Trajetos do seu círculo')}</Text>
      {c.circleTrips.length === 0 ? (
        <Text style={styles.hint}>{t('Ninguém do seu círculo está compartilhando um trajeto agora.')}</Text>
      ) : (
        <View style={styles.card}>
          {c.circleTrips.map((trip, index) => (
            <Pressable
              key={trip.id}
              onPress={trip.open}
              style={[styles.row, index > 0 && styles.rowDivider]}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name={trip.overdue ? 'clock-alert-outline' : 'map-marker-path'}
                size={24}
                color={trip.overdue ? brand.error : brand.blue}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>
                  {trip.destination
                    ? t('{name} → {destination}', { name: trip.name, destination: trip.destination })
                    : trip.name}
                </Text>
                <Text style={[styles.rowSubtitle, trip.overdue && styles.rowLate]}>{trip.arrival}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={brand.textMuted} />
            </Pressable>
          ))}
        </View>
      )}
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
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    liveDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: brand.blue,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.blue,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: brand.textDark,
    },
    map: {
      height: 260,
    },
    box: {
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: brand.textDark,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: brand.orange,
      backgroundColor: brand.surface,
    },
    chipSelected: {
      backgroundColor: brand.orange,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: brand.textDark,
    },
    chipTextSelected: {
      color: brand.onPrimary,
    },
    heading: {
      marginTop: 12,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.textMuted,
    },
    card: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: brand.divider,
    },
    rowText: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: brand.textDark,
    },
    rowSubtitle: {
      fontSize: 13,
      color: brand.textMuted,
    },
    rowLate: {
      color: brand.error,
      fontWeight: '700',
    },
    text: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textDark,
    },
    hint: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    warn: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
      color: brand.error,
    },
    error: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.error,
    },
  });
}

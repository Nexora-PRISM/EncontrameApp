import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import type { AlertaEmergenciaController } from '@/features/alerta-emergencia/alerta-emergencia.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: AlertaEmergenciaController };

/** Contagem regressiva com o "Cancelar" bem grande — um toque sem querer não vira alerta. */
export function AlertaCountdownSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.lead}>
        {c.paused ? t('Contagem pausada: responda sobre a localização') : t('O alerta começa em')}
      </Text>
      <View
        style={styles.circle}
        accessible
        accessibilityLabel={c.remaining === 1 ? t('1 segundo') : t('{count} segundos', { count: c.remaining })}
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.number}>{c.remaining}</Text>
        <Text style={styles.unit}>{c.remaining === 1 ? t('segundo') : t('segundos')}</Text>
      </View>

      <Pressable
        onPress={c.cancel}
        style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={t('Cancelar alerta')}
      >
        <MaterialCommunityIcons name="close-circle-outline" size={28} color={brand.onPrimary} />
        <Text style={styles.cancelText}>{t('Cancelar alerta')}</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('Quando a contagem terminar:')}</Text>
        <Step brand={brand} styles={styles} icon="phone-outline">
          {t('O telefone abre com o {callNumber}. Você toca em ligar.', { callNumber: c.callNumber })}
        </Step>
        {c.willSendAlert ? (
          <Step brand={brand} styles={styles} icon="cloud-upload-outline">
            {t('Um alerta com sua localização vai para o Encontra-me. Esta tela mostra quando ele for recebido.')}
          </Step>
        ) : null}
        <Step brand={brand} styles={styles} icon="map-marker-outline">
          {t('Sua localização fica pronta para você mandar a seus contatos de confiança.')}
        </Step>
      </View>

      <Pressable
        onPress={c.actNow}
        style={({ pressed }) => [styles.actNow, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={t('Não esperar: abrir o telefone com o {callNumber} agora', { callNumber: c.callNumber })}
      >
        <MaterialCommunityIcons name="phone" size={22} color={brand.onEmergency} />
        <Text style={styles.actNowText}>{t('Não esperar — ligar {callNumber} agora', { callNumber: c.callNumber })}</Text>
      </Pressable>
    </View>
  );
}

function Step({
  icon,
  children,
  brand,
  styles,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  children: ReactNode;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.step}>
      <MaterialCommunityIcons name={icon} size={22} color={brand.blue} />
      <Text style={styles.stepText}>{children}</Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 18,
      alignItems: 'stretch',
    },
    lead: {
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: brand.textDark,
    },
    circle: {
      alignSelf: 'center',
      width: 184,
      height: 184,
      borderRadius: Radius.pill,
      borderWidth: 8,
      borderColor: brand.emergency,
      backgroundColor: brand.emergencySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    number: {
      fontSize: 76,
      lineHeight: 84,
      fontWeight: '900',
      color: brand.emergency,
    },
    unit: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.textDark,
    },
    cancel: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderRadius: Radius.md,
      backgroundColor: brand.blue,
    },
    cancelText: {
      fontSize: 19,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
    card: {
      gap: 10,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.textDark,
    },
    step: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    stepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 21,
      color: brand.textDark,
    },
    actNow: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      backgroundColor: brand.emergency,
    },
    actNowText: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.onEmergency,
    },
  });
}

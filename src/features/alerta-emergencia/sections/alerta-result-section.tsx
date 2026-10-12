import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import { EMERGENCY_LINES } from '@/constants/emergency';
import type { AlertaEmergenciaController } from '@/features/alerta-emergencia/alerta-emergencia.controller';
import { LocationShareSection } from '@/features/compartilhar-localizacao/sections/location-share-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { formatClock } from '@/lib/location-share';

type Props = { controller: AlertaEmergenciaController };

type Tone = 'info' | 'danger' | 'success';

/** Depois da contagem: situação da ligação, do envio ao servidor e o envio aos contatos. */
export function AlertaResultSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const otherLines = EMERGENCY_LINES.filter((line) => line.number !== c.callNumber);

  return (
    <View style={styles.wrap}>
      {c.callStatus === 'opened' ? (
        <StatusCard brand={brand} styles={styles} tone="info" icon="phone-outgoing" title={t('Telefone aberto com o {callNumber}', { callNumber: c.callNumber })}>
          {t('Toque em ligar para falar com a Polícia Militar. Se o telefone não abriu, disque {callNumber}.', { callNumber: c.callNumber })}
        </StatusCard>
      ) : c.callStatus === 'failed' ? (
        <StatusCard brand={brand} styles={styles} tone="danger" icon="phone-alert" title={t('Não foi possível abrir o telefone')}>
          {t('Disque {callNumber} manualmente.', { callNumber: c.callNumber })}
        </StatusCard>
      ) : (
        <StatusCard brand={brand} styles={styles} tone="danger" icon="phone" title={t('Ligue para o {callNumber}', { callNumber: c.callNumber })}>
          {t('Toque no botão abaixo para abrir o telefone.')}
        </StatusCard>
      )}
      <Pressable
        onPress={c.openDialer}
        style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={t('Ligar {callNumber}', { callNumber: c.callNumber })}
      >
        <MaterialCommunityIcons name="phone" size={24} color={brand.onEmergency} />
        <Text style={styles.callButtonText}>{t('Ligar {callNumber}', { callNumber: c.callNumber })}</Text>
      </Pressable>

      {c.sendStatus === 'disabled' ? (
        <StatusCard brand={brand} styles={styles} tone="info" icon="information-outline" title={t('Alerta automático ainda não disponível')}>
          {t('Por enquanto o Encontra-me não envia o alerta sozinho para ninguém. Avise seus contatos abaixo.')}
        </StatusCard>
      ) : c.sendStatus === 'needs-login' ? (
        <>
          <StatusCard brand={brand} styles={styles} tone="info" icon="account-alert-outline" title={t('Alerta não enviado: entre na sua conta')}>
            {t('Com a conta conectada, o alerta vai para o Encontra-me. Ligar e mandar a localização funcionam sem conta.')}
          </StatusCard>
          <BrandButton label={t('Entrar na conta')} variant="outline" onPress={c.goToLogin} />
        </>
      ) : c.sendStatus === 'sending' ? (
        <View style={[styles.card, styles.cardInfo]} accessibilityLiveRegion="polite">
          <ActivityIndicator color={brand.blue} />
          <Text style={styles.cardBodyRow}>{t('Enviando o alerta… aguarde a confirmação do servidor.')}</Text>
        </View>
      ) : c.sendStatus === 'confirmed' && c.receipt ? (
        <StatusCard brand={brand} styles={styles} tone="success" icon="check-decagram-outline" title={t('Alerta recebido pelo Encontra-me')}>
          {t('Recebido às {time} · protocolo {alertId}.', {
            time: formatClock(new Date(c.receipt.receivedAt).getTime()),
            alertId: c.receipt.alertId,
          })}
          {c.receipt.notifiedContacts != null
            ? ` ${
                c.receipt.notifiedContacts === 1
                  ? t('O servidor avisou 1 contato.')
                  : t('O servidor avisou {count} contatos.', { count: c.receipt.notifiedContacts })
              }`
            : ''}
          {c.receipt.simulated
            ? ` ${t('Teste do modo de desenvolvimento: nenhum alerta real foi enviado.')}`
            : ''}
        </StatusCard>
      ) : c.sendStatus === 'failed' ? (
        <>
          <StatusCard brand={brand} styles={styles} tone="danger" icon="alert-circle-outline" title={t('Envio do alerta não confirmado')}>
            {t('O alerta pode não ter chegado. Ligue {callNumber} e avise seus contatos.', { callNumber: c.callNumber })}
          </StatusCard>
          <BrandButton label={t('Tentar enviar de novo')} variant="outline" onPress={c.retrySend} />
        </>
      ) : null}

      <LocationShareSection share={c.share} title={t('Avise seus contatos')} />

      <Text style={styles.sectionTitle}>{t('Outros números')}</Text>
      <View style={styles.linesRow}>
        {otherLines.map((line) => (
          <Pressable
            key={line.number}
            onPress={() => c.callLine(line.number)}
            style={({ pressed }) => [styles.lineButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t('Ligar {number}, {name}', { number: line.number, name: t(line.name) })}
          >
            <Text style={styles.lineNumber}>{line.number}</Text>
            <Text style={styles.lineName} numberOfLines={2}>
              {t(line.name)}
            </Text>
          </Pressable>
        ))}
      </View>

      <BrandButton label={t('Voltar ao início')} variant="outline" onPress={c.goHome} />
    </View>
  );
}

function StatusCard({
  tone,
  icon,
  title,
  children,
  brand,
  styles,
}: {
  tone: Tone;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  children: ReactNode;
  brand: BrandColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const color =
    tone === 'danger' ? brand.emergency : tone === 'success' ? brand.statusEncontrado : brand.blue;
  return (
    <View
      style={[styles.card, tone === 'danger' ? styles.cardDanger : styles.cardInfo]}
      accessibilityLiveRegion="polite"
    >
      <MaterialCommunityIcons name={icon} size={26} color={color} />
      <View style={styles.cardTexts}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBody}>{children}</Text>
      </View>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 14,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
    },
    cardInfo: {
      backgroundColor: brand.surface,
      borderColor: brand.divider,
    },
    cardDanger: {
      backgroundColor: brand.emergencySoft,
      borderColor: brand.emergency,
    },
    cardTexts: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    cardBody: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    cardBodyRow: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    callButton: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderRadius: Radius.pill,
      backgroundColor: brand.emergency,
    },
    callButtonText: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.onEmergency,
    },
    pressed: {
      opacity: 0.85,
    },
    sectionTitle: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.label,
    },
    linesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    lineButton: {
      flexGrow: 1,
      flexBasis: '45%',
      minHeight: 64,
      padding: 10,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.fieldBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lineNumber: {
      fontSize: 20,
      fontWeight: '900',
      color: brand.textDark,
    },
    lineName: {
      fontSize: 13,
      textAlign: 'center',
      color: brand.textMuted,
    },
  });
}

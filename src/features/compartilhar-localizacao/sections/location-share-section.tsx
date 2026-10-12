import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { LocationShareController } from '@/features/compartilhar-localizacao/use-location-share';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { describeAccuracy, formatClock } from '@/lib/location-share';
import { maskPhone } from '@/lib/masks';

type Props = {
  share: LocationShareController;
  /** Título do bloco (no alerta: "Avise seus contatos"). */
  title?: string;
};

/** Localização atual + envio para contatos de confiança (WhatsApp/SMS) ou pelo celular. */
export function LocationShareSection({ share, title }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.block}>
      <Text style={styles.title} accessibilityRole="header">
        {title ?? t('Enviar minha localização')}
      </Text>

      <View style={styles.locationCard} accessibilityLiveRegion="polite">
        {share.status === 'locating' ? (
          <ActivityIndicator color={brand.blue} />
        ) : (
          <MaterialCommunityIcons
            name={share.status === 'ready' ? 'map-marker-check-outline' : 'map-marker-off-outline'}
            size={26}
            color={share.status === 'ready' ? brand.blue : brand.error}
          />
        )}
        <View style={styles.locationTexts}>
          <Text style={styles.locationTitle}>
            {share.status === 'ready' && share.location
              ? t('Localização obtida às {value}', { value: formatClock(share.location.capturedAt) })
              : share.status === 'locating'
                ? t('Buscando sua localização…')
                : share.status === 'denied'
                  ? t('Sem permissão de localização')
                  : t('Não foi possível obter a localização')}
          </Text>
          <Text style={styles.locationBody}>
            {share.status === 'ready' && share.location
              ? (describeAccuracy(share.location.accuracy, t) ?? t('Precisão não informada pelo GPS.'))
              : share.status === 'locating'
                ? t('Isso leva alguns segundos.')
                : share.status === 'denied'
                  ? t('Você ainda pode avisar seus contatos: a mensagem vai sem o link do mapa.')
                  : t('Verifique se o GPS está ligado. A mensagem vai sem o link do mapa.')}
          </Text>
        </View>
      </View>
      {share.status === 'denied' ? (
        <BrandButton label={t('Permitir nos ajustes')} variant="outline" onPress={share.openLocationSettings} />
      ) : share.status === 'unavailable' || share.status === 'ready' ? (
        <Pressable onPress={share.retryLocation} style={styles.inlineLink} accessibilityRole="button">
          <MaterialCommunityIcons name="refresh" size={18} color={brand.blue} />
          <Text style={styles.inlineLinkText}>{t('Atualizar localização')}</Text>
        </Pressable>
      ) : null}

      {share.contacts.length > 0 ? (
        share.contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactTexts}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{maskPhone(contact.phone)}</Text>
            </View>
            <View style={styles.contactActions}>
              <Pressable
                onPress={() => share.sendWhatsApp(contact)}
                style={styles.channelButton}
                accessibilityRole="button"
                accessibilityLabel={t('Enviar por WhatsApp para {name}', { name: contact.name })}
              >
                <MaterialCommunityIcons name="whatsapp" size={22} color={brand.blue} />
                <Text style={styles.channelText}>{t('WhatsApp')}</Text>
              </Pressable>
              <Pressable
                onPress={() => share.sendSms(contact)}
                style={styles.channelButton}
                accessibilityRole="button"
                accessibilityLabel={t('Enviar SMS para {name}', { name: contact.name })}
              >
                <MaterialCommunityIcons name="message-text-outline" size={22} color={brand.blue} />
                <Text style={styles.channelText}>{t('SMS')}</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>
          {t('Você ainda não tem contatos de confiança. Cadastre até 5 pessoas para avisar com um toque.')}
        </Text>
      )}

      <BrandButton label={t('Escolher no celular')} variant="outline" onPress={share.shareWithSystem} />
      <Pressable onPress={share.goToContacts} style={styles.inlineLink} accessibilityRole="button">
        <MaterialCommunityIcons name="account-multiple-plus-outline" size={18} color={brand.blue} />
        <Text style={styles.inlineLinkText}>
          {share.contacts.length > 0 ? t('Gerenciar contatos de confiança') : t('Cadastrar contatos de confiança')}
        </Text>
      </Pressable>

      {share.opened ? (
        <View style={styles.openedCard} accessibilityLiveRegion="polite">
          <MaterialCommunityIcons name="information-outline" size={20} color={brand.blue} />
          <Text style={styles.openedText}>
            {t('Abrimos {opened}. A mensagem só chega quando você tocar em enviar.', { opened: share.opened })}
          </Text>
        </View>
      ) : (
        <Text style={styles.note}>
          {t('O app não envia nada sozinho: ele abre o WhatsApp, o SMS ou o compartilhamento com a mensagem pronta e você confirma o envio.')}
        </Text>
      )}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    block: {
      gap: 12,
    },
    title: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.label,
    },
    locationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    locationTexts: {
      flex: 1,
      gap: 2,
    },
    locationTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.textDark,
    },
    locationBody: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    inlineLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      minHeight: 44,
      paddingHorizontal: 4,
    },
    inlineLinkText: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.blue,
    },
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
      padding: 12,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    contactTexts: {
      flex: 1,
      minWidth: 140,
      gap: 2,
    },
    contactName: {
      fontSize: 16,
      fontWeight: '700',
      color: brand.textDark,
    },
    contactPhone: {
      fontSize: 14,
      color: brand.textMuted,
    },
    contactActions: {
      flexDirection: 'row',
      gap: 8,
    },
    channelButton: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: brand.blue,
      backgroundColor: brand.surface,
    },
    channelText: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.blue,
    },
    empty: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textMuted,
    },
    openedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.fieldBackground,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    openedText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 19,
      color: brand.textDark,
    },
    note: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
  });
}

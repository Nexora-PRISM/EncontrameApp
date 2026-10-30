import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { SightingStatusChip } from '@/components/sighting-status-chip';
import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { PessoaDetalheController } from '@/features/pessoa-detalhe/pessoa-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

interface PessoaDetalheThanksSectionProps {
  controller: PessoaDetalheController;
}

export function PessoaDetalheThanksSection({ controller }: PessoaDetalheThanksSectionProps) {
  const t = useT();
  const brand = useBrand();
  const { isWide } = useWideLayout();
  const styles = useMemo(() => makeStyles(brand, isWide), [brand, isWide]);
  const personName = controller.person?.nickname ?? controller.person?.fullName;
  const receipt = controller.receipt;

  return (
    <Modal
      visible={controller.thanksOpen}
      transparent={isWide}
      animationType={isWide ? 'fade' : 'slide'}
      presentationStyle={isWide ? 'overFullScreen' : 'fullScreen'}
      onRequestClose={controller.closeThanks}
    >
      <View style={styles.shell}>
        {isWide ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={controller.closeThanks}
            accessibilityRole="button"
            accessibilityLabel={t('Fechar')}
          />
        ) : null}
        <SafeAreaView style={styles.panel} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Pressable
              onPress={controller.closeThanks}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel={t('Fechar')}
            >
              <MaterialCommunityIcons name="close" size={28} color={brand.textDark} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <Image
              source={require('@/assets/images/sofia-avatar.jpg')}
              style={receipt ? [styles.avatar, styles.avatarSmall] : styles.avatar}
              resizeMode="cover"
              accessibilityLabel={t('Sofia')}
            />
            <Text style={styles.name}>{t('Sofia')}</Text>
            <Text style={styles.title}>{t('Obrigada por ajudar')}</Text>
            <Text style={styles.message}>
              {personName
                ? t('Cada avistamento pode ser o passo que faltava para encontrar {personName}. Sua ajuda é muito importante — de verdade.', { personName })
                : t('Cada avistamento pode ser o passo que faltava para alguém voltar para casa. Sua ajuda é muito importante — de verdade.')}
            </Text>
            {receipt?.reportId ? (
              <View style={styles.receipt}>
                <Text style={styles.receiptLabel}>{t('Relato recebido · nº {id}', { id: receipt.reportId })}</Text>
                <SightingStatusChip status={receipt.status} />
                <Text style={styles.receiptText}>
                  {t('Ele passa por análise antes de qualquer mudança no caso. Acompanhe a situação em "Meus relatos".')}
                </Text>
                {receipt.simulated ? (
                  <Text style={styles.receiptDemo}>
                    {t('Modo de demonstração: nada foi enviado de verdade.')}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.footer}>
            {receipt ? (
              <BrandButton
                label={t('Ver meus relatos')}
                variant="outline"
                onPress={controller.goToMyReports}
              />
            ) : null}
            <BrandButton
              label={t('Voltar para o início')}
              variant="orange"
              onPress={controller.goToInicio}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function makeStyles(brand: BrandColors, isWide: boolean) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: isWide ? brand.overlay : brand.white,
      justifyContent: isWide ? 'center' : 'flex-start',
      alignItems: isWide ? 'center' : 'stretch',
      padding: isWide ? PageGutter : 0,
    },
    panel: {
      flex: isWide ? undefined : 1,
      width: '100%',
      maxWidth: isWide ? 480 : undefined,
      backgroundColor: brand.white,
      borderRadius: isWide ? Radius.lg : 0,
      overflow: 'hidden',
      zIndex: 1,
    },
    header: {
      alignItems: 'flex-end',
      paddingHorizontal: PageGutter,
      paddingTop: 8,
    },
    closeBtn: {
      padding: 4,
    },
    body: {
      flex: isWide ? undefined : 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: PageGutter,
      paddingVertical: 24,
    },
    avatar: {
      width: 148,
      height: 148,
      borderRadius: 74,
      backgroundColor: brand.avatarBackground,
      borderWidth: 4,
      borderColor: brand.orange,
    },
    avatarSmall: {
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    receipt: {
      marginTop: 20,
      alignSelf: 'stretch',
      alignItems: 'center',
      gap: 10,
      padding: 16,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    receiptLabel: {
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
      color: brand.textDark,
    },
    receiptText: {
      fontSize: 15,
      lineHeight: 21,
      textAlign: 'center',
      color: brand.textMuted,
    },
    receiptDemo: {
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
      color: brand.orangeText,
    },
    name: {
      marginTop: 16,
      fontSize: 15,
      fontWeight: '700',
      color: brand.textMuted,
    },
    title: {
      marginTop: 8,
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
      color: brand.textDark,
    },
    message: {
      marginTop: 12,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      color: brand.textMuted,
      maxWidth: 360,
    },
    footer: {
      gap: 12,
      paddingHorizontal: PageGutter,
      paddingBottom: 16,
      paddingTop: 8,
    },
  });
}

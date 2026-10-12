import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { Radius, type BrandColors } from '@/constants/brand';
import { useAlertaEmergenciaController } from '@/features/alerta-emergencia/alerta-emergencia.controller';
import { AlertaCountdownSection } from '@/features/alerta-emergencia/sections/alerta-countdown-section';
import { AlertaResultSection } from '@/features/alerta-emergencia/sections/alerta-result-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/**
 * "/alerta-emergencia" — contagem de 10 s, cancelável. Aberta pelo "Pedir ajuda".
 * Nunca exige login para ligar ou mandar a localização. Sair da tela durante a contagem cancela.
 */
export default function AlertaEmergenciaPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useAlertaEmergenciaController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Alerta de emergência')} />
          {controller.phase === 'counting' ? (
            <AlertaCountdownSection controller={controller} />
          ) : controller.phase === 'cancelled' ? (
            <View style={styles.cancelled} accessibilityLiveRegion="polite">
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={40}
                color={brand.blue}
                style={styles.cancelledIcon}
              />
              <Text style={styles.cancelledTitle}>{t('Alerta cancelado')}</Text>
              <Text style={styles.cancelledBody}>{t('Nada foi enviado e o telefone não foi aberto.')}</Text>
              <BrandButton label={t('Acionar de novo')} variant="blue" onPress={controller.restart} />
              <BrandButton label={t('Voltar ao início')} variant="outline" onPress={controller.goHome} />
            </View>
          ) : (
            <AlertaResultSection controller={controller} />
          )}
        </ContentShell>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: brand.white,
    },
    content: {
      flexGrow: 1,
      paddingTop: 8,
      paddingBottom: 32,
    },
    shell: {
      gap: 16,
    },
    cancelled: {
      gap: 12,
      padding: 18,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
      alignItems: 'stretch',
    },
    cancelledIcon: {
      alignSelf: 'center',
    },
    cancelledTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: brand.textDark,
      textAlign: 'center',
    },
    cancelledBody: {
      fontSize: 15,
      lineHeight: 21,
      color: brand.textMuted,
      textAlign: 'center',
    },
  });
}

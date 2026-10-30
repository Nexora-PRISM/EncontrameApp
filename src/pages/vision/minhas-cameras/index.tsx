import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { useMinhasCamerasController } from '@/features/vision/minhas-cameras.controller';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { AUTHORIZATION_LABEL, authorizationColor, CAMERA_SOURCE_LABEL } from '@/lib/vision-labels';

/** "/vision/minhas-cameras" — câmeras da conta, situação de cada uma e pedidos recebidos. */
export default function MinhasCamerasPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const c = useMinhasCamerasController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Minhas câmeras')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O Encontra-me Vision ainda não está disponível.')} />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              <VisionNotice
                icon="shield-check-outline"
                text={t('Você continua no controle: cadastrar a câmera não libera imagens para ninguém. Cada pedido chega para você decidir, e você pode pausar ou sair quando quiser.')}
              />
              <BrandButton label={t('Cadastrar uma câmera')} variant="orange" onPress={c.addCamera} />
              {c.hasRequests ? (
                <SettingsGroup title={t('Pedidos')}>
                  <SettingsRow
                    icon="file-document-outline"
                    label={t('Pedidos de preservação recebidos')}
                    value={c.waitingRequests > 0 ? t('{count} aguardando', { count: String(c.waitingRequests) }) : undefined}
                    onPress={c.goToRequests}
                  />
                </SettingsGroup>
              ) : null}
              <Text style={s.title} accessibilityRole="header">
                {t('Câmeras cadastradas')}
              </Text>
              {c.loading || c.error || c.cameras.length === 0 ? (
                <VisionState
                  loading={c.loading}
                  error={c.error ? t('Não foi possível carregar suas câmeras.') : undefined}
                  empty={t('Nenhuma câmera cadastrada ainda.')}
                  onRetry={c.retry}
                />
              ) : (
                c.cameras.map((camera) => (
                  <Pressable
                    key={camera.id}
                    onPress={() => c.openCamera(camera.id)}
                    style={({ pressed }) => [s.card, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`${camera.name}, ${t(AUTHORIZATION_LABEL[camera.authorization])}`}
                  >
                    <Text style={s.cardTitle}>{camera.name}</Text>
                    <Text style={s.muted}>
                      {t(CAMERA_SOURCE_LABEL[camera.source])} · {camera.region}, {camera.city}
                    </Text>
                    <View style={s.row}>
                      <VisionChip
                        label={t(AUTHORIZATION_LABEL[camera.authorization])}
                        color={authorizationColor(brand, camera.authorization)}
                      />
                    </View>
                    <Text style={s.muted}>
                      {camera.recordingsAvailable
                        ? t('Guarda gravações por {days} dias', { days: String(camera.retentionDays) })
                        : t('Não guarda gravações')}
                    </Text>
                  </Pressable>
                ))
              )}
            </>
          )}
        </ContentShell>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: brand.white },
    content: { flexGrow: 1, paddingTop: 8, paddingBottom: 32 },
    shell: { gap: 16 },
    pressed: { opacity: 0.85 },
  });
}

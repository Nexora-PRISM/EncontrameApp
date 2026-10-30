import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { useCameraFormController } from '@/features/vision/camera-form.controller';
import { CameraFormSection, CameraParticipationSection } from '@/features/vision/sections/camera-form-sections';
import { VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/vision/minhas-cameras/[id]" — cadastrar ("nova") ou editar uma câmera e controlar a participação. */
export default function CameraFormPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useCameraFormController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={c.isNew ? t('Cadastrar câmera') : t('Minha câmera')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O Encontra-me Vision ainda não está disponível.')} />
          ) : c.loading || c.notFound ? (
            <VisionState loading={c.loading} empty={t('Câmera não encontrada nesta conta.')} />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              <CameraParticipationSection controller={c} />
              <CameraFormSection controller={c} />
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
    shell: { gap: 18 },
  });
}

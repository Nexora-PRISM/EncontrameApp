import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { useInstitucionalController } from '@/features/vision/institucional.controller';
import {
  InstitutionalAccessRequestSection,
  InstitutionalGovernanceSection,
  InstitutionalOperationsSection,
} from '@/features/vision/sections/institucional-sections';
import { VisionDemoSwitcher, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/vision/institucional" — ambiente institucional do Encontra-me Vision (autoridades habilitadas). */
export default function InstitucionalPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useInstitucionalController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Ambiente institucional')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O Encontra-me Vision ainda não está disponível.')} />
          ) : c.checking || c.checkFailed ? (
            <VisionState
              loading={c.checking}
              error={c.checkFailed ? t('Não foi possível verificar o acesso.') : undefined}
              onRetry={c.retryAccess}
            />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              {c.demo ? <VisionDemoSwitcher role={c.access?.role} onChange={c.setDemoRole} /> : null}
              {!c.institutional ? (
                <InstitutionalAccessRequestSection controller={c} />
              ) : (
                <>
                  <VisionNotice
                    icon="scale-balance"
                    text={t('Semelhança visual não é prova. Nenhuma pessoa é dada como encontrada por uma correspondência, e o reconhecimento facial está desligado.')}
                  />
                  <InstitutionalOperationsSection controller={c} />
                  <InstitutionalGovernanceSection controller={c} />
                </>
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
    shell: { gap: 18 },
  });
}

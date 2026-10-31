import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useDossieController } from '@/features/central/dossie.controller';
import {
  DossierClosureSection,
  DossierMobilizationSection,
  DossierPreservationSection,
  DossierTipsSection,
} from '@/features/central/sections/dossie-action-sections';
import {
  DossierFilesSection,
  DossierHistorySection,
  DossierSummarySection,
  DossierTabs,
  DossierTimelineSection,
} from '@/features/central/sections/dossie-sections';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/institucional/dossie/[id]" — dossiê digital do caso (ambiente institucional). */
export default function DossiePage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useDossieController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Dossiê {id}', { id: c.id })} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('A Central de Inteligência ainda não está disponível.')} />
          ) : c.checking ? (
            <VisionState loading />
          ) : !c.allowed ? (
            <VisionState empty={t('Esta área é só para autoridades e profissionais habilitados.')} />
          ) : c.loading || c.error || !c.dossier ? (
            <VisionState loading={c.loading} error={t('Não foi possível carregar o dossiê.')} onRetry={c.retry} />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              <DossierTabs controller={c} />
              {c.tab === 'summary' ? <DossierSummarySection controller={c} /> : null}
              {c.tab === 'timeline' ? <DossierTimelineSection controller={c} /> : null}
              {c.tab === 'tips' ? <DossierTipsSection controller={c} /> : null}
              {c.tab === 'files' ? <DossierFilesSection controller={c} /> : null}
              {c.tab === 'preservation' ? <DossierPreservationSection controller={c} /> : null}
              {c.tab === 'mobilization' ? <DossierMobilizationSection controller={c} /> : null}
              {c.tab === 'closure' ? <DossierClosureSection controller={c} /> : null}
              {c.tab === 'history' ? <DossierHistorySection controller={c} /> : null}
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

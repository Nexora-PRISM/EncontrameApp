import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { useOperacaoController } from '@/features/vision/operacao.controller';
import {
  OperationInfosSection,
  OperationMatchesSection,
  OperationTrajectorySection,
} from '@/features/vision/sections/operacao-analysis-sections';
import {
  OperationCamerasSection,
  OperationHistorySection,
  OperationPreservationSection,
  OperationSummarySection,
  OperationTabs,
} from '@/features/vision/sections/operacao-sections';
import { VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/vision/institucional/operacao/[id]" — operação de busca: câmeras, preservação, correspondências e trajeto. */
export default function OperacaoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useOperacaoController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Operação {id}', { id: c.id })} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O Encontra-me Vision ainda não está disponível.')} />
          ) : c.checking ? (
            <VisionState loading />
          ) : !c.institutional ? (
            <VisionState empty={t('Esta área é só para autoridades e profissionais habilitados.')} />
          ) : c.loading || c.error || !c.view ? (
            <VisionState
              loading={c.loading}
              error={t('Não foi possível carregar a operação.')}
              onRetry={c.retry}
            />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              <OperationTabs controller={c} />
              {c.tab === 'summary' ? <OperationSummarySection controller={c} /> : null}
              {c.tab === 'cameras' ? <OperationCamerasSection controller={c} /> : null}
              {c.tab === 'preservation' ? <OperationPreservationSection controller={c} /> : null}
              {c.tab === 'matches' ? <OperationMatchesSection controller={c} /> : null}
              {c.tab === 'trajectory' ? <OperationTrajectorySection controller={c} /> : null}
              {c.tab === 'infos' ? <OperationInfosSection controller={c} /> : null}
              {c.tab === 'history' ? <OperationHistorySection controller={c} /> : null}
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

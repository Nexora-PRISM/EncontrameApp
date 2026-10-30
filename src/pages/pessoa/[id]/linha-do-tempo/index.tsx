import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useLinhaDoTempoController } from '@/features/linha-do-tempo/linha-do-tempo.controller';
import { LinhaDoTempoHeaderSection } from '@/features/linha-do-tempo/sections/linha-do-tempo-header-section';
import { LinhaDoTempoListSection } from '@/features/linha-do-tempo/sections/linha-do-tempo-list-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/pessoa/[id]/linha-do-tempo" — linha do tempo pública do caso (não exige login). */
export default function LinhaDoTempoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useLinhaDoTempoController();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Linha do tempo')} onBack={controller.goBack} />
          <LinhaDoTempoHeaderSection controller={controller} />
          <LinhaDoTempoListSection controller={controller} />
        </ContentShell>
      </ScrollView>
      <BottomBar />
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
      gap: 20,
    },
  });
}

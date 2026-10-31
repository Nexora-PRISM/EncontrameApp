import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useFichaListController } from '@/features/ficha/ficha-list.controller';
import { FichaListSection } from '@/features/ficha/sections/ficha-list-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/ficha" — fichas de identificação preparadas pela família (só neste aparelho, sem login). */
export default function FichaListPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useFichaListController();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Ficha de identificação')} onBack={controller.goBack} />
          <FichaListSection controller={controller} />
        </ContentShell>
      </ScrollView>
      <BottomBar />
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: brand.white },
    scroll: { paddingBottom: 32 },
    shell: { gap: 16 },
  });
}

import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useApoiadoresController } from '@/features/apoiadores/apoiadores.controller';
import { ApoiadoresListSection } from '@/features/apoiadores/sections/apoiadores-list-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/apoiadores" — Nossos apoiadores: empresas e organizações que apoiam o Encontra-me (sem login). */
export default function ApoiadoresPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useApoiadoresController();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Nossos apoiadores')} onBack={controller.goBack} />
          <ApoiadoresListSection controller={controller} />
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
    shell: { gap: 20 },
  });
}

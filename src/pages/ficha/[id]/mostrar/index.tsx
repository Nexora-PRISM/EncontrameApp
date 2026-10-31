import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useFichaShowController } from '@/features/ficha/ficha-show.controller';
import { FichaShowSection } from '@/features/ficha/sections/ficha-show-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/ficha/[id]/mostrar" — ficha para mostrar à polícia ou imprimir (só neste aparelho). */
export default function FichaShowPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useFichaShowController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Mostrar para a polícia')} onBack={controller.goBack} />
          <FichaShowSection controller={controller} />
        </ContentShell>
      </ScrollView>
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

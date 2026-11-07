import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { TrajetoHubSection } from '@/features/trajeto/sections/trajeto-hub-section';
import { useTrajetoController } from '@/features/trajeto/trajeto.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/trajeto" — compartilhar meu trajeto, quem compartilha comigo e alertas de não chegada (exige conta). */
export default function TrajetoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useTrajetoController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Trajeto compartilhado')} onBack={controller.goBack} />
          <TrajetoHubSection controller={controller} />
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

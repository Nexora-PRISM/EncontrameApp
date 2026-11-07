import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { TrajetoContatosSection } from '@/features/trajeto/sections/trajeto-contatos-section';
import { useTrajetoContatosController } from '@/features/trajeto/trajeto-contatos.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/trajeto/contatos" — convites e vínculos de confiança dos trajetos (os dois lados podem desfazer). */
export default function TrajetoContatosPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useTrajetoContatosController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Contatos e convites')} onBack={controller.goBack} />
          <TrajetoContatosSection controller={controller} />
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

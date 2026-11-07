import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { TrajetoNovoSection } from '@/features/trajeto/sections/trajeto-novo-section';
import { useTrajetoNovoController } from '@/features/trajeto/trajeto-novo.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/trajeto/novo" — começar a compartilhar um trajeto com contatos escolhidos, com consentimento. */
export default function TrajetoNovoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useTrajetoNovoController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Compartilhar trajeto')} onBack={controller.goBack} />
          <TrajetoNovoSection controller={controller} />
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

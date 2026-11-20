import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import type { BrandColors } from '@/constants/brand';
import { SegurancaInfantilContentSection } from '@/features/seguranca-infantil/sections/seguranca-infantil-content-section';
import { useSegurancaInfantilController } from '@/features/seguranca-infantil/seguranca-infantil.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

export default function SegurancaInfantilPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useSegurancaInfantilController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Padrões de segurança infantil')} onBack={controller.goBack} />
          <SegurancaInfantilContentSection controller={controller} />
        </ContentShell>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: brand.white },
    content: { flexGrow: 1, paddingTop: 8, paddingBottom: 32 },
    shell: { gap: 16 },
  });
}

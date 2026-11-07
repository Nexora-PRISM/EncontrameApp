import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { TrajetoAlertaSection } from '@/features/trajeto/sections/trajeto-alerta-section';
import { useTrajetoAlertaController } from '@/features/trajeto/trajeto-alerta.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/trajeto/[id]/alerta" — Sinal de Alerta de um contato escolhido (vai para a equipe, nunca para o público). */
export default function TrajetoAlertaPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useTrajetoAlertaController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Sinal de Alerta')} onBack={controller.goBack} />
          <TrajetoAlertaSection controller={controller} />
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

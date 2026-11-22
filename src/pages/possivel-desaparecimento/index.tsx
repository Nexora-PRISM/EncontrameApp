import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { usePossivelDesaparecimentoController } from '@/features/possivel-desaparecimento/possivel-desaparecimento.controller';
import { PossivelDesaparecimentoSection } from '@/features/possivel-desaparecimento/sections/possivel-desaparecimento-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/possivel-desaparecimento" — encontrei alguém perdido (sem login, sem exigir boletim). */
export default function PossivelDesaparecimentoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = usePossivelDesaparecimentoController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ContentShell style={styles.shell}>
            <ScreenHeader title={t('Encontrei alguém perdido')} onBack={controller.goBack} />
            <PossivelDesaparecimentoSection controller={controller} />
          </ContentShell>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: brand.white,
    },
    flex: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingTop: 8,
      paddingBottom: 32,
    },
    shell: {
      gap: 16,
    },
  });
}

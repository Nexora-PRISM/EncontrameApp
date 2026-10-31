import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useFichaFormController } from '@/features/ficha/ficha-form.controller';
import { FichaFormSection } from '@/features/ficha/sections/ficha-form-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/ficha/[id]" — criar ("nova") ou editar uma ficha de identificação (só neste aparelho). */
export default function FichaFormPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useFichaFormController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ContentShell style={styles.shell}>
            <ScreenHeader title={controller.isNew ? t('Nova ficha') : t('Ficha de identificação')} onBack={controller.goBack} />
            <FichaFormSection controller={controller} />
          </ContentShell>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: brand.white },
    flex: { flex: 1 },
    scroll: { paddingBottom: 32 },
    shell: { gap: 16 },
  });
}

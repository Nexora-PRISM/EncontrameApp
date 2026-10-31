import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useApoiadorFormController } from '@/features/equipe/apoiador-form.controller';
import { ApoiadorFormSection } from '@/features/equipe/sections/apoiador-form-section';
import { EquipeAccessGate } from '@/features/equipe/sections/equipe-access-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/equipe/apoiadores/[id]" — cadastrar ("novo") ou editar um apoiador. Só contas da equipe. */
export default function EquipeApoiadorFormPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useApoiadorFormController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ContentShell style={styles.shell}>
            <ScreenHeader title={c.isNew ? t('Novo apoiador') : t('Editar apoiador')} onBack={c.goBack} />
            <EquipeAccessGate checking={c.checking} checkFailed={c.checkFailed} isStaff={c.isStaff} demo={c.demo} onRetry={c.retry}>
              <ApoiadorFormSection controller={c} />
            </EquipeAccessGate>
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
    content: { flexGrow: 1, paddingTop: 8, paddingBottom: 32 },
    shell: { gap: 16 },
  });
}

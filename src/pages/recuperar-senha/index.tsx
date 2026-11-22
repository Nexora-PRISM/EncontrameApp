import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useRecuperarSenhaController } from '@/features/recuperar-senha/recuperar-senha.controller';
import { RecuperarSenhaSection } from '@/features/recuperar-senha/sections/recuperar-senha-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/recuperar-senha" — código por e-mail e senha nova (sem login; o e-mail não vai na URL). */
export default function RecuperarSenhaPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useRecuperarSenhaController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ContentShell style={styles.shell}>
            <ScreenHeader title={t('Recuperar senha')} onBack={controller.goBack} />
            <RecuperarSenhaSection controller={controller} />
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

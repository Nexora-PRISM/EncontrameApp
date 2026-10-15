import { Redirect } from 'expo-router';
import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useAvisoSegurancaController } from '@/features/aviso-seguranca/aviso-seguranca.controller';
import { AvisoSegurancaFormSection } from '@/features/aviso-seguranca/sections/aviso-seguranca-form-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/aviso-seguranca" — publicar um aviso de segurança sobre um lugar (exige login). */
export default function AvisoSegurancaPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useAvisoSegurancaController();

  if (!controller.enabled) {
    return <Redirect href="/inicio" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ContentShell>
            <ScreenHeader title={t('Novo aviso de segurança')} onBack={controller.goBack} />
            <AvisoSegurancaFormSection controller={controller} />
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
      paddingBottom: 40,
      gap: 16,
    },
  });
}

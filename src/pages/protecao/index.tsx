import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useProtecaoController } from '@/features/protecao/protecao.controller';
import { ProtecaoFormSection } from '@/features/protecao/sections/protecao-form-section';
import { ProtecaoIntroSection } from '@/features/protecao/sections/protecao-intro-section';
import { ProtecaoResultSection } from '@/features/protecao/sections/protecao-result-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/**
 * "/protecao" — "Sou a pessoa procurada" e "Estou sofrendo perseguição" (?caso=<id>&modo=).
 * Sem login e sem pedir localização. O id do caso não é dado pessoal (a página pública já o usa).
 */
export default function ProtecaoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useProtecaoController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ContentShell style={styles.shell}>
            <ScreenHeader title={t('Proteção e contestação')} onBack={controller.goBack} />
            <ProtecaoIntroSection controller={controller} />
            {controller.result ? (
              <ProtecaoResultSection controller={controller} />
            ) : (
              <ProtecaoFormSection controller={controller} />
            )}
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

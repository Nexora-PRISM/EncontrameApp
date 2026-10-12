import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useConfiguracoesController } from '@/features/configuracoes/configuracoes.controller';
import { ConfiguracoesGroupsSection } from '@/features/configuracoes/sections/configuracoes-groups-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

export default function ConfiguracoesPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useConfiguracoesController();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <ContentShell style={styles.shell}>
            <ScreenHeader title={t('Configurações')} onBack={controller.goBack} />
            <ConfiguracoesGroupsSection controller={controller} />
          </ContentShell>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomBar />
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
    scroll: {
      paddingBottom: 32,
    },
    shell: {
      gap: 24,
    },
  });
}

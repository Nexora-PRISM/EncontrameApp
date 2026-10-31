import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useApoiadoresAdminController } from '@/features/equipe/apoiadores-admin.controller';
import { ApoiadoresAdminSection } from '@/features/equipe/sections/apoiadores-admin-section';
import { EquipeAccessGate } from '@/features/equipe/sections/equipe-access-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/equipe/apoiadores" — Nossos apoiadores no Painel da equipe (só contas da equipe). */
export default function EquipeApoiadoresPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useApoiadoresAdminController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Nossos apoiadores')} onBack={c.goBack} />
          <EquipeAccessGate checking={c.checking} checkFailed={c.checkFailed} isStaff={c.isStaff} demo={c.demo} onRetry={c.retry}>
            <ApoiadoresAdminSection controller={c} />
          </EquipeAccessGate>
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

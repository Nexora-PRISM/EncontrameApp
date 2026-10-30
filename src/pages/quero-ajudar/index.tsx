import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useQueroAjudarController } from '@/features/quero-ajudar/quero-ajudar.controller';
import { QueroAjudarFormSection } from '@/features/quero-ajudar/sections/quero-ajudar-form-section';
import { QueroAjudarGuidelinesSection } from '@/features/quero-ajudar/sections/quero-ajudar-guidelines-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/quero-ajudar" — voluntariado com orientações de segurança. */
export default function QueroAjudarPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useQueroAjudarController();
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Quero ajudar')} onBack={c.goBack} />
          <Text style={styles.lead}>
            {t('Você pode ajudar a divulgar casos e a passar informações para a equipe, com segurança e sem se expor.')}
          </Text>
          <QueroAjudarGuidelinesSection />
          <QueroAjudarFormSection controller={c} />
        </ContentShell>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: brand.white },
    content: { flexGrow: 1, paddingTop: 8, paddingBottom: 32 },
    shell: { gap: 20 },
    lead: { fontSize: 17, lineHeight: 24, color: brand.textDark },
  });
}

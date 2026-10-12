import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { usePremiumController } from '@/features/premium/premium.controller';
import { PremiumBenefitsSection } from '@/features/premium/sections/premium-benefits-section';
import { PremiumHeroSection } from '@/features/premium/sections/premium-hero-section';
import { PremiumNotesSection } from '@/features/premium/sections/premium-notes-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/premium" — grátis × Premium, preço de referência e situação da assinatura (sem login). */
export default function PremiumPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = usePremiumController();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Premium')} onBack={controller.goBack} />
          <PremiumHeroSection controller={controller} />
          <PremiumBenefitsSection controller={controller} />
          <PremiumNotesSection controller={controller} />
        </ContentShell>
      </ScrollView>
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
    scroll: {
      paddingTop: 8,
      paddingBottom: 32,
    },
    shell: {
      gap: 16,
    },
  });
}

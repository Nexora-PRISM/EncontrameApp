import { Redirect } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { MaxListingWidth } from '@/constants/theme';
import { usePetsController } from '@/features/pets/pets.controller';
import { PetsListSection } from '@/features/pets/sections/pets-list-section';
import { PetsPremiumSection } from '@/features/pets/sections/pets-premium-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

export default function PetsPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = usePetsController();

  if (!controller.enabled) {
    return <Redirect href="/inicio" />;
  }

  const listHeader = (
    <View style={styles.header}>
      <ScreenHeader title={t('Pets desaparecidos')} />
      <Text style={styles.intro}>
        {t('Viu algum destes animais? Divulgue o caso e avise o tutor. Toda ajuda conta.')}
      </Text>
      <PetsPremiumSection controller={controller} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ContentShell style={styles.shell} maxWidth={MaxListingWidth}>
        <PetsListSection controller={controller} header={listHeader} />
      </ContentShell>
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
    shell: {
      flex: 1,
      paddingTop: 8,
    },
    header: {
      gap: 12,
      marginBottom: 12,
    },
    intro: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textMuted,
    },
  });
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomBar } from '@/components/bottom-bar';
import { BrandButton } from '@/components/brand-button';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useCartazController } from '@/features/cartaz/cartaz.controller';
import { CartazActionsSection } from '@/features/cartaz/sections/cartaz-actions-section';
import { CartazOptionsSection } from '@/features/cartaz/sections/cartaz-options-section';
import { CartazPosterSection } from '@/features/cartaz/sections/cartaz-poster-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/pessoa/[id]/cartaz" — cartaz do caso com QR Code (não exige login). */
export default function CartazPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const controller = useCartazController();

  let body = null;
  if (controller.loading) {
    body = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  } else if (controller.notFound) {
    body = <Text style={styles.message}>{t('Não encontramos essa pessoa.')}</Text>;
  } else if (controller.availability !== 'available') {
    body = (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name={controller.availability === 'closed' ? 'flag-checkered' : 'clock-outline'}
          size={44}
          color={brand.textMuted}
        />
        <Text style={styles.message}>
          {controller.availability === 'closed'
            ? t('Este caso foi encerrado e não deve mais ser divulgado. Se encontrar um cartaz antigo, não compartilhe.')
            : t('O cartaz fica disponível depois que a equipe aprovar o caso.')}
        </Text>
        <BrandButton label={t('Voltar para o caso')} variant="outline" onPress={controller.openCase} />
      </View>
    );
  } else {
    body = (
      <>
        <CartazPosterSection controller={controller} />
        <CartazActionsSection controller={controller} />
        <CartazOptionsSection controller={controller} />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Cartaz do caso')} onBack={controller.goBack} />
          {body}
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
    content: {
      flexGrow: 1,
      paddingTop: 8,
      paddingBottom: 32,
    },
    shell: {
      gap: 22,
    },
    center: {
      alignItems: 'center',
      gap: 16,
      paddingVertical: 40,
    },
    message: {
      fontSize: 16,
      lineHeight: 23,
      textAlign: 'center',
      color: brand.textMuted,
    },
  });
}

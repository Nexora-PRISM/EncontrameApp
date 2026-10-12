import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { LocationShareSection } from '@/features/compartilhar-localizacao/sections/location-share-section';
import { useLocationShare } from '@/features/compartilhar-localizacao/use-location-share';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/**
 * "/compartilhar-localizacao" — manda a localização atual para um contato de confiança
 * (WhatsApp ou SMS) ou pelo compartilhamento do celular. Não exige login.
 */
export default function CompartilharLocalizacaoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const share = useLocationShare({ mode: 'share' });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Compartilhar localização')} />
          <Text style={styles.intro}>
            {t('Mande onde você está agora para alguém de confiança — por exemplo, ao voltar para casa sozinha ou ao sair com alguém que acabou de conhecer.')}
          </Text>
          <LocationShareSection share={share} />
        </ContentShell>
      </ScrollView>
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
      gap: 16,
    },
    intro: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textMuted,
    },
  });
}

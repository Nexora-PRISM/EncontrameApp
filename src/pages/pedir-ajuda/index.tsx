import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { EmergencyOptions } from '@/components/emergency-sheet';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/**
 * "/pedir-ajuda" — mesma ajuda da folha do botão vermelho, em tela cheia.
 * É o destino do atalho de emergência da tela inicial do Android
 * (encontrameapp://pedir-ajuda). Nunca exige login: ligar para 190/180/100 é sempre livre.
 */
export default function PedirAjudaPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Pedir ajuda')} />
          <Text style={styles.subtitle}>{t('Escolha o que está acontecendo.')}</Text>
          <EmergencyOptions onNavigate={(href: Href) => router.push(href)} />
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
      paddingBottom: 24,
    },
    shell: {
      gap: 8,
    },
    subtitle: {
      fontSize: 15,
      color: brand.textMuted,
      marginBottom: 4,
    },
  });
}

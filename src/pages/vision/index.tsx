import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { VisionDemoSwitcher, VisionState } from '@/features/vision/sections/vision-common';
import { VisionCoverageSection, VisionPathsSection } from '@/features/vision/sections/vision-home-sections';
import { useVisionHomeController } from '@/features/vision/vision-home.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { VISION_NAME } from '@/lib/vision-labels';

/** "/vision" — Encontra-me Vision: cobertura colaborativa de câmeras (pública) e caminhos para participar. */
export default function VisionPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useVisionHomeController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={VISION_NAME} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O Encontra-me Vision ainda não está disponível.')} />
          ) : (
            <>
              {c.demo ? (
                <DemoBanner
                  text={t('Dados de demonstração: câmeras, responsáveis e regiões são fictícios. Nenhuma câmera real está conectada.')}
                />
              ) : null}
              {c.demo && c.loggedIn ? <VisionDemoSwitcher role={c.access?.role} onChange={c.setDemoRole} /> : null}
              <Text style={styles.lead}>
                {t('Uma rede de câmeras participantes que ajuda autoridades a reconstruir o caminho de uma pessoa desaparecida, sempre com autorização e registro.')}
              </Text>
              <VisionCoverageSection controller={c} />
              <VisionPathsSection controller={c} />
            </>
          )}
        </ContentShell>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: brand.white },
    content: { flexGrow: 1, paddingTop: 8, paddingBottom: 32 },
    shell: { gap: 18 },
    lead: { fontSize: 16, lineHeight: 23, color: brand.textDark },
  });
}

import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useEquipeCasoController } from '@/features/equipe/equipe-caso.controller';
import { EquipeAccessGate } from '@/features/equipe/sections/equipe-access-section';
import { EquipeCasoAiSection } from '@/features/equipe/sections/equipe-caso-ai-section';
import { EquipeCasoSearchSection } from '@/features/equipe/sections/equipe-caso-search-section';
import { EquipeCasoSightingsSection } from '@/features/equipe/sections/equipe-caso-sightings-section';
import { EquipeCasoStatusSection } from '@/features/equipe/sections/equipe-caso-status-section';
import { JustificationField } from '@/features/equipe/sections/justification-field';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/equipe/caso/[id]" — situação, relatos, acompanhamento da busca e sugestões da IA de um caso. */
export default function EquipeCasoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useEquipeCasoController();
  const name = c.person?.nickname ?? c.person?.fullName;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Caso nº {id}', { id: c.id })} onBack={c.goBack} />
          <EquipeAccessGate checking={c.checking} checkFailed={c.checkFailed} isStaff={c.isStaff} demo={c.demo} onRetry={c.retry}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            {!c.personLoading && !c.person ? <Text style={styles.muted}>{t('Não encontramos essa pessoa.')}</Text> : null}
            <JustificationField justification={c.justification} />
            <EquipeCasoStatusSection controller={c} />
            <EquipeCasoSightingsSection controller={c} />
            <EquipeCasoSearchSection controller={c} />
            <EquipeCasoAiSection controller={c} />
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
    shell: { gap: 22 },
    name: { fontSize: 20, fontWeight: '800', color: brand.textDark },
    muted: { fontSize: 15, color: brand.textMuted },
  });
}

import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { EquipeAccessGate } from '@/features/equipe/sections/equipe-access-section';
import { TripAlertsSection } from '@/features/equipe/sections/trip-alerts-section';
import { useTripAlertsController } from '@/features/equipe/trip-alerts.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/equipe/trajetos" — Sinais de Alerta de trajeto (só equipe; a API responde 403 aos outros). */
export default function EquipeTrajetosPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useTripAlertsController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Sinais de Alerta de trajeto')} onBack={c.goBack} />
          <EquipeAccessGate checking={c.checking} checkFailed={c.checkFailed} isStaff={c.isStaff} demo={c.demo} onRetry={c.retry}>
            <TripAlertsSection controller={c} />
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

import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { Radius, type BrandColors } from '@/constants/brand';
import { useDenunciasController } from '@/features/equipe/denuncias.controller';
import { EquipeAccessGate } from '@/features/equipe/sections/equipe-access-section';
import { JustificationField } from '@/features/equipe/sections/justification-field';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { REPORT_REASON_LABEL, REPORT_TARGET_LABEL } from '@/lib/team-labels';

/** "/equipe/denuncias" — fila de denúncias abertas (endpoints que a API já tem). */
export default function DenunciasPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useDenunciasController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Denúncias abertas')} onBack={c.goBack} />
          <EquipeAccessGate checking={c.checking} checkFailed={c.checkFailed} isStaff={c.isStaff} demo={c.demo} onRetry={c.retry}>
            <JustificationField justification={c.justification} />
            {c.loading ? (
              <ActivityIndicator size="large" color={brand.orange} />
            ) : c.error ? (
              <Text style={styles.muted}>{t('Não foi possível carregar as denúncias.')}</Text>
            ) : c.reports.length === 0 ? (
              <Text style={styles.muted}>{t('Nenhuma denúncia aberta.')}</Text>
            ) : (
              c.reports.map((report) => (
                <View key={report.id} style={styles.card}>
                  <Text style={styles.title}>{t(REPORT_REASON_LABEL[report.reason])}</Text>
                  <Text style={styles.line}>
                    {t(REPORT_TARGET_LABEL[report.target])} · {t('nº {id}', { id: report.targetId })}
                  </Text>
                  <Text style={styles.muted}>{c.formatDate(report.createdAt)}</Text>
                  <View style={styles.row}>
                    {report.target === 'MissingPerson' ? (
                      <BrandButton label={t('Ver o caso')} variant="outline" onPress={() => c.openCase(report.targetId)} />
                    ) : null}
                    <BrandButton label={t('Ocultar')} variant="blue" loading={c.busy} onPress={() => c.hide(report)} />
                    <BrandButton label={t('Manter')} variant="outline" loading={c.busy} onPress={() => c.keep(report)} />
                  </View>
                </View>
              ))
            )}
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
    card: {
      gap: 6,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    title: { fontSize: 17, fontWeight: '800', color: brand.textDark },
    line: { fontSize: 15, color: brand.textDark },
    muted: { fontSize: 14, color: brand.textMuted },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  });
}

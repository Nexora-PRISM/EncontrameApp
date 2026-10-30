import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import { useEquipeController } from '@/features/equipe/equipe.controller';
import { EquipeAccessGate } from '@/features/equipe/sections/equipe-access-section';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "/equipe" — Painel da equipe (moderação, análise e acompanhamento das buscas). Exige conta da equipe. */
export default function EquipePage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useEquipeController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Painel da equipe')} onBack={c.goBack} />
          <EquipeAccessGate
            checking={c.checking}
            checkFailed={c.checkFailed}
            isStaff={c.isStaff}
            demo={c.demo}
            onRetry={c.retry}
          >
            <Text style={styles.lead}>
              {t('Toda decisão pede uma justificativa, que vai junto com a decisão. Nenhuma sugestão da IA muda um caso sozinha.')}
            </Text>
            <SettingsGroup title={t('Fila de trabalho')}>
              <SettingsRow
                icon="flag-outline"
                label={t('Denúncias abertas')}
                value={c.openReports == null ? undefined : String(c.openReports)}
                onPress={c.goToReports}
              />
            </SettingsGroup>
            <View style={styles.caseBox}>
              <Text style={styles.caseTitle} accessibilityRole="header">
                {t('Abrir um caso')}
              </Text>
              <Text style={styles.caseText}>
                {t('Situação, relatos, acompanhamento da busca e sugestões da IA de um caso.')}
              </Text>
              <BrandField
                label={t('Número do caso')}
                value={c.caseNumber}
                onChangeText={c.setCaseNumber}
                autoCapitalize="none"
                error={c.caseError}
              />
              <BrandButton label={t('Abrir caso')} variant="blue" onPress={c.openCase} />
            </View>
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
    shell: { gap: 18 },
    lead: { fontSize: 15, lineHeight: 21, color: brand.textMuted },
    caseBox: { gap: 12 },
    caseTitle: { fontSize: 18, fontWeight: '800', color: brand.textDark },
    caseText: { fontSize: 15, lineHeight: 21, color: brand.textMuted },
  });
}

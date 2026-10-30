import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { useAuditoriaController } from '@/features/vision/auditoria.controller';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { ACTION_LABEL, ROLE_LABEL } from '@/lib/vision-labels';

/** "/vision/institucional/auditoria" — registro de acessos e decisões do Vision. Só coordenação e auditoria. */
export default function AuditoriaPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const c = useAuditoriaController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Auditoria')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O Encontra-me Vision ainda não está disponível.')} />
          ) : c.checking ? (
            <VisionState loading />
          ) : !c.allowed ? (
            <VisionState empty={t('Só a coordenação e a auditoria veem quem acessou o quê.')} />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              <VisionNotice
                icon="lock-check-outline"
                text={t('Cada consulta, trecho aberto e decisão fica registrado com pessoa, função, horário e justificativa — inclusive as tentativas negadas. Na API real, o registro não pode ser alterado nem apagado pela tela.')}
              />
              <View style={s.metrics}>
                <View style={s.metric}>
                  <Text style={s.metricValue}>{c.total}</Text>
                  <Text style={s.metricLabel}>{t('Registros')}</Text>
                </View>
                <View style={s.metric}>
                  <Text style={s.metricValue}>{c.denied}</Text>
                  <Text style={s.metricLabel}>{t('Tentativas negadas')}</Text>
                </View>
              </View>
              <SettingsGroup title={t('Filtro')}>
                <SettingsRow
                  icon="filter-outline"
                  label={t('Mostrar só as tentativas negadas')}
                  switchValue={c.onlyDenied}
                  onSwitchChange={c.setOnlyDenied}
                />
              </SettingsGroup>
              {c.loading || c.error || c.entries.length === 0 ? (
                <VisionState
                  loading={c.loading}
                  error={c.error ? t('Não foi possível carregar a auditoria.') : undefined}
                  empty={t('Nenhum registro.')}
                  onRetry={c.retry}
                />
              ) : (
                c.entries.map((entry) => (
                  <View key={entry.id} style={s.card}>
                    <VisionChip
                      label={entry.result === 'allowed' ? t('Permitido') : t('Negado')}
                      color={entry.result === 'allowed' ? brand.categoryAdult : brand.orangeText}
                    />
                    <Text style={s.text}>
                      {t(ACTION_LABEL[entry.action])} · {entry.target}
                    </Text>
                    <Text style={s.muted}>
                      {c.format.dateTime(entry.at)} · {entry.actorName} ({t(ROLE_LABEL[entry.role])})
                    </Text>
                    {entry.justification ? (
                      <Text style={s.muted}>{t('Justificativa: {text}', { text: entry.justification })}</Text>
                    ) : entry.result === 'denied' ? (
                      <Text style={s.muted}>{t('Sem permissão ou sem justificativa.')}</Text>
                    ) : null}
                  </View>
                ))
              )}
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
    shell: { gap: 16 },
  });
}

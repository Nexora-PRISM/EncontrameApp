import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import { useCentralAuditoriaController } from '@/features/central/central-auditoria.controller';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { CENTRAL_ACTION_LABEL, CENTRAL_ROLE_LABEL } from '@/lib/central-labels';
import { useT } from '@/lib/i18n';

/** "/institucional/auditoria" — auditoria da Central, com verificação da corrente de hashes. */
export default function CentralAuditoriaPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const c = useCentralAuditoriaController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Auditoria da Central')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('A Central de Inteligência ainda não está disponível.')} />
          ) : c.checking ? (
            <VisionState loading />
          ) : !c.allowed ? (
            <VisionState empty={t('Só a administração institucional e a auditoria veem este registro.')} />
          ) : c.loading || c.error ? (
            <VisionState loading={c.loading} error={t('Não foi possível carregar a auditoria.')} onRetry={c.retry} />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              <VisionNotice
                icon={c.verification.ok ? 'link-variant' : 'link-variant-off'}
                tone={c.verification.ok ? 'info' : 'attention'}
                text={
                  c.verification.ok
                    ? t('Corrente íntegra: {count} registros conferidos. Cada registro guarda o hash do anterior; qualquer alteração ou remoção aparece aqui.', {
                        count: String(c.total),
                      })
                    : t('Corrente quebrada a partir do registro {seq}: algum registro foi alterado, removido ou fora de ordem.', {
                        seq: String(c.verification.brokenAt ?? '?'),
                      })
                }
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
                {c.demo ? (
                  <SettingsRow
                    icon="flask-outline"
                    label={t('Teste: simular alteração de um registro (só nesta tela)')}
                    switchValue={c.tampered}
                    onSwitchChange={c.setTampered}
                  />
                ) : null}
              </SettingsGroup>
              {c.entries.map((entry) => (
                <View key={entry.seq} style={s.card}>
                  <View style={s.row}>
                    <VisionChip label={`#${entry.seq}`} color={brand.navy} />
                    <VisionChip
                      label={entry.result === 'allowed' ? t('Permitido') : t('Negado')}
                      color={entry.result === 'allowed' ? brand.categoryAdult : brand.orangeText}
                    />
                  </View>
                  <Text style={s.text}>
                    {t(CENTRAL_ACTION_LABEL[entry.action])} · {entry.target}
                  </Text>
                  <Text style={s.muted}>
                    {c.format.dateTime(entry.at)} · {entry.actorName} ({t(CENTRAL_ROLE_LABEL[entry.role])})
                  </Text>
                  {entry.justification ? <Text style={s.muted}>{t('Justificativa: {text}', { text: entry.justification })}</Text> : null}
                  <Text style={styles.hash} selectable>
                    {entry.hash.slice(0, 24)}…
                  </Text>
                </View>
              ))}
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
    hash: { fontSize: 12, color: brand.textMuted },
  });
}

import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsSegmented } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { useNovaOperacaoController } from '@/features/vision/nova-operacao.controller';
import { VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useVisionFormat } from '@/features/vision/vision-format';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { OPERATION_ERROR_LABEL } from '@/lib/vision-labels';
import { type OperationError, RADIUS_STEPS_KM } from '@/lib/vision-rules';

/** "/vision/institucional/nova-operacao" — abrir operação de busca audiovisual (identificação, escopo e justificativa). */
export default function NovaOperacaoPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const format = useVisionFormat();
  const c = useNovaOperacaoController();
  const f = c.fields;
  const error = (key: OperationError) => (c.errors.includes(key) ? t(OPERATION_ERROR_LABEL[key]) : undefined);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Nova operação de busca')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O Encontra-me Vision ainda não está disponível.')} />
          ) : c.checking ? (
            <VisionState loading />
          ) : !c.allowed ? (
            <VisionState empty={t('Só a coordenação institucional abre operações de busca.')} />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              {c.demo ? <BrandButton label={t('Preencher com um exemplo fictício')} variant="outline" onPress={c.fillDemo} /> : null}
              <VisionNotice
                icon="clipboard-check-outline"
                text={t('Toda operação tem caso, escopo, justificativa, responsáveis e histórico. A justificativa vai para a auditoria.')}
              />
              <BrandField label={t('Número do caso')} value={f.caseId} onChangeText={c.setCaseId} autoCapitalize="none" required error={error('case')} />
              <BrandField label={t('Último local conhecido')} value={f.place} onChangeText={c.setPlace} required error={error('place')} />
              <View style={styles.row}>
                <View style={styles.half}>
                  <BrandField label={t('Latitude')} value={f.latitude} onChangeText={c.setLatitude} keyboardType="numbers-and-punctuation" />
                </View>
                <View style={styles.half}>
                  <BrandField label={t('Longitude')} value={f.longitude} onChangeText={c.setLongitude} keyboardType="numbers-and-punctuation" />
                </View>
              </View>
              <BrandButton label={t('Usar a localização deste aparelho')} variant="outline" loading={c.locating} onPress={c.locateHere} />
              {error('location') ? <Text style={styles.error}>{error('location')}</Text> : null}
              <View style={styles.row}>
                <View style={styles.half}>
                  <BrandField label={t('Data')} value={f.date} onChangeText={c.setDate} placeholder="dd/mm/aaaa" keyboardType="number-pad" required />
                </View>
                <View style={styles.half}>
                  <BrandField label={t('Horário')} value={f.time} onChangeText={c.setTime} placeholder="hh:mm" keyboardType="number-pad" required />
                </View>
              </View>
              {c.timeError || error('time') || error('future') ? (
                <Text style={styles.error}>{c.timeError ?? error('time') ?? error('future')}</Text>
              ) : null}
              <Text style={styles.label}>{t('Raio inicial')}</Text>
              <SettingsSegmented
                label={t('Raio inicial')}
                value={String(f.radiusKm)}
                onChange={(value) => c.setRadiusKm(Number(value))}
                options={RADIUS_STEPS_KM.map((step) => ({ value: String(step), label: format.distance(step) }))}
              />
              <BrandField
                label={t('Descrição visual informada (roupas, mochila, acessórios)')}
                value={f.description}
                onChangeText={c.setDescription}
                maxLength={300}
                multiline
              />
              <Text style={styles.hint}>
                {t('A análise usa só características não biométricas: roupa, mochila, acessórios, direção e horário.')}
              </Text>
              <BrandField label={t('Escopo')} value={f.scope} onChangeText={c.setScope} maxLength={300} multiline required error={error('scope')} />
              <BrandField
                label={t('Justificativa')}
                value={f.justification}
                onChangeText={c.setJustification}
                maxLength={500}
                multiline
                required
                error={error('justification')}
              />
              {c.message ? <Text style={styles.message}>{c.message}</Text> : null}
              <BrandButton label={t('Abrir operação')} variant="blue" loading={c.saving} onPress={c.submit} />
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
    shell: { gap: 14 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    half: { flexGrow: 1, flexBasis: 140 },
    label: { fontSize: 15, fontWeight: '700', color: brand.label },
    hint: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    error: { fontSize: 14, color: brand.error },
    message: { fontSize: 15, lineHeight: 21, color: brand.textDark },
  });
}

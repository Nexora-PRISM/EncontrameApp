import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { type BrandColors } from '@/constants/brand';
import { useInstitucionalCentralController } from '@/features/central/institucional-central.controller';
import { CentralDemoSwitcher } from '@/features/central/sections/central-common';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useVisionFormat } from '@/features/vision/vision-format';
import { useBrand } from '@/lib/brand-theme';
import { CENTRAL_ROLE_LABEL, DOSSIER_STATUS_LABEL } from '@/lib/central-labels';
import { useT } from '@/lib/i18n';

/** "/institucional" — Central de Inteligência: dossiês, auditoria, verificação de pacotes e ambiente técnico. */
export default function InstitucionalCentralPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const format = useVisionFormat();
  const c = useInstitucionalCentralController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Central de Inteligência')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('A Central de Inteligência ainda não está disponível.')} />
          ) : c.checking || c.checkFailed ? (
            <VisionState
              loading={c.checking}
              error={c.checkFailed ? t('Não foi possível verificar o acesso.') : undefined}
              onRetry={c.retryAccess}
            />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              {c.demo ? (
                <CentralDemoSwitcher role={c.access?.role} mfa={c.access?.mfa ?? false} onRole={c.setDemoRole} onMfa={c.setDemoMfa} />
              ) : null}
              <Text style={s.muted}>
                {t('Sua função: {role}', { role: c.access ? t(CENTRAL_ROLE_LABEL[c.access.role]) : '—' })}
                {c.access?.institution ? ` · ${c.access.institution}` : ''}
              </Text>
              {c.canDossiers ? (
                <View style={s.section}>
                  <VisionNotice
                    icon="scale-balance"
                    text={t('Fatos documentados, relatos não verificados e hipóteses aparecem separados. Nada aqui identifica suspeitos ou substitui a decisão das autoridades.')}
                  />
                  <Text style={s.title} accessibilityRole="header">
                    {t('Dossiês')}
                  </Text>
                  {c.dossiersLoading || c.dossiersError || c.dossiers.length === 0 ? (
                    <VisionState
                      loading={c.dossiersLoading}
                      error={c.dossiersError ? t('Não foi possível carregar os dossiês.') : undefined}
                      empty={t('Nenhum dossiê.')}
                      onRetry={c.retryDossiers}
                    />
                  ) : (
                    c.dossiers.map((dossier) => (
                      <Pressable
                        key={dossier.id}
                        onPress={() => c.openDossier(dossier.id)}
                        style={({ pressed }) => [s.card, pressed && styles.pressed]}
                        accessibilityRole="button"
                        accessibilityLabel={`${dossier.id}, ${dossier.label}`}
                      >
                        <Text style={s.cardTitle}>
                          {dossier.id} · {dossier.label}
                        </Text>
                        <Text style={s.muted}>
                          {dossier.lastKnownPlace} · {format.dateTime(dossier.lastSeenAt)}
                        </Text>
                        <View style={s.row}>
                          <VisionChip label={t(DOSSIER_STATUS_LABEL[dossier.status])} color={brand.navy} />
                          {dossier.priority ? (
                            <VisionChip label={t('Criança ou adolescente: prioridade')} color={brand.categoryChild} />
                          ) : null}
                          {dossier.tipsToReview > 0 ? (
                            <VisionChip
                              label={t('{count} pistas para analisar', { count: String(dossier.tipsToReview) })}
                              color={brand.orangeText}
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    ))
                  )}
                </View>
              ) : c.access?.role === 'technical' ? (
                <VisionNotice
                  icon="server-network"
                  text={t('A equipe técnica não tem acesso automático aos dossiês. Um acesso excepcional precisa de pedido justificado, aprovação e registro.')}
                />
              ) : c.access?.role === 'auditor' ? (
                <VisionNotice icon="clipboard-text-clock-outline" text={t('A auditoria vê quem acessou o quê, sem abrir os dossiês.')} />
              ) : (
                <VisionNotice
                  icon="shield-lock-outline"
                  tone="attention"
                  text={t('Esta área é só para autoridades e profissionais habilitados. A habilitação é verificada pela equipe; dizer que é autoridade não libera nada.')}
                />
              )}
              <SettingsGroup title={t('Ambientes e ferramentas')}>
                {c.visionEnabled ? (
                  <SettingsRow icon="cctv" label={t('Operações de câmeras (Vision)')} onPress={c.goToVision} />
                ) : null}
                <SettingsRow
                  icon="clipboard-text-clock-outline"
                  label={t('Auditoria (registro encadeado)')}
                  onPress={c.canAudit ? c.goToAudit : undefined}
                  disabled={!c.canAudit}
                />
                <SettingsRow icon="file-check-outline" label={t('Verificar integridade de um pacote')} onPress={c.goToVerify} />
                <SettingsRow
                  icon="server-network"
                  label={t('Central técnica (Nexora Prism)')}
                  onPress={c.canTechnical ? c.goToTechnical : undefined}
                  disabled={!c.canTechnical}
                />
              </SettingsGroup>
              <SettingsGroup
                title={t('Segurança e governança')}
                footer={t('Dependem da API: nada disso está ligado de verdade ainda.')}
              >
                <SettingsRow icon="two-factor-authentication" label={t('Autenticação em dois fatores')} unavailable />
                <SettingsRow icon="devices" label={t('Sessões ativas e encerramento remoto')} unavailable />
                <SettingsRow icon="account-key-outline" label={t('Permissões individuais por função')} unavailable />
                <SettingsRow icon="delete-clock-outline" label={t('Política de retenção e descarte')} unavailable />
                <SettingsRow icon="alarm-light-outline" label={t('Resposta a incidentes de segurança')} unavailable />
              </SettingsGroup>
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
    pressed: { opacity: 0.85 },
  });
}

import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { type BrandColors } from '@/constants/brand';
import { useCentralTecnicaController } from '@/features/central/central-tecnica.controller';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { SERVICE_STATE_LABEL, serviceColor } from '@/lib/central-labels';
import { useT } from '@/lib/i18n';

/** "/central-tecnica" — Central técnica da Nexora Prism: monitoramento sem acesso a conteúdo sigiloso. */
export default function CentralTecnicaPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const c = useCentralTecnicaController();
  const status = c.status;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Central técnica')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('A Central de Inteligência ainda não está disponível.')} />
          ) : c.checking ? (
            <VisionState loading />
          ) : !c.allowed ? (
            <VisionState empty={t('Só a equipe técnica da Nexora Prism acessa esta área.')} />
          ) : c.loading || c.error || !status ? (
            <VisionState loading={c.loading} error={t('Não foi possível carregar a saúde do sistema.')} onRetry={c.retry} />
          ) : (
            <>
              {c.demo ? <DemoBanner text={t('Dados de demonstração: os estados abaixo são simulados.')} /> : null}
              <VisionNotice
                icon="shield-lock-outline"
                text={t('Esta área mostra o funcionamento da plataforma, nunca o conteúdo dos dossiês, pistas ou gravações. Os registros técnicos chegam sem dados pessoais.')}
              />
              <Text style={s.title} accessibilityRole="header">
                {t('Disponibilidade')}
              </Text>
              {c.overall ? (
                <VisionChip label={t(SERVICE_STATE_LABEL[c.overall])} color={serviceColor(brand, c.overall)} icon="heart-pulse" />
              ) : null}
              <Text style={s.muted}>{t('Conferido em {date}', { date: c.format.dateTime(status.checkedAt) })}</Text>
              {status.services.map((service) => (
                <View key={service.key} style={s.card}>
                  <Text style={s.cardTitle}>{service.label}</Text>
                  <VisionChip label={t(SERVICE_STATE_LABEL[service.state])} color={serviceColor(brand, service.state)} />
                  {service.detail ? <Text style={s.muted}>{service.detail}</Text> : null}
                </View>
              ))}
              <Text style={s.title} accessibilityRole="header">
                {t('Alertas de segurança')}
              </Text>
              {status.securityAlerts.map((alert, index) => (
                <Text key={`${alert.at}-${index}`} style={s.bullet}>
                  • {c.format.dateTime(alert.at)} — {alert.text}
                </Text>
              ))}
              <Text style={s.title} accessibilityRole="header">
                {t('Registros técnicos (sem conteúdo dos casos)')}
              </Text>
              {status.logs.map((log, index) => (
                <Text key={`${log.at}-${index}`} style={s.bullet}>
                  • {c.format.dateTime(log.at)} · {log.level.toUpperCase()} · {log.event}
                  {log.code ? ` (${log.code})` : ''}
                </Text>
              ))}
              <Text style={s.title} accessibilityRole="header">
                {t('Integrações')}
              </Text>
              {status.integrations.map((integration) => (
                <View key={integration.key} style={s.row}>
                  <Text style={s.text}>{integration.label}</Text>
                  <VisionChip label={t(SERVICE_STATE_LABEL[integration.state])} color={serviceColor(brand, integration.state)} />
                </View>
              ))}
              <Text style={s.title} accessibilityRole="header">
                {t('Acesso excepcional a conteúdo')}
              </Text>
              <Text style={s.muted}>
                {t('Só em último caso (por exemplo, para corrigir um arquivo corrompido). O pedido precisa de aprovação de quem responde pelos dados, vale por tempo limitado e fica registrado.')}
              </Text>
              <BrandField label={t('O que precisa acessar')} value={c.target} onChangeText={c.setTarget} maxLength={120} />
              <BrandField
                label={t('Justificativa')}
                value={c.justification}
                onChangeText={c.setJustification}
                maxLength={500}
                multiline
              />
              {c.message ? <Text style={s.text}>{c.message}</Text> : null}
              <BrandButton label={t('Pedir acesso excepcional')} variant="outline" loading={c.sending} onPress={c.requestAccess} />
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
  });
}

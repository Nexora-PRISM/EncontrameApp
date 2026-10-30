import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { ContentShell } from '@/components/content-shell';
import { ScreenHeader } from '@/components/screen-header';
import { Radius, type BrandColors } from '@/constants/brand';
import { DemoBanner } from '@/features/equipe/sections/equipe-access-section';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { usePedidosController } from '@/features/vision/pedidos.controller';
import { VisionChip, VisionNotice, VisionState } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { PRESERVATION_STATUS_LABEL, preservationColor, URGENCY_LABEL, urgencyColor } from '@/lib/vision-labels';

/** "/vision/pedidos" — pedidos de preservação de imagens recebidos pelas câmeras da conta. */
export default function PedidosPage() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const c = usePedidosController();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ContentShell style={styles.shell}>
          <ScreenHeader title={t('Pedidos de preservação')} onBack={c.goBack} />
          {!c.enabled ? (
            <VisionState empty={t('O Encontra-me Vision ainda não está disponível.')} />
          ) : (
            <>
              {c.demo ? <DemoBanner /> : null}
              <VisionNotice
                icon="information-outline"
                text={t('Preservar é só não deixar o equipamento apagar as gravações daquele intervalo. Este pedido não obriga você a entregar imagens, e nada é enviado sem a sua decisão.')}
              />
              <VisionNotice
                icon="share-off-outline"
                tone="attention"
                text={t('Não publique as imagens em redes sociais: isso pode atrapalhar a busca e expor pessoas inocentes.')}
              />
              {c.loading || c.error || c.requests.length === 0 ? (
                <VisionState
                  loading={c.loading}
                  error={c.error ? t('Não foi possível carregar os pedidos.') : undefined}
                  empty={t('Nenhum pedido recebido.')}
                  onRetry={c.retry}
                />
              ) : (
                c.requests.map((request) => (
                  <View key={request.id} style={s.card}>
                    <Text style={s.cardTitle}>{t('Pedido {id}', { id: request.id })}</Text>
                    <Text style={s.text}>{request.cameraName}</Text>
                    <View style={s.row}>
                      <VisionChip
                        label={t(PRESERVATION_STATUS_LABEL[request.status])}
                        color={preservationColor(brand, request.status)}
                      />
                      {request.open ? (
                        <VisionChip label={t(URGENCY_LABEL[request.urgency])} color={urgencyColor(brand, request.urgency)} icon="clock-outline" />
                      ) : null}
                    </View>
                    <Text style={s.text}>
                      {t('Gravações de {from} até {to}', {
                        from: c.format.dateTime(request.from),
                        to: c.format.dateTime(request.to),
                      })}
                    </Text>
                    <Text style={s.muted}>
                      {t('Pelo prazo do seu equipamento, podem ser apagadas a partir de {date}.', {
                        date: c.format.dateTime(request.deadline),
                      })}
                    </Text>
                    <Text style={s.muted}>
                      {t('Quem pede: {name} — {institution}', { name: request.requesterName, institution: request.institution })}
                    </Text>
                    <BrandButton
                      label={c.letterOpen(request.id) ? t('Esconder o texto do pedido') : t('Ler o texto completo do pedido')}
                      variant="outline"
                      onPress={() => c.toggleLetter(request.id)}
                    />
                    {c.letterOpen(request.id) ? <Text style={styles.letter}>{c.letter(request)}</Text> : null}
                    {request.status === 'sent' ? (
                      <>
                        <BrandField
                          label={t('Observação (opcional)')}
                          value={c.noteFor(request.id)}
                          onChangeText={(value) => c.setNote(request.id, value)}
                          placeholder={t('Ex.: gravações guardadas em um pendrive')}
                          maxLength={300}
                          multiline
                        />
                        <View style={s.row}>
                          <BrandButton label={t('Aceitar preservar')} variant="blue" loading={c.busy} onPress={() => c.accept(request)} />
                          <BrandButton label={t('Recusar')} variant="outline" loading={c.busy} onPress={() => c.decline(request)} />
                        </View>
                      </>
                    ) : null}
                    <Text style={styles.historyTitle}>{t('Histórico do pedido')}</Text>
                    {request.history.map((step, index) => (
                      <Text key={`${step.at}-${index}`} style={s.muted}>
                        {c.format.dateTime(step.at)} — {t(PRESERVATION_STATUS_LABEL[step.status])} · {step.byName}
                        {step.note ? ` · ${step.note}` : ''}
                      </Text>
                    ))}
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
    letter: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.fieldBackground,
    },
    historyTitle: { marginTop: 6, fontSize: 14, fontWeight: '800', color: brand.textDark },
  });
}

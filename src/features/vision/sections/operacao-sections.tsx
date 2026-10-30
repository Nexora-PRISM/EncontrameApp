import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { OPERATION_TAB_LABEL, OPERATION_TABS, type OperacaoController } from '@/features/vision/operacao.controller';
import { SchematicMap } from '@/features/vision/sections/schematic-map';
import { VisionChip, VisionNotice } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import {
  ACTION_LABEL,
  CAMERA_SOURCE_LABEL,
  INTEGRATION_LABEL,
  PRESERVATION_ACTION_LABEL,
  PRESERVATION_STATUS_LABEL,
  preservationColor,
  RECORDING_STATUS_LABEL,
  recordingColor,
  ROLE_LABEL,
  SHARING_LABEL,
  URGENCY_LABEL,
  urgencyColor,
} from '@/lib/vision-labels';
import { RADIUS_STEPS_KM, VISION_JUSTIFICATION } from '@/lib/vision-rules';

type Props = { controller: OperacaoController };

/** Abas da operação (texto grande, todas visíveis, quebram linha no celular). */
export function OperationTabs({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {OPERATION_TABS.map((tab) => {
        const selected = c.tab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => c.setTab(tab)}
            style={[styles.tab, selected && styles.tabSelected]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{t(OPERATION_TAB_LABEL[tab])}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Justificativa da próxima ação: obrigatória para ampliar raio, pedir preservação, abrir trecho e classificar. */
export function OperationJustificationField({ controller: c }: Props) {
  const t = useT();
  return (
    <BrandField
      label={t('Justificativa da próxima ação')}
      value={c.justification}
      onChangeText={c.setJustification}
      placeholder={t('Ex.: conferir passagem logo após o último local conhecido.')}
      maxLength={VISION_JUSTIFICATION.max}
      multiline
      required
      error={c.justificationError}
    />
  );
}

export function OperationSummarySection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const view = c.view;
  if (!view) return null;
  const op = view.operation;
  const atMin = op.radiusKm <= RADIUS_STEPS_KM[0];
  const atMax = op.radiusKm >= RADIUS_STEPS_KM[RADIUS_STEPS_KM.length - 1];
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {op.id} · {op.caseLabel}
      </Text>
      <Text style={s.text}>{t('Último local conhecido: {place}', { place: op.lastKnownPlace })}</Text>
      <Text style={s.text}>{t('Data e horário: {date}', { date: c.format.dateTime(op.lastSeenAt) })}</Text>
      {op.description ? <Text style={s.text}>{t('Descrição informada: {text}', { text: op.description })}</Text> : null}
      <Text style={s.muted}>{t('Escopo: {text}', { text: op.scope })}</Text>
      <Text style={s.muted}>{t('Justificativa: {text}', { text: op.justification })}</Text>
      <Text style={s.muted}>{t('Responsáveis: {names}', { names: op.responsible.join(', ') })}</Text>
      <View style={s.metrics}>
        <Metric value={c.format.distance(op.radiusKm)} label={t('Raio da busca')} />
        <Metric value={String(view.nearby.length)} label={t('Câmeras no raio')} />
        <Metric value={String(view.requestViews.filter((item) => item.open).length)} label={t('Pedidos em andamento')} />
        <Metric value={String(op.matchesToReview)} label={t('Correspondências para revisar')} />
      </View>
      {c.permissions.changeRadius ? (
        <>
          <OperationJustificationField controller={c} />
          <View style={s.row}>
            <BrandButton label={t('Reduzir o raio')} variant="outline" disabled={atMin} loading={c.busy} onPress={() => c.changeRadius('down')} />
            <BrandButton label={t('Ampliar o raio')} variant="blue" disabled={atMax} loading={c.busy} onPress={() => c.changeRadius('up')} />
          </View>
        </>
      ) : null}
      {view.outsideRadius > 0 ? (
        <Text style={s.muted}>
          {t('Há {count} câmeras participantes fora do raio atual.', { count: String(view.outsideRadius) })}
        </Text>
      ) : null}
      <VisionNotice
        icon="alert-circle-outline"
        tone="attention"
        text={t('Câmera desligada, sem gravação ou fora do raio não prova que a pessoa não passou por ali.')}
      />
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  return (
    <View style={s.metric}>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

export function OperationCamerasSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const view = c.view;
  if (!view) return null;
  const op = view.operation;
  const center = { latitude: op.latitude, longitude: op.longitude };
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Câmeras participantes no raio')}
      </Text>
      <SchematicMap
        center={center}
        radiusKm={op.radiusKm}
        points={[
          { id: 'center', ...center, color: brand.navy, square: true, size: 16 },
          ...view.nearby.map((item, index) => ({
            id: item.camera.id,
            latitude: item.camera.latitude,
            longitude: item.camera.longitude,
            color: recordingColor(brand, item.recording.status),
            label: String(index + 1),
          })),
        ]}
        accessibilityLabel={t('Mapa com o último local conhecido e {count} câmeras no raio.', { count: String(view.nearby.length) })}
      />
      <Text style={s.muted}>
        {t('Ordem de prioridade: primeiro as gravações que vão ser apagadas antes, depois as mais perto.')}
      </Text>
      {c.permissions.requestPreservation ? <OperationJustificationField controller={c} /> : null}
      {view.nearby.length === 0 ? <Text style={s.muted}>{t('Nenhuma câmera participante dentro do raio.')}</Text> : null}
      {view.nearby.map((item, index) => {
        const open = item.request && !['declined', 'expired', 'cancelled'].includes(item.request.status);
        const recordingUseful = item.recording.status === 'available' || item.recording.status === 'expiring';
        return (
          <View key={item.camera.id} style={s.card}>
            <Text style={s.cardTitle}>
              {index + 1}. {item.camera.name}
            </Text>
            <Text style={s.muted}>
              {t(CAMERA_SOURCE_LABEL[item.camera.source])} · {t('a {distance} do último local', { distance: c.format.distance(item.distanceKm) })}
            </Text>
            <View style={s.row}>
              <VisionChip label={t(RECORDING_STATUS_LABEL[item.recording.status])} color={recordingColor(brand, item.recording.status)} />
              {item.request ? (
                <VisionChip label={t(PRESERVATION_STATUS_LABEL[item.request.status])} color={preservationColor(brand, item.request.status)} />
              ) : null}
            </View>
            {item.recording.hoursLeft != null ? (
              <Text style={s.muted}>{t('Tempo até o prazo de guarda acabar: {left}', { left: c.format.hoursLeft(item.recording.hoursLeft) })}</Text>
            ) : null}
            <Text style={s.muted}>{t('Responsável: {name}', { name: item.camera.ownerName })}</Text>
            <Text style={s.muted}>{t('O que mostra: {text}', { text: item.camera.coverage })}</Text>
            <Text style={s.muted}>
              {t(INTEGRATION_LABEL[item.camera.integration])} · {t(SHARING_LABEL[item.camera.sharing])}
            </Text>
            {c.permissions.requestPreservation && !open && recordingUseful ? (
              <BrandButton
                label={t('Preparar pedido de preservação')}
                variant={item.recording.status === 'expiring' ? 'orange' : 'outline'}
                loading={c.busy}
                onPress={() => c.requestPreservation(item.camera.id)}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function OperationPreservationSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const view = c.view;
  if (!view) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Pedidos de preservação de imagens')}
      </Text>
      <VisionNotice
        icon="email-fast-outline"
        text={t('O app prepara o texto do pedido; quem envia é a equipe, por e-mail ou ofício, e depois registra aqui. Nada é enviado automaticamente, e o responsável não é obrigado a fornecer imagens sem procedimento legal.')}
      />
      {c.permissions.requestPreservation ? <OperationJustificationField controller={c} /> : null}
      {view.requestViews.length === 0 ? <Text style={s.muted}>{t('Nenhum pedido ainda.')}</Text> : null}
      {view.requestViews.map((request) => (
        <View key={request.id} style={s.card}>
          <Text style={s.cardTitle}>
            {request.id} · {request.cameraName}
          </Text>
          <View style={s.row}>
            <VisionChip label={t(PRESERVATION_STATUS_LABEL[request.status])} color={preservationColor(brand, request.status)} />
            {request.open ? (
              <VisionChip label={t(URGENCY_LABEL[request.urgency])} color={urgencyColor(brand, request.urgency)} icon="clock-outline" />
            ) : null}
          </View>
          <Text style={s.muted}>
            {t('Intervalo: {from} até {to}', { from: c.format.dateTime(request.from), to: c.format.dateTime(request.to) })}
          </Text>
          <Text style={s.muted}>{t('Prazo de guarda do equipamento: {date}', { date: c.format.dateTime(request.deadline) })}</Text>
          <Text style={s.muted}>{t('Responsável: {name}', { name: request.ownerName })}</Text>
          {request.history.map((step, index) => (
            <Text key={`${step.at}-${index}`} style={s.muted}>
              {c.format.dateTime(step.at)} — {t(PRESERVATION_STATUS_LABEL[step.status])} · {step.byName}
              {step.note ? ` · ${step.note}` : ''}
            </Text>
          ))}
          <View style={s.row}>
            <BrandButton label={t('Compartilhar o texto do pedido')} variant="outline" onPress={() => c.shareLetter(request)} />
            {c.permissions.requestPreservation
              ? c.institutionSteps(request).map((status) => (
                  <BrandButton
                    key={status}
                    label={t(PRESERVATION_ACTION_LABEL[status])}
                    variant={status === 'cancelled' ? 'outline' : 'blue'}
                    loading={c.busy}
                    onPress={() => c.movePreservation(request, status)}
                  />
                ))
              : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export function OperationHistorySection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const view = c.view;
  if (!view) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Histórico da operação')}
      </Text>
      {[...view.operation.history].reverse().map((item, index) => (
        <View key={`${item.at}-${index}`} style={s.card}>
          <Text style={s.muted}>
            {c.format.dateTime(item.at)} · {item.byName}
          </Text>
          <Text style={s.text}>{item.text}</Text>
        </View>
      ))}
      <Text style={s.title} accessibilityRole="header">
        {t('Auditoria desta operação')}
      </Text>
      {!c.permissions.audit ? (
        <Text style={s.muted}>{t('Só a coordenação e a auditoria veem quem acessou o quê.')}</Text>
      ) : c.audit.length === 0 ? (
        <Text style={s.muted}>{c.auditLoading ? t('Carregando…') : t('Nenhum registro.')}</Text>
      ) : (
        c.audit.map((entry) => (
          <View key={entry.id} style={s.card}>
            <View style={s.row}>
              <VisionChip
                label={entry.result === 'allowed' ? t('Permitido') : t('Negado')}
                color={entry.result === 'allowed' ? brand.categoryAdult : brand.orangeText}
              />
            </View>
            <Text style={s.text}>
              {t(ACTION_LABEL[entry.action])} · {entry.target}
            </Text>
            <Text style={s.muted}>
              {c.format.dateTime(entry.at)} · {entry.actorName} ({t(ROLE_LABEL[entry.role])})
            </Text>
            {entry.justification ? <Text style={s.muted}>{t('Justificativa: {text}', { text: entry.justification })}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: brand.navy,
      backgroundColor: brand.white,
    },
    tabSelected: { backgroundColor: brand.navy },
    tabText: { fontSize: 15, fontWeight: '700', color: brand.navy },
    tabTextSelected: { color: brand.onPrimary },
  });
}

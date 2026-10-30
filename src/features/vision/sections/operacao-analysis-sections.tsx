import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import type { OperacaoController } from '@/features/vision/operacao.controller';
import { OperationJustificationField } from '@/features/vision/sections/operacao-sections';
import { type SchematicLine, SchematicMap, type SchematicPoint } from '@/features/vision/sections/schematic-map';
import { SyntheticClip } from '@/features/vision/sections/synthetic-clip';
import { VisionChip, VisionNotice } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import {
  CERTAINTY_LABEL,
  certaintyColor,
  COMPASS_LABEL,
  CONFIDENCE_BAND_LABEL,
  FEATURE_KIND_LABEL,
  INFO_SOURCE_LABEL,
  MATCH_CLASS_HINT,
  MATCH_CLASS_LABEL,
  matchColor,
  RELIABILITY_LABEL,
  reliabilityColor,
} from '@/lib/vision-labels';
import { BIOMETRIC_ANALYSIS_ENABLED, confidenceBand, confidencePercent, MATCH_CLASSES, type Reliability } from '@/lib/vision-rules';

type Props = { controller: OperacaoController };

export function OperationMatchesSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const view = c.view;
  if (!view) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Possíveis correspondências')}
      </Text>
      <VisionNotice
        icon="scale-balance"
        tone="attention"
        text={t('A IA compara só roupa, mochila, acessórios, direção e horário. Semelhança não é identificação: ninguém é dado como encontrado por uma correspondência.')}
      />
      {!BIOMETRIC_ANALYSIS_ENABLED ? (
        <Text style={s.muted}>{t('Reconhecimento facial e outras análises biométricas: desligados.')}</Text>
      ) : null}
      {c.permissions.viewFootage || c.permissions.classify ? <OperationJustificationField controller={c} /> : null}
      {view.matchesByTime.length === 0 ? <Text style={s.muted}>{t('Nenhuma correspondência até agora.')}</Text> : null}
      {view.matchesByTime.map((match) => {
        const clip = c.clipFor(match);
        const percent = confidencePercent(match.confidence);
        return (
          <View key={match.id} style={s.card}>
            <Text style={s.cardTitle}>
              {c.format.time(match.seenAt)} · {match.cameraName}
            </Text>
            <Text style={s.muted}>{match.region}</Text>
            <View style={s.row}>
              <VisionChip label={t(MATCH_CLASS_LABEL[match.classification])} color={matchColor(brand, match.classification)} />
              <VisionChip
                label={`${t(CONFIDENCE_BAND_LABEL[confidenceBand(match.confidence)])} · ${c.format.percent(percent)}`}
                color={brand.navy}
              />
            </View>
            <Text style={s.muted}>{t(MATCH_CLASS_HINT[match.classification])}</Text>
            <Text style={s.text}>{t('Características compatíveis:')}</Text>
            {match.features.map((feature, index) => (
              <Text key={`${feature.kind}-${index}`} style={s.bullet}>
                • {t(FEATURE_KIND_LABEL[feature.kind])}: {feature.value}
              </Text>
            ))}
            <Text style={s.text}>{t('Por que a IA apontou: {text}', { text: match.reason })}</Text>
            {match.limitations.length > 0 ? (
              <>
                <Text style={s.text}>{t('Limitações:')}</Text>
                {match.limitations.map((item, index) => (
                  <Text key={index} style={s.bullet}>
                    • {item}
                  </Text>
                ))}
              </>
            ) : null}
            <Text style={s.muted}>
              {match.aiSuggestion
                ? t('Sugestão inicial da IA: {value}', { value: t(MATCH_CLASS_LABEL[match.aiSuggestion]) })
                : t('Sem sugestão da IA.')}
            </Text>
            {match.reviewedByName ? (
              <Text style={s.muted}>
                {t('Revisado por {name} em {date}: {note}', {
                  name: match.reviewedByName,
                  date: c.format.dateTime(match.reviewedAt),
                  note: match.reviewNote ?? '',
                })}
              </Text>
            ) : null}
            {clip ? <SyntheticClip access={clip} viewer={c.viewerName} format={c.format} /> : null}
            <View style={s.row}>
              {c.permissions.viewFootage && !clip ? (
                <BrandButton label={t('Ver o trecho (fica registrado)')} variant="outline" loading={c.busy} onPress={() => c.openClip(match)} />
              ) : null}
              {c.permissions.classify
                ? MATCH_CLASSES.filter((value) => value !== match.classification).map((value) => (
                    <BrandButton
                      key={value}
                      label={t(MATCH_CLASS_LABEL[value])}
                      variant={value === 'confirmed' ? 'blue' : 'outline'}
                      loading={c.busy}
                      onPress={() => c.classify(match, value)}
                    />
                  ))
                : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function OperationTrajectorySection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const view = c.view;
  if (!view) return null;
  const trajectory = view.trajectory;
  const byId = new Map(trajectory.points.map((point) => [point.id, point]));

  const points: SchematicPoint[] = [
    ...trajectory.points.map((point) => ({
      id: point.id,
      latitude: point.latitude,
      longitude: point.longitude,
      color: certaintyColor(brand, point.certainty),
      square: point.kind === 'last_known',
      size: point.kind === 'last_known' ? 16 : 14,
      label: c.format.time(point.at),
    })),
    ...trajectory.loosePoints.map((point) => ({
      id: `loose-${point.id}`,
      latitude: point.latitude,
      longitude: point.longitude,
      color: certaintyColor(brand, 'inconclusive'),
      hollow: true,
    })),
  ];
  const lines: SchematicLine[] = trajectory.segments.flatMap((segment) => {
    const from = byId.get(segment.fromId);
    const to = byId.get(segment.toId);
    if (!from || !to) return [];
    return [
      {
        id: `${segment.fromId}-${segment.toId}`,
        from,
        to,
        color: segment.hypothetical ? brand.blue : brand.categoryAdult,
        dashed: segment.hypothetical,
      },
    ];
  });

  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Trajeto possível')}
      </Text>
      <VisionNotice
        icon="map-marker-path"
        text={t('O trajeto usa só o último local conhecido e correspondências confirmadas ou prováveis. Sem evidência suficiente, o app não desenha caminho.')}
      />
      {!trajectory.sufficient ? (
        <VisionNotice
          icon="map-marker-question-outline"
          tone="attention"
          text={
            trajectory.reason === 'no_last_known'
              ? t('Falta o último local conhecido para montar um trajeto.')
              : t('Evidências insuficientes para indicar um trajeto. Continue pedindo preservação e revisando as correspondências.')
          }
        />
      ) : (
        <>
          <SchematicMap
            points={points}
            lines={lines}
            accessibilityLabel={t('Mapa do trajeto possível com {count} pontos.', { count: String(trajectory.points.length) })}
          />
          <View style={s.row}>
            {(['fact', 'confirmed', 'hypothesis', 'inconclusive'] as const).map((certainty) => (
              <VisionChip key={certainty} label={t(CERTAINTY_LABEL[certainty])} color={certaintyColor(brand, certainty)} />
            ))}
          </View>
          <Text style={s.text}>
            {trajectory.overallDirection
              ? t('Direção geral provável: {direction} · {distance} percorridos entre os pontos.', {
                  direction: t(COMPASS_LABEL[trajectory.overallDirection]),
                  distance: c.format.distance(trajectory.totalKm),
                })
              : t('Sem direção geral definida.')}
          </Text>
          {trajectory.points.map((point, index) => {
            const segment = index > 0 ? trajectory.segments[index - 1] : undefined;
            return (
              <View key={point.id} style={s.card}>
                {segment ? (
                  <Text style={s.muted}>
                    {t('↓ {distance} em {minutes} min', {
                      distance: c.format.distance(segment.distanceKm),
                      minutes: String(segment.minutes),
                    })}
                    {segment.direction ? ` · ${t(COMPASS_LABEL[segment.direction])}` : ''}
                    {!segment.plausible ? ` · ${t('deslocamento improvável — revisar')}` : ''}
                  </Text>
                ) : null}
                <Text style={s.cardTitle}>
                  {c.format.time(point.at)} — {point.kind === 'last_known' ? t('Último local conhecido') : point.label}
                </Text>
                <View style={s.row}>
                  <VisionChip label={t(CERTAINTY_LABEL[point.certainty])} color={certaintyColor(brand, point.certainty)} />
                  {point.confidence != null ? (
                    <VisionChip label={c.format.percent(confidencePercent(point.confidence))} color={brand.navy} />
                  ) : null}
                </View>
              </View>
            );
          })}
        </>
      )}
      {trajectory.loosePoints.length > 0 ? (
        <>
          <Text style={s.title} accessibilityRole="header">
            {t('Fora do trajeto')}
          </Text>
          <Text style={s.muted}>{t('Registros inconclusivos ou anteriores ao último local conhecido. Ficam visíveis, mas não entram na linha.')}</Text>
          {trajectory.loosePoints.map((point) => (
            <Text key={point.id} style={s.bullet}>
              • {c.format.time(point.at)} — {point.label} ({t(CERTAINTY_LABEL[point.certainty])})
            </Text>
          ))}
        </>
      ) : null}
      {view.nextCameras.length > 0 ? (
        <>
          <Text style={s.title} accessibilityRole="header">
            {t('Próximas câmeras a consultar (sugestão)')}
          </Text>
          {view.nextCameras.map((item) => (
            <Text key={item.camera.id} style={s.bullet}>
              • {item.camera.name} — {c.format.distance(item.distanceKm)}
              {item.onTheWay ? ` · ${t('na direção do deslocamento')}` : ''}
            </Text>
          ))}
        </>
      ) : null}
    </View>
  );
}

const RATINGS: Reliability[] = ['low', 'medium', 'high'];

export function OperationInfosSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const view = c.view;
  if (!view) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Informações de outras fontes')}
      </Text>
      <Text style={s.muted}>
        {t('Moradores, comércios, voluntários e instituições. Cada informação tem origem, horário, confiabilidade e histórico de avaliação.')}
      </Text>
      {c.permissions.rate ? <OperationJustificationField controller={c} /> : null}
      {view.infos.length === 0 ? <Text style={s.muted}>{t('Nenhuma informação recebida.')}</Text> : null}
      {view.infos.map((info) => (
        <View key={info.id} style={s.card}>
          <Text style={s.cardTitle}>{t(INFO_SOURCE_LABEL[info.source])}</Text>
          <Text style={s.muted}>{t('Origem (restrita): {label}', { label: info.sourceLabel })}</Text>
          <Text style={s.text}>{info.text}</Text>
          <Text style={s.muted}>{t('Local: {place}', { place: info.place })}</Text>
          <Text style={s.muted}>
            {t('Recebida em {date}', { date: c.format.dateTime(info.receivedAt) })}
            {info.happenedAt ? ` · ${t('fato por volta de {time}', { time: c.format.time(info.happenedAt) })}` : ''}
          </Text>
          <VisionChip label={t(RELIABILITY_LABEL[info.reliability])} color={reliabilityColor(brand, info.reliability)} />
          {info.changes.map((change, index) => (
            <Text key={`${change.at}-${index}`} style={s.muted}>
              {c.format.dateTime(change.at)} — {change.byName}: {t(RELIABILITY_LABEL[change.from])} → {t(RELIABILITY_LABEL[change.to])} · {change.note}
            </Text>
          ))}
          {c.permissions.rate ? (
            <View style={s.row}>
              {RATINGS.filter((value) => value !== info.reliability).map((value) => (
                <BrandButton key={value} label={t(RELIABILITY_LABEL[value])} variant="outline" loading={c.busy} onPress={() => c.rateInfo(info, value)} />
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

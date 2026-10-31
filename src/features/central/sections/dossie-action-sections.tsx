import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { BrandSelect } from '@/components/brand-select';
import { SettingsChoiceList, SettingsGroup } from '@/components/settings-list';
import type { DossieController } from '@/features/central/dossie.controller';
import { DossierJustificationField } from '@/features/central/sections/dossie-sections';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { VisionChip, VisionNotice } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import {
  AREA_STATUS_LABEL,
  CLOSURE_STEP_LABEL,
  LEGAL_BASIS_LABEL,
  TIP_CHANNEL_LABEL,
  TIP_LINK_LABEL,
  TIP_STATUS_LABEL,
  tipStatusColor,
} from '@/lib/central-labels';
import { type ClosureOutcome, nextMobilizationRadius, NOTIFY_LIMITS, publicViewAfterClosure, TIP_STATUSES } from '@/lib/central-rules';
import { useT } from '@/lib/i18n';

type Props = { controller: DossieController };

export function DossierTipsSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const d = c.dossier;
  if (!d) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Central de pistas')}
      </Text>
      <VisionNotice
        icon="account-lock-outline"
        text={t('A identidade de quem enviou cada pista fica guardada em separado. Abrir exige justificativa, segundo fator e fica registrado. Ela nunca aparece na área pública.')}
      />
      <Text style={s.title} accessibilityRole="header">
        {t('Organização automática')}
      </Text>
      <Text style={s.muted}>
        {t('Regras do app cruzam horário, lugar e texto das pistas. São sugestões para análise humana: não confirmam identidade nem apontam suspeitos.')}
      </Text>
      {c.analysis.links.length === 0 ? <Text style={s.muted}>{t('Nenhuma relação encontrada.')}</Text> : null}
      {c.analysis.links.map((link) => (
        <Text key={`${link.kind}-${link.a}-${link.b}`} style={s.bullet}>
          • {t(TIP_LINK_LABEL[link.kind])}: {link.a} e {link.b} ({t('{minutes} min de diferença', { minutes: String(link.minutes) })}
          {link.km != null ? `, ${c.format.distance(link.km)}` : ''})
        </Text>
      ))}
      {c.analysis.sequence.length > 0 ? (
        <Text style={s.text}>
          {t('Hipótese de deslocamento: {ids}', { ids: c.analysis.sequence.join(' → ') })}
        </Text>
      ) : null}
      {c.can.review || c.can.identity ? <DossierJustificationField controller={c} /> : null}
      {d.tips.map((tip) => {
        const identity = c.identityFor(tip.id);
        return (
          <View key={tip.id} style={s.card}>
            <Text style={s.cardTitle}>
              {tip.id} · {t(TIP_CHANNEL_LABEL[tip.channel])}
            </Text>
            <View style={s.row}>
              <VisionChip label={t(TIP_STATUS_LABEL[tip.status])} color={tipStatusColor(brand, tip.status)} />
              <VisionChip label={t('Relato não verificado')} color={brand.orangeText} />
            </View>
            <Text style={s.text}>{tip.text}</Text>
            <Text style={s.muted}>
              {tip.happenedAt ? t('Aconteceu por volta de {date}', { date: c.format.dateTime(tip.happenedAt) }) : t('Horário não informado')}
              {tip.place ? ` · ${tip.place}` : ''}
            </Text>
            <Text style={s.muted}>{t('Recebida em {date}', { date: c.format.dateTime(tip.receivedAt) })}</Text>
            {tip.history.slice(1).map((step, index) => (
              <Text key={`${step.at}-${index}`} style={s.muted}>
                {c.format.dateTime(step.at)} — {t(TIP_STATUS_LABEL[step.status])} · {step.byName}
                {step.note ? ` · ${step.note}` : ''}
              </Text>
            ))}
            {tip.hasIdentity ? (
              identity ? (
                <View style={s.card}>
                  <Text style={s.cardTitle}>{t('Identidade (sigilosa)')}</Text>
                  <Text style={s.text}>{identity.name ?? t('Sem nome informado')}</Text>
                  {identity.contact ? <Text style={s.text}>{identity.contact}</Text> : null}
                  <Text style={s.muted}>{t('Este acesso ficou registrado na auditoria. Não copie para outros sistemas.')}</Text>
                </View>
              ) : (
                <Text style={s.muted}>{t('Quem enviou deixou contato. A identidade está guardada em separado.')}</Text>
              )
            ) : (
              <Text style={s.muted}>{t('Enviada sem identificação.')}</Text>
            )}
            <View style={s.row}>
              {c.can.review
                ? TIP_STATUSES.filter((status) => status !== 'new' && status !== tip.status).map((status) => (
                    <BrandButton
                      key={status}
                      label={t(TIP_STATUS_LABEL[status])}
                      variant="outline"
                      loading={c.busy}
                      onPress={() => c.reviewTip(tip, status)}
                    />
                  ))
                : null}
              {c.can.identity && tip.hasIdentity && !identity ? (
                <BrandButton label={t('Abrir identidade (fica registrado)')} variant="outline" loading={c.busy} onPress={() => c.openIdentity(tip)} />
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function DossierPreservationSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const d = c.dossier;
  if (!d) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Preservação de informações')}
      </Text>
      <Text style={s.muted}>
        {t('Com pedido formal e fundamento legal, os registros do caso ficam preservados: originais, origem, datas, histórico de alterações e quem consultou, exportou ou compartilhou.')}
      </Text>
      {d.preservation.length === 0 ? <Text style={s.muted}>{t('Nenhuma preservação registrada.')}</Text> : null}
      {d.preservation.map((item) => (
        <View key={item.id} style={s.card}>
          <Text style={s.cardTitle}>
            {item.id} · {item.reference}
          </Text>
          <VisionChip
            label={item.status === 'active' ? t('Ativa') : item.status === 'expired' ? t('Vencida') : t('Liberada')}
            color={item.status === 'active' ? brand.categoryAdult : brand.textMuted}
          />
          <Text style={s.muted}>{t(LEGAL_BASIS_LABEL[item.legalBasis])}</Text>
          <Text style={s.muted}>{t('Escopo: {text}', { text: item.scope })}</Text>
          <Text style={s.muted}>
            {t('Pedida em {date} por {name}', { date: c.format.dateTime(item.requestedAt), name: item.requestedBy })} ·{' '}
            {t('até {date}', { date: c.format.dateTime(item.until) })}
          </Text>
        </View>
      ))}
      {c.can.preserve ? (
        <>
          <Text style={s.title} accessibilityRole="header">
            {t('Registrar preservação')}
          </Text>
          <BrandSelect
            label={t('Fundamento')}
            value={c.preservation.legalBasis}
            options={c.legalBasisOptions}
            onSelect={(value) => c.setPreservationField('legalBasis', value)}
          />
          <BrandField
            label={t('Referência do pedido (ofício, processo)')}
            value={c.preservation.reference}
            onChangeText={(value) => c.setPreservationField('reference', value)}
            maxLength={120}
          />
          <BrandField
            label={t('O que preservar')}
            value={c.preservation.scope}
            onChangeText={(value) => c.setPreservationField('scope', value)}
            maxLength={300}
            multiline
          />
          <BrandField
            label={t('Preservar até')}
            value={c.preservation.until}
            onChangeText={(value) => c.setPreservationField('until', value)}
            placeholder="dd/mm/aaaa"
            keyboardType="number-pad"
          />
          {c.preservationError ? <Text style={s.muted}>{c.preservationError}</Text> : null}
          <DossierJustificationField controller={c} />
          <BrandButton label={t('Registrar preservação')} variant="blue" loading={c.busy} onPress={c.addPreservation} />
        </>
      ) : null}
    </View>
  );
}

export function DossierMobilizationSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const d = c.dossier;
  if (!d) return null;
  const closed = d.status === 'found' || d.status === 'closed';
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Mobilização geográfica')}
      </Text>
      <VisionNotice
        icon="map-marker-radius-outline"
        text={t('Alertas só para quem autorizou e está dentro de uma área ativa, no máximo {perDay} por dia e com pelo menos {gap} horas entre alertas do mesmo caso. Ninguém é rastreado: o servidor só compara a área com a localização que a pessoa permitiu usar. Os alertas param sozinhos quando o caso é encerrado.', {
          perDay: String(NOTIFY_LIMITS.perDay),
          gap: String(NOTIFY_LIMITS.minGapHours),
        })}
      />
      {c.can.mobilize && !closed ? <DossierJustificationField controller={c} /> : null}
      {d.mobilization.map((area) => {
        const next = nextMobilizationRadius(area.radiusKm);
        return (
          <View key={area.id} style={s.card}>
            <Text style={s.cardTitle}>{area.label}</Text>
            <View style={s.row}>
              <VisionChip
                label={t(AREA_STATUS_LABEL[area.status])}
                color={area.status === 'active' ? brand.categoryAdult : brand.textMuted}
              />
              <VisionChip label={c.format.distance(area.radiusKm)} color={brand.navy} />
            </View>
            <Text style={s.muted}>{t('Motivo: {text}', { text: area.reason })}</Text>
            {c.can.mobilize && !closed && area.status !== 'ended' ? (
              <View style={s.row}>
                {area.status === 'active' && next != null ? (
                  <BrandButton
                    label={t('Ampliar para {distance}', { distance: c.format.distance(next) })}
                    variant="outline"
                    loading={c.busy}
                    onPress={() => c.changeArea(area.id, 'expand')}
                  />
                ) : null}
                {area.status === 'active' ? (
                  <BrandButton label={t('Pausar')} variant="outline" loading={c.busy} onPress={() => c.changeArea(area.id, 'pause')} />
                ) : (
                  <BrandButton label={t('Retomar')} variant="outline" loading={c.busy} onPress={() => c.changeArea(area.id, 'resume')} />
                )}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function DossierClosureSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const d = c.dossier;
  if (!d) return null;
  if (d.closure) {
    const view = publicViewAfterClosure(d.closure.outcome);
    return (
      <View style={s.section}>
        <Text style={s.title} accessibilityRole="header">
          {t('Protocolo de encerramento')}
        </Text>
        <Text style={s.text}>
          {t('Encerrado em {date} por {name}.', { date: c.format.dateTime(d.closure.at), name: d.closure.byName })}
        </Text>
        {d.closure.steps.map((step) => (
          <Text key={step} style={s.bullet}>
            ✓ {t(CLOSURE_STEP_LABEL[step])}
          </Text>
        ))}
        <VisionNotice
          icon="eye-off-outline"
          text={
            view.status === 'located'
              ? t('Na área pública fica só "Pessoa localizada". Foto, último local, endereço, destino e condição da pessoa não são divulgados.')
              : t('Na área pública fica só "Caso encerrado". Foto, último local e detalhes não são divulgados.')
          }
        />
      </View>
    );
  }
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Protocolo de encerramento')}
      </Text>
      <Text style={s.muted}>{t('Ao encerrar, estes passos acontecem juntos:')}</Text>
      {(Object.keys(CLOSURE_STEP_LABEL) as (keyof typeof CLOSURE_STEP_LABEL)[]).map((step) => (
        <Text key={step} style={s.bullet}>
          • {t(CLOSURE_STEP_LABEL[step])}
        </Text>
      ))}
      <VisionNotice
        icon="shield-account-outline"
        tone="attention"
        text={t('Encontrar a pessoa não autoriza divulgar endereço, destino, condição pessoal ou outras informações privadas.')}
      />
      {c.can.close ? (
        <>
          <SettingsGroup title={t('Resultado')}>
            <SettingsChoiceList<ClosureOutcome>
              label={t('Resultado')}
              value={c.outcome}
              onChange={c.setOutcome}
              options={[
                { value: 'found', label: t('Pessoa localizada') },
                { value: 'cancelled', label: t('Encerramento administrativo (sem localização)') },
              ]}
            />
          </SettingsGroup>
          <DossierJustificationField controller={c} />
          <BrandButton label={t('Encerrar o caso')} variant="blue" loading={c.busy} onPress={c.closeCase} />
        </>
      ) : (
        <Text style={s.muted}>{t('Só a administração institucional encerra casos.')}</Text>
      )}
    </View>
  );
}

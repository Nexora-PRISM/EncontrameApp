import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import { DOSSIER_TAB_LABEL, DOSSIER_TABS, type DossieController } from '@/features/central/dossie.controller';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { VisionChip, VisionNotice } from '@/features/vision/sections/vision-common';
import { useBrand } from '@/lib/brand-theme';
import {
  DOSSIER_STATUS_LABEL,
  FILE_KIND_LABEL,
  LINK_STATE_LABEL,
  LEGAL_BASIS_LABEL,
  NATURE_LABEL,
  natureColor,
  RETENTION_LABEL,
  SENSITIVITY_LABEL,
} from '@/lib/central-labels';
import { CENTRAL_JUSTIFICATION, INFO_NATURES, type InfoNature } from '@/lib/central-rules';
import { useT } from '@/lib/i18n';

type Props = { controller: DossieController };

export function DossierTabs({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {DOSSIER_TABS.map((tab) => {
        const selected = c.tab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => c.setTab(tab)}
            style={[styles.tab, selected && styles.tabSelected]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{t(DOSSIER_TAB_LABEL[tab])}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Justificativa da próxima ação (abrir identidade, analisar pista, preservar, mobilizar, encerrar, links). */
export function DossierJustificationField({ controller: c }: Props) {
  const t = useT();
  return (
    <BrandField
      label={t('Justificativa da próxima ação')}
      value={c.justification}
      onChangeText={c.setJustification}
      placeholder={t('Ex.: requisição do delegado responsável, ofício nº…')}
      maxLength={CENTRAL_JUSTIFICATION.max}
      multiline
      required
      error={c.justificationError}
    />
  );
}

export function DossierSummarySection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const d = c.dossier;
  if (!d) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {d.id} · {d.label}
      </Text>
      <View style={s.row}>
        <VisionChip label={t(DOSSIER_STATUS_LABEL[d.status])} color={brand.navy} />
        {d.priority ? <VisionChip label={t('Criança ou adolescente: prioridade')} color={brand.categoryChild} /> : null}
      </View>
      <Text style={s.text}>
        {d.person.name} · {t('{age} anos', { age: String(d.person.age) })}
      </Text>
      <Text style={s.text}>{t('Descrição informada: {text}', { text: d.person.description })}</Text>
      {d.person.characteristics.map((item) => (
        <Text key={item} style={s.bullet}>
          • {item}
        </Text>
      ))}
      <Text style={s.text}>{t('Último local conhecido: {place}', { place: d.lastKnownPlace })}</Text>
      <Text style={s.text}>{t('Data e horário: {date}', { date: c.format.dateTime(d.lastSeenAt) })}</Text>
      <View style={s.metrics}>
        <View style={s.metric}>
          <Text style={s.metricValue}>{d.tips.length}</Text>
          <Text style={s.metricLabel}>{t('Pistas')}</Text>
        </View>
        <View style={s.metric}>
          <Text style={s.metricValue}>{d.files.length}</Text>
          <Text style={s.metricLabel}>{t('Arquivos')}</Text>
        </View>
        <View style={s.metric}>
          <Text style={s.metricValue}>{d.activePreservations}</Text>
          <Text style={s.metricLabel}>{t('Preservações ativas')}</Text>
        </View>
      </View>
      <Text style={s.title} accessibilityRole="header">
        {t('Ligações com outros módulos')}
      </Text>
      {d.links.visionOperationId ? (
        c.visionEnabled ? (
          <BrandButton
            label={t('Operação de câmeras {id} (Vision)', { id: d.links.visionOperationId })}
            variant="outline"
            onPress={() => c.goToVision(d.links.visionOperationId!)}
          />
        ) : (
          <Text style={s.muted}>{t('Operação de câmeras {id} (Vision)', { id: d.links.visionOperationId })}</Text>
        )
      ) : null}
      {d.links.sightingReports.length > 0 ? (
        <Text style={s.muted}>{t('Relatos de avistamento: {ids}', { ids: d.links.sightingReports.join(', ') })}</Text>
      ) : null}
      <Text style={s.muted}>
        {t('Cada registro guarda a sua origem. A mesma informação vinda de módulos diferentes aparece uma vez só.')}
      </Text>
      {c.can.export ? (
        <BrandButton label={t('Exportar dossiê para autoridades')} variant="blue" onPress={c.goToExport} />
      ) : null}
    </View>
  );
}

const FILTERS: (InfoNature | 'all')[] = ['all', ...INFO_NATURES];

export function DossierTimelineSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const d = c.dossier;
  if (!d) return null;
  const items = [...d.timeline]
    .filter((item) => c.natureFilter === 'all' || item.nature === c.natureFilter)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Cronologia')}
      </Text>
      <View style={styles.tabs}>
        {FILTERS.map((filter) => {
          const selected = c.natureFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => c.setNatureFilter(filter)}
              style={[styles.tab, selected && styles.tabSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                {filter === 'all' ? t('Tudo') : t(NATURE_LABEL[filter])}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {items.map((item) => (
        <View key={item.id} style={s.card}>
          <Text style={s.muted}>{c.format.dateTime(item.at)}</Text>
          <Text style={s.cardTitle}>{item.title}</Text>
          {item.detail ? <Text style={s.text}>{item.detail}</Text> : null}
          <View style={s.row}>
            <VisionChip label={t(NATURE_LABEL[item.nature])} color={natureColor(brand, item.nature)} />
          </View>
          <Text style={s.muted}>
            {t('Origem: {origin}', { origin: item.origin })}
            {item.originRef ? ` · ${item.originRef}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function DossierFilesSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const d = c.dossier;
  if (!d) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Arquivos do caso')}
      </Text>
      <VisionNotice
        icon="file-lock-outline"
        text={t('Os arquivos originais nunca são alterados. Organização, visualização e exportação usam cópias controladas, e cada passo fica no histórico de custódia.')}
      />
      {d.files.map((file) => (
        <View key={file.id} style={s.card}>
          <Text style={s.cardTitle}>{file.name}</Text>
          <View style={s.row}>
            <VisionChip label={t(FILE_KIND_LABEL[file.kind])} color={brand.navy} />
            <VisionChip label={t(SENSITIVITY_LABEL[file.sensitivity])} color={file.sensitivity === 'normal' ? brand.textMuted : brand.orangeText} />
          </View>
          <Text style={s.muted}>
            {t('Origem: {origin}', { origin: file.origin })} · {t('recebido em {date}', { date: c.format.dateTime(file.receivedAt) })}
          </Text>
          <Text style={s.muted}>{t('{size} bytes', { size: String(file.size) })}</Text>
          <Text style={styles.hash} selectable>
            SHA-256: {file.sha256}
          </Text>
          <Text style={s.muted}>{t(RETENTION_LABEL[d.fileRetention[file.id] ?? 'keep'])}</Text>
          {file.custody.map((step, index) => (
            <Text key={`${step.at}-${index}`} style={s.muted}>
              {c.format.dateTime(step.at)} — {step.action} ({step.byName})
            </Text>
          ))}
        </View>
      ))}
      <Text style={s.muted}>
        {t('O prazo de guarda mostrado é provisório (demonstração). A política real de retenção e descarte é decisão dos sócios e do jurídico.')}
      </Text>
    </View>
  );
}

export function DossierHistorySection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  const d = c.dossier;
  if (!d) return null;
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Providências')}
      </Text>
      {[...d.actions].reverse().map((item, index) => (
        <Text key={`${item.at}-${index}`} style={s.muted}>
          {c.format.dateTime(item.at)} — {item.text} ({item.byName})
        </Text>
      ))}
      <Text style={s.title} accessibilityRole="header">
        {t('Exportações')}
      </Text>
      {d.exports.length === 0 ? <Text style={s.muted}>{t('Nenhuma exportação.')}</Text> : null}
      {c.can.links && d.exports.length > 0 ? <DossierJustificationField controller={c} /> : null}
      {d.exports.map((item) => (
        <View key={item.id} style={s.card}>
          <Text style={s.cardTitle}>
            {item.id} · {item.recipient.institution}
          </Text>
          <Text style={s.muted}>
            {c.format.dateTime(item.at)} · {item.byName} · {t('autorizado por {name}', { name: item.authorizedBy })}
          </Text>
          <Text style={s.muted}>
            {t('Finalidade: {text}', { text: item.purpose })} · {t(LEGAL_BASIS_LABEL[item.legalBasis])}
          </Text>
          <Text style={s.muted} selectable>
            {t('Manifesto (SHA-256): {hash}', { hash: item.manifestSha256 })}
          </Text>
          {item.links.map((link) => {
            const state = d.linkStates[link.id] ?? 'expired';
            return (
              <View key={link.id} style={s.row}>
                <VisionChip label={`${link.id} · ${t(LINK_STATE_LABEL[state])}`} color={state === 'active' ? brand.categoryAdult : brand.textMuted} />
                <Text style={s.muted}>
                  {t('vence {date}', { date: c.format.dateTime(link.expiresAt) })}
                  {link.simulated ? ` · ${t('simulado: não funciona sem a API')}` : ''}
                </Text>
                {c.can.links && state === 'active' ? (
                  <BrandButton label={t('Revogar')} variant="outline" loading={c.busy} onPress={() => c.revokeLink(item.id, link.id)} />
                ) : null}
              </View>
            );
          })}
          {c.can.links ? (
            <View style={s.row}>
              {[24, 72, 168].map((hours) => (
                <BrandButton
                  key={hours}
                  label={t('Link seguro por {hours} h', { hours: String(hours) })}
                  variant="outline"
                  loading={c.busy}
                  onPress={() => c.createLink(item.id, hours)}
                />
              ))}
            </View>
          ) : null}
        </View>
      ))}
      <Text style={s.muted}>
        {t('Link seguro exige a API: o pacote fica no servidor, o acesso pede autenticação, cada download fica registrado e o link pode ser revogado. Nada é enviado automaticamente.')}
      </Text>
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
    hash: { fontSize: 12, color: brand.textDark, fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
  });
}

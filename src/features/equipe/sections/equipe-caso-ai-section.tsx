import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { SettingsRow } from '@/components/settings-list';
import type { EquipeCasoController } from '@/features/equipe/equipe-caso.controller';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { AI_INDICATION_LABEL, AI_KIND_LABEL } from '@/lib/team-labels';

/** Sugestões da IA com o motivo de cada uma. A IA sugere; quem decide é uma pessoa. */
export function EquipeCasoAiSection({ controller: c }: { controller: EquipeCasoController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Sugestões da IA')}
      </Text>
      <Text style={s.muted}>
        {t('A IA não confirma identidade nem faz reconhecimento facial. A compatibilidade é só uma indicação técnica.')}
      </Text>
      {!c.aiEnabled ? (
        <SettingsRow icon="robot-outline" label={t('Sugestões da IA')} unavailable />
      ) : c.aiLoading ? (
        <ActivityIndicator color={brand.orange} />
      ) : c.suggestions.length === 0 ? (
        <Text style={s.muted}>{t('Nenhuma sugestão aguardando revisão.')}</Text>
      ) : (
        c.suggestions.map((item) => (
          <View key={item.id} style={s.card}>
            <Text style={s.cardTitle}>{t(AI_KIND_LABEL[item.kind])}</Text>
            <View style={[s.chip, { borderColor: brand.categoryElder }]}>
              <Text style={[s.chipText, { color: brand.categoryElder }]}>{t(AI_INDICATION_LABEL[item.indication])}</Text>
            </View>
            {item.reasons.map((reason) => (
              <Text key={reason} style={s.bullet}>
                • {reason}
              </Text>
            ))}
            {item.reportIds.length > 0 ? (
              <Text style={s.muted}>{t('Relatos: {ids}', { ids: item.reportIds.join(', ') })}</Text>
            ) : null}
            <View style={s.row}>
              <BrandButton label={t('Aceitar para análise')} variant="blue" loading={c.busy} onPress={() => c.decideAi(item.id, true)} />
              <BrandButton label={t('Descartar')} variant="outline" loading={c.busy} onPress={() => c.decideAi(item.id, false)} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

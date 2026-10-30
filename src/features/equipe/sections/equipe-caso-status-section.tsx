import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import type { EquipeCasoController } from '@/features/equipe/equipe-caso.controller';
import { makeEquipeStyles } from '@/features/equipe/sections/equipe-styles';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** Situação do caso (endpoint que a API já tem), só com as mudanças permitidas. */
export function EquipeCasoStatusSection({ controller: c }: { controller: EquipeCasoController }) {
  const t = useT();
  const brand = useBrand();
  const s = useMemo(() => makeEquipeStyles(brand), [brand]);
  return (
    <View style={s.section}>
      <Text style={s.title} accessibilityRole="header">
        {t('Situação do caso')}
      </Text>
      <Text style={s.text}>{t('Situação atual: {status}', { status: c.currentStatus })}</Text>
      {c.transitions.length === 0 ? (
        <Text style={s.muted}>{t('Caso encerrado: a situação não muda mais.')}</Text>
      ) : (
        <View style={s.row}>
          {c.transitions.map((next) => (
            <BrandButton
              key={next}
              label={t('Mudar para {status}', { status: c.statusLabel(next) })}
              variant="outline"
              loading={c.busy}
              onPress={() => c.changeStatus(next)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

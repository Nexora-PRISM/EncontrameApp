import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { SupportersGrid } from '@/components/supporters-grid';
import { Radius, type BrandColors } from '@/constants/brand';
import { useSupportersSectionController } from '@/features/apoiadores/supporters-section.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SUPPORTERS_INTRO } from '@/lib/supporter-labels';

type Props = {
  /** Espaço extra acima (no fim da lista do Início). */
  spaced?: boolean;
};

/**
 * "Nossos apoiadores": reconhecimento discreto, sem cara de anúncio. Fica no fim da lista do Início e no Sobre.
 * Some sozinha quando o recurso está desligado ou quando não há marca publicada.
 */
export function SupportersSection({ spaced = false }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const c = useSupportersSectionController();

  if (!c.visible) return null;

  return (
    <View style={[styles.card, spaced && styles.spaced]}>
      <View style={styles.head}>
        <View style={styles.rule} />
        <Text style={styles.overline} accessibilityRole="header">
          {t('Nossos apoiadores')}
        </Text>
        <View style={styles.rule} />
      </View>
      <Text style={styles.intro}>{t(SUPPORTERS_INTRO)}</Text>
      <SupportersGrid supporters={c.supporters} onOpen={(supporter) => void c.openSite(supporter)} />
      {c.demo ? <Text style={styles.demo}>{t('Demonstração: empresas fictícias, só para testar a seção.')}</Text> : null}
      <BrandButton
        label={t('Conheça nossos apoiadores')}
        variant="outline"
        trailingIcon="arrow-right"
        onPress={c.goToAll}
      />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    card: {
      gap: 16,
      padding: 20,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    spaced: { marginTop: 20, marginBottom: 8 },
    head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rule: { flex: 1, height: StyleSheet.hairlineWidth * 2, backgroundColor: brand.divider },
    overline: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: brand.textMuted,
    },
    intro: { fontSize: 15, lineHeight: 22, textAlign: 'center', color: brand.textMuted },
    demo: { fontSize: 13, lineHeight: 18, textAlign: 'center', fontStyle: 'italic', color: brand.textMuted },
  });
}

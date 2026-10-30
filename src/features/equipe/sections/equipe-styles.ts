import { StyleSheet } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';

/** Estilos comuns às seções do caso no Painel da equipe. */
export function makeEquipeStyles(brand: BrandColors) {
  return StyleSheet.create({
    section: { gap: 12 },
    title: { fontSize: 19, fontWeight: '800', color: brand.textDark },
    text: { fontSize: 15, lineHeight: 21, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    card: {
      gap: 6,
      padding: 14,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.surface,
    },
    cardTitle: { fontSize: 16, fontWeight: '800', color: brand.textDark },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    chip: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
    },
    chipText: { fontSize: 13, fontWeight: '700' },
    metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    metric: {
      flexGrow: 1,
      flexBasis: 140,
      gap: 2,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    metricValue: { fontSize: 22, fontWeight: '900', color: brand.navy },
    metricLabel: { fontSize: 13, color: brand.textMuted },
    map: { height: 260, width: '100%', borderRadius: Radius.lg, overflow: 'hidden' },
    bullet: { fontSize: 15, lineHeight: 21, color: brand.textDark, paddingLeft: 4 },
  });
}

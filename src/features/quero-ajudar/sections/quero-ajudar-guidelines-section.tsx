import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';

export const VOLUNTEER_GUIDELINES = [
  msg('Nunca faça buscas sozinho em lugares perigosos.'),
  msg('Não entre em propriedades nem aborde pessoas.'),
  msg('Não entre em confronto. Se houver risco, ligue 190.'),
  msg('Divulgue só o cartaz e o link oficiais do caso.'),
  msg('Não compartilhe dados das famílias nem de quem enviou informações.'),
  msg('Não existe ranking: toda ajuda conta igual.'),
];

/** Orientações de segurança, sempre visíveis, antes de qualquer cadastro. */
export function QueroAjudarGuidelinesSection() {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {t('Antes de ajudar')}
      </Text>
      {VOLUNTEER_GUIDELINES.map((item) => (
        <View key={item} style={styles.row}>
          <MaterialCommunityIcons name="check-circle-outline" size={22} color={brand.categoryAdult} />
          <Text style={styles.text}>{t(item)}</Text>
        </View>
      ))}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    card: { gap: 12, padding: 16, borderRadius: Radius.lg, backgroundColor: brand.surface, borderWidth: 1, borderColor: brand.divider },
    title: { fontSize: 19, fontWeight: '800', color: brand.textDark },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    text: { flex: 1, fontSize: 16, lineHeight: 23, color: brand.textDark },
  });
}

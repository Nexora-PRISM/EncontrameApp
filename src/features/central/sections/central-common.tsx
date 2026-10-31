import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsRow } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { CENTRAL_ROLE_LABEL } from '@/lib/central-labels';
import { CENTRAL_ROLES, type CentralRole } from '@/lib/central-rules';
import { useT } from '@/lib/i18n';

/** Troca de perfil e de segundo fator do modo de demonstração (só com dados fictícios). */
export function CentralDemoSwitcher({
  role,
  mfa,
  onRole,
  onMfa,
}: {
  role: CentralRole | undefined;
  mfa: boolean;
  onRole: (role: CentralRole) => void;
  onMfa: (value: boolean) => void;
}) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  return (
    <View style={styles.box}>
      <View style={styles.head}>
        <MaterialCommunityIcons name="flask-outline" size={20} color={brand.navy} />
        <Text style={styles.title}>{t('Demonstração: ver a Central como')}</Text>
      </View>
      <View style={styles.row} accessibilityRole="radiogroup">
        {CENTRAL_ROLES.map((item) => {
          const selected = item === role;
          return (
            <Pressable
              key={item}
              onPress={() => onRole(item)}
              style={[styles.option, selected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{t(CENTRAL_ROLE_LABEL[item])}</Text>
            </Pressable>
          );
        })}
      </View>
      <SettingsRow
        icon="two-factor-authentication"
        label={t('Segundo fator confirmado (simulado)')}
        switchValue={mfa}
        onSwitchChange={onMfa}
      />
      <Text style={styles.hint}>
        {t('Perfis fictícios. Na versão real, a função vem da conta, a habilitação é verificada pela equipe e o segundo fator é pedido a cada sessão.')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    box: { gap: 10, padding: 12, borderRadius: Radius.md, backgroundColor: brand.cream },
    head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 15, fontWeight: '800', color: brand.navy },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    option: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: brand.navy,
      backgroundColor: brand.white,
    },
    optionSelected: { backgroundColor: brand.navy },
    optionText: { fontSize: 14, fontWeight: '700', color: brand.navy },
    optionTextSelected: { color: brand.onPrimary },
    hint: { fontSize: 13, lineHeight: 18, color: brand.navy },
  });
}

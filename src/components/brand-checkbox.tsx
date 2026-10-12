import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';

type Props = {
  checked: boolean;
  onToggle: () => void;
  /** Texto do aceite. Pode conter <Text onPress> para links (ex.: regras de uso). */
  children: ReactNode;
  /** Rótulo lido pelo leitor de tela (texto completo, sem formatação). */
  accessibilityLabel: string;
  error?: string;
};

/** Caixa de seleção da identidade (aceites e declarações). Área de toque ≥ 44 px. */
export function BrandCheckbox({ checked, onToggle, children, accessibilityLabel, error }: Props) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onToggle}
        style={styles.row}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={accessibilityLabel}
        hitSlop={4}
      >
        <MaterialCommunityIcons
          name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={26}
          color={error ? brand.error : checked ? brand.blue : brand.label}
        />
        <Text style={styles.label}>{children}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrapper: {
      gap: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      minHeight: 44,
      paddingVertical: 4,
    },
    label: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    error: {
      marginLeft: 36,
      fontSize: 13,
      color: brand.error,
    },
  });
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { EmergencySheet } from '@/components/emergency-sheet';
import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

/** "Pedir ajuda" no header fixo da web: abre a mesma folha de emergência da barra inferior. */
export function EmergencyHelpButton({ height = 44 }: { height?: number }) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand, height), [brand, height]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.pill, pressed && { backgroundColor: brand.emergencyDark }]}
        accessibilityRole="button"
        accessibilityLabel={t('Pedir ajuda')}
        accessibilityHint={t('Mostra os números de emergência e como comunicar um desaparecimento')}
      >
        <MaterialCommunityIcons name="alarm-light-outline" size={20} color={brand.onEmergency} />
        <Text style={styles.label} numberOfLines={1}>
          {t('Pedir ajuda')}
        </Text>
      </Pressable>
      <EmergencySheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

function makeStyles(brand: BrandColors, height: number) {
  return StyleSheet.create({
    pill: {
      height,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 18,
      borderRadius: Radius.pill,
      backgroundColor: brand.emergency,
    },
    label: {
      fontSize: 15,
      fontWeight: '800',
      color: brand.onEmergency,
    },
  });
}

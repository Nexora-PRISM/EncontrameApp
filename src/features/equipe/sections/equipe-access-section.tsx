import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = {
  checking: boolean;
  checkFailed: boolean;
  isStaff: boolean;
  demo: boolean;
  onRetry: () => void;
  children: ReactNode;
};

/** Só mostra o conteúdo para a equipe. Também avisa quando os dados são de demonstração. */
export function EquipeAccessGate({ checking, checkFailed, isStaff, demo, onRetry, children }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  }
  if (checkFailed) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{t('Não foi possível verificar o acesso.')}</Text>
        <BrandButton label={t('Tentar de novo')} variant="outline" onPress={onRetry} />
      </View>
    );
  }
  if (!isStaff) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="shield-lock-outline" size={44} color={brand.textMuted} />
        <Text style={styles.text}>{t('Esta área é só para a equipe do Encontra-me.')}</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      {demo ? <DemoBanner /> : null}
      {children}
    </View>
  );
}

/** Faixa que identifica dados fictícios (modo de demonstração). */
export function DemoBanner({ text }: { text?: string }) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <MaterialCommunityIcons name="flask-outline" size={20} color={brand.navy} />
      <Text style={styles.bannerText}>
        {text ?? t('Dados de demonstração: nada aqui é um caso, relato ou decisão de verdade.')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 20 },
    center: { alignItems: 'center', gap: 14, paddingVertical: 40 },
    text: { fontSize: 16, lineHeight: 23, textAlign: 'center', color: brand.textMuted },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.cream,
    },
    bannerText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.navy },
  });
}

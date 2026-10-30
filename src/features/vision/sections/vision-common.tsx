import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { ROLE_LABEL } from '@/lib/vision-labels';
import { VISION_ROLES, type VisionRole } from '@/lib/vision-rules';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Etiqueta colorida (situação, classificação, nível). O texto já vem traduzido. */
export function VisionChip({ label, color, icon }: { label: string; color: string; icon?: IconName }) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  return (
    <View style={[styles.chip, { borderColor: color }]}>
      {icon ? <MaterialCommunityIcons name={icon} size={14} color={color} /> : null}
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

/** Caixa de aviso (texto já traduzido). `tone="attention"` para limites importantes. */
export function VisionNotice({
  text,
  icon = 'information-outline',
  tone = 'info',
}: {
  text: string;
  icon?: IconName;
  tone?: 'info' | 'attention';
}) {
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  return (
    <View style={[styles.notice, tone === 'attention' && styles.noticeAttention]}>
      <MaterialCommunityIcons name={icon} size={22} color={brand.navy} />
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

/** Carregando, erro ou vazio — sempre com texto grande e, quando dá, um botão. */
export function VisionState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean;
  error?: string;
  empty?: string;
  onRetry?: () => void;
}) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  if (loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  }
  const text = error ?? empty;
  if (!text) return null;
  return (
    <View style={styles.state}>
      <Text style={styles.stateText}>{text}</Text>
      {error && onRetry ? <BrandButton label={t('Tentar de novo')} variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

/**
 * Troca de perfil do modo de demonstração: permite testar os três ambientes (comunidade, responsável por câmera,
 * institucional) e a equipe técnica. Só aparece com dados fictícios.
 */
export function VisionDemoSwitcher({ role, onChange }: { role: VisionRole | undefined; onChange: (role: VisionRole) => void }) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  return (
    <View style={styles.switcher}>
      <View style={styles.switcherHead}>
        <MaterialCommunityIcons name="flask-outline" size={20} color={brand.navy} />
        <Text style={styles.switcherTitle}>{t('Demonstração: ver o Vision como')}</Text>
      </View>
      <View style={styles.switcherRow} accessibilityRole="radiogroup">
        {VISION_ROLES.map((item) => {
          const selected = item === role;
          return (
            <Pressable
              key={item}
              onPress={() => onChange(item)}
              style={[styles.option, selected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{t(ROLE_LABEL[item])}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.switcherHint}>
        {t('Perfis fictícios. Na versão real, a função vem da conta e a habilitação institucional é verificada pela equipe.')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    chip: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
    },
    chipText: { fontSize: 13, fontWeight: '700' },
    notice: {
      flexDirection: 'row',
      gap: 10,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    noticeAttention: { backgroundColor: brand.attentionSoft, borderColor: brand.attentionBorder },
    noticeText: { flex: 1, fontSize: 15, lineHeight: 21, color: brand.textDark },
    state: { alignItems: 'center', gap: 14, paddingVertical: 28 },
    stateText: { fontSize: 16, lineHeight: 23, textAlign: 'center', color: brand.textMuted },
    switcher: { gap: 10, padding: 12, borderRadius: Radius.md, backgroundColor: brand.cream },
    switcherHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    switcherTitle: { fontSize: 15, fontWeight: '800', color: brand.navy },
    switcherRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
    switcherHint: { fontSize: 13, lineHeight: 18, color: brand.navy },
  });
}

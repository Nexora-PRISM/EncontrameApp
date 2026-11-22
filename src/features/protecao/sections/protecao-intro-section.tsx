import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import type { ProtecaoController } from '@/features/protecao/protecao.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: ProtecaoController;
}

/** Primeiro a segurança: em perigo agora, ligar vem antes de qualquer formulário. */
export function ProtecaoIntroSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.block}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="shield-lock-outline" size={24} color={brand.orangeText} />
        <Text style={styles.title}>{t('Sua segurança vem primeiro')}</Text>
      </View>
      <Text style={styles.body}>
        {t('Se você está em perigo agora, ligue antes de preencher qualquer coisa. O Encontra-me não avisa a polícia sozinho.')}
      </Text>
      <View style={styles.calls}>
        {[
          { number: '190', name: t('Polícia Militar') },
          { number: '180', name: t('Central de Atendimento à Mulher') },
        ].map((line) => (
          <Pressable
            key={line.number}
            onPress={() => c.call(line.number)}
            style={({ pressed }) => [styles.call, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t('Ligar {number}, {name}', { number: line.number, name: line.name })}
          >
            <Text style={styles.callNumber}>{line.number}</Text>
            <Text style={styles.callName}>{line.name}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.link} onPress={c.goToEmergency} accessibilityRole="link">
        {t('Ver todas as opções de "Pedir ajuda"')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    block: {
      gap: 10,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.attentionSoft,
      borderWidth: 1,
      borderColor: brand.attentionBorder,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: brand.textDark,
    },
    body: {
      fontSize: 15,
      lineHeight: 21,
      color: brand.textDark,
    },
    calls: {
      flexDirection: 'row',
      gap: 8,
    },
    call: {
      flex: 1,
      minHeight: 64,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.attentionBorder,
    },
    callNumber: {
      fontSize: 22,
      fontWeight: '900',
      color: brand.textDark,
    },
    callName: {
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
      color: brand.textMuted,
    },
    link: {
      fontSize: 14,
      fontWeight: '700',
      color: brand.blue,
      textDecorationLine: 'underline',
    },
    pressed: {
      opacity: 0.85,
    },
  });
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { PageGutter } from '@/constants/theme';
import type { SofiaPerfilController } from '@/features/sofia-perfil/sofia-perfil.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = {
  controller: SofiaPerfilController;
};

export function SofiaPerfilHeroSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/sofia-avatar.jpg')}
          style={styles.avatar}
          resizeMode="cover"
          accessibilityLabel={t('Sofia')}
        />
        <Text style={styles.name}>{t('Sofia')}</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.status}>{t('aqui com você')}</Text>
        </View>
        <Text style={styles.role}>{t('IA de apoio emocional do Encontra-me')}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={controller.goBackToChat}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel={t('Conversar')}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons name="message-text-outline" size={22} color={brand.blue} />
          </View>
          <Text style={styles.actionLabel}>{t('Conversar')}</Text>
        </Pressable>
        <Pressable
          onPress={controller.goToExercises}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel={t('Exercícios')}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons name="heart-outline" size={22} color={brand.blue} />
          </View>
          <Text style={styles.actionLabel}>{t('Exercícios')}</Text>
        </Pressable>
        <Pressable
          onPress={controller.goToTheme}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel={t('Personalizar cores')}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons name="palette-outline" size={22} color={brand.blue} />
          </View>
          <Text style={styles.actionLabel}>{t('Cores')}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>{t('Sobre')}</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutText}>
          {t('Sofia é uma inteligência artificial criada para conversar e oferecer apoio. Ela não é psicóloga, terapeuta ou médica e não substitui atendimento humano profissional. Não realiza diagnósticos, tratamentos ou atendimento de emergência.')}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>{t('Em emergência no Brasil')}</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutText}>
          {t('188 · CVV (apoio emocional)\n192 · SAMU\n193 · Bombeiros\n190 · Polícia Militar')}
        </Text>
      </View>
    </ScrollView>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: PageGutter,
      paddingBottom: 40,
    },
    hero: {
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 24,
    },
    avatar: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: brand.avatarBackground,
      marginBottom: 16,
    },
    name: {
      fontSize: 28,
      fontWeight: '800',
      color: brand.textDark,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: brand.blue,
    },
    status: {
      fontSize: 15,
      color: brand.textMuted,
    },
    role: {
      fontSize: 14,
      color: brand.label,
      marginTop: 8,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginBottom: 28,
    },
    action: {
      alignItems: 'center',
      gap: 8,
      minWidth: 72,
    },
    actionPressed: {
      opacity: 0.75,
    },
    actionIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: brand.blue,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: brand.label,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    aboutCard: {
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
      marginBottom: 20,
    },
    aboutText: {
      fontSize: 14,
      lineHeight: 22,
      color: brand.textMuted,
    },
  });
}

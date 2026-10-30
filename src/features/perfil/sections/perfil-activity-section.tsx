import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { PerfilController } from '@/features/perfil/perfil.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: PerfilController };

type Shortcut = {
  key: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
};

/** Atividades, atalhos e acessos rápidos do perfil. */
export function PerfilActivitySection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  const shortcuts: Shortcut[] = [
    { key: 'register', icon: 'account-plus-outline', label: t('Cadastrar pessoa'), onPress: controller.goToRegister },
    { key: 'people', icon: 'account-search-outline', label: t('Ver casos'), onPress: controller.goToAllPeople },
    { key: 'sofia', icon: 'robot-happy-outline', label: t('Falar com a Sofia'), onPress: controller.goToChat },
    { key: 'group', icon: 'account-group-outline', label: t('Grupo de apoio'), onPress: controller.goToGroupChat },
  ];
  if (controller.sightingReportsEnabled) {
    shortcuts.push({
      key: 'reports',
      icon: 'eye-check-outline',
      label: t('Meus relatos'),
      onPress: controller.goToMyReports,
    });
  }

  const pending = controller.localPendingCount;

  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <Text style={styles.title} accessibilityRole="header">
          {t('Minhas atividades')}
        </Text>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={26} color={brand.blue} />
          <View style={styles.statTexts}>
            <Text style={styles.statNumber}>{pending == null ? '—' : pending}</Text>
            <Text style={styles.statLabel}>
              {pending === 1 ? t('cadastro aguardando envio') : t('cadastros aguardando envio')}
            </Text>
          </View>
        </View>
        <Text style={styles.note}>
          {controller.sightingReportsEnabled
            ? t('Os avistamentos que você enviou ficam em "Meus relatos". Em breve você verá aqui também os alertas que publicou.')
            : t('Em breve você verá aqui os alertas que publicou e os avistamentos que enviou.')}
        </Text>
      </View>

      {controller.localDrafts.length > 0 ? (
        <SettingsGroup
          title={t('Revisar e enviar')}
          footer={t('Estes cadastros foram feitos neste aparelho sem conta. Nada é enviado sem a sua revisão: confira os dados, aceite a declaração e o caso passa a ficar ligado à sua conta.')}
        >
          {controller.localDrafts.map((draft) => (
            <SettingsRow
              key={draft.id}
              icon="cloud-upload-outline"
              label={draft.name || t('Cadastro sem nome')}
              description={t('Toque para revisar e enviar')}
              onPress={() => controller.reviewDraft(draft.id)}
            />
          ))}
        </SettingsGroup>
      ) : null}

      <View style={styles.block}>
        <Text style={styles.title} accessibilityRole="header">
          {t('Atalhos')}
        </Text>
        <View style={styles.grid}>
          {shortcuts.map((item) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={styles.shortcut}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <MaterialCommunityIcons name={item.icon} size={26} color={brand.blue} />
              <Text style={styles.shortcutText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SettingsGroup title={t('Segurança')}>
        <SettingsRow
          icon="account-multiple-check-outline"
          label={t('Contatos de confiança')}
          description={t('Para mandar sua localização com um toque.')}
          onPress={controller.goToTrustedContacts}
        />
        <SettingsRow
          icon="map-marker-account-outline"
          label={t('Compartilhar minha localização')}
          onPress={controller.goToShareLocation}
        />
        <SettingsRow icon="home-heart" label={t('Círculo familiar')} unavailable />
      </SettingsGroup>

      <SettingsGroup title={t('Mais')}>
        <SettingsRow icon="help-circle-outline" label={t('Ajuda e suporte')} onPress={controller.goToHelp} />
        <SettingsRow icon="cog-outline" label={t('Configurações')} onPress={controller.goToSettings} />
      </SettingsGroup>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 24,
    },
    block: {
      gap: 10,
    },
    title: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: brand.label,
      paddingHorizontal: 4,
    },
    statCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    statTexts: {
      flex: 1,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: brand.textDark,
    },
    statLabel: {
      fontSize: 14,
      color: brand.textMuted,
    },
    note: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
      paddingHorizontal: 4,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    shortcut: {
      flexGrow: 1,
      flexBasis: '45%',
      minHeight: 88,
      gap: 8,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    shortcutText: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.textDark,
    },
  });
}

import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { SobreController } from '@/features/sobre/sobre.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: SobreController };

export function SobreInfoSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const { info } = controller;

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel={t('Logo do {name}', { name: info.name })}
        />
        <Text style={styles.name} accessibilityRole="header">
          {info.name}
        </Text>
        <Text style={styles.slogan}>“{info.slogan}”</Text>
        <Text style={styles.company}>{info.companyLine}</Text>
      </View>

      <Text style={styles.mission}>{t(info.mission)}</Text>

      <SettingsGroup title={t('Aplicativo')}>
        <SettingsRow icon="information-outline" label={t('Versão')} value={controller.version} />
        <SettingsRow icon="domain" label={t('Empresa responsável')} value={info.company} />
      </SettingsGroup>

      <SettingsGroup title={t('Contato')}>
        <SettingsRow
          icon="email-outline"
          label={t('E-mail')}
          description={info.supportEmail}
          onPress={controller.openEmail}
        />
        <SettingsRow
          icon="web"
          label={t('Site da Nexora Prism')}
          description={info.companySite.replace('https://', '')}
          onPress={controller.openSite}
        />
      </SettingsGroup>

      <SettingsGroup
        title={t('Documentos')}
        footer={t('Os termos de uso e a política de privacidade completos estão em revisão jurídica e serão publicados antes do lançamento.')}
      >
        <SettingsRow
          icon="clipboard-check-outline"
          label={t('Regras de uso e privacidade')}
          description={t('Resumo das regras da comunidade e do uso dos seus dados.')}
          onPress={controller.goToRules}
        />
        <SettingsRow icon="file-document-outline" label={t('Termos de uso')} unavailable />
        <SettingsRow icon="shield-account-outline" label={t('Política de privacidade')} unavailable />
      </SettingsGroup>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 24,
    },
    hero: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 24,
      paddingHorizontal: 16,
      borderRadius: Radius.xl,
      backgroundColor: brand.navy,
    },
    logo: {
      width: 96,
      height: 96,
    },
    name: {
      fontSize: 26,
      fontWeight: '800',
      color: brand.onPrimary,
    },
    slogan: {
      fontSize: 16,
      fontStyle: 'italic',
      textAlign: 'center',
      color: brand.cream,
    },
    mission: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      color: brand.textMuted,
      paddingHorizontal: 8,
    },
    company: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
      color: brand.onPrimary,
    },
  });
}

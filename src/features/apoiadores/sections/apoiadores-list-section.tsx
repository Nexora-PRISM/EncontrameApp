import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { SupportersGrid } from '@/components/supporters-grid';
import { type BrandColors } from '@/constants/brand';
import type { ApoiadoresController } from '@/features/apoiadores/apoiadores.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { SUPPORTER_CATEGORY_TITLE, SUPPORTERS_INTRO } from '@/lib/supporter-labels';

type Props = { controller: ApoiadoresController };

export function ApoiadoresListSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <MaterialCommunityIcons name="handshake-outline" size={34} color={brand.blue} />
        <Text style={styles.intro}>{t(SUPPORTERS_INTRO)}</Text>
      </View>

      {!c.enabled ? (
        <Text style={styles.muted}>{t('Esta área ainda não está disponível.')}</Text>
      ) : c.loading ? (
        <ActivityIndicator size="large" color={brand.orange} />
      ) : c.error ? (
        <View style={styles.center}>
          <Text style={styles.muted}>{t('Não foi possível carregar os apoiadores.')}</Text>
          <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
        </View>
      ) : c.empty ? (
        <Text style={styles.muted}>{t('Ainda não há apoiadores publicados.')}</Text>
      ) : (
        c.groups.map((group) => (
          <View key={group.category} style={styles.group}>
            <Text style={styles.groupTitle} accessibilityRole="header">
              {t(SUPPORTER_CATEGORY_TITLE[group.category])}
            </Text>
            <SupportersGrid supporters={group.items} onOpen={(supporter) => void c.openSite(supporter)} showNames />
          </View>
        ))
      )}

      {c.demo ? <Text style={styles.demo}>{t('Demonstração: empresas fictícias, só para testar a seção.')}</Text> : null}

      <Text style={styles.note}>
        {t(
          'As marcas só aparecem com autorização das empresas. As categorias organizam o reconhecimento e não indicam valores. Apoiar o projeto não dá acesso a dados de casos nem de quem usa o app.',
        )}
      </Text>

      <SettingsGroup
        title={t('Quer apoiar o Encontra-me?')}
        footer={t('Abre o seu app de e-mail com a mensagem pronta. Ela só chega à equipe quando você enviar.')}
      >
        <SettingsRow
          icon="email-outline"
          label={t('Falar com a equipe')}
          description={t('Empresas e organizações interessadas em apoiar a causa.')}
          onPress={() => void c.contact()}
        />
      </SettingsGroup>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 24 },
    hero: { alignItems: 'center', gap: 12, paddingHorizontal: 8 },
    intro: { fontSize: 17, lineHeight: 25, textAlign: 'center', color: brand.textDark },
    center: { alignItems: 'center', gap: 12 },
    muted: { fontSize: 15, lineHeight: 21, textAlign: 'center', color: brand.textMuted },
    group: { gap: 12 },
    groupTitle: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: brand.textMuted,
    },
    demo: { fontSize: 13, lineHeight: 18, textAlign: 'center', fontStyle: 'italic', color: brand.textMuted },
    note: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
  });
}

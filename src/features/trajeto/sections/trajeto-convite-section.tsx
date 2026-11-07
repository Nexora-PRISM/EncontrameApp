import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { TrajetoConviteController } from '@/features/trajeto/trajeto-convite.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: TrajetoConviteController };

export function TrajetoConviteSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.enabled) {
    return (
      <SettingsGroup title={t('Convite')}>
        <SettingsRow icon="account-heart-outline" label={t('Compartilhar meu trajeto')} unavailable />
      </SettingsGroup>
    );
  }
  if (c.loading) return <ActivityIndicator size="large" color={brand.orange} />;
  if (c.unavailable || !c.preview) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.text}>{t('Este convite não está disponível. Ele pode ter vencido (48 horas) ou já ter sido usado. Peça um novo.')}</Text>
        <BrandButton label={t('Voltar')} variant="outline" onPress={c.decline} />
      </View>
    );
  }
  if (c.preview.ownInvite) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.text}>{t('Este convite é seu. Mande o link ou o código para a pessoa que vai acompanhar seus trajetos.')}</Text>
        <BrandButton label={t('Voltar')} variant="outline" onPress={c.decline} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.box} accessible accessibilityRole="summary">
        <MaterialCommunityIcons name="account-heart-outline" size={30} color={brand.blue} />
        <Text style={styles.title}>{t('{name} quer que você acompanhe os trajetos que escolher compartilhar.', { name: c.preview.ownerName })}</Text>
        <Text style={styles.muted}>{c.expires}</Text>
      </View>
      {c.preview.alreadyConnected ? (
        <Text style={styles.text}>{t('Vocês já estão conectados. Aceitar de novo não muda nada.')}</Text>
      ) : null}
      <Text style={styles.heading}>{t('Ao aceitar')}</Text>
      <Text style={styles.text}>{t('• Você só vê a localização quando {name} escolher você para um trajeto, e só até a chegada ou o encerramento.', { name: c.preview.ownerName })}</Text>
      <Text style={styles.text}>{t('• Você recebe avisos de início, chegada, atraso e falta de sinal desses trajetos.')}</Text>
      <Text style={styles.text}>{t('• Se não conseguir falar com a pessoa depois de um atraso, você pode acionar o Sinal de Alerta para a equipe do Encontra-me analisar.')}</Text>
      <Text style={styles.text}>{t('• Você não pode iniciar um acompanhamento, e qualquer um dos dois pode desfazer o vínculo quando quiser.')}</Text>
      <BrandButton label={t('Aceitar convite')} variant="blue" loading={c.accepting} onPress={c.accept} />
      <BrandButton label={t('Agora não')} variant="outline" onPress={c.decline} />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 12 },
    box: {
      gap: 8,
      alignItems: 'flex-start',
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    title: { fontSize: 18, lineHeight: 25, fontWeight: '900', color: brand.textDark },
    heading: { fontSize: 16, fontWeight: '900', color: brand.textDark, marginTop: 4 },
    text: { fontSize: 15, lineHeight: 22, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
  });
}

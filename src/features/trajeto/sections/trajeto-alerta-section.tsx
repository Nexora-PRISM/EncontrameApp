import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { Radius, type BrandColors } from '@/constants/brand';
import type { TrajetoAlertaController } from '@/features/trajeto/trajeto-alerta.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: TrajetoAlertaController };

export function TrajetoAlertaSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!c.enabled) {
    return (
      <SettingsGroup title={t('Sinal de Alerta')}>
        <SettingsRow icon="bell-alert-outline" label={t('Sinal de Alerta')} unavailable />
      </SettingsGroup>
    );
  }
  if (c.loading) return <ActivityIndicator size="large" color={brand.orange} />;
  if (c.unavailable || !c.trip) {
    return <Text style={styles.text}>{t('Este trajeto não está mais disponível para você.')}</Text>;
  }

  if (c.receipt) {
    return (
      <View style={styles.wrap}>
        <View style={styles.receipt} accessible accessibilityRole="summary">
          <MaterialCommunityIcons name="check-decagram-outline" size={28} color={brand.blue} />
          <Text style={styles.title}>{c.receiptText}</Text>
          <Text style={styles.text}>{c.receiptPoint}</Text>
          <Text style={styles.text}>
            {c.receipt.alreadyOpen
              ? t('Já havia um alerta aberto para este trajeto: sua informação foi acrescentada a ele.')
              : t('A equipe do Encontra-me recebeu o alerta com a última localização, o horário e o trajeto. {name} e os outros contatos também são avisados.', { name: c.trip.ownerName })}
          </Text>
          <Text style={styles.muted}>
            {t('O Encontra-me não chama a polícia sozinho. Se houver risco, ligue 190 agora.')}
          </Text>
        </View>
        <BrandButton label={t('Ligar 190')} variant="outline" trailingIcon="phone" onPress={c.call190} />
        <BrandButton label={t('Comunicar desaparecimento')} variant="outline" onPress={c.registerCase} />
        <Text style={styles.muted}>
          {t('O cadastro de desaparecimento passa pela análise da equipe antes de aparecer no app. Faça só se a família decidir.')}
        </Text>
        <BrandButton label={t('Voltar ao trajeto')} variant="blue" onPress={c.backToTrip} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.box}>
        <Text style={styles.title}>{t('Acionar o Sinal de Alerta sobre {name}', { name: c.trip.ownerName })}</Text>
        {c.reasonLabel ? <Text style={styles.text}>{c.reasonLabel}</Text> : null}
        {c.alreadyOpen ? (
          <Text style={styles.muted}>{t('Já existe um alerta aberto: o que você escrever será acrescentado a ele.')}</Text>
        ) : null}
        <Text style={styles.muted}>
          {t('O alerta vai para a equipe do Encontra-me, com a última localização, o horário e o trajeto. Não é publicado no app, não diz que a pessoa desapareceu e não chama a polícia.')}
        </Text>
      </View>

      <BrandCheckbox checked={c.tried} onToggle={c.toggleTried} accessibilityLabel={t('Tentei falar com a pessoa e não consegui')} error={c.errors.tried}>
        <Text style={styles.text}>{t('Tentei falar com a pessoa e não consegui')}</Text>
      </BrandCheckbox>
      <BrandField
        label={t('Como e quando você tentou falar com ela?')}
        value={c.attempt}
        onChangeText={c.setAttempt}
        placeholder={t('Ex.: liguei 3 vezes às 22h10 e mandei mensagem, sem resposta')}
        maxLength={c.attemptMax}
        multiline
        error={c.errors.attempt}
      />
      {c.failure ? (
        <Text style={styles.warn} accessibilityRole="alert">
          {c.failure}
        </Text>
      ) : null}
      <BrandButton label={t('Acionar sinal de alerta')} variant="blue" trailingIcon="bell-alert-outline" loading={c.sending} onPress={c.submit} />
      <BrandButton label={t('Ligar 190')} variant="outline" trailingIcon="phone" onPress={c.call190} />
      <Text style={styles.muted}>
        {t('Use o alerta só quando não conseguir falar com a pessoa. Alertas sem fundamento são encerrados pela equipe, e há um limite por dia.')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: { gap: 14 },
    box: {
      gap: 8,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.attentionSoft,
      borderWidth: 1,
      borderColor: brand.attentionBorder,
    },
    receipt: {
      gap: 8,
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    title: { fontSize: 18, fontWeight: '900', color: brand.textDark },
    text: { fontSize: 15, lineHeight: 22, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    warn: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: brand.orangeText },
  });
}

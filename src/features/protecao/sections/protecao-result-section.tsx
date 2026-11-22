import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { ProtecaoController } from '@/features/protecao/protecao.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: ProtecaoController;
}

/**
 * Depois do envio: diz exatamente o que aconteceu. "Registrado" só quando a API confirmou; o
 * e-mail só "chega" quando a pessoa envia no app de e-mail.
 */
export function ProtecaoResultSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const result = c.result;
  if (!result) return null;

  const lines: { icon: keyof typeof MaterialCommunityIcons.glyphMap; text: string }[] = [];
  if (result.registered) {
    lines.push({
      icon: 'check-circle-outline',
      text: t('Pedido registrado no app. A equipe vê a denúncia sobre este alerta e pode suspender a divulgação enquanto analisa.'),
    });
  } else if (c.hasPublishedCase && c.loggedIn) {
    lines.push({
      icon: 'alert-circle-outline',
      text: t('Não foi possível registrar pelo app agora (verifique a internet). O e-mail continua valendo.'),
    });
  }
  lines.push(
    result.emailOpened
      ? {
          icon: 'email-fast-outline',
          text: t('Seu app de e-mail abriu com a mensagem pronta. Confira e toque em enviar: só então ela chega à equipe.'),
        }
      : {
          icon: 'email-alert-outline',
          text: t('O app de e-mail não abriu. Escreva para {email} contando o que marcou aqui.', {
            email: c.supportEmail,
          }),
        },
  );
  lines.push({
    icon: 'account-lock-outline',
    text: t('Quem criou o alerta não recebe sua localização, sua foto nem seus dados.'),
  });

  return (
    <View style={styles.block} accessibilityLiveRegion="polite">
      <Text style={styles.title} accessibilityRole="header">
        {result.urgent ? t('Pedido urgente preparado') : t('Pedido preparado')}
      </Text>
      {lines.map((line) => (
        <View key={line.text} style={styles.row}>
          <MaterialCommunityIcons name={line.icon} size={20} color={brand.blue} />
          <Text style={styles.text}>{line.text}</Text>
        </View>
      ))}
      {result.urgent ? (
        <Text style={styles.urgent}>
          {t('Se você corre perigo agora, ligue 190. Violência contra a mulher: 180.')}
        </Text>
      ) : null}
      <BrandButton label={t('Fazer outro pedido')} variant="outline" onPress={c.startOver} />
      {c.goToCase ? (
        <BrandButton label={t('Voltar para o alerta')} variant="outline" onPress={c.goToCase} />
      ) : null}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    block: {
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    text: {
      flex: 1,
      fontSize: 15,
      lineHeight: 21,
      color: brand.textDark,
    },
    urgent: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
      color: brand.orangeText,
    },
  });
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { PessoaDetalheController } from '@/features/pessoa-detalhe/pessoa-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

interface Props {
  controller: PessoaDetalheController;
}

/**
 * "Algo errado neste cadastro?": pedir correção/atualização (inclusive "foi encontrada") ou
 * denunciar. Disponível para qualquer pessoa, com ou sem conta — denúncia não pode depender de login.
 */
export function PessoaDetalheFeedbackSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const { isWide } = useWideLayout();
  const styles = useMemo(() => makeStyles(brand, isWide), [brand, isWide]);

  if (!controller.person || controller.isLocalPerson) return null;

  return (
    <View style={styles.block}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="flag-outline" size={22} color={brand.orangeText} />
        <Text style={styles.title} accessibilityRole="header">
          {t('Algo errado neste cadastro?')}
        </Text>
      </View>
      <Text style={styles.body}>
        {t('Peça a correção se houver dados errados ou se a pessoa já foi encontrada. Denuncie se o cadastro for falso, um golpe ou puder colocar alguém em risco — inclusive se você é a pessoa cadastrada, está em segurança e não quer ser localizada.')}
      </Text>
      <View style={styles.actions}>
        <BrandButton
          label={t('Pedir correção ou atualização')}
          variant="outline"
          onPress={controller.requestCorrection}
          containerStyle={isWide ? styles.actionSlot : styles.actionFull}
          style={isWide ? styles.ghost : [styles.ghost, styles.actionFull]}
        />
        <BrandButton
          label={t('Denunciar este cadastro')}
          variant="outline"
          onPress={controller.reportCase}
          containerStyle={isWide ? styles.actionSlot : styles.actionFull}
          style={isWide ? styles.ghost : [styles.ghost, styles.actionFull]}
        />
        {controller.canBlockAuthor ? (
          <BrandButton
            label={t('Bloquear quem publicou')}
            variant="outline"
            onPress={controller.blockAuthor}
            containerStyle={isWide ? styles.actionSlot : styles.actionFull}
            style={isWide ? styles.ghost : [styles.ghost, styles.actionFull]}
          />
        ) : null}
      </View>
      <Text style={styles.note}>
        {t('A correção abre o seu app de e-mail. A denúncia fica registrada no app para a equipe analisar.')}
      </Text>
    </View>
  );
}

function makeStyles(brand: BrandColors, isWide: boolean) {
  return StyleSheet.create({
    block: {
      gap: 12,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.attentionSoft,
      borderWidth: 1,
      borderColor: brand.attentionBorder,
    },
    actions: {
      flexDirection: isWide ? 'row' : 'column',
      flexWrap: isWide ? 'wrap' : 'nowrap',
      alignItems: isWide ? 'center' : 'stretch',
      alignSelf: 'stretch',
      gap: isWide ? 10 : 12,
    },
    actionFull: {
      width: '100%',
      alignSelf: 'stretch',
    },
    actionSlot: {
      alignSelf: 'flex-start',
      flexGrow: 0,
      flexShrink: 1,
      maxWidth: '100%',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: brand.attentionBorder,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    note: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
  });
}

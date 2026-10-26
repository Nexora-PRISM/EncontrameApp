import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Radius, type BrandColors } from '@/constants/brand';
import type { PessoaDetalheController } from '@/features/pessoa-detalhe/pessoa-detalhe.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

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
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (!controller.person || controller.isLocalPerson) return null;

  return (
    <View style={styles.block}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="flag-outline" size={22} color={brand.blue} />
        <Text style={styles.title} accessibilityRole="header">
          {t('Algo errado neste cadastro?')}
        </Text>
      </View>
      <Text style={styles.body}>
        {t('Peça a correção se houver dados errados ou se a pessoa já foi encontrada. Denuncie se o cadastro for falso, um golpe ou puder colocar alguém em risco — inclusive se você é a pessoa cadastrada, está em segurança e não quer ser localizada.')}
      </Text>
      <BrandButton
        label={t('Pedir correção ou atualização')}
        variant="outline"
        onPress={controller.requestCorrection}
      />
      <BrandButton label={t('Denunciar este cadastro')} variant="outline" onPress={controller.reportCase} />
      {controller.canBlockAuthor ? (
        <BrandButton
          label={t('Bloquear quem publicou')}
          variant="outline"
          onPress={controller.blockAuthor}
        />
      ) : null}
      <Text style={styles.note}>
        {t('A correção abre o seu app de e-mail. A denúncia fica registrada no app para a equipe analisar.')}
      </Text>
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

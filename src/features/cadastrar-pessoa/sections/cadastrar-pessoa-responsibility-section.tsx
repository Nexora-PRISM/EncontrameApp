import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { BrandSelect } from '@/components/brand-select';
import { Radius, type BrandColors } from '@/constants/brand';
import {
  type CadastrarPessoaController,
  RELATIONSHIP_OPTIONS,
} from '@/features/cadastrar-pessoa/cadastrar-pessoa.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: CadastrarPessoaController;
}

/**
 * "Sobre quem cadastra": vínculo com a pessoa, boletim de ocorrência (obrigatório para menores)
 * e declaração de veracidade. Ajuda a evitar falsos alertas e o uso do app para perseguir alguém.
 */
export function CadastrarPessoaResponsibilitySection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const relationshipError = c.fieldError('reporterRelationship');

  return (
    <View style={styles.block}>
      <Text style={styles.title} accessibilityRole="header">
        {t('Sobre quem está cadastrando')}
      </Text>

      <View style={styles.field}>
        <BrandSelect
          label={t('Seu vínculo com a pessoa *')}
          value={c.reporterRelationship}
          options={RELATIONSHIP_OPTIONS}
          onSelect={c.setReporterRelationship}
          placeholder={t('Escolha')}
        />
        {relationshipError ? <Text style={styles.error}>{relationshipError}</Text> : null}
      </View>

      <BrandField
        label={t('Número do boletim de ocorrência')}
        value={c.policeReport}
        onChangeText={c.setPoliceReport}
        onBlur={c.blurPoliceReport}
        placeholder={t('Ex.: 2026-123456')}
        required={c.isMinor}
        error={c.fieldError('policeReport')}
      />
      <Text style={styles.hint}>
        {c.isMinor
          ? t('Para crianças e adolescentes, o número do boletim de ocorrência é obrigatório. Registre na delegacia mais próxima ou, se o seu estado permitir, na delegacia on-line — não é preciso esperar 24 horas.')
          : t('Recomendado. Com o boletim de ocorrência, o caso fica mais confiável para a comunidade.')}
      </Text>

      <BrandCheckbox
        checked={c.declarationAccepted}
        onToggle={c.toggleDeclaration}
        error={c.fieldError('declaration')}
        accessibilityLabel={t('Declaro que as informações são verdadeiras, que tenho vínculo com a pessoa ou autorização da família e que o cadastro não tem como objetivo perseguir ou expor ninguém')}
      >
        {t('Declaro que as informações são verdadeiras, que tenho vínculo com a pessoa ou autorização da família e que o cadastro não tem como objetivo perseguir ou expor ninguém. Sei que informações falsas podem levar ao bloqueio da conta e à responsabilização civil e criminal.')}{' '}
        <Text style={styles.link} onPress={c.goToRules} accessibilityRole="link">
          {t('Ver regras de uso')}
        </Text>
      </BrandCheckbox>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    block: {
      gap: 14,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: brand.textDark,
    },
    field: {
      gap: 6,
    },
    error: {
      fontSize: 13,
      color: brand.error,
    },
    hint: {
      marginTop: -6,
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    link: {
      color: brand.blue,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
}

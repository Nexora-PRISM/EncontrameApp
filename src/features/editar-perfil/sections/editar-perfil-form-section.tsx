import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import type { EditarPerfilController } from '@/features/editar-perfil/editar-perfil.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: EditarPerfilController;
}

export function EditarPerfilFormSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  if (c.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={brand.orange} />
      </View>
    );
  }

  if (!c.available) {
    return (
      <Text style={styles.note}>
        {t('Editar o perfil ainda não está disponível. Tente de novo mais tarde.')}
      </Text>
    );
  }

  if (c.loadError) {
    return (
      <View style={styles.form}>
        <Text style={styles.error}>{t('Não foi possível carregar seus dados.')}</Text>
        <BrandButton label={t('Tentar de novo')} variant="outline" onPress={c.retry} />
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <BrandField
        label={t('Nome completo')}
        value={c.name}
        onChangeText={c.setName}
        onBlur={c.blurName}
        autoComplete="name"
        required
        error={c.fieldError('name')}
      />
      <BrandField
        label={t('Celular')}
        value={c.cellPhone}
        onChangeText={c.setCellPhone}
        onBlur={c.blurCellPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="(31) 99999-9999"
        required
        error={c.fieldError('cellPhone')}
      />
      <BrandField
        label={t('CEP')}
        value={c.cep}
        onChangeText={c.setCep}
        onBlur={c.blurCep}
        keyboardType="number-pad"
        autoComplete="postal-code"
        placeholder="00000-000"
        error={c.fieldError('cep')}
      />
      <BrandField label={t('E-mail')} value={c.email} onChangeText={() => undefined} editable={false} />
      <View style={styles.box}>
        <Text style={styles.note}>
          {c.googleLinked
            ? t('Sua conta entra com o Google. Para trocar o e-mail, fale com a equipe pela Central de Ajuda.')
            : t('Para trocar o e-mail, fale com a equipe pela Central de Ajuda. Seu CPF não aparece no app e não muda.')}
        </Text>
      </View>
      {c.formError ? <Text style={styles.error}>{c.formError}</Text> : null}
      <BrandButton label={t('Salvar')} variant="orange" loading={c.saving} onPress={c.save} />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    center: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    form: {
      gap: 18,
    },
    box: {
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    note: {
      fontSize: 14,
      lineHeight: 20,
      color: brand.textDark,
    },
    error: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.error,
    },
  });
}

import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { Radius, type BrandColors } from '@/constants/brand';
import type { AlterarSenhaController } from '@/features/alterar-senha/alterar-senha.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface Props {
  controller: AlterarSenhaController;
}

export function AlterarSenhaFormSection({ controller: c }: Props) {
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
    return <Text style={styles.note}>{t('Alterar a senha pelo app ainda não está disponível. Tente de novo mais tarde.')}</Text>;
  }

  if (c.googleOnly) {
    return (
      <View style={styles.form}>
        <View style={styles.box}>
          <Text style={styles.note}>
            {t('Sua conta entra com o Google e não tem senha. Continue entrando com o botão do Google.')}
          </Text>
        </View>
        {c.canCreateByEmail ? (
          <BrandButton
            label={t('Criar uma senha pelo e-mail')}
            variant="outline"
            onPress={c.goToRecover}
          />
        ) : null}
      </View>
    );
  }

  const eye = c.show ? 'eye-off-outline' : 'eye-outline';
  const eyeLabel = c.show ? t('Ocultar senha') : t('Mostrar senha');

  return (
    <View style={styles.form}>
      <BrandField
        label={t('Senha atual')}
        value={c.values.currentPassword}
        onChangeText={c.setCurrentPassword}
        onBlur={c.blurCurrentPassword}
        secureTextEntry={!c.show}
        trailingIcon={eye}
        onTrailingPress={c.toggleShow}
        trailingAccessibilityLabel={eyeLabel}
        autoComplete="current-password"
        required
        error={c.fieldError('currentPassword')}
      />
      <BrandField
        label={t('Senha nova')}
        value={c.values.newPassword}
        onChangeText={c.setNewPassword}
        onBlur={c.blurNewPassword}
        secureTextEntry={!c.show}
        autoComplete="new-password"
        required
        error={c.fieldError('newPassword')}
      />
      <BrandField
        label={t('Repita a senha nova')}
        value={c.values.confirmPassword}
        onChangeText={c.setConfirmPassword}
        onBlur={c.blurConfirmPassword}
        secureTextEntry={!c.show}
        autoComplete="new-password"
        required
        error={c.fieldError('confirmPassword')}
      />
      <Text style={styles.hint}>{t('Pelo menos 8 caracteres, com letras e números.')}</Text>
      <View style={styles.box}>
        <Text style={styles.note}>
          {t('Ao trocar a senha, os outros aparelhos conectados à sua conta são desconectados.')}
        </Text>
      </View>
      {c.formError ? <Text style={styles.error}>{c.formError}</Text> : null}
      <BrandButton label={t('Alterar senha')} variant="orange" loading={c.submitting} onPress={c.submit} />
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
    hint: {
      fontSize: 13,
      color: brand.textMuted,
      marginTop: -8,
    },
    error: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.error,
    },
  });
}

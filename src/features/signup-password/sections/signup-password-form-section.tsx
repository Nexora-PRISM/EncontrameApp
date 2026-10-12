import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { type BrandColors } from '@/constants/brand';
import { BiometricEnrollSection } from '@/features/biometric/sections/biometric-enroll-section';
import type { SignupPasswordController } from '@/features/signup-password/signup-password.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface SignupPasswordFormSectionProps {
  controller: SignupPasswordController;
}

export function SignupPasswordFormSection({ controller }: SignupPasswordFormSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <>
      <View style={styles.form}>
        <View style={styles.fieldWithHint}>
          <BrandField
            label={t('Senha')}
            value={controller.password}
            onChangeText={controller.setPassword}
            placeholder="••••••••••••••"
            secureTextEntry={!controller.showPassword}
            trailingIcon={controller.showPassword ? 'eye-off-outline' : 'eye-outline'}
            onTrailingPress={controller.toggleShowPassword}
            trailingAccessibilityLabel={controller.showPassword ? t('Ocultar senha') : t('Mostrar senha')}
            autoComplete="new-password"
            required
            error={controller.fieldError('password')}
            onBlur={controller.blurPassword}
          />
          <Text style={styles.hint}>
            {t('Pelo menos 8 caracteres, com letras e números. Não use a mesma senha de outros sites.')}
          </Text>
        </View>
        <BrandField
          label={t('Confirmar senha')}
          value={controller.confirm}
          onChangeText={controller.setConfirm}
          placeholder="••••••••••••••"
          secureTextEntry={!controller.showPassword}
          autoComplete="new-password"
          required
          error={controller.fieldError('confirm')}
          onBlur={controller.blurConfirm}
        />
      </View>

      <View style={styles.footer}>
        <BrandButton
          label={t('Cadastrar')}
          variant="orange"
          loading={controller.submitting}
          onPress={controller.handleRegister}
        />
      </View>
      <BiometricEnrollSection controller={controller.enroll} />
    </>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    form: {
      marginTop: 20,
      gap: 20,
    },
    fieldWithHint: {
      gap: 6,
    },
    hint: {
      fontSize: 13,
      lineHeight: 18,
      color: brand.textMuted,
    },
    footer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
  });
}

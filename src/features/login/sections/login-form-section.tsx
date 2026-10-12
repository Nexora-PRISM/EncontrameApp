import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandField } from '@/components/brand-field';
import { GoogleAuthButton } from '@/components/google-auth-button';
import type { BrandColors } from '@/constants/brand';
import { BiometricEnrollSection } from '@/features/biometric/sections/biometric-enroll-section';
import type { LoginController } from '@/features/login/login.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface LoginFormSectionProps {
  controller: LoginController;
  /** Labels claros no fundo navy da home desktop. */
  tone?: 'default' | 'onDark';
  /** Remove margem superior (quando o form já vem embutido). */
  compact?: boolean;
}

export function LoginFormSection({
  controller,
  tone = 'default',
  compact = false,
}: LoginFormSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={[styles.form, compact && styles.formCompact]}>
      {controller.biometricAvailable ? (
        <>
          <BrandButton
            label={controller.biometricLabel}
            variant="outline"
            loading={controller.biometricSubmitting}
            disabled={controller.submitting}
            onPress={controller.handleBiometricLogin}
            trailingIcon={controller.biometricIcon}
          />
          <Text style={[styles.orLabel, tone === 'onDark' && styles.orLabelOnDark]}>{t('ou')}</Text>
        </>
      ) : null}
      <BrandField
        label={t('E-mail / CPF')}
        value={controller.identifier}
        onChangeText={controller.setIdentifier}
        placeholder={t('exemplo@email.com')}
        keyboardType="email-address"
        autoCapitalize="none"
        tone={tone}
        required
        error={controller.fieldError('identifier')}
        onBlur={controller.blurIdentifier}
      />
      <BrandField
        label={t('Senha')}
        value={controller.password}
        onChangeText={controller.setPassword}
        placeholder="••••••••••••••"
        secureTextEntry={!controller.showPassword}
        trailingIcon={controller.showPassword ? 'eye-off-outline' : 'eye-outline'}
        onTrailingPress={controller.toggleShowPassword}
        trailingAccessibilityLabel={controller.showPassword ? t('Ocultar senha') : t('Mostrar senha')}
        autoComplete="current-password"
        tone={tone}
        required
        error={controller.fieldError('password')}
        onBlur={controller.blurPassword}
      />
      {controller.formError ? (
        <Text style={styles.formError}>{controller.formError}</Text>
      ) : null}
      <BrandButton
        label={t('Entrar')}
        variant="orange"
        loading={controller.submitting}
        disabled={controller.biometricSubmitting}
        onPress={controller.handleLogin}
        style={styles.submit}
      />
      {controller.googleAvailable ? (
        <>
          <Text style={[styles.orLabel, tone === 'onDark' && styles.orLabelOnDark]}>{t('ou')}</Text>
          <GoogleAuthButton
            onPress={controller.handleGoogle}
            loading={controller.googleSubmitting}
            disabled={!controller.googleReady || controller.submitting || controller.biometricSubmitting}
          />
        </>
      ) : null}
      <Pressable onPress={controller.goToSignup} hitSlop={12} style={styles.signupHit}>
        <Text style={[styles.signupLink, tone === 'onDark' && styles.signupLinkOnDark]}>
          {t('Se cadastrar')}
        </Text>
      </Pressable>
      {controller.biometricAvailable ? (
        <Pressable
          onPress={controller.handleUseAnotherAccount}
          hitSlop={12}
          style={styles.signupHit}
        >
          <Text style={[styles.otherAccount, tone === 'onDark' && styles.signupLinkOnDark]}>
            {t('Usar outra conta')}
          </Text>
        </Pressable>
      ) : null}
      <BiometricEnrollSection controller={controller.enroll} />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    form: {
      marginTop: 28,
      gap: 20,
    },
    formCompact: {
      marginTop: 0,
    },
    formError: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.error,
    },
    submit: {
      marginTop: 8,
    },
    orLabel: {
      alignSelf: 'center',
      fontSize: 14,
      fontWeight: '600',
      color: brand.placeholder,
    },
    orLabelOnDark: {
      color: brand.cream,
    },
    signupHit: {
      alignSelf: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    signupLink: {
      color: brand.blue,
      fontSize: 15,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    signupLinkOnDark: {
      color: brand.cream,
    },
    otherAccount: {
      color: brand.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}

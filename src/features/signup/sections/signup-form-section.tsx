import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandCheckbox } from '@/components/brand-checkbox';
import { BrandField } from '@/components/brand-field';
import { FormRow } from '@/components/form-row';
import { type BrandColors } from '@/constants/brand';
import { BiometricEnrollSection } from '@/features/biometric/sections/biometric-enroll-section';
import { SignupGoogleControls } from '@/features/signup/sections/signup-google-controls';
import type { SignupController } from '@/features/signup/signup.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

interface SignupFormSectionProps {
  controller: SignupController;
}

export function SignupFormSection({ controller }: SignupFormSectionProps) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.form}>
      {controller.fromGoogle ? null : (
        <SignupGoogleControls
          onNeedsRegistration={controller.applyGoogleDraft}
          disabled={controller.submitting}
        />
      )}
      <FormRow>
        <BrandField
          label={t('Nome')}
          value={controller.name}
          onChangeText={controller.setName}
          placeholder={t('Fulano Beltrano da Silva')}
          autoCapitalize="words"
          required
          error={controller.fieldError('name')}
          onBlur={controller.blurName}
        />
        <BrandField
          label={t('CPF')}
          value={controller.cpf}
          onChangeText={controller.setCpf}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          required
          error={controller.fieldError('cpf')}
          onBlur={controller.blurCpf}
        />
      </FormRow>
      <FormRow>
        <BrandField
          label={t('E-mail')}
          value={controller.email}
          onChangeText={controller.setEmail}
          placeholder={t('exemplo@email.com')}
          keyboardType="email-address"
          autoCapitalize="none"
          required
          editable={!controller.fromGoogle}
          error={controller.fieldError('email')}
          onBlur={controller.blurEmail}
        />
        <BrandField
          label={t('Telefone')}
          value={controller.phone}
          onChangeText={controller.setPhone}
          placeholder="( 31 ) 9 9999-9999"
          keyboardType="phone-pad"
          required
          error={controller.fieldError('phone')}
          onBlur={controller.blurPhone}
        />
      </FormRow>
      <FormRow>
        <BrandField
          label={t('CEP')}
          value={controller.cep}
          onChangeText={controller.setCep}
          placeholder="30550-830"
          keyboardType="numeric"
          error={controller.fieldError('cep')}
          onBlur={controller.blurCep}
        />
      </FormRow>

      <BrandCheckbox
        checked={controller.rulesAccepted}
        onToggle={controller.toggleRulesAccepted}
        error={controller.fieldError('rules')}
        accessibilityLabel={t('Li e aceito as regras de uso e a forma como meus dados são usados')}
      >
        {t('Li e aceito as')}{' '}
        <Text style={styles.link} onPress={controller.goToRules} accessibilityRole="link">
          {t('regras de uso e privacidade')}
        </Text>
        {t('. Sei que meus dados identificam minha conta e podem ser usados para apurar abusos.')}
      </BrandCheckbox>

      {controller.formError ? <Text style={styles.formError}>{controller.formError}</Text> : null}

      <BrandButton
        label={controller.fromGoogle ? t('Criar conta') : t('Próximo')}
        variant="outline"
        trailingIcon={controller.fromGoogle ? undefined : 'chevron-double-right'}
        loading={controller.submitting}
        onPress={controller.handleNext}
        style={styles.submit}
      />
      <BiometricEnrollSection controller={controller.enroll} />
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    form: {
      marginTop: 20,
      gap: 18,
    },
    link: {
      color: brand.blue,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    formError: {
      fontSize: 13,
      fontWeight: '600',
      color: brand.error,
    },
    submit: {
      marginTop: 12,
    },
  });
}

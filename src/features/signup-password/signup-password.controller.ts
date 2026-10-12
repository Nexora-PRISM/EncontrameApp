import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useBiometricEnroll } from '@/features/biometric/use-biometric-enroll';
import { parseApiError } from '@/lib/api-errors';
import { clearSignupDraft, getSignupDraft, setSignupReturnErrors } from '@/lib/signup-draft';
import { useFieldErrors } from '@/lib/use-field-errors';
import { collectErrors, newPasswordError, textError, type ErrorCode } from '@/lib/validation';
import { useSignupMutation } from '@/services/auth/auth.service';
import type { SignupPayload } from '@/services/auth/auth.types';

/** Campos da API que têm outro nome no formulário. */
const API_FIELD_MAP = { document: 'cpf', cellPhone: 'phone' };

function confirmError(password: string, confirm: string): ErrorCode | undefined {
  return textError(confirm) ?? (password !== confirm ? 'invalid_format' : undefined);
}

/** Centraliza validação e cadastro da etapa 2 (senha). */
export function useSignupPasswordController() {
  const router = useRouter();
  const navigation = useNavigation();
  const signupMutation = useSignupMutation();
  const enroll = useBiometricEnroll();
  const { errors, setErrors, setFieldCode, markDirty, isDirty, fieldError } = useFieldErrors();

  // Sem os dados da etapa 1 (ex.: a página foi recarregada no navegador), volta para o início do cadastro.
  useEffect(() => {
    if (!getSignupDraft()) {
      router.replace('/signup');
    }
  }, [router]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const changePassword = (value: string) => {
    setPassword(value);
    if (isDirty('password')) setFieldCode('password', newPasswordError(value));
    if (isDirty('confirm')) setFieldCode('confirm', confirmError(value, confirm));
  };

  const blurPassword = () => {
    markDirty('password');
    setFieldCode('password', newPasswordError(password));
  };

  const changeConfirm = (value: string) => {
    setConfirm(value);
    if (isDirty('confirm')) setFieldCode('confirm', confirmError(password, value));
  };

  const blurConfirm = () => {
    markDirty('confirm');
    setFieldCode('confirm', confirmError(password, confirm));
  };

  const handleRegister = async () => {
    const found = collectErrors({
      password: newPasswordError(password),
      confirm: confirmError(password, confirm),
    });

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const draft = getSignupDraft();
    if (!draft) {
      router.replace('/signup');
      return;
    }

    const payload: SignupPayload = {
      name: draft.name,
      cpf: draft.cpf,
      email: draft.email,
      phone: draft.phone,
      cep: draft.cep,
      clause: '',
      password,
      termsAcceptedAt: draft.termsAcceptedAt,
    };

    try {
      await signupMutation.mutateAsync(payload);
      clearSignupDraft();
      await enroll.promptIfAvailable();
      router.replace('/inicio');
    } catch (error) {
      const { fields } = parseApiError(error, API_FIELD_MAP);

      if (fields.password) {
        setErrors({ password: fields.password });
        return;
      }

      if (Object.keys(fields).length > 0) {
        // Mostra o erro no campo certo (ex.: CPF já cadastrado) ao voltar para a etapa 1.
        setSignupReturnErrors(fields);
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          router.replace('/signup');
        }
      }
    }
  };

  return {
    password,
    setPassword: changePassword,
    blurPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((value) => !value),
    confirm,
    setConfirm: changeConfirm,
    blurConfirm,
    errors,
    fieldError,
    submitting: signupMutation.isPending,
    handleRegister,
    enroll,
  };
}

export type SignupPasswordController = ReturnType<typeof useSignupPasswordController>;

import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { accountFormError } from '@/lib/account-errors';
import { formatResetCode, newPasswordErrors, normalizeResetCode, resetCodeError } from '@/lib/account-rules';
import { useSafeBack } from '@/lib/safe-back';
import { useFieldErrors } from '@/lib/use-field-errors';
import { collectErrors, type ErrorCode, formatError, isEmail } from '@/lib/validation';
import {
  useAccountCapabilitiesQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '@/services/account/account.service';

type Step = 'email' | 'code' | 'done';

/**
 * "/recuperar-senha" (sem login): e-mail → código de 8 caracteres que chega por e-mail → senha nova.
 * A tela nunca diz se o e-mail tem conta (a API responde igual). O e-mail não vai na URL.
 */
export function useRecuperarSenhaController() {
  const router = useRouter();
  const goBack = useSafeBack('/login');
  const capabilities = useAccountCapabilitiesQuery();
  const forgot = useForgotPasswordMutation();
  const reset = useResetPasswordMutation();
  const { setErrors, setFieldCode, markDirty, isDirty, fieldError } = useFieldErrors();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState('');
  const [resent, setResent] = useState(false);

  const codeStepErrors = (next: { code: string; newPassword: string; confirmPassword: string }) => {
    const password = newPasswordErrors(next.newPassword, next.confirmPassword);
    const result: Record<'code' | 'newPassword' | 'confirmPassword', ErrorCode | undefined> = {
      code: resetCodeError(next.code),
      newPassword: password.newPassword,
      confirmPassword: password.confirmPassword,
    };
    return result;
  };

  const sendCode = async (again: boolean) => {
    const emailError = formatError(email, isEmail);
    setErrors(collectErrors({ email: emailError }));
    setFormError('');
    if (emailError) return;

    try {
      await forgot.mutateAsync(email.trim());
      setResent(again);
      setStep('code');
    } catch (error) {
      const { fields, message } = accountFormError(error);
      if (Object.keys(fields).length > 0) setErrors(fields);
      setFormError(message);
    }
  };

  const submitNewPassword = async () => {
    const found = collectErrors(codeStepErrors({ code, newPassword, confirmPassword }));
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    try {
      await reset.mutateAsync({ email: email.trim(), code: normalizeResetCode(code), newPassword });
      setStep('done');
    } catch (error) {
      const { fields, message } = accountFormError(error);
      if (Object.keys(fields).length > 0) setErrors(fields);
      setFormError(message);
    }
  };

  const recheck = (next: { code: string; newPassword: string; confirmPassword: string }) => {
    const errors = codeStepErrors(next);
    (['code', 'newPassword', 'confirmPassword'] as const).forEach((field) => {
      if (isDirty(field)) setFieldCode(field, errors[field]);
    });
  };

  return {
    goBack,
    loading: capabilities.isPending,
    available: capabilities.data?.passwordReset === true,
    goToHelp: () => router.push({ pathname: '/ajuda', params: { assunto: 'esqueci-senha' } } as Href),
    step,
    email,
    setEmail: (value: string) => {
      setEmail(value);
      setFormError('');
      if (isDirty('email')) setFieldCode('email', formatError(value, isEmail));
    },
    blurEmail: () => {
      markDirty('email');
      setFieldCode('email', formatError(email, isEmail));
    },
    sendCode: () => void sendCode(false),
    resendCode: () => void sendCode(true),
    resent,
    sending: forgot.isPending,
    changeEmail: () => {
      setStep('email');
      setCode('');
      setResent(false);
      setFormError('');
    },
    code,
    setCode: (value: string) => {
      const formatted = formatResetCode(value);
      setCode(formatted);
      setFormError('');
      recheck({ code: formatted, newPassword, confirmPassword });
    },
    blurCode: () => {
      markDirty('code');
      setFieldCode('code', resetCodeError(code));
    },
    newPassword,
    setNewPassword: (value: string) => {
      setNewPassword(value);
      setFormError('');
      recheck({ code, newPassword: value, confirmPassword });
    },
    blurNewPassword: () => {
      markDirty('newPassword');
      setFieldCode('newPassword', codeStepErrors({ code, newPassword, confirmPassword }).newPassword);
    },
    confirmPassword,
    setConfirmPassword: (value: string) => {
      setConfirmPassword(value);
      setFormError('');
      recheck({ code, newPassword, confirmPassword: value });
    },
    blurConfirmPassword: () => {
      markDirty('confirmPassword');
      setFieldCode('confirmPassword', codeStepErrors({ code, newPassword, confirmPassword }).confirmPassword);
    },
    show,
    toggleShow: () => setShow((value) => !value),
    submitNewPassword: () => void submitNewPassword(),
    saving: reset.isPending,
    fieldError,
    formError,
    goToLogin: () => router.replace('/login' as Href),
  };
}

export type RecuperarSenhaController = ReturnType<typeof useRecuperarSenhaController>;

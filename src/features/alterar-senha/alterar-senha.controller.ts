import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { accountFormError } from '@/lib/account-errors';
import { newPasswordErrors } from '@/lib/account-rules';
import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import { useFieldErrors } from '@/lib/use-field-errors';
import { useSessionUser } from '@/lib/use-session-user';
import { collectErrors, type ErrorCode, textError } from '@/lib/validation';
import {
  useAccountCapabilitiesQuery,
  useChangePasswordMutation,
  useProfileQuery,
} from '@/services/account/account.service';

type Field = 'currentPassword' | 'newPassword' | 'confirmPassword';

/** "/alterar-senha": pede a senha atual; a API desconecta os outros aparelhos ao trocar. */
export function useAlterarSenhaController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/configuracoes');
  const sessionUser = useSessionUser();
  const capabilities = useAccountCapabilitiesQuery();
  const available = capabilities.data?.changePassword === true;
  // O perfil diz se a conta tem senha (conta só com Google não tem).
  const profileQuery = useProfileQuery(sessionUser != null && capabilities.data?.profile === true);
  const mutation = useChangePasswordMutation();
  const { setErrors, setFieldCode, markDirty, isDirty, fieldError } = useFieldErrors();

  const [values, setValues] = useState<Record<Field, string>>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState('');

  const validate = (next: Record<Field, string>): Record<Field, ErrorCode | undefined> => {
    const password = newPasswordErrors(next.newPassword, next.confirmPassword);
    return {
      currentPassword: textError(next.currentPassword),
      newPassword: password.newPassword,
      confirmPassword: password.confirmPassword,
    };
  };

  const change = (field: Field) => (value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    setFormError('');
    const errors = validate(next);
    (['currentPassword', 'newPassword', 'confirmPassword'] as const).forEach((name) => {
      if (isDirty(name)) setFieldCode(name, errors[name]);
    });
  };

  const blur = (field: Field) => () => {
    markDirty(field);
    setFieldCode(field, validate(values)[field]);
  };

  const submit = async () => {
    const found = collectErrors(validate(values));
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    try {
      await mutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      showAlert(
        t('Senha alterada'),
        t('Os outros aparelhos conectados à sua conta foram desconectados. Neste aparelho você continua conectado.'),
      );
      goBack();
    } catch (error) {
      const { fields, message } = accountFormError(error);
      if (Object.keys(fields).length > 0) setErrors(fields);
      setFormError(message);
    }
  };

  return {
    goBack,
    loading: capabilities.isPending,
    available: capabilities.isSuccess && available,
    /** Conta só com Google: não tem senha para trocar. */
    googleOnly: profileQuery.data != null && !profileQuery.data.hasPassword,
    canCreateByEmail: capabilities.data?.passwordReset === true,
    goToRecover: () => router.push('/recuperar-senha' as Href),
    values,
    setCurrentPassword: change('currentPassword'),
    setNewPassword: change('newPassword'),
    setConfirmPassword: change('confirmPassword'),
    blurCurrentPassword: blur('currentPassword'),
    blurNewPassword: blur('newPassword'),
    blurConfirmPassword: blur('confirmPassword'),
    show,
    toggleShow: () => setShow((value) => !value),
    fieldError,
    formError,
    submitting: mutation.isPending,
    submit: () => void submit(),
  };
}

export type AlterarSenhaController = ReturnType<typeof useAlterarSenhaController>;

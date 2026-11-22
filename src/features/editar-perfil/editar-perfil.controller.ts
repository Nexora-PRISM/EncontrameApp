import { useState } from 'react';

import { accountFormError } from '@/lib/account-errors';
import { profileErrors } from '@/lib/account-rules';
import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { maskCep, maskPhone } from '@/lib/masks';
import { useSafeBack } from '@/lib/safe-back';
import { useFieldErrors } from '@/lib/use-field-errors';
import { useSessionUser } from '@/lib/use-session-user';
import {
  useAccountCapabilitiesQuery,
  useProfileQuery,
  useUpdateProfileMutation,
} from '@/services/account/account.service';

/** "/editar-perfil": nome, celular e CEP. E-mail e CPF não mudam por aqui (o CPF nem aparece). */
export function useEditarPerfilController() {
  const t = useT();
  const goBack = useSafeBack('/configuracoes');
  const sessionUser = useSessionUser();
  const capabilities = useAccountCapabilitiesQuery();
  const available = capabilities.data?.profile === true;
  const profileQuery = useProfileQuery(sessionUser != null && available);
  const mutation = useUpdateProfileMutation();
  const { setErrors, setFieldCode, markDirty, isDirty, fieldError } = useFieldErrors();

  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [cep, setCep] = useState('');
  const [formError, setFormError] = useState('');

  // Preenche o formulário uma vez, quando os dados chegam (sem apagar o que a pessoa já digitou).
  const profile = profileQuery.data;
  if (profile && loadedId !== profile.id) {
    setLoadedId(profile.id);
    setName(profile.name);
    setCellPhone(maskPhone(profile.cellPhone));
    setCep(maskCep(profile.cep));
  }

  const revalidate = (field: 'name' | 'cellPhone' | 'cep', next: { name: string; cellPhone: string; cep: string }) => {
    if (isDirty(field)) setFieldCode(field, profileErrors(next)[field]);
  };

  const save = async () => {
    const found = profileErrors({ name, cellPhone, cep });
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    try {
      await mutation.mutateAsync({ name, cellPhone, cep });
      showAlert(t('Dados salvos'), t('Seu perfil foi atualizado.'));
      goBack();
    } catch (error) {
      const { fields, message } = accountFormError(error);
      if (Object.keys(fields).length > 0) setErrors(fields);
      setFormError(message);
    }
  };

  return {
    goBack,
    loading: capabilities.isPending || (available && profileQuery.isPending),
    available: capabilities.isSuccess && available,
    loadError: profileQuery.isError,
    retry: () => void profileQuery.refetch(),
    email: profile?.email ?? sessionUser?.email ?? '',
    googleLinked: profile?.googleLinked ?? false,
    name,
    setName: (value: string) => {
      setName(value);
      setFormError('');
      revalidate('name', { name: value, cellPhone, cep });
    },
    blurName: () => {
      markDirty('name');
      setFieldCode('name', profileErrors({ name, cellPhone, cep }).name);
    },
    cellPhone,
    setCellPhone: (value: string) => {
      const masked = maskPhone(value);
      setCellPhone(masked);
      setFormError('');
      revalidate('cellPhone', { name, cellPhone: masked, cep });
    },
    blurCellPhone: () => {
      markDirty('cellPhone');
      setFieldCode('cellPhone', profileErrors({ name, cellPhone, cep }).cellPhone);
    },
    cep,
    setCep: (value: string) => {
      const masked = maskCep(value);
      setCep(masked);
      setFormError('');
      revalidate('cep', { name, cellPhone, cep: masked });
    },
    blurCep: () => {
      markDirty('cep');
      setFieldCode('cep', profileErrors({ name, cellPhone, cep }).cep);
    },
    fieldError,
    formError,
    saving: mutation.isPending,
    save: () => void save(),
  };
}

export type EditarPerfilController = ReturnType<typeof useEditarPerfilController>;

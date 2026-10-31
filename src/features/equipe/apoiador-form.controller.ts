import { isAxiosError } from 'axios';
import { type Href, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { parseApiError } from '@/lib/api-errors';
import { confirmAction, showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { useSafeBack } from '@/lib/safe-back';
import {
  base64Bytes,
  logoTypeFromBase64,
  normalizeWebsite,
  SUPPORTER_LOGO_MAX_BYTES,
  type SupporterCategory,
  type SupporterFormInput,
  validateSupporterForm,
} from '@/lib/supporter-rules';
import { usePhotoPicker } from '@/lib/use-photo-picker';
import { useIsStaffQuery } from '@/services/team/team.service';
import {
  useSupporterActions,
  useSupporterAdminLogoQuery,
  useSupportersAdminQuery,
} from '@/services/supporters/supporters.service';
import type { SupporterAdmin } from '@/services/supporters/supporters.types';

export type SupporterFormState = SupporterFormInput & { showOnHome: boolean };
type FormField = keyof SupporterFormState | 'logo';

const EMPTY: SupporterFormState = {
  name: '',
  websiteUrl: '',
  category: '',
  isActive: false,
  showOnHome: true,
  authorizationConfirmed: false,
  authorizationNote: '',
};

const fromItem = (item: SupporterAdmin): SupporterFormState => ({
  name: item.name,
  websiteUrl: item.websiteUrl ?? '',
  category: item.category,
  isActive: item.isActive,
  showOnHome: item.showOnHome,
  authorizationConfirmed: item.authorizationConfirmed,
  authorizationNote: item.authorizationNote,
});

/**
 * "/equipe/apoiadores/[id]" ("novo" para cadastrar): dados, logotipo, publicação e autorização da marca.
 * Publicar exige a autorização confirmada; desmarcar a autorização tira a marca do ar.
 */
export function useApoiadorFormController() {
  const t = useT();
  const params = useLocalSearchParams<{ id?: string }>();
  const rawId = typeof params.id === 'string' ? params.id : '';
  const id = rawId && rawId !== 'novo' ? rawId : null;
  const goBack = useSafeBack('/equipe/apoiadores' as Href);
  const staffQuery = useIsStaffQuery();
  const isStaff = staffQuery.data === true;
  const listQuery = useSupportersAdminQuery(isStaff && env.supportersEnabled);
  const current = id ? (listQuery.data?.find((item) => item.id === id) ?? null) : null;
  const logoQuery = useSupporterAdminLogoQuery(id, isStaff && current?.hasLogo === true);
  const picker = usePhotoPicker(SUPPORTER_LOGO_MAX_BYTES, { logo: true });
  const actions = useSupporterActions();

  const [form, setForm] = useState<SupporterFormState>(EMPTY);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

  // Preenche o formulário quando o apoiador chega (ajuste durante a renderização, sem efeito).
  if (current && loadedId !== current.id) {
    setLoadedId(current.id);
    setForm(fromItem(current));
  }

  const set = <K extends keyof SupporterFormState>(key: K, value: SupporterFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const newLogo = picker.photoBase64;
  const logoRemoved = removeLogo && !newLogo;
  const existingLogo = current?.hasLogo && !logoRemoved ? (logoQuery.data ?? null) : null;

  const messages: Record<string, string> = {
    'name:required': t('Informe o nome da empresa ou organização.'),
    'name:too_short': t('O nome está muito curto.'),
    'name:invalid_format': t('Use até 80 caracteres.'),
    'websiteUrl:invalid_format': t('Use o endereço completo com https:// (ex.: https://www.exemplo.com.br).'),
    'category:required': t('Escolha a categoria.'),
    'category:invalid_format': t('Escolha a categoria.'),
    'authorizationNote:invalid_format': t('Use até 200 caracteres.'),
    'authorizationConfirmed:required': t('Para publicar, confirme a autorização de uso da marca.'),
  };
  const logoMessage = t('Use uma imagem PNG, JPG ou WebP de até 300 KB.');
  const message = (field: string, code: string) =>
    field === 'logo' ? logoMessage : (messages[`${field}:${code}`] ?? t('Confira este campo.'));

  const save = async () => {
    const found: Partial<Record<FormField, string>> = {};
    for (const [field, code] of Object.entries(validateSupporterForm(form))) {
      if (code) found[field as FormField] = message(field, code);
    }
    if (newLogo && (logoTypeFromBase64(newLogo) === null || base64Bytes(newLogo) > SUPPORTER_LOGO_MAX_BYTES)) {
      found.logo = logoMessage;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      name: form.name.trim(),
      websiteUrl: normalizeWebsite(form.websiteUrl) ?? '',
      category: form.category as SupporterCategory,
      logoBase64: newLogo || undefined,
      removeLogo: id ? logoRemoved : undefined,
      isActive: form.isActive && form.authorizationConfirmed,
      showOnHome: form.showOnHome,
      authorizationConfirmed: form.authorizationConfirmed,
      authorizationNote: form.authorizationNote.trim(),
    };
    try {
      if (id) await actions.update.mutateAsync({ id, payload });
      else await actions.create.mutateAsync(payload);
      showAlert(
        t('Apoiador salvo'),
        payload.isActive ? t('A marca passa a aparecer no app.') : t('Ficou salvo sem aparecer no app.'),
      );
      goBack();
    } catch (error) {
      const fields = parseApiError(error).fields;
      const fromApi: Partial<Record<FormField, string>> = {};
      for (const [field, code] of Object.entries(fields)) {
        if (code) fromApi[field as FormField] = message(field, code);
      }
      setErrors(fromApi);
      // Erro da API já aparece no aviso geral do app.
      if (!isAxiosError(error)) showAlert(t('Não foi possível salvar'), t('Tente de novo em alguns instantes.'));
    }
  };

  const remove = async () => {
    if (!id || !current) return;
    const ok = await confirmAction({
      title: t('Excluir {name}?', { name: current.name }),
      message: t('A marca e o logotipo saem do app e do cadastro. Para tirar do ar sem apagar, use "Publicar no app".'),
      confirmLabel: t('Excluir'),
    });
    if (!ok) return;
    try {
      await actions.remove.mutateAsync(id);
      goBack();
    } catch (error) {
      if (!isAxiosError(error)) showAlert(t('Não foi possível excluir'), t('Tente de novo em alguns instantes.'));
    }
  };

  return {
    goBack,
    demo: env.useMocks,
    enabled: env.supportersEnabled,
    checking: staffQuery.isLoading,
    checkFailed: staffQuery.isError,
    isStaff,
    retry: () => {
      void staffQuery.refetch();
    },
    isNew: id === null,
    loading: id !== null && listQuery.isLoading,
    notFound: id !== null && !listQuery.isLoading && current === null,
    form,
    errors,
    setName: (value: string) => set('name', value),
    setWebsite: (value: string) => set('websiteUrl', value),
    setCategory: (value: string) => set('category', value),
    setNote: (value: string) => set('authorizationNote', value),
    setShowOnHome: (value: boolean) => set('showOnHome', value),
    setActive: (value: boolean) => {
      set('isActive', value);
      if (value && !form.authorizationConfirmed) {
        setErrors((prev) => ({ ...prev, authorizationConfirmed: messages['authorizationConfirmed:required'] }));
      }
    },
    setAuthorization: (value: boolean) => {
      setForm((prev) => ({ ...prev, authorizationConfirmed: value, isActive: value ? prev.isActive : false }));
      setErrors((prev) => ({ ...prev, authorizationConfirmed: undefined, isActive: undefined }));
    },
    /** Pré-visualização: o logotipo novo escolhido ou o que já está salvo. */
    logoPreview: picker.photoUri || existingLogo,
    logoLoading: Boolean(current?.hasLogo) && !logoRemoved && !newLogo && logoQuery.isLoading,
    hasLogo: Boolean(newLogo) || Boolean(existingLogo),
    pickLogo: () => {
      setErrors((prev) => ({ ...prev, logo: undefined }));
      picker.pickPhoto();
    },
    removeLogo: () => {
      picker.removePhoto();
      setRemoveLogo(true);
    },
    saving: actions.create.isPending || actions.update.isPending,
    deleting: actions.remove.isPending,
    save: () => void save(),
    remove: () => void remove(),
  };
}

export type ApoiadorFormController = ReturnType<typeof useApoiadorFormController>;

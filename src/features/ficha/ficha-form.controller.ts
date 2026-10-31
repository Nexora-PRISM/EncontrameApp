import { randomUUID } from 'expo-crypto';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useIdSheetActions, useIdSheetQuery, useIdSheetsQuery } from '@/features/ficha/id-sheets.queries';
import { confirmAction, showAlert } from '@/lib/dialog';
import { useI18n, useT } from '@/lib/i18n';
import {
  ageFromBirthDate,
  dayPhotoExpiresAt,
  ID_SHEET_HEALTH_MAX,
  ID_SHEET_LIMIT,
  ID_SHEET_NAME_MAX,
  ID_SHEET_TEXT_MAX,
  type IdSheet,
  isDayPhotoValid,
  photoNeedsUpdate,
} from '@/lib/id-sheet-rules';
import { maskDate, maskDigits, maskPhone } from '@/lib/masks';
import { useSafeBack } from '@/lib/safe-back';
import { usePhotoPicker } from '@/lib/use-photo-picker';
import { isPastDate, isPhone, NAME_MIN_LENGTH } from '@/lib/validation';

type FormValues = Pick<
  IdSheet,
  | 'name'
  | 'nickname'
  | 'birthDate'
  | 'heightCm'
  | 'build'
  | 'ethnicity'
  | 'hair'
  | 'eyes'
  | 'marks'
  | 'healthNotes'
  | 'contactPhone'
  | 'dayClothes'
>;
type FormField = keyof FormValues;

const EMPTY: FormValues = {
  name: '',
  nickname: '',
  birthDate: '',
  heightCm: '',
  build: '',
  ethnicity: '',
  hair: '',
  eyes: '',
  marks: '',
  healthNotes: '',
  contactPhone: '',
  dayClothes: '',
};

const pick = (sheet: IdSheet): FormValues => ({
  name: sheet.name,
  nickname: sheet.nickname,
  birthDate: sheet.birthDate,
  heightCm: sheet.heightCm,
  build: sheet.build,
  ethnicity: sheet.ethnicity,
  hair: sheet.hair,
  eyes: sheet.eyes,
  marks: sheet.marks,
  healthNotes: sheet.healthNotes,
  contactPhone: sheet.contactPhone,
  dayClothes: sheet.dayClothes,
});

/**
 * "/ficha/[id]" ("nova" cria): dados que a família prepara antes. Fica só neste aparelho.
 * A foto do dia (roupa de hoje) vale 24 horas.
 */
export function useFichaFormController() {
  const t = useT();
  const { language } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/ficha' as Href);
  const params = useLocalSearchParams<{ id?: string }>();
  const rawId = typeof params.id === 'string' ? params.id : '';
  const id = rawId && rawId !== 'nova' ? rawId : null;
  const sheetQuery = useIdSheetQuery(id);
  const listQuery = useIdSheetsQuery();
  const actions = useIdSheetActions();
  const facePicker = usePhotoPicker();
  const dayPicker = usePhotoPicker();
  const saved = id ? (sheetQuery.data ?? null) : null;

  const [form, setForm] = useState<FormValues>(EMPTY);
  const [loadedFrom, setLoadedFrom] = useState<IdSheet | null>(null);
  const [faceRemoved, setFaceRemoved] = useState(false);
  const [dayRemoved, setDayRemoved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

  // Preenche o formulário quando a ficha chega (ajuste durante a renderização, sem efeito).
  if (saved && saved !== loadedFrom) {
    setLoadedFrom(saved);
    setForm(pick(saved));
    setFaceRemoved(false);
    setDayRemoved(false);
  }

  const set = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /** Hora em que a tela abriu (só para mostrar; ao salvar vale a hora do salvamento). */
  const [now] = useState(() => new Date());
  const facePhoto = facePicker.photoBase64 || (faceRemoved ? '' : (saved?.photo ?? ''));
  const savedDayValid = saved ? isDayPhotoValid(saved, now) : false;
  const dayPhoto = dayPicker.photoBase64 || (dayRemoved || !savedDayValid ? '' : (saved?.dayPhoto ?? ''));
  const shownDayPhotoAt = dayPicker.photoBase64 ? now.toISOString() : dayPhoto ? (saved?.dayPhotoAt ?? null) : null;
  const dayExpires = dayPhoto && shownDayPhotoAt ? dayPhotoExpiresAt({ dayPhoto, dayPhotoAt: shownDayPhotoAt }) : null;
  const preview = (picked: string, uri: string, base64: string) =>
    picked ? uri : base64 ? `data:image/jpeg;base64,${base64}` : '';

  const validate = (): Partial<Record<FormField, string>> => {
    const found: Partial<Record<FormField, string>> = {};
    const name = form.name.trim();
    if (!name) found.name = t('Informe o nome.');
    else if (name.length < NAME_MIN_LENGTH) found.name = t('O nome está muito curto.');
    if (form.birthDate.trim() && !isPastDate(form.birthDate)) found.birthDate = t('Use a data no formato dd/mm/aaaa.');
    if (form.contactPhone.trim() && !isPhone(form.contactPhone)) found.contactPhone = t('Telefone inválido. Use DDD + número.');
    return found;
  };

  const persist = async (): Promise<IdSheet | null> => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return null;
    if (!id && (listQuery.data?.length ?? 0) >= ID_SHEET_LIMIT) {
      showAlert(t('Limite de fichas'), t('Este aparelho guarda até {limit} fichas. Apague uma antes de criar outra.', { limit: ID_SHEET_LIMIT }));
      return null;
    }
    const stamp = new Date().toISOString();
    const sheet: IdSheet = {
      id: id ?? randomUUID(),
      createdAt: saved?.createdAt ?? stamp,
      updatedAt: stamp,
      ...form,
      name: form.name.trim(),
      photo: facePhoto,
      photoAt: facePicker.photoBase64 ? stamp : facePhoto ? (saved?.photoAt ?? stamp) : null,
      dayPhoto,
      dayPhotoAt: dayPicker.photoBase64 ? stamp : dayPhoto ? (saved?.dayPhotoAt ?? null) : null,
      dayClothes: dayPhoto ? form.dayClothes.trim() : '',
    };
    try {
      await actions.save.mutateAsync(sheet);
      return sheet;
    } catch {
      showAlert(t('Não foi possível salvar'), t('Tente de novo em alguns instantes.'));
      return null;
    }
  };

  const save = async () => {
    const sheet = await persist();
    if (!sheet) return;
    showAlert(t('Ficha salva'), t('Ela fica só neste aparelho. Nada foi enviado.'));
    if (!id) router.replace(`/ficha/${encodeURIComponent(sheet.id)}` as Href);
  };

  const report = async () => {
    const ok = await confirmAction({
      title: t('Comunicar o desaparecimento?'),
      message: t('Ligue 190 se ainda não ligou. O cadastro abre com os dados da ficha para você conferir; as observações de saúde não vão para o cadastro público.'),
      confirmLabel: t('Abrir o cadastro'),
    });
    if (!ok) return;
    const sheet = await persist();
    if (!sheet) return;
    router.push(`/cadastrar-pessoa?ficha=${encodeURIComponent(sheet.id)}` as Href);
  };

  const remove = async () => {
    if (!id) return;
    const ok = await confirmAction({
      title: t('Apagar esta ficha?'),
      message: t('Os dados e as fotos saem deste aparelho e não dá para desfazer.'),
      confirmLabel: t('Apagar'),
    });
    if (!ok) return;
    try {
      await actions.remove.mutateAsync(id);
      router.dismissTo('/ficha' as Href);
    } catch {
      showAlert(t('Não foi possível apagar'), t('Tente de novo em alguns instantes.'));
    }
  };

  const age = ageFromBirthDate(form.birthDate, now);

  return {
    goBack,
    isNew: id === null,
    loading: id !== null && sheetQuery.isLoading,
    notFound: id !== null && !sheetQuery.isLoading && saved === null,
    form,
    errors,
    limits: { name: ID_SHEET_NAME_MAX, text: ID_SHEET_TEXT_MAX, health: ID_SHEET_HEALTH_MAX },
    ageLabel: age === null ? '' : t('{age} anos hoje', { age }),
    setName: (value: string) => set('name', value),
    setNickname: (value: string) => set('nickname', value),
    setBirthDate: (value: string) => set('birthDate', maskDate(value)),
    setHeightCm: (value: string) => set('heightCm', maskDigits(value).slice(0, 3)),
    setBuild: (value: string) => set('build', value),
    setEthnicity: (value: string) => set('ethnicity', value),
    setHair: (value: string) => set('hair', value),
    setEyes: (value: string) => set('eyes', value),
    setMarks: (value: string) => set('marks', value),
    setHealthNotes: (value: string) => set('healthNotes', value),
    setContactPhone: (value: string) => set('contactPhone', maskPhone(value)),
    setDayClothes: (value: string) => set('dayClothes', value),
    facePreview: preview(facePicker.photoBase64, facePicker.photoUri, facePhoto),
    faceNeedsUpdate: Boolean(facePhoto) && photoNeedsUpdate({ photo: facePhoto, photoAt: facePicker.photoBase64 ? now.toISOString() : (saved?.photoAt ?? null), birthDate: form.birthDate }, now),
    pickFace: facePicker.pickPhoto,
    removeFace: () => {
      facePicker.removePhoto();
      setFaceRemoved(true);
    },
    dayPreview: preview(dayPicker.photoBase64, dayPicker.photoUri, dayPhoto),
    dayUntil: dayExpires
      ? new Intl.DateTimeFormat(language, { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(dayExpires)
      : '',
    pickDay: dayPicker.pickPhoto,
    removeDay: () => {
      dayPicker.removePhoto();
      setDayRemoved(true);
    },
    saving: actions.save.isPending,
    save: () => void save(),
    report: () => void report(),
    show: () => id && router.push(`/ficha/${encodeURIComponent(id)}/mostrar` as Href),
    remove: () => void remove(),
  };
}

export type FichaFormController = ReturnType<typeof useFichaFormController>;

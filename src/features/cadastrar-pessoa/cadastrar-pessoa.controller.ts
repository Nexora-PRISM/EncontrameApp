import * as ImagePicker from 'expo-image-picker';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { draftToFormValues } from '@/features/cadastrar-pessoa/draft-review';
import {
  RELATIONSHIP_OPTIONS,
  ageError,
  isMinorAge,
  policeReportError,
} from '@/features/cadastrar-pessoa/legitimacy';
import {
  HEIGHT_MAX_CM,
  HEIGHT_MIN_CM,
  validatePersonForm,
} from '@/features/cadastrar-pessoa/person-form';
import { parseApiError } from '@/lib/api-errors';
import { showAlert } from '@/lib/dialog';
import { tr, useT } from '@/lib/i18n';
import { msg } from '@/lib/i18n-msg';
import { maskDate, maskDigits, maskPhone } from '@/lib/masks';
import { isLocalPersonId } from '@/lib/person-status';
import {
  MAX_PHOTO_BYTES,
  isAllowedPhotoFile,
  photoSizeError,
  stripDataUrlPrefix,
} from '@/lib/photo';
import { getSessionUser } from '@/lib/session';
import { useFieldErrors } from '@/lib/use-field-errors';
import {
  NAME_MIN_LENGTH,
  formatError,
  isPastDate,
  isPhone,
  optionalFormatError,
  optionalRangeError,
  textError,
} from '@/lib/validation';
import {
  getLocalDraft,
  useCreatePersonMutation,
  useSubmitLocalDraftMutation,
} from '@/services/people/people.service';
import type { CreatePersonPayload } from '@/services/people/people.types';

export { RELATIONSHIP_OPTIONS };

export const ETHNICITY_OPTIONS = [msg('Branca'), msg('Preta'), msg('Parda'), msg('Amarela'), msg('Indígena')] as const;
export const BUILD_OPTIONS = [msg('Magro'), msg('Médio'), msg('Atlético'), msg('Forte')] as const;

const SUBMIT_END_THRESHOLD = 120;

/** Campos da API que têm outro nome no formulário. */
const API_FIELD_MAP = {
  name: 'fullName',
  height: 'heightCm',
  location: 'localidade',
  city: 'localidade',
  contactPhone: 'phone',
};

/**
 * Centraliza estado, validação e cadastro de uma nova pessoa desaparecida.
 *
 * Com `?rascunho=<id local>`, o mesmo formulário serve para REVISAR um cadastro feito sem conta
 * neste aparelho: a pessoa logada confere os dados, completa o que faltar, aceita a declaração
 * e só então o caso é enviado pela conta dela.
 */
export function useCadastrarPessoaController() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ rascunho?: string | string[] }>();
  const rawDraftId = Array.isArray(params.rascunho) ? params.rascunho[0] : params.rascunho;
  const draftId = rawDraftId && isLocalPersonId(rawDraftId) ? rawDraftId : null;
  const createMutation = useCreatePersonMutation();
  const submitDraftMutation = useSubmitLocalDraftMutation();
  const { errors, setErrors, setFieldCode, markDirty, isDirty, fieldError } = useFieldErrors();

  const [photoUri, setPhotoUri] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [build, setBuild] = useState('');
  const [clothes, setClothes] = useState('');
  const [hair, setHair] = useState('');
  const [eyes, setEyes] = useState('');
  const [tattoo, setTattoo] = useState('');
  const [accessories, setAccessories] = useState('');
  const [location, setLocation] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [originState, setOriginState] = useState('');
  const [originCountry, setOriginCountry] = useState('Brasil');
  const [originNeighborhood, setOriginNeighborhood] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [phone, setPhone] = useState('');
  const [reporterRelationship, setReporterRelationshipState] = useState('');
  const [policeReport, setPoliceReport] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [draftLoading, setDraftLoading] = useState(draftId != null);
  /** Rascunho já aplicado ao formulário — evita sobrescrever o que a pessoa editou. */
  const appliedDraftRef = useRef<string | null>(null);
  const isMinor = isMinorAge(age);
  /** True quando o botão "Cadastrar" do formulário entra na área visível. */
  const [nearFormEnd, setNearFormEnd] = useState(false);

  // Revisão de rascunho local: carrega uma vez e preenche o formulário (sem a declaração).
  useEffect(() => {
    if (!draftId || appliedDraftRef.current === draftId) return;

    if (getSessionUser() == null) {
      showAlert(
        tr('Entre na sua conta'),
        tr('Para revisar e enviar um cadastro feito neste aparelho, entre na sua conta.'),
      );
      router.replace({ pathname: '/login', params: { returnTo: `/pessoa/${draftId}` } } as Href);
      return;
    }

    let cancelled = false;
    void getLocalDraft(draftId)
      .then((draft) => {
        if (cancelled) return;
        if (!draft) {
          showAlert(
            tr('Cadastro não encontrado'),
            tr('Ele pode já ter sido enviado ou apagado deste aparelho.'),
          );
          router.dismissTo('/perfil' as Href);
          return;
        }
        appliedDraftRef.current = draftId;
        const values = draftToFormValues(draft.payload);
        setPhotoUri(values.photoUri);
        setPhotoBase64(values.photoBase64);
        setFullName(values.fullName);
        setNickname(values.nickname);
        setAge(values.age);
        setHeightCm(values.heightCm);
        setEthnicity(values.ethnicity);
        setBuild(values.build);
        setClothes(values.clothes);
        setHair(values.hair);
        setEyes(values.eyes);
        setTattoo(values.tattoo);
        setAccessories(values.accessories);
        setLocation(values.location);
        setOriginCity(values.originCity);
        setOriginState(values.originState);
        setOriginCountry(values.originCountry);
        setOriginNeighborhood(values.originNeighborhood);
        setLastSeen(values.lastSeen);
        setPhone(values.phone);
        setReporterRelationshipState(values.reporterRelationship);
        setPoliceReport(values.policeReport);
        setDeclarationAccepted(false);
      })
      .catch(() => {
        if (!cancelled) {
          showAlert(tr('Não foi possível abrir o cadastro'), tr('Tente novamente em instantes.'));
        }
      })
      .finally(() => {
        if (!cancelled) setDraftLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [draftId, router]);

  const changeFullName = (value: string) => {
    setFullName(value);
    if (isDirty('fullName')) setFieldCode('fullName', textError(value, NAME_MIN_LENGTH));
  };

  const blurFullName = () => {
    markDirty('fullName');
    setFieldCode('fullName', textError(fullName, NAME_MIN_LENGTH));
  };

  // "Localidade": onde a pessoa foi vista pela última vez (vai para `location` na API).
  const changeLocation = (value: string) => {
    setLocation(value);
    if (isDirty('localidade')) setFieldCode('localidade', textError(value));
  };

  const blurLocation = () => {
    markDirty('localidade');
    setFieldCode('localidade', textError(location));
  };

  const changePhone = (value: string) => {
    const next = maskPhone(value);
    setPhone(next);
    if (isDirty('phone')) setFieldCode('phone', formatError(next, isPhone));
  };

  const blurPhone = () => {
    markDirty('phone');
    setFieldCode('phone', formatError(phone, isPhone));
  };

  const changeLastSeen = (value: string) => {
    const next = maskDate(value);
    setLastSeen(next);
    if (isDirty('lastSeen')) setFieldCode('lastSeen', optionalFormatError(next, isPastDate));
  };

  const blurLastSeen = () => {
    markDirty('lastSeen');
    setFieldCode('lastSeen', optionalFormatError(lastSeen, isPastDate));
  };

  const changeAge = (value: string) => {
    const next = maskDigits(value);
    setAge(next);
    if (isDirty('age')) setFieldCode('age', ageError(next));
    // Se a idade passa a ser de menor, o boletim de ocorrência vira obrigatório.
    if (isDirty('policeReport')) {
      setFieldCode('policeReport', policeReportError(policeReport, isMinorAge(next)));
    }
  };

  const setReporterRelationship = (value: string) => {
    setReporterRelationshipState(value);
    markDirty('reporterRelationship');
    setFieldCode('reporterRelationship', textError(value));
  };

  const changePoliceReport = (value: string) => {
    setPoliceReport(value);
    if (isDirty('policeReport')) setFieldCode('policeReport', policeReportError(value, isMinor));
  };

  const blurPoliceReport = () => {
    markDirty('policeReport');
    setFieldCode('policeReport', policeReportError(policeReport, isMinor));
  };

  const toggleDeclaration = () => {
    const next = !declarationAccepted;
    setDeclarationAccepted(next);
    if (isDirty('declaration')) setFieldCode('declaration', next ? undefined : 'required');
  };

  const blurAge = () => {
    markDirty('age');
    setFieldCode('age', ageError(age));
  };

  const changeHeightCm = (value: string) => {
    const next = maskDigits(value);
    setHeightCm(next);
    if (isDirty('heightCm')) {
      setFieldCode('heightCm', optionalRangeError(next, HEIGHT_MIN_CM, HEIGHT_MAX_CM));
    }
  };

  const blurHeightCm = () => {
    markDirty('heightCm');
    setFieldCode('heightCm', optionalRangeError(heightCm, HEIGHT_MIN_CM, HEIGHT_MAX_CM));
  };

  const validate = () =>
    validatePersonForm({
      fullName,
      location,
      phone,
      age,
      heightCm,
      lastSeen,
      reporterRelationship,
      policeReport,
      declarationAccepted,
    });

  const updateSubmitVisibility = (metrics: {
    contentHeight: number;
    layoutHeight: number;
    offsetY: number;
  }) => {
    const { contentHeight, layoutHeight, offsetY } = metrics;
    if (layoutHeight <= 0) return;
    const fitsWithoutScroll = contentHeight <= layoutHeight + 8;
    const atEnd = offsetY + layoutHeight >= contentHeight - SUBMIT_END_THRESHOLD;
    setNearFormEnd(fitsWithoutScroll || atEnd);
  };

  const applyPhoto = (uri: string, base64OrDataUrl: string) => {
    const normalized = stripDataUrlPrefix(base64OrDataUrl);
    const problem = photoSizeError(normalized);
    if (problem === 'photo_too_large') {
      showAlert(t('Foto muito grande'), t('A foto deve ter no máximo 2 MB.'));
      return;
    }
    if (problem === 'photo_empty') {
      showAlert(t('Foto inválida'), t('Não foi possível ler a imagem selecionada.'));
      return;
    }
    setPhotoUri(uri);
    setPhotoBase64(normalized);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert(t('Permissão necessária'), t('Autorize o acesso à galeria para escolher uma foto.'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      showAlert(t('Foto inválida'), t('Não foi possível ler a imagem selecionada.'));
      return;
    }
    applyPhoto(asset.uri, asset.base64);
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert(t('Permissão necessária'), t('Autorize o acesso à câmera para tirar uma foto.'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      showAlert(t('Foto inválida'), t('Não foi possível ler a imagem capturada.'));
      return;
    }
    applyPhoto(asset.uri, asset.base64);
  };

  const pickFromWebFile = () => {
    if (typeof document === 'undefined') return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,.png,.jpg,.jpeg';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!isAllowedPhotoFile(file.type, file.name)) {
        showAlert(t('Formato inválido'), t('Envie apenas fotos PNG ou JPG.'));
        return;
      }

      if (file.size > MAX_PHOTO_BYTES) {
        showAlert(t('Foto muito grande'), t('A foto deve ter no máximo 2 MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        if (!result) {
          showAlert(t('Foto inválida'), t('Não foi possível ler o arquivo selecionado.'));
          return;
        }
        applyPhoto(result, result);
      };
      reader.onerror = () => {
        showAlert(t('Foto inválida'), t('Não foi possível ler o arquivo selecionado.'));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handlePickPhoto = () => {
    if (Platform.OS === 'web') {
      pickFromWebFile();
      return;
    }

    Alert.alert(t('Adicionar foto'), t('Escolha a origem da imagem'), [
      { text: t('Câmera'), onPress: () => void pickFromCamera() },
      { text: t('Galeria'), onPress: () => void pickFromLibrary() },
      { text: t('Cancelar'), style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = () => {
    setPhotoUri('');
    setPhotoBase64('');
  };

  const handleRegister = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Esses campos ficam no fim do formulário: avisa quem tocou no botão flutuante lá em cima.
      if (found.reporterRelationship || found.policeReport || found.declaration) {
        showAlert(
          t('Falta pouco'),
          t('No fim do formulário, informe seu vínculo com a pessoa, o boletim de ocorrência (obrigatório para crianças e adolescentes) e confirme a declaração.'),
        );
      }
      return;
    }

    const payload: CreatePersonPayload = {
      fullName,
      nickname,
      age,
      heightCm,
      ethnicity,
      build,
      clothes,
      hair,
      eyes,
      tattoo,
      accessories,
      location,
      lastSeen,
      originCity,
      originState,
      originCountry,
      originNeighborhood,
      phone,
      photoUri: photoUri || undefined,
      photo: photoBase64 || undefined,
      reporterRelationship,
      policeReportNumber: policeReport.trim(),
      declarationAcceptedAt: new Date().toISOString(),
    };

    try {
      if (draftId) {
        if (getSessionUser() == null) {
          showAlert(t('Entre na sua conta'), t('Sua sessão terminou. Entre de novo para enviar este cadastro.'));
          router.replace({ pathname: '/login', params: { returnTo: `/pessoa/${draftId}` } } as Href);
          return;
        }
        await submitDraftMutation.mutateAsync({ draftId, payload });
        showAlert(
          t('Cadastro enviado'),
          t('O caso foi enviado pela sua conta e saiu da lista de cadastros deste aparelho.'),
        );
        // Volta ao perfil (onde ficam os outros cadastros para revisar), sem empilhar outra cópia.
        router.dismissTo('/perfil' as Href);
        return;
      }

      const loggedIn = getSessionUser() != null;
      await createMutation.mutateAsync(payload);
      showAlert(
        t('Cadastro concluído'),
        loggedIn
          ? t('A pessoa foi cadastrada com sucesso.')
          : t('Cadastro salvo só neste aparelho. Para enviá-lo, entre na sua conta e toque em "Revisar e enviar" no próprio cadastro ou em Meu perfil.'),
      );
      router.replace('/inicio');
    } catch (error) {
      const { fields } = parseApiError(error, API_FIELD_MAP);
      const formFields = Object.fromEntries(
        Object.entries(fields).filter(([field]) => field !== 'photo'),
      );

      if (Object.keys(formFields).length > 0) {
        setErrors(formFields);
      }
    }
  };

  return {
    photoUri,
    setPhotoUri,
    fullName,
    setFullName: changeFullName,
    blurFullName,
    nickname,
    setNickname,
    age,
    setAge: changeAge,
    blurAge,
    heightCm,
    setHeightCm: changeHeightCm,
    blurHeightCm,
    ethnicity,
    setEthnicity,
    build,
    setBuild,
    clothes,
    setClothes,
    hair,
    setHair,
    eyes,
    setEyes,
    tattoo,
    setTattoo,
    accessories,
    setAccessories,
    location,
    setLocation: changeLocation,
    blurLocation,
    originCity,
    setOriginCity,
    originState,
    setOriginState,
    originCountry,
    setOriginCountry,
    originNeighborhood,
    setOriginNeighborhood,
    lastSeen,
    setLastSeen: changeLastSeen,
    isMinor,
    reporterRelationship,
    setReporterRelationship,
    policeReport,
    setPoliceReport: changePoliceReport,
    blurPoliceReport,
    declarationAccepted,
    toggleDeclaration,
    goToRules: () => router.push('/regras' as Href),
    blurLastSeen,
    phone,
    setPhone: changePhone,
    blurPhone,
    errors,
    fieldError,
    submitting: createMutation.isPending || submitDraftMutation.isPending,
    /** Revisando um cadastro feito sem conta neste aparelho (`?rascunho=`). */
    reviewingDraft: draftId != null,
    draftLoading,
    nearFormEnd,
    updateSubmitVisibility,
    handlePickPhoto,
    handleRemovePhoto,
    handleRegister,
  };
}

export type CadastrarPessoaController = ReturnType<typeof useCadastrarPessoaController>;

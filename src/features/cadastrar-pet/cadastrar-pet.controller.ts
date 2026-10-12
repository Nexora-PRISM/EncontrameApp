import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';

import { parseApiError } from '@/lib/api-errors';
import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { maskDate, maskPhone } from '@/lib/masks';
import { canRegisterPets, PREMIUM_PLAN } from '@/lib/premium-plan';
import { useSafeBack } from '@/lib/safe-back';
import { useFieldErrors } from '@/lib/use-field-errors';
import { usePhotoPicker } from '@/lib/use-photo-picker';
import { useSessionUser } from '@/lib/use-session-user';
import {
  collectErrors,
  formatError,
  isPastDate,
  isPhone,
  optionalFormatError,
  textError,
} from '@/lib/validation';
import { useCreatePetMutation } from '@/services/pets/pets.service';
import { PET_SIZE_OPTIONS, PET_SPECIES_OPTIONS } from '@/services/pets/pets.types';
import { usePremiumStatusQuery } from '@/services/premium/premium.service';

export { PET_SIZE_OPTIONS, PET_SPECIES_OPTIONS };

const PET_NAME_MIN = 2;

/** Campos da API que têm outro nome no formulário. */
const API_FIELD_MAP = { name: 'petName' };

/** Cadastro de pet desaparecido (conta conectada + Premium, se a chave do plano exigir). */
export function useCadastrarPetController() {
  const t = useT();
  const router = useRouter();
  const goBack = useSafeBack('/pets' as Href);
  const enabled = env.petsEnabled;
  const sessionUser = useSessionUser();
  const premiumQuery = usePremiumStatusQuery(enabled && PREMIUM_PLAN.petAlertsRequirePremium);
  const createMutation = useCreatePetMutation();
  const photo = usePhotoPicker();
  const { setErrors, setFieldCode, markDirty, isDirty, fieldError } = useFieldErrors();

  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [marks, setMarks] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const rules = {
    petName: (value: string) => textError(value, PET_NAME_MIN),
    species: (value: string) => textError(value),
    city: (value: string) => textError(value),
    lastSeen: (value: string) => optionalFormatError(value, isPastDate),
    contactPhone: (value: string) => formatError(value, isPhone),
  };

  const change = (field: keyof typeof rules, value: string, set: (next: string) => void) => {
    set(value);
    if (isDirty(field)) setFieldCode(field, rules[field](value));
  };

  const blur = (field: keyof typeof rules, value: string) => {
    markDirty(field);
    setFieldCode(field, rules[field](value));
  };

  const handleSubmit = async () => {
    const found = collectErrors({
      petName: rules.petName(petName),
      species: rules.species(species),
      city: rules.city(city),
      lastSeen: rules.lastSeen(lastSeen),
      contactPhone: rules.contactPhone(contactPhone),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      await createMutation.mutateAsync({
        name: petName,
        species,
        breed,
        color,
        size,
        marks,
        city,
        neighborhood,
        lastSeen,
        contactPhone,
        photo: photo.photoBase64 || undefined,
        photoUri: photo.photoUri || undefined,
      });
      showAlert(
        t('Pet publicado'),
        t('Agora a comunidade pode ajudar. Use "Divulgar" para compartilhar o caso com seus contatos.'),
      );
      router.replace('/pets' as Href);
    } catch (error) {
      const { fields } = parseApiError(error, API_FIELD_MAP);
      if (Object.keys(fields).length > 0) {
        setErrors(fields);
      }
    }
  };

  return {
    enabled,
    goBack,
    canRegister: canRegisterPets(sessionUser != null, premiumQuery.data?.active === true),
    premiumLoading: PREMIUM_PLAN.petAlertsRequirePremium && premiumQuery.isLoading,
    goToPremium: () => router.push('/premium' as Href),
    petName,
    setPetName: (value: string) => change('petName', value, setPetName),
    blurPetName: () => blur('petName', petName),
    species,
    setSpecies: (value: string) => {
      setSpecies(value);
      markDirty('species');
      setFieldCode('species', rules.species(value));
    },
    breed,
    setBreed,
    color,
    setColor,
    size,
    setSize,
    marks,
    setMarks,
    city,
    setCity: (value: string) => change('city', value, setCity),
    blurCity: () => blur('city', city),
    neighborhood,
    setNeighborhood,
    lastSeen,
    setLastSeen: (value: string) => change('lastSeen', maskDate(value), setLastSeen),
    blurLastSeen: () => blur('lastSeen', lastSeen),
    contactPhone,
    setContactPhone: (value: string) => change('contactPhone', maskPhone(value), setContactPhone),
    blurContactPhone: () => blur('contactPhone', contactPhone),
    fieldError,
    photoUri: photo.photoUri,
    pickPhoto: photo.pickPhoto,
    removePhoto: photo.removePhoto,
    submitting: createMutation.isPending,
    handleSubmit: () => {
      void handleSubmit();
    },
  };
}

export type CadastrarPetController = ReturnType<typeof useCadastrarPetController>;

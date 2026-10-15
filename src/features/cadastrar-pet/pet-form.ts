import {
  collectErrors,
  formatError,
  isPastDate,
  isPhone,
  optionalFormatError,
  textError,
  type ErrorCode,
  type FieldErrors,
} from '@/lib/validation';

export const PET_NAME_MIN = 2;

export interface PetFormInput {
  petName: string;
  species: string;
  city: string;
  lastSeen: string;
  contactPhone: string;
}

export type PetFormField = keyof PetFormInput;

/** Erro de um campo do cadastro de pet (blur e digitação). */
export function petFieldError(field: PetFormField, value: string): ErrorCode | undefined {
  switch (field) {
    case 'petName':
      return textError(value, PET_NAME_MIN);
    case 'species':
      return textError(value);
    case 'city':
      return textError(value);
    case 'lastSeen':
      return optionalFormatError(value, isPastDate);
    case 'contactPhone':
      return formatError(value, isPhone);
  }
}

/** Cadastro de pet: nome, espécie, cidade e telefone obrigatórios; data só se preenchida. */
export function validatePetForm(input: PetFormInput): FieldErrors {
  return collectErrors({
    petName: petFieldError('petName', input.petName),
    species: petFieldError('species', input.species),
    city: petFieldError('city', input.city),
    lastSeen: petFieldError('lastSeen', input.lastSeen),
    contactPhone: petFieldError('contactPhone', input.contactPhone),
  });
}

import {
  ageError,
  isMinorAge,
  policeReportError,
} from '@/features/cadastrar-pessoa/legitimacy';
import {
  NAME_MIN_LENGTH,
  collectErrors,
  formatError,
  isPastDate,
  isPhone,
  optionalFormatError,
  optionalRangeError,
  textError,
  type FieldErrors,
} from '@/lib/validation';

export const HEIGHT_MIN_CM = 30;
export const HEIGHT_MAX_CM = 250;

/** Campos que o cadastro de pessoa desaparecida valida antes de enviar. */
export interface PersonFormInput {
  fullName: string;
  location: string;
  phone: string;
  age: string;
  heightCm: string;
  lastSeen: string;
  reporterRelationship: string;
  policeReport: string;
  declarationAccepted: boolean;
}

/**
 * Regras do formulário de pessoa: identidade, último local, idade obrigatória,
 * boletim para menores e declaração de veracidade.
 */
export function validatePersonForm(input: PersonFormInput): FieldErrors {
  return collectErrors({
    fullName: textError(input.fullName, NAME_MIN_LENGTH),
    localidade: textError(input.location),
    phone: formatError(input.phone, isPhone),
    age: ageError(input.age),
    heightCm: optionalRangeError(input.heightCm, HEIGHT_MIN_CM, HEIGHT_MAX_CM),
    lastSeen: optionalFormatError(input.lastSeen, isPastDate),
    reporterRelationship: textError(input.reporterRelationship),
    policeReport: policeReportError(input.policeReport, isMinorAge(input.age)),
    declaration: input.declarationAccepted ? undefined : 'required',
  });
}

import { msg } from '@/lib/i18n-msg';

export const PET_SPECIES_OPTIONS = [msg('Cachorro'), msg('Gato'), msg('Outro')] as const;
export const PET_SIZE_OPTIONS = [msg('Pequeno'), msg('Médio'), msg('Grande')] as const;

export type PetStatus = 'perdido' | 'encontrado';

/** Animal de estimação desaparecido (recurso Premium). */
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  color?: string;
  size?: string;
  /** Sinais particulares (coleira, mancha, cicatriz…). */
  marks?: string;
  city: string;
  neighborhood?: string;
  /** Data em que foi visto pela última vez (ISO). */
  dtLastSeen?: string;
  photoUri?: string;
  /** Telefone do tutor, só se ele quiser divulgar. */
  contactPhone?: string;
  status: PetStatus;
}

export interface CreatePetPayload {
  name: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  marks: string;
  city: string;
  neighborhood: string;
  /** dd/mm/aaaa digitado no formulário. */
  lastSeen: string;
  contactPhone: string;
  /** Foto em base64 (sem o prefixo data:). */
  photo?: string;
  /** URI local da foto, só para pré-visualização. */
  photoUri?: string;
}

import { api } from '@/lib/axios';
import { dateToIso, onlyDigits } from '@/lib/masks';
import type { PetsRepository } from '@/services/pets/pets.repository';
import type { CreatePetPayload, Pet } from '@/services/pets/pets.types';

/**
 * Contrato PROPOSTO para a API (.NET) — os endpoints /MissingPet ainda precisam ser criados.
 * Documentado em docs/AUDITORIA-2026-10.md (rodada 5).
 */
interface ApiMissingPet {
  missingPetId: number;
  name: string;
  species: string;
  breed?: string | null;
  color?: string | null;
  size?: string | null;
  marks?: string | null;
  city: string;
  neighborhood?: string | null;
  dtLastSeen?: string | null;
  photo?: string | null;
  contactPhone?: string | null;
  /** 1 = perdido, 3 = encontrado (mesmos códigos de MissingPerson). */
  statusId?: number | null;
}

interface ApiPagedPets {
  items: ApiMissingPet[];
}

const PAGE_SIZE = 30;

export const petsAxiosRepository: PetsRepository = {
  async list() {
    const { data } = await api.get<ApiPagedPets>('/MissingPet', {
      params: { page: 1, pageSize: PAGE_SIZE },
    });
    return (data?.items ?? []).map(mapPet);
  },

  async create(payload: CreatePetPayload) {
    const { data } = await api.post<ApiMissingPet>('/MissingPet', {
      name: payload.name.trim(),
      species: payload.species,
      breed: payload.breed.trim() || null,
      color: payload.color.trim() || null,
      size: payload.size || null,
      marks: payload.marks.trim() || null,
      city: payload.city.trim(),
      neighborhood: payload.neighborhood.trim() || null,
      dtLastSeen: payload.lastSeen ? dateToIso(payload.lastSeen) : null,
      contactPhone: onlyDigits(payload.contactPhone) || null,
      photo: payload.photo || null,
    });
    return mapPet(data);
  },
};

function mapPet(apiPet: ApiMissingPet): Pet {
  return {
    id: String(apiPet.missingPetId),
    name: apiPet.name,
    species: apiPet.species,
    breed: apiPet.breed || undefined,
    color: apiPet.color || undefined,
    size: apiPet.size || undefined,
    marks: apiPet.marks || undefined,
    city: apiPet.city,
    neighborhood: apiPet.neighborhood || undefined,
    dtLastSeen: apiPet.dtLastSeen || undefined,
    photoUri: toPhotoUri(apiPet.photo),
    contactPhone: apiPet.contactPhone || undefined,
    status: apiPet.statusId === 3 ? 'encontrado' : 'perdido',
  };
}

function toPhotoUri(photo?: string | null): string | undefined {
  const value = photo?.trim();
  if (!value) return undefined;
  if (value.startsWith('data:')) return value;
  return `data:image/jpeg;base64,${value}`;
}

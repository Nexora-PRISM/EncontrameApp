import { dateToIso, maskPhone } from '@/lib/masks';
import type { PetsRepository } from '@/services/pets/pets.repository';
import type { CreatePetPayload, Pet } from '@/services/pets/pets.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Dados FICTÍCIOS só para desenvolvimento (o mock nunca é usado em produção). */
let mockPets: Pet[] = [
  {
    id: 'pet-exemplo-1',
    name: 'Exemplo Thor',
    species: 'Cachorro',
    breed: 'Sem raça definida',
    color: 'Caramelo',
    size: 'Médio',
    marks: 'Coleira azul (exemplo)',
    city: 'Belo Horizonte - MG',
    neighborhood: 'Savassi',
    dtLastSeen: '2026-09-28T12:00:00.000Z',
    status: 'perdido',
  },
  {
    id: 'pet-exemplo-2',
    name: 'Exemplo Mel',
    species: 'Gato',
    color: 'Branca e cinza',
    size: 'Pequeno',
    city: 'Contagem - MG',
    dtLastSeen: '2026-10-02T12:00:00.000Z',
    status: 'perdido',
  },
];

export const petsMockRepository: PetsRepository = {
  async list() {
    await delay(350);
    return [...mockPets];
  },

  async create(payload: CreatePetPayload) {
    await delay(500);
    const pet: Pet = {
      id: `pet-mock-${Date.now()}`,
      name: payload.name.trim(),
      species: payload.species,
      breed: payload.breed.trim() || undefined,
      color: payload.color.trim() || undefined,
      size: payload.size || undefined,
      marks: payload.marks.trim() || undefined,
      city: payload.city.trim(),
      neighborhood: payload.neighborhood.trim() || undefined,
      dtLastSeen: payload.lastSeen ? (dateToIso(payload.lastSeen) ?? undefined) : undefined,
      contactPhone: payload.contactPhone ? maskPhone(payload.contactPhone) : undefined,
      photoUri: payload.photoUri,
      status: 'perdido',
    };
    mockPets = [pet, ...mockPets];
    return pet;
  },
};

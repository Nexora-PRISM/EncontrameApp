import { env } from '@/lib/env';
import { petsAxiosRepository } from '@/services/pets/pets.axios.repository';
import { petsMockRepository } from '@/services/pets/pets.mock.repository';
import type { CreatePetPayload, Pet } from '@/services/pets/pets.types';

/** Contrato comum aos repositórios de pets (axios e mock). */
export interface PetsRepository {
  list(): Promise<Pet[]>;
  create(payload: CreatePetPayload): Promise<Pet>;
}

export function getPetsRepository(): PetsRepository {
  return env.useMocks ? petsMockRepository : petsAxiosRepository;
}

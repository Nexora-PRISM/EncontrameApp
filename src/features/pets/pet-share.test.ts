import { buildPetShareMessage, formatPetDate, petDescription, petPlace } from '@/features/pets/pet-share';
import type { Pet } from '@/services/pets/pets.types';

function pet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: 'pet-1',
    name: 'Luna',
    species: 'Cachorro',
    city: 'Belo Horizonte',
    status: 'perdido',
    ...overrides,
  };
}

describe('divulgação de pet', () => {
  it('formata a data em UTC e monta o lugar sem endereço completo', () => {
    expect(formatPetDate('2026-06-15T12:00:00.000Z')).toBe('15/06/2026');
    expect(formatPetDate('não-é-data')).toBeUndefined();
    expect(formatPetDate(undefined)).toBeUndefined();
    expect(petPlace(pet({ neighborhood: 'Centro' }))).toBe('Centro, Belo Horizonte');
    expect(petPlace(pet({ city: '   ', neighborhood: '' }))).toBe('');
  });

  it('inclui nome, sinais e telefone mascarado', () => {
    const message = buildPetShareMessage(
      pet({
        breed: 'vira-lata',
        color: 'caramelo',
        size: 'Médio',
        marks: 'coleira azul',
        neighborhood: 'Centro',
        dtLastSeen: '2026-06-15T12:00:00.000Z',
        contactPhone: '31999998888',
      }),
    );
    expect(message).toContain('PET DESAPARECIDO: Luna');
    expect(message).toContain('coleira azul');
    expect(message).toContain('(31) 99999-8888');
    expect(message).toContain('15/06/2026');
    expect(petDescription(pet({ species: 'Gato', size: 'Pequeno' }))).toContain('Gato');
  });

  it('sem telefone, aponta o app em vez do tutor', () => {
    const message = buildPetShareMessage(pet());
    expect(message).toContain('avise pelo app Encontra-me');
    expect(message).not.toContain('avise o tutor');
  });
});

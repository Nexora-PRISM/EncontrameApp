import { petFieldError, validatePetForm, type PetFormInput } from '@/features/cadastrar-pet/pet-form';

function pet(overrides: Partial<PetFormInput> = {}): PetFormInput {
  return {
    petName: 'Luna',
    species: 'Cachorro',
    city: 'Belo Horizonte',
    lastSeen: '',
    contactPhone: '31999998888',
    ...overrides,
  };
}

describe('formulário de pet', () => {
  it('aceita o cadastro mínimo', () => {
    expect(validatePetForm(pet())).toEqual({});
    expect(petFieldError('lastSeen', '')).toBeUndefined();
  });

  it('exige nome, espécie, cidade e telefone válido', () => {
    const errors = validatePetForm(pet({ petName: 'L', species: ' ', city: '', contactPhone: '123' }));
    expect(errors.petName).toBe('too_short');
    expect(errors.species).toBe('required');
    expect(errors.city).toBe('required');
    expect(errors.contactPhone).toBe('invalid_format');
  });

  it('recusa data que ainda não aconteceu', () => {
    expect(validatePetForm(pet({ lastSeen: '01/01/2099' })).lastSeen).toBe('invalid_format');
  });
});

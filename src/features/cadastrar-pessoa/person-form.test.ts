import { validatePersonForm, type PersonFormInput } from '@/features/cadastrar-pessoa/person-form';

function form(overrides: Partial<PersonFormInput> = {}): PersonFormInput {
  return {
    fullName: 'Ana Silva',
    location: 'Praça da Sé',
    phone: '11999998888',
    age: '30',
    heightCm: '',
    lastSeen: '',
    reporterRelationship: 'Mãe ou pai',
    policeReport: '',
    declarationAccepted: true,
    ...overrides,
  };
}

describe('formulário de pessoa desaparecida', () => {
  it('aceita um cadastro de adulto com declaração', () => {
    expect(validatePersonForm(form())).toEqual({});
  });

  it('exige boletim quando a idade é de menor e não exige quando é de adulto', () => {
    expect(validatePersonForm(form({ age: '10' })).policeReport).toBe('required');
    expect(validatePersonForm(form({ age: '10', policeReport: '1234' })).policeReport).toBeUndefined();
    expect(validatePersonForm(form({ age: '18' })).policeReport).toBeUndefined();
  });

  it('não deixa a idade em branco furar a exigência do boletim', () => {
    expect(validatePersonForm(form({ age: '' })).age).toBe('required');
  });

  it('exige a declaração e recusa altura fora de 30 a 250 cm', () => {
    expect(validatePersonForm(form({ declarationAccepted: false })).declaration).toBe('required');
    expect(validatePersonForm(form({ heightCm: '29' })).heightCm).toBe('out_of_range');
    expect(validatePersonForm(form({ heightCm: '251' })).heightCm).toBe('out_of_range');
    expect(validatePersonForm(form({ heightCm: '170' })).heightCm).toBeUndefined();
  });

  it('recusa nome curto, local vazio, telefone inválido e data futura', () => {
    const errors = validatePersonForm(
      form({
        fullName: 'An',
        location: ' ',
        phone: '123',
        lastSeen: '01/01/2099',
        reporterRelationship: '',
      }),
    );
    expect(errors.fullName).toBe('too_short');
    expect(errors.localidade).toBe('required');
    expect(errors.phone).toBe('invalid_format');
    expect(errors.lastSeen).toBe('invalid_format');
    expect(errors.reporterRelationship).toBe('required');
  });
});

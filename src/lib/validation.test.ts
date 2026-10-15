import {
  collectErrors,
  confirmPasswordError,
  formatError,
  isCep,
  isCpf,
  isEmail,
  isPastDate,
  isPhone,
  newPasswordError,
  optionalFormatError,
  optionalRangeError,
  rulesAcceptedError,
  textError,
} from '@/lib/validation';

describe('validação de campos', () => {
  it('aceita CPF com dígitos verificadores corretos', () => {
    expect(isCpf('529.982.247-25')).toBe(true);
  });

  it('recusa CPF curto, repetido ou com verificador errado', () => {
    expect(isCpf('529.982.247-2')).toBe(false);
    expect(isCpf('111.111.111-11')).toBe(false);
    expect(isCpf('529.982.247-26')).toBe(false);
  });

  it('aceita telefone com DDD e 8 ou 9 dígitos', () => {
    expect(isPhone('(31) 99999-8888')).toBe(true);
    expect(isPhone('3133334444')).toBe(true);
  });

  it('recusa telefone sem tamanho ou com DDD começando em zero', () => {
    expect(isPhone('999998888')).toBe(false);
    expect(isPhone('01999998888')).toBe(false);
    expect(isPhone('30999998888')).toBe(false);
  });

  it('confere e-mail e CEP', () => {
    expect(isEmail('ana@exemplo.com')).toBe(true);
    expect(isEmail('ana@exemplo')).toBe(false);
    expect(isEmail('')).toBe(false);
    expect(isCep('30130-000')).toBe(true);
    expect(isCep('3013')).toBe(false);
  });

  it('exige senha nova com 8 caracteres, letra e número', () => {
    expect(newPasswordError('')).toBe('required');
    expect(newPasswordError('abc1234')).toBe('too_short');
    expect(newPasswordError('abcdefgh')).toBe('invalid_format');
    expect(newPasswordError('12345678')).toBe('invalid_format');
    expect(newPasswordError('abc12345')).toBeUndefined();
  });

  it('exige a confirmação igual à senha', () => {
    expect(confirmPasswordError('abc12345', '')).toBe('required');
    expect(confirmPasswordError('abc12345', 'abc12346')).toBe('invalid_format');
    expect(confirmPasswordError('abc12345', 'abc12345')).toBeUndefined();
  });

  it('exige o aceite das regras de uso', () => {
    expect(rulesAcceptedError(false)).toBe('required');
    expect(rulesAcceptedError(true)).toBeUndefined();
  });

  it('aceita data passada a partir de 1900 e recusa o que não é data ou ainda vai acontecer', () => {
    expect(isPastDate('01/01/2000')).toBe(true);
    expect(isPastDate('01/01/1899')).toBe(false);
    expect(isPastDate('31/02/2020')).toBe(false);
    expect(isPastDate('01/01/2099')).toBe(false);
  });

  it('marca texto vazio, curto e formato inválido', () => {
    expect(textError('  ')).toBe('required');
    expect(textError('ab', 3)).toBe('too_short');
    expect(textError('Ana', 3)).toBeUndefined();
    expect(formatError('', isEmail)).toBe('required');
    expect(formatError('nao-e-email', isEmail)).toBe('invalid_format');
    expect(optionalFormatError('', isEmail)).toBeUndefined();
    expect(optionalFormatError('x', isEmail)).toBe('invalid_format');
  });

  it('valida faixa só quando o campo está preenchido', () => {
    expect(optionalRangeError('', 0, 10)).toBeUndefined();
    expect(optionalRangeError('1,5', 1, 2)).toBeUndefined();
    expect(optionalRangeError('abc', 0, 10)).toBe('invalid_format');
    expect(optionalRangeError('11', 0, 10)).toBe('out_of_range');
  });

  it('descarta os campos sem erro', () => {
    expect(collectErrors({ nome: 'required', email: undefined })).toEqual({ nome: 'required' });
  });
});

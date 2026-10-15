import { ageError, isMinorAge, policeReportError } from '@/features/cadastrar-pessoa/legitimacy';

describe('legitimidade do cadastro', () => {
  it('trata como menor só quem tem idade abaixo de 18', () => {
    expect(isMinorAge('17')).toBe(true);
    expect(isMinorAge('17 anos')).toBe(true);
    expect(isMinorAge('18')).toBe(false);
    expect(isMinorAge('')).toBe(false);
  });

  it('exige idade e recusa valor fora de 0 a 130', () => {
    expect(ageError('')).toBe('required');
    expect(ageError('   ')).toBe('required');
    expect(ageError('0')).toBeUndefined();
    expect(ageError('130')).toBeUndefined();
    expect(ageError('131')).toBe('out_of_range');
    expect(ageError('abc')).toBe('invalid_format');
  });

  it('exige boletim para menor e, se informado, um número com pelo menos 4 dígitos', () => {
    expect(policeReportError('', true)).toBe('required');
    expect(policeReportError('', false)).toBeUndefined();
    expect(policeReportError('12', true)).toBe('too_short');
    expect(policeReportError('BO-1234', false)).toBeUndefined();
  });
});

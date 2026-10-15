import { dateToIso, maskCep, maskCpf, maskDate, maskDigits, maskPhone, onlyDigits } from '@/lib/masks';

describe('máscaras', () => {
  it('fica só com os dígitos', () => {
    expect(onlyDigits('(31) 99999-8888')).toBe('31999998888');
    expect(maskDigits('idade 12')).toBe('12');
  });

  it('formata CPF, telefone, CEP e data enquanto a pessoa digita', () => {
    expect(maskCpf('52998224725')).toBe('529.982.247-25');
    expect(maskPhone('31999998888')).toBe('(31) 99999-8888');
    expect(maskPhone('3133334444')).toBe('(31) 3333-4444');
    expect(maskCep('30130000')).toBe('30130-000');
    expect(maskDate('01012020')).toBe('01/01/2020');
  });

  it('corta o que passa do tamanho de cada campo', () => {
    expect(maskCpf('52998224725999')).toBe('529.982.247-25');
    expect(maskPhone('3199999888899')).toBe('(31) 99999-8888');
    expect(maskCep('3013000099')).toBe('30130-000');
  });

  it('converte uma data válida para ISO ao meio-dia UTC', () => {
    expect(dateToIso('01/01/2020')).toBe('2020-01-01T12:00:00.000Z');
  });

  it('rejeita data incompleta ou que não existe no calendário', () => {
    expect(dateToIso('1/1/2020')).toBeNull();
    expect(dateToIso('31/02/2020')).toBeNull();
    expect(dateToIso('')).toBeNull();
  });
});

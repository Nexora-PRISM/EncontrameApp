import { fieldErrorMessage, generalErrorMessage } from '@/lib/error-messages';

describe('mensagens de erro', () => {
  it('prefere o texto do campo e cai no código ou no genérico', () => {
    expect(fieldErrorMessage('cpf', 'invalid_format')).toBe('CPF inválido.');
    expect(fieldErrorMessage('phone', 'required')).toBe('Campo obrigatório.');
    expect(fieldErrorMessage('apelido', 'codigo_novo')).toBe('Campo inválido.');
  });

  it('traduz o código geral e usa o padrão quando ele é desconhecido', () => {
    expect(generalErrorMessage('invalid_credentials')).toBe('E-mail/CPF ou senha inválidos.');
    expect(generalErrorMessage('nao_mapeado')).toBe('Não foi possível concluir. Tente novamente.');
    expect(generalErrorMessage()).toBe('Não foi possível concluir. Tente novamente.');
  });
});

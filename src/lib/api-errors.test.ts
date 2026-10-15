import { apiErrorDisplayMessage, parseApiError } from '@/lib/api-errors';

function axiosError(
  data: unknown,
  extras: { code?: string; response?: unknown | null } = {},
) {
  const response = 'response' in extras ? extras.response : { data };
  return {
    isAxiosError: true,
    message: 'falhou',
    code: extras.code,
    response,
  };
}

describe('erros da API', () => {
  it('renomeia o campo da API e guarda o código geral', () => {
    const parsed = parseApiError(
      axiosError({
        message: 'validation_failed',
        errors: [{ field: 'document', error: 'invalid_format' }],
      }),
      { document: 'cpf' },
    );
    expect(parsed.code).toBe('validation_failed');
    expect(parsed.fields).toEqual({ cpf: 'invalid_format' });
  });

  it('ignora o que não é erro da API e lê um corpo em texto', () => {
    expect(parseApiError(new Error('x'))).toEqual({ fields: {} });
    expect(parseApiError(axiosError(undefined, { response: null }))).toEqual({ fields: {} });
    expect(parseApiError(axiosError('invalid_credentials')).code).toBe('invalid_credentials');
  });

  it('escolhe a mensagem de rede, de campo ou de código desconhecido', () => {
    expect(apiErrorDisplayMessage(axiosError(undefined, { response: null }))).toBe(
      'Não foi possível conectar. Verifique sua internet.',
    );
    expect(apiErrorDisplayMessage(axiosError(undefined, { response: null, code: 'ECONNABORTED' }))).toBe(
      'A requisição demorou demais. Tente novamente.',
    );
    expect(
      apiErrorDisplayMessage(
        axiosError({ errors: [{ field: 'cpf', error: 'invalid_format' }] }),
      ),
    ).toBe('CPF inválido.');
    expect(apiErrorDisplayMessage(axiosError({ message: 'codigo_que_nao_existe' }))).toBe(
      'Não foi possível concluir. Tente novamente.',
    );
    expect(apiErrorDisplayMessage(axiosError({ message: 'Mensagem livre da API' }))).toBe(
      'Mensagem livre da API',
    );
    expect(apiErrorDisplayMessage(new Error('quebrou'))).toBe('quebrou');
    expect(apiErrorDisplayMessage('nada')).toBe('Não foi possível concluir. Tente novamente.');
  });
});

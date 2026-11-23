import { isAxiosError } from 'axios';

import { apiErrorDisplayMessage, parseApiError } from '@/lib/api-errors';
import { tr } from '@/lib/i18n';
import type { FieldErrors } from '@/lib/validation';

/**
 * Erro das telas da conta: vai para o campo quando a API aponta um, senão vira uma linha abaixo do
 * formulário (sem modal — as rotas da conta são "quietas" no axios).
 */
export function accountFormError(error: unknown): { fields: FieldErrors; message: string } {
  if (isAxiosError(error) && error.response?.status === 429) {
    return { fields: {}, message: tr('Muitas tentativas. Espere alguns minutos e tente de novo.') };
  }

  const { fields } = parseApiError(error);
  if (Object.keys(fields).length > 0) return { fields, message: '' };
  return { fields: {}, message: apiErrorDisplayMessage(error) };
}

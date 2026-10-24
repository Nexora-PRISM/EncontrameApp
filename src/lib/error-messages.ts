import { msg } from '@/lib/i18n-msg';

/**
 * A API devolve apenas códigos (`{ field, error }`); o texto exibido é decidido aqui.
 */

/** Texto padrão de cada código, quando o campo não tem mensagem própria. */
const byCode: Record<string, string> = {
  required: msg('Campo obrigatório.'),
  invalid_format: msg('Formato inválido.'),
  too_short: msg('Muito curto.'),
  out_of_range: msg('Valor fora do permitido.'),
  already_registered: msg('Já cadastrado.'),
  photo_invalid: msg('Imagem inválida.'),
  photo_empty: msg('Imagem vazia.'),
  photo_too_large: msg('A imagem deve ter no máximo 2 MB.'),
};

/** Mensagens específicas, na chave `campo.codigo`. */
const byField: Record<string, string> = {
  'cpf.invalid_format': msg('CPF inválido.'),
  'cpf.already_registered': msg('Este CPF já está cadastrado.'),
  'document.invalid_format': msg('CPF inválido.'),
  'document.already_registered': msg('Este CPF já está cadastrado.'),
  'email.invalid_format': msg('Informe um e-mail válido.'),
  'email.already_registered': msg('Este e-mail já está cadastrado.'),
  'phone.invalid_format': msg('Informe DDD e número, como (31) 99999-9999.'),
  'cellPhone.invalid_format': msg('Informe DDD e número, como (31) 99999-9999.'),
  'cep.invalid_format': msg('O CEP deve ter 8 dígitos.'),
  'name.too_short': msg('Informe o nome completo.'),
  'fullName.too_short': msg('Informe o nome completo.'),
  'password.too_short': msg('A senha deve ter ao menos 8 caracteres.'),
  'password.invalid_format': msg('Use letras e números na senha.'),
  'confirm.invalid_format': msg('A confirmação não corresponde à senha.'),
  'age.out_of_range': msg('Idade inválida.'),
  'age.required': msg('Informe a idade (pode ser aproximada).'),
  'lastSeen.invalid_format': msg('Use o formato dd/mm/aaaa, com uma data que já passou.'),
  'rules.required': msg('Para criar a conta, aceite as regras de uso.'),
  'reporterRelationship.required': msg('Informe seu vínculo com a pessoa.'),
  'policeReport.required': msg('Para crianças e adolescentes, informe o número do boletim de ocorrência.'),
  'policeReport.too_short': msg('Confira o número do boletim de ocorrência.'),
  'declaration.required': msg('Confirme a declaração para continuar.'),
  'contactPhone.invalid_format': msg('Informe DDD e número, como (31) 99999-9999.'),
  'contactPhone.already_registered': msg('Este número já está na sua lista.'),
  'contactName.required': msg('Informe o nome do contato.'),
  'contactName.too_short': msg('Informe o nome do contato.'),
  'height.out_of_range': msg('Altura inválida.'),
  'location.required': msg('Informe o endereço ou use sua localização.'),
  'localidade.required': msg('Informe onde a pessoa foi vista pela última vez.'),
  'lat.required': msg('Ative a localização para ver pessoas próximas.'),
  'lng.required': msg('Ative a localização para ver pessoas próximas.'),
  'radiusKm.out_of_range': msg('O raio deve ser de até 200 km.'),
};

/** Mensagem de um campo específico do formulário. */
export function fieldErrorMessage(field: string, code: string) {
  return byField[`${field}.${code}`] ?? byCode[code] ?? msg('Campo inválido.');
}

/** Mensagem geral, usada quando a falha não aponta para um campo. */
const generalByCode: Record<string, string> = {
  validation_failed: msg('Verifique os campos destacados.'),
  conflict: msg('Estes dados já estão cadastrados.'),
  invalid_credentials: msg('E-mail/CPF ou senha inválidos.'),
  unauthorized: msg('Não autorizado.'),
  not_found: msg('Registro não encontrado.'),
  llm_unavailable: msg('A Sofia está indisponível no momento. Tente novamente em instantes.'),
};

export function generalErrorMessage(code?: string) {
  if (!code) return msg('Não foi possível concluir. Tente novamente.');
  return generalByCode[code] ?? msg('Não foi possível concluir. Tente novamente.');
}

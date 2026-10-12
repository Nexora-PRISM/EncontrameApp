import type { FieldErrors } from '@/lib/validation';

/**
 * Rascunho da etapa 1 do cadastro (nome, CPF, e-mail, celular, CEP).
 * Fica SÓ na memória do app: antes ia como parâmetro de rota e, no navegador,
 * aparecia na barra de endereço e no histórico (inclusive o CPF).
 */
export interface SignupDraft {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  cep: string;
  /** Momento em que a pessoa aceitou as regras de uso (ISO). */
  termsAcceptedAt: string;
}

let draft: SignupDraft | null = null;
let returnedErrors: FieldErrors | null = null;

export function setSignupDraft(next: SignupDraft) {
  draft = next;
}

export function getSignupDraft(): SignupDraft | null {
  return draft;
}

export function clearSignupDraft() {
  draft = null;
  returnedErrors = null;
}

/** Erros da API sobre campos da etapa 1 (ex.: CPF já cadastrado), para mostrar ao voltar. */
export function setSignupReturnErrors(errors: FieldErrors) {
  returnedErrors = errors;
}

/** Lê e limpa os erros devolvidos pela etapa 2. */
export function takeSignupReturnErrors(): FieldErrors | null {
  const errors = returnedErrors;
  returnedErrors = null;
  return errors;
}

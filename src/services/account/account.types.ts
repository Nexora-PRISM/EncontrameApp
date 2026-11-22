/** O que a API em uso oferece para a conta. API antiga (sem a rota) = tudo false: o app mantém "Em breve". */
export interface AccountCapabilities {
  profile: boolean;
  changePassword: boolean;
  sessions: boolean;
  /** "Esqueci minha senha": só quando a API consegue mandar e-mail. */
  passwordReset: boolean;
}

export const NO_ACCOUNT_CAPABILITIES: AccountCapabilities = {
  profile: false,
  changePassword: false,
  sessions: false,
  passwordReset: false,
};

/** Dados da conta. O CPF não vem da API e não aparece no app. */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cellPhone: string;
  cep: string;
  hasPassword: boolean;
  googleLinked: boolean;
}

export interface UpdateProfilePayload {
  name: string;
  cellPhone: string;
  cep: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
  language: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

/** Um aparelho ou navegador conectado. A API não informa o modelo nem o lugar. */
export interface AccountSession {
  id: string;
  /** Última renovação do acesso (aproxima o último uso). ISO. */
  lastActiveAt: string;
  expiresAt: string;
  current: boolean;
}

import type { Href } from 'expo-router';

interface UseGoogleAuthOptions {
  /** Destino após login Google de conta já existente. */
  successHref?: Href;
  /** Chamado quando o e-mail ainda não tem cadastro (já com draft gravado). */
  onNeedsRegistration?: () => void;
  /** Roda após autenticar (ex.: oferecer biometria) e antes de navegar. */
  beforeSuccess?: () => Promise<void>;
}

const unavailable = {
  available: false,
  ready: false,
  submitting: false,
  error: '',
  promptGoogle: async () => {},
};

/**
 * No Android e no iOS o login com Google ainda não existe.
 * Não chama o fluxo OAuth: no Android ele inicia mesmo com o botão escondido
 * e fecha o app ao abrir a tela de entrar.
 * O site usa `use-google-auth.web.ts`.
 */
export function useGoogleAuth(_options: UseGoogleAuthOptions = {}) {
  return unavailable;
}

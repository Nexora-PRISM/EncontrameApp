/** Recusa da Central (no modo de demonstração; na API real, 400, 403 ou 409). */
export class CentralDeniedError extends Error {
  reason: 'role' | 'mfa' | 'justification' | 'invalid' | 'flow';

  constructor(reason: CentralDeniedError['reason']) {
    super(`central:${reason}`);
    this.reason = reason;
  }
}

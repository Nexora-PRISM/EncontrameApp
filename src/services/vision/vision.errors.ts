/** Recusa do Vision (no modo de demonstração; na API real, 400, 403 ou 409). */
export class VisionDeniedError extends Error {
  reason: 'role' | 'justification' | 'owner' | 'flow' | 'invalid';

  constructor(reason: VisionDeniedError['reason']) {
    super(`vision:${reason}`);
    this.reason = reason;
  }
}

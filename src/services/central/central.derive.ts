import { linkStatus, retentionState, type RetentionState } from '@/lib/central-rules';
import type { Dossier, DossierFile, ExportRecord } from '@/services/central/central.types';

/**
 * Prazo provisório de guarda usado só para mostrar a regra na demonstração. A política real (por tipo de registro)
 * é decisão dos sócios e do jurídico.
 */
export const DEMO_RETENTION_DAYS = 365;

export type DossierView = Dossier & {
  computedAt: number;
  fileRetention: Record<string, RetentionState>;
  linkStates: Record<string, 'active' | 'expired' | 'revoked'>;
};

/** Cálculos que dependem do relógio, feitos ao buscar os dados (não na tela). */
export function deriveDossier(dossier: Dossier, now: number): DossierView {
  const legalHold = dossier.preservation.some((item) => item.status === 'active');
  const fileRetention: Record<string, RetentionState> = {};
  dossier.files.forEach((file: DossierFile) => {
    fileRetention[file.id] = retentionState(Date.parse(file.receivedAt), DEMO_RETENTION_DAYS, legalHold, now);
  });
  const linkStates: Record<string, 'active' | 'expired' | 'revoked'> = {};
  dossier.exports.forEach((item: ExportRecord) => {
    item.links.forEach((link) => {
      linkStates[link.id] = linkStatus(link, now);
    });
  });
  return { ...dossier, computedAt: now, fileRetention, linkStates };
}

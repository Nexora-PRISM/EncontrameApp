import type { ClosureOutcome, LegalBasis, TipStatus } from '@/lib/central-rules';
import { env } from '@/lib/env';
import { centralAxiosRepository } from '@/services/central/central.axios.repository';
import { centralMockRepository } from '@/services/central/central.mock.repository';
import type {
  CentralAccessInfo,
  CentralReceipt,
  ChainedAudit,
  ConfidentialTipBody,
  Dossier,
  DossierSummary,
  ExportRecord,
  TechnicalStatus,
  WitnessIdentity,
} from '@/services/central/central.types';

/**
 * Central de Inteligência. Nenhum destes endpoints existe hoje na API (propostos em CONTRATOS-API.md).
 * O servidor decide o acesso; o app só esconde o que a função não permite.
 */
export interface CentralRepository {
  /** GET /Central/access/me */
  getAccess(): Promise<CentralAccessInfo>;
  /** POST /ConfidentialTip — pista confidencial (pública, com ou sem conta). Identidade em registro separado. */
  submitConfidentialTip(body: ConfidentialTipBody): Promise<CentralReceipt>;
  /** GET /Central/dossiers */
  listDossiers(): Promise<DossierSummary[]>;
  /** GET /Central/dossiers/{id} */
  getDossier(id: string): Promise<Dossier>;
  /** GET /Central/dossiers/{id}/files/{fileId}/original — bytes do arquivo original, nunca alterado. */
  getFileBytes(dossierId: string, fileId: string): Promise<Uint8Array>;
  /** POST /Central/tips/{id}/review */
  reviewTip(dossierId: string, tipId: string, status: TipStatus, note: string): Promise<CentralReceipt>;
  /** POST /Central/tips/{id}/identity — abre a identidade de quem enviou (justificativa + segundo fator + registro). */
  openWitnessIdentity(dossierId: string, tipId: string, justification: string): Promise<WitnessIdentity>;
  /** POST /Central/dossiers/{id}/preservation */
  addPreservation(
    dossierId: string,
    input: { legalBasis: LegalBasis; reference: string; scope: string; until: string; justification: string },
  ): Promise<CentralReceipt>;
  /** POST /Central/dossiers/{id}/mobilization */
  changeMobilization(
    dossierId: string,
    input: { areaId: string | null; action: 'expand' | 'pause' | 'resume'; justification: string },
  ): Promise<CentralReceipt>;
  /** POST /Central/dossiers/{id}/closure */
  closeCase(dossierId: string, input: { outcome: ClosureOutcome; justification: string }): Promise<CentralReceipt>;
  /** POST /Central/dossiers/{id}/exports — registra a exportação (o pacote é gerado no aparelho de quem exporta). */
  registerExport(
    dossierId: string,
    input: Omit<ExportRecord, 'id' | 'at' | 'byName' | 'links'> & { justification: string },
  ): Promise<CentralReceipt>;
  /** POST /Central/exports/{id}/links — link seguro com prazo (exige a API; o pacote fica no servidor). */
  createLink(dossierId: string, exportId: string, hours: number, justification: string): Promise<CentralReceipt>;
  /** POST /Central/exports/{id}/links/{linkId}/revoke */
  revokeLink(dossierId: string, exportId: string, linkId: string, justification: string): Promise<CentralReceipt>;
  /** GET /Central/audit — registro encadeado (só inclusão). */
  getAudit(): Promise<ChainedAudit[]>;
  /** GET /Technical/status — sem conteúdo de dossiês. */
  getTechnicalStatus(): Promise<TechnicalStatus>;
  /** POST /Technical/exceptional-access — pedido; nunca liberado automaticamente. */
  requestExceptionalAccess(target: string, justification: string): Promise<CentralReceipt>;
}

export function getCentralRepository(): CentralRepository {
  return env.useMocks ? centralMockRepository : centralAxiosRepository;
}

import { env } from '@/lib/env';
import type { CameraAuthorization, MatchClass, PreservationStatus, Reliability } from '@/lib/vision-rules';
import { visionAxiosRepository } from '@/services/vision/vision.axios.repository';
import { visionMockRepository } from '@/services/vision/vision.mock.repository';
import type {
  AuditEntry,
  Camera,
  ClipAccess,
  CoverageResponse,
  CreateOperationInput,
  InstitutionalAccessRequest,
  OperationDetail,
  PreservationRequest,
  SaveCameraInput,
  VisionAccessInfo,
  VisionOperationSummary,
  VisionReceipt,
} from '@/services/vision/vision.types';

/**
 * Encontra-me Vision. Nenhum destes endpoints existe hoje na API: todos são propostos
 * (docs/evolucao/CONTRATOS-API.md). Sem eles, o módulo só funciona no modo de demonstração.
 * O servidor decide o acesso; o app só esconde o que a função não permite.
 */
export interface VisionRepository {
  /** GET /Vision/access/me — função, habilitação e pedido em análise. */
  getAccess(): Promise<VisionAccessInfo>;
  /** POST /Vision/access/requests — pedido de habilitação institucional (análise humana, nunca automática). */
  requestInstitutionalAccess(input: InstitutionalAccessRequest): Promise<VisionReceipt>;
  /** GET /Vision/coverage — só região e nível; nada de posição, responsável ou dado técnico. */
  getCoverage(): Promise<CoverageResponse>;
  /** GET /Vision/cameras/mine. */
  getMyCameras(): Promise<Camera[]>;
  /** POST /Vision/cameras ou PUT /Vision/cameras/{id}. Nunca envia senha ou endereço de acesso. */
  saveCamera(id: string | null, input: SaveCameraInput): Promise<VisionReceipt>;
  /** POST /Vision/cameras/{id}/participation — pausar, encerrar ou pedir para voltar. */
  setCameraParticipation(id: string, next: CameraAuthorization): Promise<VisionReceipt>;
  /** GET /Vision/preservation-requests/received — pedidos para as câmeras da conta. */
  getReceivedRequests(): Promise<PreservationRequest[]>;
  /** GET /Vision/operations. */
  getOperations(): Promise<VisionOperationSummary[]>;
  /** POST /Vision/operations. */
  createOperation(input: CreateOperationInput): Promise<VisionReceipt>;
  /** GET /Vision/operations/{id}. */
  getOperation(id: string): Promise<OperationDetail>;
  /** PUT /Vision/operations/{id}/radius. */
  changeRadius(operationId: string, radiusKm: number, justification: string): Promise<VisionReceipt>;
  /** POST /Vision/operations/{id}/preservation-requests — cria o pedido como rascunho. */
  requestPreservation(
    operationId: string,
    input: { cameraId: string; from: string; to: string; justification: string },
  ): Promise<VisionReceipt>;
  /** POST /Vision/preservation-requests/{id}/status — enviar, aceitar, recusar, registrar recebimento, cancelar. */
  movePreservation(requestId: string, status: PreservationStatus, note: string): Promise<VisionReceipt>;
  /** POST /Vision/matches/{id}/classification. */
  classifyMatch(matchId: string, classification: MatchClass, note: string): Promise<VisionReceipt>;
  /** POST /Vision/clips/{id}/access — libera o trecho por pouco tempo e registra quem viu e por quê. */
  openClip(clipId: string, justification: string): Promise<ClipAccess>;
  /** POST /Vision/infos/{id}/reliability. */
  rateInfo(infoId: string, reliability: Reliability, note: string): Promise<VisionReceipt>;
  /** GET /Vision/audit?operationId= — só coordenação e auditoria. */
  getAudit(operationId?: string): Promise<AuditEntry[]>;
}

export function getVisionRepository(): VisionRepository {
  return env.useMocks ? visionMockRepository : visionAxiosRepository;
}

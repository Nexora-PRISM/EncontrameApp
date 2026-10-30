import type {
  AuditEntry,
  Camera,
  CameraAuthorization,
  CameraInput,
  InfoSource,
  MatchClass,
  PreservationStatus,
  PublicCoverageArea,
  Reliability,
  ReliabilityChange,
  VisionAccess,
  VisualFeature,
} from '@/lib/vision-rules';

/** Contratos do Encontra-me Vision (docs/evolucao/CONTRATOS-API.md, seção "Vision"). */

export type VisionAccessInfo = VisionAccess & {
  userName: string;
  /** Órgão ou instituição da habilitação (só contas institucionais). */
  institution?: string;
  /** Pedido de habilitação institucional em análise, se houver. */
  pendingRequest?: { id: string; requestedAt: string };
  simulated?: boolean;
};

export type InstitutionalAccessRequest = {
  institution: string;
  position: string;
  /** Matrícula ou identificação funcional. */
  registration: string;
  institutionalEmail: string;
  reason: string;
};

/** Resposta de envio: só vale como "recebido" com `id` + `receivedAt`. */
export type VisionReceipt = { id?: string; receivedAt?: string; simulated?: boolean };

export type CoverageResponse = { areas: PublicCoverageArea[]; simulated?: boolean };

export type SaveCameraInput = Omit<CameraInput, 'consent'> & { consent: true };

export type OperationHistoryItem = { at: string; byName: string; text: string };

export type VisionOperationSummary = {
  id: string;
  caseId: string;
  /** Referência do caso para a equipe (sem nome da pessoa nas listas). */
  caseLabel: string;
  lastKnownPlace: string;
  lastSeenAt: string;
  radiusKm: number;
  status: 'open' | 'closed';
  createdAt: string;
  createdByName: string;
  openRequests: number;
  matchesToReview: number;
  simulated?: boolean;
};

export type VisionOperation = VisionOperationSummary & {
  latitude: number;
  longitude: number;
  /** Descrição visual informada pela família (roupas, mochila etc.), base da análise não biométrica. */
  description: string;
  scope: string;
  justification: string;
  responsible: string[];
  history: OperationHistoryItem[];
};

export type CreateOperationInput = {
  caseId: string;
  latitude: number;
  longitude: number;
  lastKnownPlace: string;
  lastSeenAt: string;
  radiusKm: number;
  description: string;
  scope: string;
  justification: string;
};

export type PreservationHistoryItem = { at: string; status: PreservationStatus; byName: string; note?: string };

export type PreservationRequest = {
  id: string;
  operationId: string;
  caseReference: string;
  cameraId: string;
  cameraName: string;
  ownerName: string;
  region: string;
  city: string;
  from: string;
  to: string;
  /** Até quando o equipamento guarda o começo do intervalo (prazo de guarda). */
  deadline: string;
  status: PreservationStatus;
  createdAt: string;
  requesterName: string;
  institution: string;
  contact: string;
  history: PreservationHistoryItem[];
  simulated?: boolean;
};

export type VisualMatch = {
  id: string;
  operationId: string;
  cameraId: string;
  cameraName: string;
  region: string;
  latitude: number;
  longitude: number;
  seenAt: string;
  /** 0 a 1. */
  confidence: number;
  features: VisualFeature[];
  /** Por que a IA apontou este registro. */
  reason: string;
  limitations: string[];
  clipId: string;
  classification: MatchClass;
  /** O que a IA sugeriu antes de qualquer revisão humana. */
  aiSuggestion: MatchClass | null;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  simulated?: boolean;
};

export type CollaborativeInfo = {
  id: string;
  operationId: string;
  source: InfoSource;
  /** Identificação interna da origem (nunca aparece no app público). */
  sourceLabel: string;
  receivedAt: string;
  happenedAt?: string;
  place: string;
  text: string;
  reliability: Reliability;
  changes: ReliabilityChange[];
  simulated?: boolean;
};

export type OperationDetail = {
  operation: VisionOperation;
  /** Câmeras participantes até o raio máximo (20 km) — a tela filtra pelo raio atual. */
  cameras: Camera[];
  requests: PreservationRequest[];
  matches: VisualMatch[];
  infos: CollaborativeInfo[];
};

/** Acesso a um trecho: liberado por pouco tempo, com registro. Em demonstração, é material sintético. */
export type ClipAccess = {
  clipId: string;
  grantedAt: string;
  expiresAt: string;
  /** Endereço temporário do vídeo (API real). */
  url?: string;
  /** Material sintético do modo de demonstração (sem vídeo real). */
  synthetic?: { cameraName: string; seenAt: string; caption: string };
  simulated?: boolean;
};

export type { AuditEntry, Camera, CameraAuthorization };

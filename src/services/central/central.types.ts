import type {
  CentralAccess,
  ChainedAudit,
  ClosureOutcome,
  ClosureStep,
  InfoNature,
  LegalBasis,
  MobilizationArea,
  Recipient,
  SecureLink,
  Sensitivity,
  ServiceState,
  TipContactPreference,
  TipStatus,
} from '@/lib/central-rules';

/** Contratos da Central de Inteligência (docs/evolucao/CENTRAL.md e CONTRATOS-API.md). */

export type CentralAccessInfo = CentralAccess & { userName: string; institution?: string; simulated?: boolean };

export type CentralReceipt = { id?: string; receivedAt?: string; simulated?: boolean };

export type DossierStatus = 'searching' | 'alert' | 'found' | 'closed';

export type DossierSummary = {
  id: string;
  caseId: string;
  label: string;
  status: DossierStatus;
  lastSeenAt: string;
  lastKnownPlace: string;
  /** Criança ou adolescente: prioridade. */
  priority: boolean;
  tipsToReview: number;
  activePreservations: number;
  updatedAt: string;
  simulated?: boolean;
};

export type DossierFile = {
  id: string;
  name: string;
  mime: string;
  size: number;
  sha256: string;
  origin: string;
  receivedAt: string;
  sensitivity: Sensitivity;
  /** Foto atual ou antiga, documento, vídeo ou outro. */
  kind: 'photo_current' | 'photo_old' | 'document' | 'video' | 'other';
  versions: { at: string; byName: string; note: string; sha256: string }[];
  custody: { at: string; byName: string; action: string }[];
};

export type DossierTimelineItem = {
  id: string;
  at: string;
  title: string;
  detail?: string;
  nature: InfoNature;
  /** Módulo de origem (cadastro, relato, pista confidencial, Vision, equipe…). */
  origin: string;
  originRef?: string;
};

export type DossierTip = {
  id: string;
  receivedAt: string;
  happenedAt?: string;
  place?: string;
  latitude?: number;
  longitude?: number;
  text: string;
  channel: 'confidential' | 'sighting_report' | 'phone' | 'vision' | 'volunteer';
  status: TipStatus;
  /** Existe identidade guardada em separado (só abre com justificativa, segundo fator e registro). */
  hasIdentity: boolean;
  history: { at: string; byName: string; status: TipStatus; note?: string }[];
};

export type WitnessIdentity = { tipId: string; name?: string; contactPreference: TipContactPreference; contact?: string };

export type MovementRecord = {
  id: string;
  at: string;
  place: string;
  latitude?: number;
  longitude?: number;
  /** Fonte e base legal (ex.: ofício nº, ordem judicial). */
  source: string;
};

export type PreservationOrder = {
  id: string;
  requestedAt: string;
  requestedBy: string;
  legalBasis: LegalBasis;
  reference: string;
  scope: string;
  until: string;
  status: 'active' | 'expired' | 'released';
};

export type ExportRecord = {
  id: string;
  at: string;
  byName: string;
  authorizedBy: string;
  recipient: Recipient;
  purpose: string;
  legalBasis: LegalBasis;
  manifestSha256: string;
  files: number;
  delivery: 'download' | 'encrypted_package' | 'print';
  links: (SecureLink & { simulated?: boolean })[];
};

export type Dossier = DossierSummary & {
  person: { name: string; age: number; characteristics: string[]; description: string };
  latitude: number;
  longitude: number;
  files: DossierFile[];
  timeline: DossierTimelineItem[];
  tips: DossierTip[];
  movements: MovementRecord[];
  preservation: PreservationOrder[];
  mobilization: MobilizationArea[];
  actions: { at: string; byName: string; text: string }[];
  links: { visionOperationId?: string; sightingReports: string[]; contentReports: string[] };
  closure?: { outcome: ClosureOutcome; at: string; byName: string; steps: ClosureStep[] };
  exports: ExportRecord[];
};

export type ConfidentialTipBody = {
  tip: { caseId?: string; text: string; when?: string; place?: string; hasIdentity: boolean };
  identity: { name?: string; contactPreference: TipContactPreference; contact?: string } | null;
};

export type TechnicalStatus = {
  checkedAt: string;
  services: { key: string; label: string; state: ServiceState; detail?: string }[];
  securityAlerts: { at: string; level: 'info' | 'warning' | 'critical'; text: string }[];
  /** Logs técnicos já sem conteúdo de dossiês (só tipo de evento, rota e código). */
  logs: { at: string; level: 'info' | 'warn' | 'error'; event: string; code?: string }[];
  integrations: { key: string; label: string; state: ServiceState }[];
  simulated?: boolean;
};

export type { ChainedAudit };

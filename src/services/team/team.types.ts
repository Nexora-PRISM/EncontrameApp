import type { AiIndication, ConnectionStatus, ExpansionLevel } from '@/lib/search-network-rules';
import type { SightingStatus } from '@/lib/sighting-report-rules';
import type { ReportReason, ReportTarget } from '@/lib/team-rules';

/** Denúncia aberta (GET /Moderation/reports — já existe na API, só para a equipe). */
export interface TeamContentReport {
  id: string;
  target: ReportTarget;
  targetId: string;
  reason: ReportReason;
  status: string;
  createdAt: string;
}

/** Relato de avistamento na fila da equipe (contrato proposto). */
export interface TeamSightingReport {
  reportId: string;
  personId: string;
  status: SightingStatus;
  seenAt: string;
  receivedAt: string;
  place?: string;
  description: string;
  clothes?: string;
  direction?: string;
  hasPhoto: boolean;
}

export interface SearchExpansion {
  id: string;
  from: ExpansionLevel;
  to: ExpansionLevel;
  justification: string;
  createdAt: string;
  /** Pessoas com alertas ligados na nova área (estimativa do servidor; não são pessoas mobilizadas). */
  estimatedRecipients?: number;
}

export type NetworkNodeKind = 'origin' | 'region' | 'report' | 'volunteer' | 'institution';

export interface NetworkNode {
  id: string;
  kind: NetworkNodeKind;
  label: string;
  latitude: number;
  longitude: number;
}

export interface NetworkConnection {
  id: string;
  from: string;
  to: string;
  status: ConnectionStatus;
  /** Quem sugeriu: a IA ou uma pessoa. */
  suggestedBy: 'ai' | 'person';
  reason?: string;
}

/** Acompanhamento da busca de um caso (contrato proposto: GET /MissingPerson/{id}/search). */
export interface SearchOverview {
  level: ExpansionLevel;
  radiusKm: number | null;
  paused: boolean;
  notificationsSent: number;
  /** Entregues, quando o serviço de push informar. null = não informado. */
  notificationsDelivered: number | null;
  reportsReceived: number;
  activeRegions: { label: string; reports: number }[];
  lastUpdates: { at: string; text: string }[];
  expansions: SearchExpansion[];
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  /** Só no modo de demonstração. */
  simulated?: boolean;
}

export type AiSuggestionKind = 'related_reports' | 'duplicate_case' | 'conflict' | 'new_region';

/** Sugestão da IA para a equipe revisar (contrato proposto). Nunca confirma identidade. */
export interface AiSuggestion {
  id: string;
  kind: AiSuggestionKind;
  score: number;
  indication: AiIndication;
  reasons: string[];
  reportIds: string[];
  status: 'pending' | 'accepted' | 'rejected';
  simulated?: boolean;
}

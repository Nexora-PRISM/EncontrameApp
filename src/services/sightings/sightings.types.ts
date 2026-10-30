import type { SightingStatus } from '@/lib/sighting-report-rules';

/** Como o local do avistamento foi indicado: GPS do aparelho, toque no mapa ou endereço digitado. */
export type SightingLocationSource = 'gps' | 'map' | 'address';

/** Relato completo de avistamento ("Eu vi essa pessoa"). Contrato em docs/evolucao/CONTRATOS-API.md. */
export interface SightingReportPayload {
  personId: string;
  /** Endereço ou descrição do local, como aparece no formulário. */
  location: string;
  city?: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  locationSource: SightingLocationSource;
  /** Ponto de referência opcional (ex.: "em frente à farmácia"). */
  referencePoint?: string;
  /** Momento do avistamento (ISO, UTC). */
  seenAt: string;
  /** true quando a pessoa marcou que o horário é aproximado. */
  timeIsApproximate: boolean;
  /** O que a pessoa viu (obrigatório). */
  description: string;
  clothes?: string;
  features?: string;
  /** Para onde a pessoa seguia, se foi possível ver. */
  direction?: string;
  details?: string;
  /** Foto opcional em base64 puro (sem prefixo data URL). Vai só para a análise; nunca é publicada. */
  photo?: string;
}

/** Comprovante devolvido pelo servidor. Só conta como recebido com reportId + receivedAt. */
export interface SightingReceipt {
  reportId?: string;
  status: SightingStatus;
  receivedAt?: string;
  /** Só no modo de demonstração (mock): nada foi enviado de verdade. */
  simulated?: boolean;
}

/** Relato enviado pela conta logada, para a tela "Meus relatos". */
export interface MySightingReport {
  reportId: string;
  personId: string;
  personName?: string;
  status: SightingStatus;
  seenAt: string;
  location?: string;
  receivedAt: string;
  updatedAt?: string;
  hasPhoto: boolean;
}

import { api } from '@/lib/axios';
import { normalizeSightingStatus } from '@/lib/sighting-report-rules';
import type { SightingsRepository } from '@/services/sightings/sightings.repository';
import type { MySightingReport, SightingReportPayload } from '@/services/sightings/sightings.types';

/**
 * Contrato proposto (a API .NET ainda não tem estes endpoints — ver docs/evolucao/CONTRATOS-API.md):
 * - POST /SightingReport → { sightingReportId, status, receivedAt }
 * - GET  /SightingReport/mine → ApiSightingReport[]
 * O relato não muda o último local do caso: isso só acontece depois da análise humana, no servidor.
 */
interface ApiSightingReceipt {
  sightingReportId?: number | string | null;
  status?: string | null;
  receivedAt?: string | null;
}

interface ApiSightingReport {
  sightingReportId: number | string;
  missingPersonId: number | string;
  missingPersonName?: string | null;
  status?: string | null;
  seenAt: string;
  location?: string | null;
  receivedAt: string;
  updatedAt?: string | null;
  hasPhoto?: boolean | null;
}

export const sightingsAxiosRepository: SightingsRepository = {
  async submit(payload: SightingReportPayload) {
    const { data } = await api.post<ApiSightingReceipt>('/SightingReport', toApiPayload(payload));
    const id = data?.sightingReportId;
    return {
      reportId: id != null && String(id).trim() ? String(id) : undefined,
      status: normalizeSightingStatus(data?.status),
      receivedAt: data?.receivedAt || undefined,
    };
  },

  async listMine() {
    const { data } = await api.get<ApiSightingReport[]>('/SightingReport/mine');
    return (data ?? []).map(mapReport);
  },
};

function toApiId(id: string): number | string {
  return /^\d+$/.test(id) ? Number(id) : id;
}

function toApiPayload(payload: SightingReportPayload) {
  return {
    missingPersonId: toApiId(payload.personId),
    location: payload.location,
    city: payload.city || null,
    neighborhood: payload.neighborhood || null,
    latitude: payload.latitude,
    longitude: payload.longitude,
    locationSource: payload.locationSource,
    referencePoint: payload.referencePoint || null,
    seenAt: payload.seenAt,
    timeIsApproximate: payload.timeIsApproximate,
    description: payload.description,
    clothes: payload.clothes || null,
    features: payload.features || null,
    direction: payload.direction || null,
    details: payload.details || null,
    photo: payload.photo || null,
  };
}

function mapReport(item: ApiSightingReport): MySightingReport {
  return {
    reportId: String(item.sightingReportId),
    personId: String(item.missingPersonId),
    personName: item.missingPersonName || undefined,
    status: normalizeSightingStatus(item.status),
    seenAt: item.seenAt,
    location: item.location || undefined,
    receivedAt: item.receivedAt,
    updatedAt: item.updatedAt || undefined,
    hasPhoto: item.hasPhoto === true,
  };
}

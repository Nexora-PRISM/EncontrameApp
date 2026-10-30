import { api } from '@/lib/axios';
import { nonBiometricFeatures, normalizeMatchClass, publicCoverage } from '@/lib/vision-rules';
import type { VisionRepository } from '@/services/vision/vision.repository';
import type {
  AuditEntry,
  Camera,
  ClipAccess,
  CoverageResponse,
  OperationDetail,
  PreservationRequest,
  VisionAccessInfo,
  VisionOperationSummary,
  VisionReceipt,
} from '@/services/vision/vision.types';

/**
 * Implementação real (endpoints propostos, ainda inexistentes na API).
 * Mesmo com a API pronta, o app reforça as regras de exibição: cobertura pública só por região e nível,
 * e características biométricas nunca aparecem.
 */
export const visionAxiosRepository: VisionRepository = {
  async getAccess() {
    const { data } = await api.get<VisionAccessInfo>('/Vision/access/me');
    return data;
  },

  async requestInstitutionalAccess(input) {
    const { data } = await api.post<VisionReceipt>('/Vision/access/requests', input);
    return data;
  },

  async getCoverage() {
    const { data } = await api.get<CoverageResponse>('/Vision/coverage');
    // Se o servidor mandar câmeras em vez de áreas, o app reduz a região + nível (defesa extra).
    const raw = data as CoverageResponse & { cameras?: Camera[] };
    if (Array.isArray(raw.cameras)) return { areas: publicCoverage(raw.cameras) };
    return {
      areas: (data.areas ?? []).map((area) => ({ region: area.region, city: area.city, level: area.level })),
    };
  },

  async getMyCameras() {
    const { data } = await api.get<Camera[]>('/Vision/cameras/mine');
    return data;
  },

  async saveCamera(id, input) {
    const { data } = id
      ? await api.put<VisionReceipt>(`/Vision/cameras/${encodeURIComponent(id)}`, input)
      : await api.post<VisionReceipt>('/Vision/cameras', input);
    return data;
  },

  async setCameraParticipation(id, next) {
    const { data } = await api.post<VisionReceipt>(`/Vision/cameras/${encodeURIComponent(id)}/participation`, {
      status: next,
    });
    return data;
  },

  async getReceivedRequests() {
    const { data } = await api.get<PreservationRequest[]>('/Vision/preservation-requests/received');
    return data;
  },

  async getOperations() {
    const { data } = await api.get<VisionOperationSummary[]>('/Vision/operations');
    return data;
  },

  async createOperation(input) {
    const { data } = await api.post<VisionReceipt>('/Vision/operations', input);
    return data;
  },

  async getOperation(id) {
    const { data } = await api.get<OperationDetail>(`/Vision/operations/${encodeURIComponent(id)}`);
    return {
      ...data,
      matches: (data.matches ?? []).map((match) => ({
        ...match,
        classification: normalizeMatchClass(match.classification),
        features: nonBiometricFeatures(match.features ?? []),
      })),
    };
  },

  async changeRadius(operationId, radiusKm, justification) {
    const { data } = await api.put<VisionReceipt>(`/Vision/operations/${encodeURIComponent(operationId)}/radius`, {
      radiusKm,
      justification,
    });
    return data;
  },

  async requestPreservation(operationId, input) {
    const { data } = await api.post<VisionReceipt>(
      `/Vision/operations/${encodeURIComponent(operationId)}/preservation-requests`,
      input,
    );
    return data;
  },

  async movePreservation(requestId, status, note) {
    const { data } = await api.post<VisionReceipt>(
      `/Vision/preservation-requests/${encodeURIComponent(requestId)}/status`,
      { status, note },
    );
    return data;
  },

  async classifyMatch(matchId, classification, note) {
    const { data } = await api.post<VisionReceipt>(`/Vision/matches/${encodeURIComponent(matchId)}/classification`, {
      classification,
      note,
    });
    return data;
  },

  async openClip(clipId, justification) {
    const { data } = await api.post<ClipAccess>(`/Vision/clips/${encodeURIComponent(clipId)}/access`, {
      justification,
    });
    return data;
  },

  async rateInfo(infoId, reliability, note) {
    const { data } = await api.post<VisionReceipt>(`/Vision/infos/${encodeURIComponent(infoId)}/reliability`, {
      reliability,
      note,
    });
    return data;
  },

  async getAudit(operationId) {
    const { data } = await api.get<AuditEntry[]>('/Vision/audit', { params: operationId ? { operationId } : undefined });
    return data;
  },
};

import { api } from '@/lib/axios';
import type { CentralRepository } from '@/services/central/central.repository';
import type {
  CentralAccessInfo,
  CentralReceipt,
  ChainedAudit,
  Dossier,
  DossierSummary,
  TechnicalStatus,
  WitnessIdentity,
} from '@/services/central/central.types';

const id = (value: string) => encodeURIComponent(value);

/** Implementação real (endpoints propostos, ainda inexistentes na API). */
export const centralAxiosRepository: CentralRepository = {
  async getAccess() {
    const { data } = await api.get<CentralAccessInfo>('/Central/access/me');
    return data;
  },
  async submitConfidentialTip(body) {
    const { data } = await api.post<CentralReceipt>('/ConfidentialTip', body);
    return data;
  },
  async listDossiers() {
    const { data } = await api.get<DossierSummary[]>('/Central/dossiers');
    return data;
  },
  async getDossier(dossierId) {
    const { data } = await api.get<Dossier>(`/Central/dossiers/${id(dossierId)}`);
    return data;
  },
  async getFileBytes(dossierId, fileId) {
    const { data } = await api.get<ArrayBuffer>(`/Central/dossiers/${id(dossierId)}/files/${id(fileId)}/original`, {
      responseType: 'arraybuffer',
    });
    return new Uint8Array(data);
  },
  async reviewTip(dossierId, tipId, status, note) {
    const { data } = await api.post<CentralReceipt>(`/Central/tips/${id(tipId)}/review`, { dossierId, status, note });
    return data;
  },
  async openWitnessIdentity(dossierId, tipId, justification) {
    const { data } = await api.post<WitnessIdentity>(`/Central/tips/${id(tipId)}/identity`, { dossierId, justification });
    return data;
  },
  async addPreservation(dossierId, input) {
    const { data } = await api.post<CentralReceipt>(`/Central/dossiers/${id(dossierId)}/preservation`, input);
    return data;
  },
  async changeMobilization(dossierId, input) {
    const { data } = await api.post<CentralReceipt>(`/Central/dossiers/${id(dossierId)}/mobilization`, input);
    return data;
  },
  async closeCase(dossierId, input) {
    const { data } = await api.post<CentralReceipt>(`/Central/dossiers/${id(dossierId)}/closure`, input);
    return data;
  },
  async registerExport(dossierId, input) {
    const { data } = await api.post<CentralReceipt>(`/Central/dossiers/${id(dossierId)}/exports`, input);
    return data;
  },
  async createLink(dossierId, exportId, hours, justification) {
    const { data } = await api.post<CentralReceipt>(`/Central/exports/${id(exportId)}/links`, {
      dossierId,
      hours,
      justification,
    });
    return data;
  },
  async revokeLink(dossierId, exportId, linkId, justification) {
    const { data } = await api.post<CentralReceipt>(`/Central/exports/${id(exportId)}/links/${id(linkId)}/revoke`, {
      dossierId,
      justification,
    });
    return data;
  },
  async getAudit() {
    const { data } = await api.get<ChainedAudit[]>('/Central/audit');
    return data;
  },
  async getTechnicalStatus() {
    const { data } = await api.get<TechnicalStatus>('/Technical/status');
    return data;
  },
  async requestExceptionalAccess(target, justification) {
    const { data } = await api.post<CentralReceipt>('/Technical/exceptional-access', { target, justification });
    return data;
  },
};

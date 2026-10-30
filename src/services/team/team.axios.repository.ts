import { isAxiosError } from 'axios';

import { api, QUIET } from '@/lib/axios';
import { aiIndication, normalizeConnectionStatus, normalizeLevel } from '@/lib/search-network-rules';
import { normalizeSightingStatus } from '@/lib/sighting-report-rules';
import { normalizeReportReason, normalizeReportTarget } from '@/lib/team-rules';
import type { TeamRepository } from '@/services/team/team.repository';
import type { AiSuggestion, SearchOverview, TeamContentReport, TeamSightingReport } from '@/services/team/team.types';

interface ApiContentReport {
  contentReportId: number;
  targetType: string;
  targetId: number;
  reason: string;
  status: string;
  dtRegistration: string;
}

export const teamAxiosRepository: TeamRepository = {
  async isStaff() {
    try {
      await api.get('/Moderation/reports', QUIET);
      return true;
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) return false;
      throw error;
    }
  },

  async listReports() {
    const { data } = await api.get<ApiContentReport[]>('/Moderation/reports');
    return (data ?? []).map(
      (item): TeamContentReport => ({
        id: String(item.contentReportId),
        target: normalizeReportTarget(item.targetType),
        targetId: String(item.targetId),
        reason: normalizeReportReason(item.reason),
        status: item.status,
        createdAt: item.dtRegistration,
      }),
    );
  },

  async hideReport(id) {
    await api.post(`/Moderation/reports/${id}/hide`);
  },

  async dismissReport(id) {
    await api.post(`/Moderation/reports/${id}/dismiss`);
  },

  async changeCaseStatus(caseId, statusId, justification) {
    await api.post(`/Moderation/missing-person/${caseId}/status`, { statusId, justification });
  },

  async listSightingReports(caseId) {
    const { data } = await api.get<TeamSightingReport[]>('/SightingReport', {
      params: { missingPersonId: caseId, status: 'pending_review' },
    });
    return (data ?? []).map((item) => ({ ...item, status: normalizeSightingStatus(item.status) }));
  },

  async decideSightingReport(reportId, status, justification) {
    await api.patch(`/SightingReport/${reportId}/status`, { status, justification });
  },

  async getSearchOverview(caseId) {
    const { data } = await api.get<SearchOverview>(`/MissingPerson/${caseId}/search`);
    return {
      ...data,
      level: normalizeLevel(data.level),
      connections: (data.connections ?? []).map((item) => ({ ...item, status: normalizeConnectionStatus(item.status) })),
      expansions: (data.expansions ?? []).map((item) => ({ ...item, from: normalizeLevel(item.from), to: normalizeLevel(item.to) })),
    };
  },

  async expandSearch(caseId, to, justification) {
    await api.post(`/MissingPerson/${caseId}/search/expansions`, { to, justification });
  },

  async setAlertsPaused(caseId, paused, justification) {
    await api.post(`/MissingPerson/${caseId}/search/pause`, { paused, justification });
  },

  async listAiSuggestions(caseId) {
    const { data } = await api.get<AiSuggestion[]>(`/MissingPerson/${caseId}/ai-suggestions`);
    return (data ?? []).map((item) => ({ ...item, indication: aiIndication(item.score) }));
  },

  async decideAiSuggestion(id, accept, justification) {
    await api.post(`/AiSuggestion/${id}/decision`, { accept, justification });
  },
};

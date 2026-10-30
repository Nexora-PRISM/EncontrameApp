import { isAxiosError } from 'axios';

import { api } from '@/lib/axios';
import { normalizeWays } from '@/lib/collaboration-rules';
import type { CollaborationRepository } from '@/services/collaboration/collaboration.repository';
import type { VolunteerProfile } from '@/services/collaboration/collaboration.types';

interface ApiReceipt {
  id?: number | string | null;
  receivedAt?: string | null;
}

function toReceipt(data: ApiReceipt | undefined) {
  return {
    id: data?.id != null && String(data.id).trim() ? String(data.id) : undefined,
    receivedAt: data?.receivedAt || undefined,
  };
}

export const collaborationAxiosRepository: CollaborationRepository = {
  async getVolunteer() {
    try {
      const { data } = await api.get<VolunteerProfile>('/Volunteer/me');
      return data ? { ...data, ways: normalizeWays(data.ways ?? []) } : null;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async saveVolunteer(profile) {
    const { data } = await api.put<ApiReceipt>('/Volunteer/me', profile);
    return toReceipt(data);
  },

  async leaveVolunteer() {
    await api.delete('/Volunteer/me');
  },

  async suggestRegion({ personId, place, reason }) {
    const { data } = await api.post<ApiReceipt>(`/MissingPerson/${personId}/region-suggestions`, { place, reason });
    return toReceipt(data);
  },
};

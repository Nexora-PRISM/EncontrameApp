import { isAxiosError } from 'axios';

import { api } from '@/lib/axios';
import { onlyDigits } from '@/lib/masks';
import type { AccountRepository } from '@/services/account/account.repository';
import {
  type AccountCapabilities,
  type AccountSession,
  NO_ACCOUNT_CAPABILITIES,
  type UserProfile,
} from '@/services/account/account.types';

interface ApiProfile {
  id?: string | number;
  name?: string;
  email?: string;
  cellPhone?: string;
  cep?: string;
  hasPassword?: boolean;
  googleLinked?: boolean;
}

interface ApiSession {
  id?: string | number;
  lastActiveAt?: string;
  expiresAt?: string;
  current?: boolean;
}

function mapProfile(data: ApiProfile): UserProfile {
  return {
    id: String(data.id ?? ''),
    name: data.name ?? '',
    email: data.email ?? '',
    cellPhone: data.cellPhone ?? '',
    cep: data.cep ?? '',
    hasPassword: Boolean(data.hasPassword),
    googleLinked: Boolean(data.googleLinked),
  };
}

function mapSession(data: ApiSession): AccountSession {
  return {
    id: String(data.id ?? ''),
    lastActiveAt: data.lastActiveAt ?? '',
    expiresAt: data.expiresAt ?? '',
    current: Boolean(data.current),
  };
}

export const accountAxiosRepository: AccountRepository = {
  async capabilities() {
    try {
      const { data } = await api.get<Partial<AccountCapabilities>>('/Auth/capabilities');
      return {
        profile: data?.profile === true,
        changePassword: data?.changePassword === true,
        sessions: data?.sessions === true,
        passwordReset: data?.passwordReset === true,
      };
    } catch (error) {
      // API ainda sem a rota: nada disponível (continua "Em breve"). Sem internet: tenta de novo depois.
      if (isAxiosError(error) && error.response?.status === 404) return NO_ACCOUNT_CAPABILITIES;
      throw error;
    }
  },

  async getProfile() {
    const { data } = await api.get<ApiProfile>('/Auth/me');
    return mapProfile(data);
  },

  async updateProfile(payload) {
    const { data } = await api.put<ApiProfile>('/Auth/me', {
      name: payload.name.trim(),
      cellPhone: onlyDigits(payload.cellPhone),
      cep: onlyDigits(payload.cep) || null,
    });
    return mapProfile(data);
  },

  async changePassword(payload) {
    await api.post('/Auth/password', payload);
  },

  async forgotPassword(payload) {
    await api.post('/Auth/password/forgot', { email: payload.email.trim(), language: payload.language });
  },

  async resetPassword(payload) {
    await api.post('/Auth/password/reset', {
      email: payload.email.trim(),
      code: payload.code,
      newPassword: payload.newPassword,
    });
  },

  async listSessions() {
    const { data } = await api.get<ApiSession[]>('/Auth/sessions');
    return Array.isArray(data) ? data.map(mapSession) : [];
  },

  async revokeSession(id) {
    await api.delete(`/Auth/sessions/${encodeURIComponent(id)}`);
  },

  async revokeOtherSessions() {
    const { data } = await api.post<{ revoked?: number }>('/Auth/sessions/revoke-others');
    return Number(data?.revoked ?? 0);
  },
};

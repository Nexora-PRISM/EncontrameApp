import { api } from '@/lib/axios';
import { env } from '@/lib/env';
import { isSupporterCategory, type SupporterCategory } from '@/lib/supporter-rules';
import type { SupportersRepository } from '@/services/supporters/supporters.repository';
import type { Supporter, SupporterAdmin, SupporterPayload } from '@/services/supporters/supporters.types';

type ApiSupporter = {
  supporterId: number;
  name: string;
  websiteUrl?: string | null;
  category: string;
  logoUrl?: string | null;
  logoWidth?: number | null;
  logoHeight?: number | null;
  isActive?: boolean;
  showOnHome?: boolean;
  displayOrder?: number;
  authorizationConfirmed?: boolean;
  authorizationConfirmedAt?: string | null;
  authorizationNote?: string | null;
  hasLogo?: boolean;
};

/** A API devolve o caminho do logotipo ("/api/Supporter/1/logo?v=…"); aqui vira endereço completo. */
function absolute(path: string | null | undefined): string | null {
  if (!path) return null;
  try {
    return new URL(path, env.apiUrl).toString();
  } catch {
    return null;
  }
}

const category = (value: string): SupporterCategory => (isSupporterCategory(value) ? value : 'apoiador');

const mapPublic = (item: ApiSupporter): Supporter => ({
  id: String(item.supporterId),
  name: item.name,
  websiteUrl: item.websiteUrl ?? null,
  category: category(item.category),
  logoUrl: absolute(item.logoUrl),
  logoWidth: item.logoWidth ?? null,
  logoHeight: item.logoHeight ?? null,
});

const mapAdmin = (item: ApiSupporter): SupporterAdmin => ({
  ...mapPublic(item),
  isActive: item.isActive === true,
  showOnHome: item.showOnHome === true,
  displayOrder: item.displayOrder ?? 0,
  authorizationConfirmed: item.authorizationConfirmed === true,
  authorizationConfirmedAt: item.authorizationConfirmedAt ?? null,
  authorizationNote: item.authorizationNote ?? '',
  hasLogo: item.hasLogo === true,
});

const toBody = (payload: SupporterPayload) => ({
  name: payload.name.trim(),
  websiteUrl: payload.websiteUrl.trim() || null,
  category: payload.category,
  logo: payload.logoBase64 || null,
  removeLogo: payload.removeLogo === true,
  isActive: payload.isActive,
  showOnHome: payload.showOnHome,
  authorizationConfirmed: payload.authorizationConfirmed,
  authorizationNote: payload.authorizationNote.trim() || null,
});

export const supportersAxiosRepository: SupportersRepository = {
  async listPublic({ home }) {
    const { data } = await api.get<ApiSupporter[]>('/Supporter', { params: home ? { home: true } : undefined, quietErrors: true });
    return data.map(mapPublic);
  },
  async listAdmin() {
    const { data } = await api.get<ApiSupporter[]>('/Supporter/admin');
    return data.map(mapAdmin);
  },
  async getAdminLogo(id) {
    const { data } = await api.get<{ logo?: string | null }>(`/Supporter/admin/${encodeURIComponent(id)}/logo`, { quietErrors: true });
    return data.logo ?? null;
  },
  async create(payload) {
    const { data } = await api.post<ApiSupporter>('/Supporter', toBody(payload));
    return mapAdmin(data);
  },
  async update(id, payload) {
    const { data } = await api.put<ApiSupporter>(`/Supporter/${encodeURIComponent(id)}`, toBody(payload));
    return mapAdmin(data);
  },
  async remove(id) {
    await api.delete(`/Supporter/${encodeURIComponent(id)}`);
  },
  async reorder(ids) {
    const { data } = await api.put<ApiSupporter[]>('/Supporter/order', { supporterIds: ids.map(Number) });
    return data.map(mapAdmin);
  },
};

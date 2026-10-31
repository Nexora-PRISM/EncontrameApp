import type { SupportersRepository } from '@/services/supporters/supporters.repository';
import type { SupporterAdmin } from '@/services/supporters/supporters.types';

/**
 * Demonstração: empresas fictícias ("Exemplo"), sem logotipo de marca real.
 * Nenhuma empresa real entra aqui sem parceria confirmada e autorização de uso da marca.
 */
const demo = (id: number, name: string, category: SupporterAdmin['category'], extra: Partial<SupporterAdmin> = {}): SupporterAdmin => ({
  id: String(id),
  name,
  websiteUrl: null,
  category,
  logoUrl: null,
  logoWidth: null,
  logoHeight: null,
  demo: true,
  isActive: true,
  showOnHome: true,
  displayOrder: id,
  authorizationConfirmed: true,
  authorizationConfirmedAt: '2026-10-31T12:00:00.000Z',
  authorizationNote: 'Exemplo de demonstração',
  hasLogo: false,
  ...extra,
});

let items: SupporterAdmin[] = [
  demo(1, 'Empresa Exemplo A', 'patrocinador'),
  demo(2, 'Instituto Exemplo B', 'parceiro'),
  demo(3, 'Comércio Exemplo C', 'apoiador'),
  demo(4, 'Associação Exemplo D', 'apoiador', { showOnHome: false }),
  demo(5, 'Marca Exemplo E (aguardando autorização)', 'apoiador', {
    isActive: false,
    showOnHome: false,
    authorizationConfirmed: false,
    authorizationConfirmedAt: null,
    authorizationNote: '',
  }),
];
let nextId = 6;
const logos = new Map<string, string>();

const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
const sorted = () => [...items].sort((a, b) => a.displayOrder - b.displayOrder || Number(a.id) - Number(b.id));

export const supportersMockRepository: SupportersRepository = {
  async listPublic({ home }) {
    await wait();
    return sorted().filter((s) => s.isActive && s.authorizationConfirmed && (!home || s.showOnHome));
  },
  async listAdmin() {
    await wait();
    return sorted();
  },
  async getAdminLogo(id) {
    return logos.get(id) ?? null;
  },
  async create(payload) {
    await wait();
    const id = String(nextId++);
    if (payload.logoBase64) logos.set(id, `data:image/png;base64,${payload.logoBase64}`);
    const created: SupporterAdmin = {
      ...demo(Number(id), payload.name.trim(), payload.category),
      websiteUrl: payload.websiteUrl.trim() || null,
      logoUrl: logos.get(id) ?? null,
      hasLogo: logos.has(id),
      isActive: payload.isActive && payload.authorizationConfirmed,
      showOnHome: payload.showOnHome,
      displayOrder: Math.max(0, ...items.map((s) => s.displayOrder)) + 1,
      authorizationConfirmed: payload.authorizationConfirmed,
      authorizationConfirmedAt: payload.authorizationConfirmed ? new Date().toISOString() : null,
      authorizationNote: payload.authorizationNote.trim(),
    };
    items = [...items, created];
    return created;
  },
  async update(id, payload) {
    await wait();
    const current = items.find((s) => s.id === id);
    if (!current) throw new Error('not_found');
    if (payload.logoBase64) logos.set(id, `data:image/png;base64,${payload.logoBase64}`);
    if (payload.removeLogo) logos.delete(id);
    const updated: SupporterAdmin = {
      ...current,
      name: payload.name.trim(),
      websiteUrl: payload.websiteUrl.trim() || null,
      category: payload.category,
      logoUrl: logos.get(id) ?? null,
      hasLogo: logos.has(id),
      isActive: payload.isActive && payload.authorizationConfirmed,
      showOnHome: payload.showOnHome,
      authorizationConfirmed: payload.authorizationConfirmed,
      authorizationConfirmedAt: payload.authorizationConfirmed ? (current.authorizationConfirmedAt ?? new Date().toISOString()) : null,
      authorizationNote: payload.authorizationNote.trim(),
    };
    items = items.map((s) => (s.id === id ? updated : s));
    return updated;
  },
  async remove(id) {
    await wait();
    items = items.filter((s) => s.id !== id);
    logos.delete(id);
  },
  async reorder(ids) {
    await wait();
    items = items.map((s) => ({ ...s, displayOrder: ids.indexOf(s.id) }));
    return sorted();
  },
};

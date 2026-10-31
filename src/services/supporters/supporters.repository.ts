import { env } from '@/lib/env';
import { supportersAxiosRepository } from '@/services/supporters/supporters.axios.repository';
import { supportersMockRepository } from '@/services/supporters/supporters.mock.repository';
import type { Supporter, SupporterAdmin, SupporterPayload } from '@/services/supporters/supporters.types';

/** Nossos Apoiadores: lista pública e administração pela equipe (a API recusa os outros com 403). */
export interface SupportersRepository {
  listPublic(params: { home: boolean }): Promise<Supporter[]>;
  listAdmin(): Promise<SupporterAdmin[]>;
  /** Logotipo para pré-visualização da equipe (data URL), inclusive de quem ainda não foi publicado. */
  getAdminLogo(id: string): Promise<string | null>;
  create(payload: SupporterPayload): Promise<SupporterAdmin>;
  update(id: string, payload: SupporterPayload): Promise<SupporterAdmin>;
  remove(id: string): Promise<void>;
  /** Nova ordem com todos os ids. */
  reorder(ids: string[]): Promise<SupporterAdmin[]>;
}

export function getSupportersRepository(): SupportersRepository {
  return env.useMocks ? supportersMockRepository : supportersAxiosRepository;
}

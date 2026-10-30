import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_NEARBY_RADIUS_KM, haversineKm, snapNearbyCoord } from '@/lib/geo';
import { syncPendingReminder } from '@/lib/pending-reminder';
import { isLocalPersonId } from '@/lib/person-status';
import { getSessionUser } from '@/lib/session';
import { useSessionUser } from '@/lib/use-session-user';
import {
  type LocalPendingPerson,
  deleteLocalPending,
  getLocalPending,
  listLocalPending,
  mergeLocalPeople,
  saveLocalPending,
} from '@/services/people/people.local.store';
import { getPeopleRepository } from '@/services/people/people.repository';
import type {
  CreatePersonPayload,
  NearbyPeopleParams,
  PeopleSearchPage,
  PeopleSearchParams,
  Person,
  ReportLastSeenPayload,
} from '@/services/people/people.types';

const DEFAULT_PAGE_SIZE = 12;

const peopleKeys = {
  all: ['people'] as const,
  search: (viewerId: string, filters: Omit<PeopleSearchParams, 'page' | 'pageSize'>) =>
    ['people', 'search', viewerId, filters] as const,
  nearby: (viewerId: string, query: string, lat: number, lng: number) =>
    ['people', 'nearby', viewerId, query, lat, lng] as const,
  detail: (id: string) => ['people', 'detail', id] as const,
  lastSeenHistory: (id: string) => ['people', 'last-seen-history', id] as const,
  follow: (viewerId: string, id: string) => ['people', 'follow', viewerId, id] as const,
};

function viewerKey(userId?: string | null) {
  return userId ?? 'anon';
}

/**
 * Busca paginada de pessoas desaparecidas (filtros no backend).
 */
export function usePeopleSearchQuery(params: PeopleSearchParams) {
  const viewerId = viewerKey(useSessionUser()?.id);
  const filters = {
    query: params.query ?? '',
    statusId: params.statusId,
    ageMin: params.ageMin,
    ageMax: params.ageMax,
    city: params.city ?? '',
    state: params.state ?? '',
    country: params.country ?? '',
    neighborhood: params.neighborhood ?? '',
    addressScope: params.addressScope ?? 'lastSeen',
  };
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: peopleKeys.search(viewerId, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PeopleSearchPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    queryFn: async ({ pageParam }) => {
      const local = filterLocalSearch(await listLocalPersons(), { ...params, page: 1, pageSize: 1000 });
      try {
        const remote = await getPeopleRepository().search({
          ...params,
          page: pageParam,
          pageSize,
        });
        if (pageParam === 1) {
          const items = mergeLocalPeople(local, remote.items);
          return {
            ...remote,
            items,
            totalCount: remote.totalCount + (items.length - remote.items.length),
          };
        }
        return remote;
      } catch (error) {
        if (pageParam === 1 && local.length > 0) {
          return {
            items: local,
            page: 1,
            pageSize,
            totalCount: local.length,
            totalPages: 1,
          } satisfies PeopleSearchPage;
        }
        throw error;
      }
    },
    placeholderData: keepPreviousData,
  });
}

export function useNearbyPeopleQuery(params: {
  query: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}) {
  const viewerId = viewerKey(useSessionUser()?.id);
  const hasCoords =
    params.latitude != null &&
    params.longitude != null &&
    Number.isFinite(params.latitude) &&
    Number.isFinite(params.longitude);
  const latitude = hasCoords ? snapNearbyCoord(params.latitude!) : null;
  const longitude = hasCoords ? snapNearbyCoord(params.longitude!) : null;

  return useQuery({
    queryKey: peopleKeys.nearby(viewerId, params.query, latitude ?? 0, longitude ?? 0),
    enabled: hasCoords,
    queryFn: async () => {
      const nearbyParams: NearbyPeopleParams = {
        query: params.query,
        latitude: latitude!,
        longitude: longitude!,
        radiusKm: params.radiusKm,
      };
      const local = filterLocalNearby(await listLocalPersons(), nearbyParams);
      try {
        const remote = await getPeopleRepository().listNearby(nearbyParams);
        return mergeLocalPeople(local, remote);
      } catch (error) {
        if (local.length > 0) return local;
        throw error;
      }
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Casos mais recentes (1ª página da busca), usados para completar o carrossel do Início
 * quando há poucas pessoas próximas — assim dá para continuar deslizando.
 */
export function useRecentPeopleQuery(enabled: boolean, pageSize = 20) {
  const viewerId = viewerKey(useSessionUser()?.id);

  return useQuery({
    queryKey: ['people', 'recent', viewerId, pageSize] as const,
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const page = await getPeopleRepository().search({ page: 1, pageSize });
      return page.items;
    },
  });
}

export function usePersonQuery(id: string) {
  return useQuery({
    queryKey: peopleKeys.detail(id),
    queryFn: async () => {
      if (isLocalPersonId(id)) {
        const person = await getLocalPending(id);
        if (!person) {
          throw new Error('Pessoa não encontrada.');
        }
        return person;
      }
      return getPeopleRepository().getById(id);
    },
    enabled: id.length > 0,
  });
}

export function useLastSeenHistoryQuery(id: string, enabled: boolean) {
  return useQuery({
    queryKey: peopleKeys.lastSeenHistory(id),
    queryFn: () => getPeopleRepository().listLastSeenHistory(id),
    enabled: enabled && id.length > 0 && !isLocalPersonId(id),
  });
}

export function useCreatePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePersonPayload) => {
      if (getSessionUser() == null) {
        const person = await saveLocalPending(payload);
        void syncPendingReminder();
        return person;
      }
      return getPeopleRepository().create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
    },
  });
}

/** Lê um cadastro feito sem conta neste aparelho, para a pessoa logada revisar antes de enviar. */
export async function getLocalDraft(id: string): Promise<LocalPendingPerson | null> {
  const items = await listLocalPending();
  return items.find((item) => item.id === id) ?? null;
}

/**
 * Envia um cadastro feito sem conta neste aparelho. Só é chamado depois que a pessoa logada
 * revisou os dados e aceitou a declaração de veracidade (nada é enviado sozinho no login).
 * O rascunho local só é apagado depois que a API confirma o cadastro.
 */
export function useSubmitLocalDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ draftId, payload }: { draftId: string; payload: CreatePersonPayload }) => {
      if (getSessionUser() == null) {
        throw new Error('Entre na sua conta para enviar este cadastro.');
      }
      const person = await getPeopleRepository().create(payload);
      try {
        await deleteLocalPending(draftId);
      } catch {
        // Uma nova tentativa evita que o mesmo caso seja enviado duas vezes.
        await deleteLocalPending(draftId).catch(() => undefined);
      }
      void syncPendingReminder();
      return person;
    },
    onSuccess: (_person, { draftId }) => {
      queryClient.removeQueries({ queryKey: peopleKeys.detail(draftId) });
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
    },
  });
}

export function useReportLastSeenMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReportLastSeenPayload) =>
      getPeopleRepository().reportLastSeen(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: peopleKeys.lastSeenHistory(id) });
    },
  });
}

/** Se a conta logada acompanha o caso. Sem conta, rascunho local ou flag desligada: não consulta. */
export function useFollowStatusQuery(id: string, enabled: boolean) {
  const userId = useSessionUser()?.id;

  return useQuery({
    queryKey: peopleKeys.follow(viewerKey(userId), id),
    queryFn: () => getPeopleRepository().getFollowStatus(id),
    enabled: enabled && userId != null && id.length > 0 && !isLocalPersonId(id),
  });
}

export function useToggleFollowMutation(id: string) {
  const queryClient = useQueryClient();
  const userId = useSessionUser()?.id;

  return useMutation({
    retry: false,
    mutationFn: async (follow: boolean) => {
      if (follow) {
        await getPeopleRepository().follow(id);
      } else {
        await getPeopleRepository().unfollow(id);
      }
      return follow;
    },
    onSuccess: (following) => {
      queryClient.setQueryData(peopleKeys.follow(viewerKey(userId), id), following);
    },
  });
}

async function listLocalPersons(): Promise<Person[]> {
  const pending = await listLocalPending();
  return pending.map((item) => item.person);
}

function filterLocalNearby(people: Person[], params: NearbyPeopleParams): Person[] {
  const radius = params.radiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const nearby = people.filter((person) => {
    if (!person.coords) return true;
    return (
      haversineKm(params.latitude, params.longitude, person.coords.latitude, person.coords.longitude) <=
      radius
    );
  });
  return filterLocalByQuery(nearby, params.query ?? '');
}

function filterLocalSearch(people: Person[], params: PeopleSearchParams): Person[] {
  const byName = filterLocalByQuery(people, params.query ?? '');
  const useOrigin = params.addressScope === 'origin';
  return byName.filter((person) => {
    if (params.statusId != null && person.statusId !== params.statusId) return false;
    if (params.ageMin != null && (person.age == null || person.age < params.ageMin)) return false;
    if (params.ageMax != null && (person.age == null || person.age > params.ageMax)) return false;
    if (params.city && !includesField(useOrigin ? person.originCity : person.city, params.city)) return false;
    if (params.state && !includesField(useOrigin ? person.originState : person.state, params.state)) return false;
    if (params.country && !includesField(useOrigin ? person.originCountry : person.country, params.country)) {
      return false;
    }
    if (
      params.neighborhood &&
      !includesField(useOrigin ? person.originNeighborhood : person.neighborhood, params.neighborhood)
    ) {
      return false;
    }
    return true;
  });
}

function filterLocalByQuery(people: Person[], query: string): Person[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return people;

  return people.filter((person) => {
    const haystack = [person.fullName, person.nickname, person.location, person.lastSeen]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

function includesField(value: string | undefined, needle: string) {
  return Boolean(value?.toLowerCase().includes(needle.trim().toLowerCase()));
}

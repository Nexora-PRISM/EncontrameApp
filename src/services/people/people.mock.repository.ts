import { DEFAULT_NEARBY_RADIUS_KM, haversineKm } from '@/lib/geo';
import { isUserBlocked } from '@/services/moderation/moderation.mock.repository';
import { dateToIso } from '@/lib/masks';
import type { PeopleRepository } from '@/services/people/people.repository';
import type {
  CreatePersonPayload,
  NearbyPeopleParams,
  PeopleSearchParams,
  Person,
  PersonLastSeen,
  ReportLastSeenPayload,
} from '@/services/people/people.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Casos acompanhados no mock (memória, some ao recarregar). */
const mockFollowing = new Set<string>();

function visiblePeople(): Person[] {
  return mockPeople.filter((person) => !person.authorId || !isUserBlocked(person.authorId));
}

let mockPeople: Person[] = [
  {
    id: 'p1',
    fullName: 'Fulano da Silva',
    nickname: 'Fulano',
    age: 36,
    location: 'Savassi, Belo Horizonte',
    lastSeen: 'Savassi, Belo Horizonte',
    dtLastSeen: '2024-01-01T12:00:00.000Z',
    originCity: 'Contagem',
    originState: 'MG',
    originCountry: 'Brasil',
    originNeighborhood: 'Eldorado',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    neighborhood: 'Savassi',
    photoUri: 'https://picsum.photos/seed/encontrame-p1/200/200',
    coords: { latitude: -19.918, longitude: -43.938 },
    restricted: false,
    statusId: 1,
    statusDescription: 'Pendente',
  },
  {
    id: 'p2',
    fullName: 'Fulana de Souza',
    nickname: 'Fulana',
    authorId: 'u-mock-publisher',
    age: 25,
    location: 'Pampulha, Belo Horizonte',
    lastSeen: 'Pampulha, Belo Horizonte',
    dtLastSeen: '2024-03-12T15:00:00.000Z',
    originCity: 'Belo Horizonte',
    originState: 'MG',
    originCountry: 'Brasil',
    originNeighborhood: 'Pampulha',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    neighborhood: 'Pampulha',
    photoUri: 'https://picsum.photos/seed/encontrame-p2/200/200',
    coords: { latitude: -19.924, longitude: -43.945 },
    restricted: true,
    statusId: 2,
    statusDescription: 'Procurado',
  },
  {
    id: 'p3',
    fullName: 'Beltrano Pereira',
    nickname: 'Beltrano',
    age: 42,
    location: 'Centro de Contagem',
    lastSeen: 'Centro de Contagem',
    dtLastSeen: '2024-05-20T10:00:00.000Z',
    originCity: 'Contagem',
    originState: 'MG',
    originCountry: 'Brasil',
    originNeighborhood: 'Centro',
    city: 'Contagem',
    state: 'MG',
    country: 'Brasil',
    neighborhood: 'Centro',
    coords: { latitude: -19.931, longitude: -44.053 },
    restricted: true,
    statusId: 1,
    statusDescription: 'Pendente',
  },
  {
    id: 'p4',
    fullName: 'Ciclano Rocha',
    nickname: 'Ciclano',
    age: 19,
    location: 'Centro, Belo Horizonte',
    lastSeen: 'Centro, Belo Horizonte',
    dtLastSeen: '2024-07-02T18:00:00.000Z',
    originCity: 'Belo Horizonte',
    originState: 'MG',
    originCountry: 'Brasil',
    originNeighborhood: 'Centro',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    neighborhood: 'Centro',
    photoUri: 'https://picsum.photos/seed/encontrame-p4/200/200',
    coords: { latitude: -19.912, longitude: -43.928 },
    restricted: false,
    statusId: 4,
    statusDescription: 'Alerta',
  },
  {
    id: 'p5',
    fullName: 'Maria do Rio',
    nickname: 'Maria',
    age: 31,
    location: 'Copacabana, Rio de Janeiro',
    lastSeen: 'Copacabana, Rio de Janeiro',
    dtLastSeen: '2024-08-18T09:00:00.000Z',
    originCity: 'Niterói',
    originState: 'RJ',
    originCountry: 'Brasil',
    originNeighborhood: 'Icaraí',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brasil',
    neighborhood: 'Copacabana',
    photoUri: 'https://picsum.photos/seed/encontrame-p5/200/200',
    coords: { latitude: -22.971, longitude: -43.182 },
    restricted: false,
    statusId: 2,
    statusDescription: 'Procurado',
  },
  // Faixas de idade variadas para testar os filtros do mapa (Crianças, Adultos, Idosos).
  {
    id: 'p6',
    fullName: 'Ana Clara Mendes',
    nickname: 'Aninha',
    age: 8,
    location: 'Praça da Liberdade, Belo Horizonte',
    lastSeen: 'Praça da Liberdade, Belo Horizonte',
    dtLastSeen: '2024-09-02T16:30:00.000Z',
    originCity: 'Belo Horizonte',
    originState: 'MG',
    originCountry: 'Brasil',
    originNeighborhood: 'Funcionários',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    neighborhood: 'Funcionários',
    coords: { latitude: -19.932, longitude: -43.938 },
    restricted: false,
    statusId: 4,
    statusDescription: 'Alerta',
  },
  {
    id: 'p7',
    fullName: 'Larissa Gomes',
    nickname: 'Lari',
    age: 16,
    location: 'Centro, Contagem',
    lastSeen: 'Centro, Contagem',
    dtLastSeen: '2024-09-10T19:00:00.000Z',
    originCity: 'Contagem',
    originState: 'MG',
    originCountry: 'Brasil',
    originNeighborhood: 'Eldorado',
    city: 'Contagem',
    state: 'MG',
    country: 'Brasil',
    neighborhood: 'Centro',
    coords: { latitude: -19.913, longitude: -43.925 },
    restricted: false,
    statusId: 2,
    statusDescription: 'Procurado',
  },
  {
    id: 'p8',
    fullName: 'José Ribeiro',
    nickname: 'Seu José',
    age: 72,
    location: 'Centro, Betim',
    lastSeen: 'Centro, Betim',
    dtLastSeen: '2024-09-14T08:15:00.000Z',
    originCity: 'Betim',
    originState: 'MG',
    originCountry: 'Brasil',
    originNeighborhood: 'Centro',
    city: 'Betim',
    state: 'MG',
    country: 'Brasil',
    neighborhood: 'Centro',
    coords: { latitude: -19.927, longitude: -43.952 },
    restricted: false,
    statusId: 2,
    statusDescription: 'Procurado',
  },
];

let mockHistory: Record<string, PersonLastSeen[]> = {
  p1: [
    {
      id: 'p1-seen-1',
      location: 'Praça da Estação',
      city: 'Belo Horizonte',
      neighborhood: 'Centro',
      state: 'MG',
      latitude: -19.9167,
      longitude: -43.9345,
      dtRegistration: '2023-12-20T09:00:00.000Z',
    },
    {
      id: 'p1-seen-2',
      location: 'Mercado Central',
      city: 'Belo Horizonte',
      neighborhood: 'Centro',
      state: 'MG',
      latitude: -19.9198,
      longitude: -43.9402,
      dtRegistration: '2023-12-28T16:30:00.000Z',
    },
    {
      id: 'p1-seen-3',
      location: 'Savassi',
      city: 'Belo Horizonte',
      neighborhood: 'Savassi',
      state: 'MG',
      latitude: -19.918,
      longitude: -43.938,
      dtRegistration: '2024-01-01T12:00:00.000Z',
    },
  ],
  p2: [
    {
      id: 'p2-seen-1',
      location: 'Mineirão',
      city: 'Belo Horizonte',
      neighborhood: 'Pampulha',
      state: 'MG',
      latitude: -19.8653,
      longitude: -43.971,
      dtRegistration: '2024-02-18T11:00:00.000Z',
    },
    {
      id: 'p2-seen-2',
      location: 'Lagoa da Pampulha',
      city: 'Belo Horizonte',
      neighborhood: 'Pampulha',
      state: 'MG',
      latitude: -19.852,
      longitude: -43.978,
      dtRegistration: '2024-03-01T14:20:00.000Z',
    },
    {
      id: 'p2-seen-3',
      location: 'Pampulha, Belo Horizonte',
      city: 'Belo Horizonte',
      neighborhood: 'Pampulha',
      state: 'MG',
      latitude: -19.924,
      longitude: -43.945,
      dtRegistration: '2024-03-12T15:00:00.000Z',
    },
  ],
  p4: [
    {
      id: 'p4-seen-1',
      location: 'Rodoviária',
      city: 'Belo Horizonte',
      neighborhood: 'Centro',
      state: 'MG',
      latitude: -19.9162,
      longitude: -43.946,
      dtRegistration: '2024-06-20T08:15:00.000Z',
    },
    {
      id: 'p4-seen-2',
      location: 'Centro, Belo Horizonte',
      city: 'Belo Horizonte',
      neighborhood: 'Centro',
      state: 'MG',
      latitude: -19.912,
      longitude: -43.928,
      dtRegistration: '2024-07-02T18:00:00.000Z',
    },
  ],
  p5: [
    {
      id: 'p5-seen-1',
      location: 'Icaraí',
      city: 'Niterói',
      neighborhood: 'Icaraí',
      state: 'RJ',
      latitude: -22.904,
      longitude: -43.103,
      dtRegistration: '2024-07-30T10:00:00.000Z',
    },
    {
      id: 'p5-seen-2',
      location: 'Botafogo',
      city: 'Rio de Janeiro',
      neighborhood: 'Botafogo',
      state: 'RJ',
      latitude: -22.951,
      longitude: -43.182,
      dtRegistration: '2024-08-10T13:40:00.000Z',
    },
    {
      id: 'p5-seen-3',
      location: 'Copacabana, Rio de Janeiro',
      city: 'Rio de Janeiro',
      neighborhood: 'Copacabana',
      state: 'RJ',
      latitude: -22.971,
      longitude: -43.182,
      dtRegistration: '2024-08-18T09:00:00.000Z',
    },
  ],
};

function historyFromPerson(person: Person): PersonLastSeen[] {
  if (person.coords == null) {
    return [];
  }

  return [
    {
      id: `${person.id}-seen-latest`,
      location: person.lastSeen ?? person.location,
      city: person.city,
      neighborhood: person.neighborhood,
      state: person.state,
      latitude: person.coords.latitude,
      longitude: person.coords.longitude,
      dtRegistration: person.dtLastSeen ?? new Date().toISOString(),
    },
  ];
}

/** Implementação mockada: permite desenvolver sem depender da API. */
export const peopleMockRepository: PeopleRepository = {
  async search(params: PeopleSearchParams) {
    await delay(400);
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(params.pageSize, 50) : 12;
    const filtered = filterPeople(visiblePeople(), params);
    const totalCount = filtered.length;
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      page,
      pageSize,
      totalCount,
      totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize),
    };
  },

  async listNearby({ query, latitude, longitude, radiusKm }: NearbyPeopleParams) {
    await delay(500);
    const radius = radiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
    const nearby = visiblePeople().filter((person) => {
      if (!person.coords) {
        return true;
      }
      return haversineKm(latitude, longitude, person.coords.latitude, person.coords.longitude) <= radius;
    });

    const needle = query?.trim().toLowerCase();
    if (!needle) {
      return nearby;
    }

    return nearby.filter((person) => {
      const haystack = [person.fullName, person.nickname, person.location, person.lastSeen]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  },

  async getById(id: string) {
    await delay(300);
    const person = visiblePeople().find((item) => item.id === id);
    if (!person) {
      throw new Error('Pessoa não encontrada.');
    }
    return person;
  },

  async create(payload: CreatePersonPayload) {
    await delay(600);
    const person = {
      id: `mock-${Date.now()}`,
      fullName: payload.fullName || 'Pessoa cadastrada',
      nickname: payload.nickname,
      age: payload.age ? Number.parseInt(payload.age, 10) || undefined : undefined,
      heightCm: payload.heightCm,
      ethnicity: payload.ethnicity,
      build: payload.build,
      clothes: payload.clothes,
      hair: payload.hair,
      eyes: payload.eyes,
      tattoo: payload.tattoo,
      accessories: payload.accessories,
      location: payload.location,
      dtLastSeen: payload.lastSeen ? (dateToIso(payload.lastSeen) ?? undefined) : undefined,
      originCity: payload.originCity || undefined,
      originState: payload.originState || undefined,
      originCountry: payload.originCountry || undefined,
      originNeighborhood: payload.originNeighborhood || undefined,
      city: payload.location || undefined,
      phone: payload.phone,
      photoUri: payload.photoUri,
      statusId: 1,
      statusDescription: 'Pendente',
    } satisfies Person;
    mockPeople = [person, ...mockPeople];
    mockHistory[person.id] = historyFromPerson(person);
    return person;
  },

  async reportLastSeen(id: string, payload: ReportLastSeenPayload) {
    await delay(400);
    const dtRegistration = new Date().toISOString();
    mockPeople = mockPeople.map((person) =>
      person.id === id
        ? {
            ...person,
            lastSeen: payload.location,
            location: payload.location,
            city: payload.city,
            neighborhood: payload.neighborhood,
            coords: { latitude: payload.latitude, longitude: payload.longitude },
            dtLastSeen: dtRegistration,
          }
        : person,
    );
    const current = mockHistory[id] ?? [];
    mockHistory = {
      ...mockHistory,
      [id]: [
        ...current,
        {
          id: `${id}-seen-${Date.now()}`,
          location: payload.location,
          city: payload.city,
          neighborhood: payload.neighborhood,
          latitude: payload.latitude,
          longitude: payload.longitude,
          dtRegistration,
        },
      ],
    };
  },

  async listLastSeenHistory(id: string) {
    await delay(250);
    const person = mockPeople.find((item) => item.id === id);
    if (!person) {
      throw new Error('Pessoa não encontrada.');
    }
    return mockHistory[id] ?? historyFromPerson(person);
  },

  async getFollowStatus(id: string) {
    await delay(200);
    return mockFollowing.has(id);
  },

  async follow(id: string) {
    await delay(300);
    mockFollowing.add(id);
  },

  async unfollow(id: string) {
    await delay(300);
    mockFollowing.delete(id);
  },
};

function filterPeople(people: Person[], params: PeopleSearchParams): Person[] {
  const needle = params.query?.trim().toLowerCase();
  const city = params.city?.trim().toLowerCase();
  const state = params.state?.trim().toLowerCase();
  const country = params.country?.trim().toLowerCase();
  const neighborhood = params.neighborhood?.trim().toLowerCase();
  const useOrigin = params.addressScope === 'origin';

  return people.filter((person) => {
    if (needle) {
      const haystack = [person.fullName, person.nickname].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (params.statusId != null && person.statusId !== params.statusId) return false;
    if (params.ageMin != null && (person.age == null || person.age < params.ageMin)) return false;
    if (params.ageMax != null && (person.age == null || person.age > params.ageMax)) return false;
    if (city && !includesField(useOrigin ? person.originCity : person.city, city)) return false;
    if (state && !includesField(useOrigin ? person.originState : person.state, state)) return false;
    if (country && !includesField(useOrigin ? person.originCountry : person.country, country)) return false;
    if (neighborhood && !includesField(useOrigin ? person.originNeighborhood : person.neighborhood, neighborhood)) {
      return false;
    }
    return true;
  });
}

function includesField(value: string | undefined, needle: string) {
  return Boolean(value?.toLowerCase().includes(needle));
}

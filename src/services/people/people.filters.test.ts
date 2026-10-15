import { filterLocalNearby, filterLocalSearch } from '@/services/people/people.filters';
import type { Person } from '@/services/people/people.types';

function person(overrides: Partial<Person> & Pick<Person, 'id'>): Person {
  return { fullName: overrides.id, ...overrides };
}

const origin = { latitude: -19.92, longitude: -43.94 };

describe('filtros locais de pessoas', () => {
  it('mantém quem está no raio ou sem coordenada e aplica a busca', () => {
    const near = person({ id: 'near', coords: origin, fullName: 'Ana' });
    const far = person({
      id: 'far',
      coords: { latitude: 0, longitude: 0 },
      fullName: 'Bruno',
    });
    const noCoords = person({ id: 'none', fullName: 'Carla' });
    const result = filterLocalNearby([near, far, noCoords], { ...origin, radiusKm: 50, query: 'a' });
    expect(result.map((item) => item.id)).toEqual(['near', 'none']);
  });

  it('filtra status, idade e endereço de origem ou do último avistamento', () => {
    const people = [
      person({ id: '1', fullName: 'Ana', age: 10, statusId: 2, city: 'Belo Horizonte', originCity: 'Ouro Preto' }),
      person({ id: '2', fullName: 'Bruno', age: 40, statusId: 3, city: 'São Paulo' }),
    ];
    expect(filterLocalSearch(people, { statusId: 2, ageMin: 0, ageMax: 18 }).map((item) => item.id)).toEqual(['1']);
    expect(filterLocalSearch(people, { city: 'ouro', addressScope: 'origin' }).map((item) => item.id)).toEqual(['1']);
    expect(filterLocalSearch(people, { city: 'ouro' })).toEqual([]);
    expect(filterLocalSearch(people, { query: 'bruno' }).map((item) => item.id)).toEqual(['2']);
    expect(filterLocalSearch(people, { ageMin: 50 })).toEqual([]);
  });
});

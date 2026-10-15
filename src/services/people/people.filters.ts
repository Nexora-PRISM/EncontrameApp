import { DEFAULT_NEARBY_RADIUS_KM, haversineKm } from '@/lib/geo';
import type { NearbyPeopleParams, PeopleSearchParams, Person } from '@/services/people/people.types';

/** Casos locais dentro do raio (sem coordenada entram) e do texto de busca. */
export function filterLocalNearby(people: Person[], params: NearbyPeopleParams): Person[] {
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

/** Filtros da listagem (status, idade, endereço de origem ou do último avistamento). */
export function filterLocalSearch(people: Person[], params: PeopleSearchParams): Person[] {
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

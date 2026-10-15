import { buildCarouselPeople } from '@/features/inicio/carousel-people';
import type { Person } from '@/services/people/people.types';

function person(id: string, statusId?: number): Person {
  return { id, fullName: id, statusId };
}

describe('carrossel do início', () => {
  it('põe quem está perto na frente e não repete', () => {
    const result = buildCarouselPeople(
      [person('near')],
      [person('near'), person('recent')],
    );
    expect(result.map((item) => item.id)).toEqual(['near', 'recent']);
  });

  it('deixa encontrado e cancelado de fora dos casos recentes', () => {
    const result = buildCarouselPeople([], [person('ok', 2), person('found', 3), person('cancelled', 99)]);
    expect(result.map((item) => item.id)).toEqual(['ok']);
  });

  it('não corta quem está perto quando o máximo é menor que a lista', () => {
    const nearby = [person('a'), person('b'), person('c')];
    expect(buildCarouselPeople(nearby, [person('d')], 1)).toHaveLength(3);
  });
});

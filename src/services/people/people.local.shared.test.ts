import { mergeLocalPeople, parsePayload, toPerson } from '@/services/people/people.local.shared';
import type { CreatePersonPayload, Person } from '@/services/people/people.types';

function payload(overrides: Partial<CreatePersonPayload> = {}): CreatePersonPayload {
  return {
    fullName: 'Ana Silva',
    nickname: '',
    age: '30',
    heightCm: '',
    ethnicity: '',
    build: '',
    clothes: '',
    hair: '',
    eyes: '',
    tattoo: '',
    accessories: '',
    location: 'Centro',
    lastSeen: '01/01/2020',
    phone: '31999998888',
    ...overrides,
  };
}

function person(id: string): Person {
  return { id, fullName: id };
}

describe('cadastro local de pessoa', () => {
  it('coloca os casos locais na frente e não repete id que já veio da API', () => {
    const merged = mergeLocalPeople([person('local-1'), person('2')], [person('2'), person('3')]);
    expect(merged.map((item) => item.id)).toEqual(['local-1', '2', '3']);
  });

  it('descarta o JSON que não dá para ler', () => {
    expect(parsePayload('não é json')).toBeNull();
    expect(parsePayload(JSON.stringify(payload()))).toMatchObject({ fullName: 'Ana Silva' });
  });

  it('monta a pessoa pendente com status local e foto em data URL', () => {
    const created = toPerson('local-1', payload({ photo: 'QQ==', age: 'abc' }));
    expect(created.statusId).toBe(0);
    expect(created.statusDescription).toBe('Cadastro pendente');
    expect(created.age).toBeUndefined();
    expect(created.dtLastSeen).toBe('2020-01-01T12:00:00.000Z');
    expect(created.photoUri).toBe('data:image/jpeg;base64,QQ==');
    expect(toPerson('local-2', payload({ photo: 'data:image/png;base64,QQ==' })).photoUri).toBe(
      'data:image/png;base64,QQ==',
    );
  });
});

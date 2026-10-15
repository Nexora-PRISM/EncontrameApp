import { buildPersonShareMessage, formatCaseDate } from '@/features/pessoa-detalhe/person-share';
import type { Person } from '@/services/people/people.types';

function person(overrides: Partial<Person> = {}): Person {
  return { id: 'caso-1', fullName: 'Ana Silva', phone: '31999998888', ...overrides };
}

describe('divulgação de caso', () => {
  it('formata a data em UTC', () => {
    expect(formatCaseDate('2026-06-15T12:00:00.000Z')).toBe('15/06/2026');
    expect(formatCaseDate('não-é-data')).toBeUndefined();
    expect(formatCaseDate(undefined)).toBeUndefined();
  });

  it('monta o texto com o que a página mostra, sem telefone', () => {
    const message = buildPersonShareMessage(
      person({
        age: 12,
        nickname: 'Aninha',
        lastSeen: 'Praça',
        dtLastSeen: '2026-06-15T12:00:00.000Z',
        heightCm: '140',
        hair: 'cacheado',
        clothes: 'camisa azul',
      }),
      'https://encontrame.example',
    );
    expect(message).toContain('Ana Silva, 12 anos');
    expect(message).toContain('Aninha');
    expect(message).toContain('Praça');
    expect(message).toContain('15/06/2026');
    expect(message).toContain('140 cm');
    expect(message).toContain('https://encontrame.example/pessoa/caso-1');
    expect(message).not.toContain('31999998888');
  });

  it('omite idade, lugar e link quando esses dados não existem', () => {
    const message = buildPersonShareMessage(person({ phone: undefined }));
    expect(message).toContain('PESSOA DESAPARECIDA: Ana Silva');
    expect(message).not.toContain('anos');
    expect(message).not.toContain('Veja o caso');
  });
});

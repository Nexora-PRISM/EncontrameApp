import { HELP_ARTICLES, normalizeSearch, searchHelp } from '@/features/ajuda/help-content';

describe('busca da Central de Ajuda', () => {
  it('ignora acento e maiúsculas', () => {
    expect(normalizeSearch('  Criança  ')).toBe('crianca');
  });

  it('devolve tudo com a busca vazia e filtra pelo texto', () => {
    expect(searchHelp('   ')).toHaveLength(HELP_ARTICLES.length);
    expect(searchHelp('premium').length).toBeGreaterThan(0);
    expect(searchHelp('zzzz-nada-a-ver')).toEqual([]);
  });

  it('encontra também o texto traduzido', () => {
    const found = searchHelp('disappearance', (text) => (text.includes('desaparecid') ? 'disappearance' : text));
    expect(found.length).toBeGreaterThan(0);
  });
});

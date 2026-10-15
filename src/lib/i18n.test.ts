import {
  interpolate,
  languageFromLocale,
  parseLanguagePreference,
  resolveLanguage,
  translate,
} from '@/lib/i18n';

describe('idioma', () => {
  it('troca as variáveis e deixa o que não foi informado', () => {
    expect(interpolate('Olá {name}', { name: 'Ana' })).toBe('Olá Ana');
    expect(interpolate('Olá {name}', {})).toBe('Olá {name}');
    expect(interpolate('Olá')).toBe('Olá');
  });

  it('traduz para o idioma pedido e cai no português quando a frase não existe', () => {
    expect(translate('en', 'Pedir ajuda')).toBe('Get help');
    expect(translate('pt-BR', 'Pedir ajuda')).toBe('Pedir ajuda');
    expect(translate('en', 'frase que não está no dicionário')).toBe('frase que não está no dicionário');
    expect(translate('es', 'Olá {name}', { name: 'Ana' })).toContain('Ana');
  });

  it('escolhe o idioma pelo código do aparelho', () => {
    expect(languageFromLocale('es-AR')).toBe('es');
    expect(languageFromLocale('pt-BR')).toBe('pt-BR');
    expect(languageFromLocale('fr-FR')).toBe('en');
    expect(languageFromLocale(null)).toBe('pt-BR');
  });

  it('respeita a preferência salva e descarta valor desconhecido', () => {
    expect(resolveLanguage('system', 'es')).toBe('es');
    expect(resolveLanguage('en', 'es')).toBe('en');
    expect(parseLanguagePreference('es')).toBe('es');
    expect(parseLanguagePreference('nope')).toBe('pt-BR');
    expect(parseLanguagePreference(null)).toBe('pt-BR');
  });
});

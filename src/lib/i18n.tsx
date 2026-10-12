import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { msg } from '@/lib/i18n-msg';
import { getLocalItem, setLocalItem } from '@/lib/local-store';
import { en } from '@/translations/en';
import { es } from '@/translations/es';

/**
 * Idiomas do app. O texto-fonte é o português (pt-BR): cada tradução é indexada pela própria
 * frase em português, e o que não estiver traduzido aparece em português.
 *
 * Uso:
 * - Durante a renderização (componentes e hooks): `const t = useT();` → `t('Pedir ajuda')`.
 * - Fora do React, em ações (alertas, mensagens montadas ao tocar): `tr('...')`.
 * - Variáveis: `t('Adicione até {max} pessoas.', { max: 5 })`.
 * - Listas e constantes fora dos componentes: marque com `msg('...')` e traduza ao mostrar
 *   (`t(opcao.label)`). Valores enviados à API continuam em português.
 * - Nome, slogan e assinatura da marca não são traduzidos (AppInfo).
 *
 * O padrão é português; "Automático" segue o idioma do celular (outros idiomas → inglês).
 *
 * Para incluir um idioma: crie `src/translations/<código>.ts`, registre em DICTIONARIES e
 * LANGUAGE_OPTIONS e rode `node scripts/check-i18n.js`.
 */
export type Language = 'pt-BR' | 'en' | 'es';
export type LanguagePreference = 'system' | Language;
export type TranslateVars = Record<string, string | number>;
export type Translate = (text: string, vars?: TranslateVars) => string;

const DICTIONARIES: Record<Exclude<Language, 'pt-BR'>, Readonly<Record<string, string>>> = {
  en,
  es,
};

/** Nome de cada idioma no próprio idioma (não é traduzido). */
export const LANGUAGE_NAMES: Record<Language, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
};

/** Opções do seletor, na ordem em que aparecem. "Automático" é traduzido; os idiomas, não. */
export const LANGUAGE_OPTIONS: { value: LanguagePreference; label: string; short: string }[] = [
  { value: 'pt-BR', label: LANGUAGE_NAMES['pt-BR'], short: 'PT' },
  { value: 'en', label: LANGUAGE_NAMES.en, short: 'EN' },
  { value: 'es', label: LANGUAGE_NAMES.es, short: 'ES' },
  { value: 'system', label: msg('Automático'), short: 'Auto' },
];

/** Versão curta (PT · EN · ES · Auto) para espaços pequenos; o nome completo vai para o leitor de tela. */
export const LANGUAGE_SHORT_OPTIONS = LANGUAGE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.short,
  accessibilityLabel: option.label,
}));

const STORAGE_KEY = 'encontrame.language';
const PREFERENCES: readonly LanguagePreference[] = ['pt-BR', 'en', 'es', 'system'];
/** Sem escolha salva, o app fica em português (o idioma do Encontra-me). */
const DEFAULT_PREFERENCE: LanguagePreference = 'pt-BR';

/** Troca `{nome}` pelos valores informados (o que não existir fica como está). */
export function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

/** "Tradutor" que só preenche as variáveis (português, o idioma-fonte). Padrão dos montadores de texto. */
export const ptTranslate: Translate = (text, vars) => interpolate(text, vars);

export function translate(language: Language, text: string, vars?: TranslateVars): string {
  const dictionary = language === 'pt-BR' ? null : DICTIONARIES[language];
  const value = dictionary?.[text] || text;
  return interpolate(value, vars);
}

/** Idioma de um código de localidade (ex.: "es-AR" → es). Outros idiomas → inglês. */
export function languageFromLocale(locale: string | null | undefined): Language {
  const code = (locale ?? '').toLowerCase();
  if (!code || code.startsWith('pt')) return 'pt-BR';
  if (code.startsWith('es')) return 'es';
  return 'en';
}

/** Idioma do aparelho (ou do navegador). Sem informação, português. */
export function detectDeviceLanguage(): Language {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.language) {
      return languageFromLocale(navigator.language);
    }
    return languageFromLocale(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return 'pt-BR';
  }
}

export function resolveLanguage(preference: LanguagePreference, device: Language): Language {
  return preference === 'system' ? device : preference;
}

export function parseLanguagePreference(raw: string | null): LanguagePreference {
  return PREFERENCES.includes(raw as LanguagePreference)
    ? (raw as LanguagePreference)
    : DEFAULT_PREFERENCE;
}

export { msg };

/** Idioma em uso, para textos montados fora da renderização (`tr`). */
let activeLanguage: Language = 'pt-BR';

/** Tradução para textos montados em ações (ao tocar, em alertas). Na tela, use `useT()`. */
export function tr(text: string, vars?: TranslateVars): string {
  return translate(activeLanguage, text, vars);
}

export function getActiveLanguage(): Language {
  return activeLanguage;
}

type I18nValue = {
  language: Language;
  /** Idioma do celular (ou do navegador), usado no "Automático". */
  deviceLanguage: Language;
  preference: LanguagePreference;
  setPreference: (next: LanguagePreference) => void;
  t: Translate;
  /** A preferência salva já foi lida (evita piscar no idioma errado). */
  ready: boolean;
};

const I18nContext = createContext<I18nValue>({
  language: 'pt-BR',
  deviceLanguage: 'pt-BR',
  preference: DEFAULT_PREFERENCE,
  setPreference: () => {},
  t: (text, vars) => interpolate(text, vars),
  ready: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [deviceLanguage] = useState(detectDeviceLanguage);
  const [preference, setPreferenceState] = useState<LanguagePreference>(DEFAULT_PREFERENCE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getLocalItem(STORAGE_KEY)
      .then((raw) => {
        if (!cancelled) setPreferenceState(parseLanguagePreference(raw));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const language = resolveLanguage(preference, deviceLanguage);

  useEffect(() => {
    activeLanguage = language;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // O navegador traduz corretamente para outros idiomas quando sabe o idioma da página.
      document.documentElement.lang = language;
    }
  }, [language]);

  const setPreference = useCallback(
    (next: LanguagePreference) => {
      activeLanguage = resolveLanguage(next, deviceLanguage);
      setPreferenceState(next);
      void setLocalItem(STORAGE_KEY, next).catch(() => undefined);
    },
    [deviceLanguage],
  );

  const t = useCallback<Translate>((text, vars) => translate(language, text, vars), [language]);

  const value = useMemo(
    () => ({ language, deviceLanguage, preference, setPreference, t, ready }),
    [language, deviceLanguage, preference, setPreference, t, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Função de tradução do idioma atual — a tela é redesenhada quando o idioma muda. */
export function useT(): Translate {
  return useContext(I18nContext).t;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

import { AppInfo } from '@/lib/app-info';
import { type Translate, ptTranslate } from '@/lib/i18n';
import type { Person } from '@/services/people/people.types';

/** dd/mm/aaaa a partir de uma data ISO (lida em UTC para não trocar o dia). */
export function formatCaseDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

/**
 * Texto pronto para divulgar um caso publicado (WhatsApp, redes sociais…). Só usa o que já
 * aparece na página do caso — sem telefone, endereço ou documentos. Com `webUrl`
 * (EXPO_PUBLIC_WEB_URL), inclui o link da página do caso. Sai no idioma do app (`t`).
 */
export function buildPersonShareMessage(
  person: Person,
  webUrl = '',
  t: Translate = ptTranslate,
): string {
  const date = formatCaseDate(person.dtLastSeen);
  const place = (person.lastSeen || person.location || '').trim();
  const traits = [
    person.heightCm ? `${person.heightCm} cm` : undefined,
    person.hair,
    person.eyes,
    person.clothes ? t('roupas: {clothes}', { clothes: person.clothes }) : undefined,
  ].filter((part): part is string => Boolean(part?.trim()));

  const lines = [
    person.age != null
      ? t('PESSOA DESAPARECIDA: {name}, {age} anos', { name: person.fullName, age: person.age })
      : t('PESSOA DESAPARECIDA: {name}', { name: person.fullName }),
    person.nickname ? t('Conhecida como {nickname}.', { nickname: person.nickname }) : undefined,
    place
      ? date
        ? t('Vista pela última vez em {place}, em {date}.', { place, date })
        : t('Vista pela última vez em {place}.', { place })
      : date
        ? t('Vista pela última vez em {date}.', { date })
        : undefined,
    traits.length > 0 ? t('Características: {traits}.', { traits: traits.join('; ') }) : undefined,
    t('Se você viu esta pessoa, ligue 190 ou informe pelo app {app}.', { app: AppInfo.name }),
    webUrl
      ? t('Veja o caso: {url}', { url: `${webUrl}/pessoa/${encodeURIComponent(person.id)}` })
      : undefined,
    t('Divulgado pelo {app} — {slogan}.', { app: AppInfo.name, slogan: AppInfo.slogan }),
  ];
  return lines.filter((line): line is string => Boolean(line?.trim())).join('\n');
}

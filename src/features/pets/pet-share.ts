import { AppInfo } from '@/lib/app-info';
import { type Translate, ptTranslate } from '@/lib/i18n';
import { maskPhone } from '@/lib/masks';
import type { Pet } from '@/services/pets/pets.types';

/** dd/mm/aaaa a partir de uma data ISO (lida em UTC para não trocar o dia). */
export function formatPetDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

/** "Bairro, Cidade" (sem endereço completo). */
export function petPlace(pet: Pet): string {
  return [pet.neighborhood, pet.city].filter((part) => Boolean(part?.trim())).join(', ');
}

/** Linha curta de descrição: espécie · raça · cor · porte. Espécie e porte vêm traduzidos. */
export function petDescription(pet: Pet, t: Translate = ptTranslate): string {
  return [
    pet.species ? t(pet.species) : undefined,
    pet.breed,
    pet.color,
    pet.size ? t('porte {size}', { size: t(pet.size).toLowerCase() }) : undefined,
  ]
    .filter((part) => Boolean(part?.trim()))
    .join(' · ');
}

/** Texto pronto para divulgar o pet em outros apps (no idioma do app; o slogan fica em português). */
export function buildPetShareMessage(pet: Pet, t: Translate = ptTranslate): string {
  const date = formatPetDate(pet.dtLastSeen);
  const place = petPlace(pet);
  const lines = [
    t('PET DESAPARECIDO: {name}', { name: pet.name }),
    petDescription(pet, t),
    place
      ? date
        ? t('Visto pela última vez em {place}, em {date}.', { place, date })
        : t('Visto pela última vez em {place}.', { place })
      : undefined,
    pet.marks ? t('Sinais: {marks}', { marks: pet.marks }) : undefined,
    pet.contactPhone
      ? t('Se você vir, avise o tutor: {phone}', { phone: maskPhone(pet.contactPhone) })
      : t('Se você vir, avise pelo app {app}.', { app: AppInfo.name }),
    t('Divulgado pelo {app} — {slogan}.', { app: AppInfo.name, slogan: AppInfo.slogan }),
  ];
  return lines.filter((line): line is string => Boolean(line?.trim())).join('\n');
}

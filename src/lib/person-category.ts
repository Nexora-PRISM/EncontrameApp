import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { BrandColors } from '@/constants/brand';
import { msg } from '@/lib/i18n-msg';
import type { Person } from '@/services/people/people.types';

/**
 * Faixas de idade usadas nos filtros do mapa e nos cartões do Início.
 * Só a idade é usada porque é o que a API devolve hoje. Um filtro "Mulheres" depende de a API
 * passar a informar o sexo da pessoa — até lá ele não aparece (nada de filtro que não filtra).
 */
export type PersonCategory = 'child' | 'adult' | 'elder';
export type CategoryFilter = 'all' | PersonCategory;

/** Até 17 anos: criança ou adolescente. A partir de 60: pessoa idosa (Estatuto da Pessoa Idosa). */
const ADULT_FROM = 18;
const ELDER_FROM = 60;
const TEEN_FROM = 12;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const CATEGORY_FILTERS: {
  value: CategoryFilter;
  /** Rótulo curto do botão (cabe na largura do celular). */
  label: string;
  /** Nome completo para o leitor de tela. */
  accessibilityLabel: string;
  icon: IconName;
}[] = [
  { value: 'all', label: msg('Todos'), accessibilityLabel: msg('Todos'), icon: 'account-group' },
  {
    value: 'child',
    label: msg('Crianças'),
    accessibilityLabel: msg('Crianças e adolescentes'),
    icon: 'human-child',
  },
  { value: 'adult', label: msg('Adultos'), accessibilityLabel: msg('Adultos'), icon: 'account' },
  { value: 'elder', label: msg('Idosos'), accessibilityLabel: msg('Idosos'), icon: 'human-cane' },
];

export function personCategory(person: Pick<Person, 'age'>): PersonCategory | null {
  const age = person.age;
  if (age == null || !Number.isFinite(age) || age < 0) return null;
  if (age < ADULT_FROM) return 'child';
  if (age >= ELDER_FROM) return 'elder';
  return 'adult';
}

export function matchesCategory(person: Pick<Person, 'age'>, filter: CategoryFilter): boolean {
  if (filter === 'all') return true;
  return personCategory(person) === filter;
}

/** Faixa etária enviada à busca paginada (o mesmo corte de `personCategory`). */
export function categoryAgeRange(filter: CategoryFilter): { ageMin?: number; ageMax?: number } {
  if (filter === 'child') return { ageMax: ADULT_FROM - 1 };
  if (filter === 'adult') return { ageMin: ADULT_FROM, ageMax: ELDER_FROM - 1 };
  if (filter === 'elder') return { ageMin: ELDER_FROM };
  return {};
}

/** Rótulo curto do cartão (singular), para quem lê rápido. */
export function personCategoryLabel(person: Pick<Person, 'age'>): string | null {
  const category = personCategory(person);
  if (category == null) return null;
  if (category === 'child') {
    return (person.age ?? 0) >= TEEN_FROM ? msg('Adolescente') : msg('Criança');
  }
  return category === 'elder' ? msg('Pessoa idosa') : msg('Adulto');
}

export function categoryIcon(category: PersonCategory | null): IconName {
  if (category === 'child') return 'human-child';
  if (category === 'elder') return 'human-cane';
  return 'account';
}

export function categoryColor(brand: BrandColors, filter: CategoryFilter | null): string {
  switch (filter) {
    case 'child':
      return brand.categoryChild;
    case 'adult':
      return brand.categoryAdult;
    case 'elder':
      return brand.categoryElder;
    case 'all':
      return brand.categoryAll;
    default:
      return brand.textMuted;
  }
}

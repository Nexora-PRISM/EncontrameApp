import { useSyncExternalStore } from 'react';

import type { CategoryFilter } from '@/lib/person-category';

/**
 * Busca, filtro de idade e menu do Início. Na web o header e a lista lateral ficam fixos no
 * layout raiz, fora da tela do Início, e precisam enxergar o mesmo estado que o mapa.
 * Fica só em memória.
 */
export type HomeSharedState = {
  /** Texto digitado no campo de busca. */
  search: string;
  /** Busca enviada (Enter ou lupa): é o que filtra as pessoas. */
  query: string;
  categoryFilter: CategoryFilter;
  menuOpen: boolean;
  /** Passo a passo: o menu da web pede de qualquer página e o Início mostra. */
  onboardingVisible: boolean;
  onboardingStep: number;
};

let state: HomeSharedState = {
  search: '',
  query: '',
  categoryFilter: 'all',
  menuOpen: false,
  onboardingVisible: false,
  onboardingStep: 0,
};
const listeners = new Set<() => void>();

export function updateHomeState(patch: Partial<HomeSharedState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): HomeSharedState {
  return state;
}

export function useHomeSharedState(): HomeSharedState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

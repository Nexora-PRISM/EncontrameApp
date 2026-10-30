import * as Location from 'expo-location';
import { useSyncExternalStore } from 'react';

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type UserLocationState = {
  location: UserLocation | null;
  denied: boolean;
};

/**
 * Uma só leitura de GPS para o app inteiro: na web o header fixo e a tela aberta usam a mesma
 * posição (com duas, a lista lateral e o mapa buscavam pessoas em pontos um pouco diferentes).
 * O acompanhamento começa com o primeiro componente que usa e para quando o último sai.
 */
let state: UserLocationState = { location: null, denied: false };
const listeners = new Set<() => void>();
let stopWatching: (() => void) | null = null;

function emit(next: UserLocationState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function startWatching(): () => void {
  let cancelled = false;
  let subscription: Location.LocationSubscription | null = null;

  const applyPosition = (coords: Location.LocationObjectCoords) => {
    if (cancelled) {
      return;
    }

    emit({
      location: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      },
      denied: false,
    });
  };

  void (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (cancelled) {
      return;
    }
    if (status !== 'granted') {
      emit({ location: null, denied: true });
      return;
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    applyPosition(current.coords);

    const watcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 8,
        timeInterval: 4000,
      },
      (update) => applyPosition(update.coords),
    );
    if (cancelled) {
      watcher.remove();
      return;
    }
    subscription = watcher;
  })();

  return () => {
    cancelled = true;
    subscription?.remove();
  };
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    stopWatching = startWatching();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopWatching?.();
      stopWatching = null;
    }
  };
}

function snapshot(): UserLocationState {
  return state;
}

/**
 * Pede permissão de localização (web e nativo) e acompanha a posição atual.
 */
export function useUserLocation(): UserLocationState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Raio do círculo de precisão, limitado para não cobrir a cidade inteira. */
export function userAccuracyRadius(accuracy: number | null): number {
  return Math.min(Math.max(accuracy ?? 35, 25), 180);
}

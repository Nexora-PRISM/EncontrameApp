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
  /**
   * Permissão dada, mas o GPS não respondeu (serviço de localização desligado, sem sinal ou erro
   * do aparelho/navegador). A última posição boa, se houver, continua em `location`.
   */
  unavailable: boolean;
};

/**
 * Uma só leitura de GPS para o app inteiro: na web o header fixo e a tela aberta usam a mesma
 * posição (com duas, a lista lateral e o mapa buscavam pessoas em pontos um pouco diferentes).
 * O acompanhamento começa com o primeiro componente que usa e para quando o último sai.
 */
let state: UserLocationState = { location: null, denied: false, unavailable: false };
const listeners = new Set<() => void>();
let stopWatching: (() => void) | null = null;

function emit(next: UserLocationState) {
  state = next;
  listeners.forEach((listener) => listener());
}

/** Leitura válida do GPS (alguns aparelhos devolvem 0,0 ou NaN logo que o sinal volta). */
function isUsable(coords: Location.LocationObjectCoords | undefined | null): coords is Location.LocationObjectCoords {
  if (!coords) return false;
  const { latitude, longitude } = coords;
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

function startWatching(): () => void {
  let cancelled = false;
  let subscription: Location.LocationSubscription | null = null;

  const applyPosition = (coords: Location.LocationObjectCoords) => {
    if (cancelled || !isUsable(coords)) {
      return;
    }

    emit({
      location: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      },
      denied: false,
      unavailable: false,
    });
  };

  /** Falha do GPS não derruba o app: mantém a última posição boa e marca como indisponível. */
  const markUnavailable = () => {
    if (!cancelled) emit({ location: state.location, denied: false, unavailable: true });
  };

  void (async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) {
        return;
      }
      if (status !== 'granted') {
        emit({ location: null, denied: true, unavailable: false });
        return;
      }

      // Primeiro a última posição conhecida (instantânea), para o mapa não esperar o GPS "esquentar".
      try {
        const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 });
        if (last && !state.location) applyPosition(last.coords);
      } catch {
        // Sem posição em cache: segue para a leitura atual.
      }

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        applyPosition(current.coords);
      } catch {
        // GPS desligado ou sem sinal: o acompanhamento abaixo tenta de novo sozinho.
        markUnavailable();
      }
      if (cancelled) {
        return;
      }

      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 8,
          timeInterval: 4000,
        },
        (update) => applyPosition(update.coords),
        () => markUnavailable(),
      );
      if (cancelled) {
        watcher.remove();
        return;
      }
      subscription = watcher;
    } catch {
      markUnavailable();
    }
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

/**
 * Tenta de novo depois de um "GPS indisponível" ou permissão negada (a pessoa ligou a localização
 * ou mudou a permissão nos ajustes). Só reinicia se alguém estiver usando a posição.
 */
export function retryUserLocation(): void {
  if (listeners.size === 0) return;
  stopWatching?.();
  emit({ location: state.location, denied: false, unavailable: false });
  stopWatching = startWatching();
}

/** Raio do círculo de precisão, limitado para não cobrir a cidade inteira. */
export function userAccuracyRadius(accuracy: number | null): number {
  return Math.min(Math.max(accuracy ?? 35, 25), 180);
}

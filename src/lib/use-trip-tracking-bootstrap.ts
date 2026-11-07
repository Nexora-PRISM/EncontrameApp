import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { env } from '@/lib/env';
import { type ActiveTripRef, TRIP_POLL_MS } from '@/lib/trip-rules';
import {
  flushTripPoints,
  getActiveTrip,
  getTrackingMode,
  recordLocations,
  subscribeTripTracking,
} from '@/lib/trip-tracking';

/**
 * No `_layout`: enquanto há um trajeto compartilhado ativo iniciado neste aparelho, envia a posição com o app
 * aberto (em qualquer tela) e esvazia a fila de posições guardadas sem internet a cada 30 s. Com o envio em
 * segundo plano ligado, quem lê o GPS é a tarefa do sistema; aqui só a fila é esvaziada.
 */
export function useTripTrackingBootstrap(ready: boolean): void {
  const [active, setActive] = useState<ActiveTripRef | null>(null);
  /** Muda a cada início, permissão nova ou fim: recomeça a leitura do GPS. */
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!env.tripSharingEnabled) return;
    let cancelled = false;
    const load = () => {
      void getActiveTrip()
        .then((ref) => {
          if (cancelled) return;
          setActive(ref);
          setRevision((value) => value + 1);
        })
        .catch(() => undefined);
    };
    load();
    const unsubscribe = subscribeTripTracking(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const tripId = active?.tripId ?? null;

  useEffect(() => {
    if (!ready || !tripId) return;
    let cancelled = false;
    let watch: Location.LocationSubscription | null = null;

    const startWatch = async () => {
      if (watch || cancelled) return;
      if ((await getTrackingMode()) !== 'foreground' || cancelled) return;
      try {
        const subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 15 * 1000, distanceInterval: 25 },
          (location) => {
            void recordLocations([location]);
          },
        );
        if (cancelled || watch) subscription.remove();
        else watch = subscription;
      } catch {
        // Sem GPS agora: a tela do trajeto mostra que a posição não está sendo enviada.
      }
    };
    const stopWatch = () => {
      watch?.remove();
      watch = null;
    };

    void startWatch();
    void flushTripPoints();
    const timer = setInterval(() => {
      void flushTripPoints();
    }, TRIP_POLL_MS);
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void startWatch();
        void flushTripPoints();
      } else if (Platform.OS !== 'web') {
        // Com o app fechado, só a tarefa em segundo plano (quando permitida) continua.
        stopWatch();
      }
    });
    return () => {
      cancelled = true;
      stopWatch();
      clearInterval(timer);
      appState.remove();
    };
  }, [ready, tripId, revision]);
}

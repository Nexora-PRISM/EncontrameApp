import { requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { tr } from '@/lib/i18n';
import { getLocalItem, setLocalItem } from '@/lib/local-store';
import { ensureSessionHydrated } from '@/lib/session';
import {
  type ActiveTripRef,
  parseActiveTripRef,
  parsePointQueue,
  queuePoint,
  serializePointQueue,
} from '@/lib/trip-rules';
import { tripErrorCode } from '@/services/trips/trips.errors';
import { getTripsRepository } from '@/services/trips/trips.repository';

type TaskManagerModule = typeof import('expo-task-manager');

/**
 * Envio das posições do trajeto compartilhado.
 *
 * - Só existe enquanto há um trajeto ativo iniciado neste aparelho pela própria pessoa (`ACTIVE_KEY`).
 * - Em segundo plano: só em build feito com TRIP_BACKGROUND_LOCATION=true (app.config.js), com a permissão
 *   "o tempo todo" dada pela pessoa e o aviso fixo do Android ("Compartilhando seu trajeto") visível.
 * - Sem isso: posições só com o app aberto (`useTripTrackingBootstrap`), e a tela diz isso claramente.
 * - Sem internet: as posições ficam numa fila curta no aparelho e vão juntas quando a conexão volta.
 * - Encerrou, chegou ou o servidor recusou o trajeto: para na hora e apaga a fila.
 */
const TASK_NAME = 'encontrame-trip-location';
const ACTIVE_KEY = 'encontrame.trip.active';
const QUEUE_KEY = 'encontrame.trip.queue';

export type TrackingMode = 'background' | 'foreground' | 'none';

let taskManager: TaskManagerModule | null | undefined;

/** Carrega o expo-task-manager só quando o módulo nativo existe (app antigo, Expo Go ou web não têm). */
function getTaskManager(): TaskManagerModule | null {
  if (taskManager !== undefined) return taskManager;
  if (Platform.OS === 'web' || !requireOptionalNativeModule('ExpoTaskManager')) {
    taskManager = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    taskManager = require('expo-task-manager') as TaskManagerModule;
  } catch {
    taskManager = null;
  }
  return taskManager;
}

/** Build com localização em segundo plano declarada (Android: serviço em primeiro plano; iOS: "Sempre"). */
export function backgroundTrackingSupported(): boolean {
  return getTaskManager() != null && Constants.expoConfig?.extra?.tripBackgroundLocation === true;
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

/** Avisa quando o trajeto ativo deste aparelho começa ou termina. */
export function subscribeTripTracking(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Uma gravação por vez: a tarefa em segundo plano e a tela aberta mexem na mesma fila.
let chain: Promise<unknown> = Promise.resolve();
function serialized<T>(work: () => Promise<T>): Promise<T> {
  const next = chain.then(work, work);
  chain = next.catch(() => undefined);
  return next;
}

export async function getActiveTrip(): Promise<ActiveTripRef | null> {
  return parseActiveTripRef(await getLocalItem(ACTIVE_KEY), new Date());
}

async function clearLocalTrip(): Promise<void> {
  await setLocalItem(ACTIVE_KEY, '');
  await setLocalItem(QUEUE_KEY, '');
  await stopBackgroundUpdates();
  emit();
}

async function isBackgroundRunning(): Promise<boolean> {
  if (!getTaskManager()) return false;
  try {
    return await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
  } catch {
    return false;
  }
}

async function stopBackgroundUpdates(): Promise<void> {
  if (!(await isBackgroundRunning())) return;
  try {
    await Location.stopLocationUpdatesAsync(TASK_NAME);
  } catch {
    // Já parado.
  }
}

/** Guarda as posições na fila (descarta as imprecisas). Sem trajeto ativo, para tudo. */
export function recordLocations(locations: Location.LocationObject[]): Promise<void> {
  return serialized(async () => {
    if (!(await getActiveTrip())) {
      await stopBackgroundUpdates();
      return;
    }
    let queue = parsePointQueue(await getLocalItem(QUEUE_KEY));
    for (const location of locations) {
      queue = queuePoint(queue, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracyMeters: location.coords.accuracy ?? null,
        recordedAt: new Date(location.timestamp).toISOString(),
      });
    }
    await setLocalItem(QUEUE_KEY, serializePointQueue(queue));
  });
}

export type FlushResult = 'sent' | 'empty' | 'queued' | 'ended';

/** Manda a fila ao servidor. Falhou por rede: continua na fila. Trajeto encerrado no servidor: para aqui também. */
export function flushTripPoints(): Promise<FlushResult> {
  return serialized(async () => {
    const active = await getActiveTrip();
    if (!active) return 'ended';
    const queue = parsePointQueue(await getLocalItem(QUEUE_KEY));
    if (queue.length === 0) return 'empty';
    await ensureSessionHydrated();
    try {
      await getTripsRepository().addPoints(active.tripId, queue);
      await setLocalItem(QUEUE_KEY, '');
      return 'sent';
    } catch (error) {
      const code = tripErrorCode(error);
      if (code === 'not_found' || code === 'not_active' || code === 'forbidden') {
        await clearLocalTrip();
        return 'ended';
      }
      return 'queued';
    }
  });
}

async function startBackgroundUpdates(): Promise<boolean> {
  if (!backgroundTrackingSupported()) return false;
  try {
    const current = await Location.getBackgroundPermissionsAsync();
    const permission = current.granted ? current : await Location.requestBackgroundPermissionsAsync();
    if (!permission.granted) return false;
    if (await isBackgroundRunning()) return true;
    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30 * 1000,
      distanceInterval: 30,
      deferredUpdatesInterval: 60 * 1000,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      // Texto genérico: o aviso fixo do Android não mostra destino nem nomes.
      foregroundService: {
        notificationTitle: tr('Compartilhando seu trajeto'),
        notificationBody: tr('Os contatos que você escolheu veem sua localização até você encerrar.'),
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Começa a enviar as posições deste trajeto. Pede só a localização "com o app aberto"; o segundo plano é pedido
 * à parte (`enableBackgroundTracking`), depois de a tela explicar o motivo.
 */
export async function startTripTracking(ref: ActiveTripRef): Promise<TrackingMode> {
  await setLocalItem(ACTIVE_KEY, JSON.stringify(ref));
  await setLocalItem(QUEUE_KEY, '');
  emit();
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return 'none';
  } catch {
    return 'none';
  }
  return (await isBackgroundRunning()) ? 'background' : 'foreground';
}

/** Pede a localização "o tempo todo" e liga o envio com a tela desligada. */
export async function enableBackgroundTracking(): Promise<TrackingMode> {
  if (!(await getActiveTrip())) return 'none';
  const started = await startBackgroundUpdates();
  emit();
  return started ? 'background' : getTrackingMode();
}

/** Para de enviar e apaga a fila deste aparelho (chegou, encerrou, saiu da conta). */
export async function stopTripTracking(): Promise<void> {
  await serialized(clearLocalTrip);
}

export async function getTrackingMode(): Promise<TrackingMode> {
  if (!(await getActiveTrip())) return 'none';
  if (await isBackgroundRunning()) return 'background';
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    return permission.granted ? 'foreground' : 'none';
  } catch {
    return 'none';
  }
}

/** Tarefa do sistema: precisa ser definida ao carregar o app (inclusive quando o Android o acorda sem tela). */
function defineTripLocationTask(): void {
  const TaskManager = getTaskManager();
  if (!TaskManager) return;
  try {
    if (TaskManager.isTaskDefined(TASK_NAME)) return;
    TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
      if (error) return;
      const locations = (data as { locations?: Location.LocationObject[] } | null | undefined)?.locations ?? [];
      await recordLocations(locations);
      await flushTripPoints();
    });
  } catch {
    // Sem tarefa em segundo plano: o envio fica só com o app aberto.
  }
}

defineTripLocationTask();

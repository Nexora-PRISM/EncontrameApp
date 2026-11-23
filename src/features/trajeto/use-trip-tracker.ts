import { useCallback, useEffect, useRef, useState } from 'react';

import { chunkPoints, shouldSendPoint, type TimedPoint } from '@/lib/trip-rules';
import type { UserLocation } from '@/lib/use-user-location';
import { useAddTripPointsMutation } from '@/services/circle/circle.service';
import type { TripPoint } from '@/services/circle/circle.types';

const MAX_QUEUE = 500;

/**
 * Envia a posição do trajeto ativo enquanto a tela está aberta (sem rastreamento em segundo plano).
 * Sem internet, guarda os pontos e manda depois, em lotes.
 */
export function useTripTracker(tripId: string | null, location: UserLocation | null) {
  const addPoints = useAddTripPointsMutation();
  const lastSent = useRef<{ tripId: string; point: TimedPoint } | null>(null);
  const queue = useRef<TripPoint[]>([]);
  const sending = useRef(false);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [failing, setFailing] = useState(false);
  const { mutateAsync } = addPoints;

  const flush = useCallback(
    async (id: string) => {
      if (sending.current || queue.current.length === 0) return;
      sending.current = true;
      try {
        for (const chunk of chunkPoints(queue.current)) {
          await mutateAsync({ id, points: chunk });
          queue.current = queue.current.slice(chunk.length);
        }
        setFailing(false);
        setLastSentAt(Date.now());
      } catch {
        // Fica na fila; vai junto no próximo ponto.
        setFailing(true);
      } finally {
        sending.current = false;
      }
    },
    [mutateAsync],
  );

  useEffect(() => {
    if (!tripId || !location) return;
    const point: TimedPoint = { latitude: location.latitude, longitude: location.longitude, at: Date.now() };
    if (lastSent.current && lastSent.current.tripId !== tripId) queue.current = [];
    const previous = lastSent.current?.tripId === tripId ? lastSent.current.point : null;
    if (!shouldSendPoint(previous, point)) return;
    lastSent.current = { tripId, point };
    queue.current = [
      ...queue.current,
      { latitude: point.latitude, longitude: point.longitude, recordedAt: new Date(point.at).toISOString() },
    ].slice(-MAX_QUEUE);
    void flush(tripId);
  }, [tripId, location, flush]);

  return { lastSentAt, failing };
}

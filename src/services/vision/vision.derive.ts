import {
  buildTrajectory,
  type Camera,
  camerasInRadius,
  nextCamerasToCheck,
  preservationIsOpen,
  preservationPriority,
  type RecordingInfo,
  recordingStatus,
  type Trajectory,
  type Urgency,
  urgencyFor,
} from '@/lib/vision-rules';
import type { OperationDetail, PreservationRequest, VisualMatch } from '@/services/vision/vision.types';

export type NearbyCamera = {
  camera: Camera;
  distanceKm: number;
  recording: RecordingInfo;
  /** Pedido de preservação mais recente desta câmera nesta operação. */
  request?: PreservationRequest;
};

export type RequestView = PreservationRequest & { urgency: Urgency; open: boolean };

/** Operação com tudo o que depende do relógio já calculado (feito ao buscar os dados, não na tela). */
export type OperationView = OperationDetail & {
  computedAt: number;
  nearby: NearbyCamera[];
  /** Câmeras participantes fora do raio atual (até 20 km), para saber se vale ampliar. */
  outsideRadius: number;
  requestViews: RequestView[];
  matchesByTime: VisualMatch[];
  trajectory: Trajectory;
  nextCameras: { camera: Camera; distanceKm: number; onTheWay: boolean }[];
};

const minutesOfDay = (ms: number) => {
  const date = new Date(ms);
  return date.getHours() * 60 + date.getMinutes();
};

export function deriveOperation(detail: OperationDetail, now: number): OperationView {
  const { operation } = detail;
  const center = { latitude: operation.latitude, longitude: operation.longitude };
  const seenAt = Date.parse(operation.lastSeenAt);
  const latestRequest = (cameraId: string) =>
    [...detail.requests]
      .filter((item) => item.cameraId === cameraId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];

  const inRadius = camerasInRadius(detail.cameras, center, operation.radiusKm);
  const nearby = preservationPriority(
    inRadius.map((item) => ({
      camera: item.camera,
      distanceKm: Math.round(item.distanceKm * 100) / 100,
      recording: recordingStatus(item.camera, seenAt, minutesOfDay(seenAt), now),
      request: latestRequest(item.camera.id),
    })),
  );
  const outsideRadius = camerasInRadius(detail.cameras, center, 20).length - inRadius.length;

  const requestViews = [...detail.requests]
    .map((item) => ({ ...item, urgency: urgencyFor(Date.parse(item.deadline), now), open: preservationIsOpen(item.status) }))
    .sort((a, b) => Number(b.open) - Number(a.open) || Date.parse(a.deadline) - Date.parse(b.deadline));

  const matchesByTime = [...detail.matches].sort((a, b) => Date.parse(a.seenAt) - Date.parse(b.seenAt));

  const trajectory = buildTrajectory(
    { latitude: operation.latitude, longitude: operation.longitude, at: seenAt, label: operation.lastKnownPlace },
    detail.matches.map((item) => ({
      id: item.id,
      cameraId: item.cameraId,
      cameraName: item.cameraName,
      region: item.region,
      latitude: item.latitude,
      longitude: item.longitude,
      seenAt: Date.parse(item.seenAt),
      confidence: item.confidence,
      classification: item.classification,
    })),
  );

  const requested = detail.requests.filter((item) => item.status !== 'cancelled').map((item) => item.cameraId);
  const nextCameras = nextCamerasToCheck(detail.cameras, trajectory, requested);

  return {
    ...detail,
    computedAt: now,
    nearby,
    outsideRadius,
    requestViews,
    matchesByTime,
    trajectory,
    nextCameras,
  };
}

export function deriveReceived(requests: PreservationRequest[], now: number): RequestView[] {
  return requests
    .map((item) => ({ ...item, urgency: urgencyFor(Date.parse(item.deadline), now), open: preservationIsOpen(item.status) }))
    .sort((a, b) => Number(b.open) - Number(a.open) || Date.parse(a.deadline) - Date.parse(b.deadline));
}

/**
 * Chegada segura: a pessoa diz em quanto tempo espera chegar; no horário o app pergunta se ela chegou.
 * Regras sem dependências. Não há rastreamento: nenhuma posição é lida durante o trajeto, e nada é enviado
 * sozinho — se a pessoa não confirmar, o app só oferece mandar a localização daquele momento.
 */
export const ARRIVAL_DURATIONS_MIN = [15, 30, 45, 60, 90] as const;
export const ARRIVAL_EXTEND_MIN = 15;
/** Limite de um trajeto (com as prorrogações): 12 horas. */
export const ARRIVAL_MAX_MIN = 12 * 60;
export const ARRIVAL_DESTINATION_MAX = 80;

export type ArrivalCheck = {
  startedAt: string;
  deadline: string;
  destination: string;
};

export type ArrivalPhase = 'none' | 'running' | 'overdue';

const MINUTE = 60 * 1000;

export function startArrivalCheck(now: Date, minutes: number, destination: string): ArrivalCheck {
  const safeMinutes = Math.min(Math.max(Math.round(minutes), 1), ARRIVAL_MAX_MIN);
  return {
    startedAt: now.toISOString(),
    deadline: new Date(now.getTime() + safeMinutes * MINUTE).toISOString(),
    destination: destination.trim().slice(0, ARRIVAL_DESTINATION_MAX),
  };
}

/** Mais tempo: conta a partir do horário combinado (ou de agora, se já passou), até 12 h desde o início. */
export function extendArrivalCheck(check: ArrivalCheck, now: Date, minutes = ARRIVAL_EXTEND_MIN): ArrivalCheck {
  const base = Math.max(new Date(check.deadline).getTime(), now.getTime());
  const limit = new Date(check.startedAt).getTime() + ARRIVAL_MAX_MIN * MINUTE;
  return { ...check, deadline: new Date(Math.min(base + minutes * MINUTE, limit)).toISOString() };
}

export function canExtendArrivalCheck(check: ArrivalCheck): boolean {
  const limit = new Date(check.startedAt).getTime() + ARRIVAL_MAX_MIN * MINUTE;
  return new Date(check.deadline).getTime() < limit;
}

export function arrivalPhase(check: ArrivalCheck | null, now: Date): ArrivalPhase {
  if (!check) return 'none';
  return now.getTime() < new Date(check.deadline).getTime() ? 'running' : 'overdue';
}

export function remainingMs(check: ArrivalCheck, now: Date): number {
  return Math.max(0, new Date(check.deadline).getTime() - now.getTime());
}

/** "08:05" (menos de 1 hora) ou "1 h 05 min". */
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  if (hours > 0) return `${hours} h ${pad(minutes)} min`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/** Lê o que ficou salvo no aparelho; qualquer coisa estranha vira "sem trajeto". */
export function parseArrivalCheck(raw: string | null): ArrivalCheck | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const startedAt = typeof value.startedAt === 'string' ? value.startedAt : '';
    const deadline = typeof value.deadline === 'string' ? value.deadline : '';
    const start = new Date(startedAt).getTime();
    const end = new Date(deadline).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    if (end - start > ARRIVAL_MAX_MIN * MINUTE) return null;
    const destination = typeof value.destination === 'string' ? value.destination.slice(0, ARRIVAL_DESTINATION_MAX) : '';
    return { startedAt, deadline, destination };
  } catch {
    return null;
  }
}

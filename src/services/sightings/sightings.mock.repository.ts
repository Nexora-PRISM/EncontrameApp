import { peopleMockRepository } from '@/services/people/people.mock.repository';
import type { SightingsRepository } from '@/services/sightings/sightings.repository';
import type { MySightingReport, SightingReportPayload } from '@/services/sightings/sightings.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Relatos do modo de demonstração: ficam só na memória e somem ao recarregar o app. */
let mockReports: MySightingReport[] = [];

/**
 * Só para desenvolvimento (EXPO_PUBLIC_USE_MOCKS): devolve um comprovante marcado como `simulated`,
 * e a tela avisa que é um teste. Para testar a falha no envio, use EXPO_PUBLIC_MOCK_SIGHTING_FAIL=true.
 * O relato não muda o último local do caso (no servidor, isso só acontece depois da análise).
 */
export const sightingsMockRepository: SightingsRepository = {
  async submit(payload: SightingReportPayload) {
    await delay(700);
    if (process.env.EXPO_PUBLIC_MOCK_SIGHTING_FAIL === 'true') {
      throw new Error('Falha simulada no envio do relato.');
    }
    const person = await peopleMockRepository.getById(payload.personId).catch(() => null);
    const receivedAt = new Date().toISOString();
    const reportId = `TESTE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    mockReports = [
      {
        reportId,
        personId: payload.personId,
        personName: person?.nickname ?? person?.fullName,
        status: 'received',
        seenAt: payload.seenAt,
        location: payload.location,
        receivedAt,
        hasPhoto: Boolean(payload.photo),
      },
      ...mockReports,
    ];
    return { reportId, status: 'received' as const, receivedAt, simulated: true };
  },

  async listMine() {
    await delay(300);
    return [...mockReports].sort(
      (left, right) => new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime(),
    );
  },
};

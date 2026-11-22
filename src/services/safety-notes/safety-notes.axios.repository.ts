import { api } from '@/lib/axios';
import { DEFAULT_NEARBY_RADIUS_KM } from '@/lib/geo';
import type { SafetyNotesRepository } from '@/services/safety-notes/safety-notes.repository';
import type {
  SafetyNote,
  SafetyNoteCategory,
  SafetyNotePeriod,
  SafetyNoteVote,
} from '@/services/safety-notes/safety-notes.types';

/**
 * Contrato da API (.NET, SafetyNoteController). Documentado em
 * docs/atualizacoes/2026-10-15-avisos-de-seguranca.md.
 *
 *   GET  /SafetyNote/nearby?latitude=&longitude=&radiusKm=   → ApiSafetyNote[]  (sem login)
 *   POST /SafetyNote                      { category, period, reference, note?, latitude,
 *                                           longitude, declarationAcceptedAt } → ApiSafetyNote (login)
 *   POST /SafetyNote/{id}/vote            { vote: "confirm" | "outdated" }    → ApiSafetyNote (login)
 *
 * Regras que a API deve aplicar: só usuário logado publica e vota (um voto por pessoa); limite de
 * avisos por conta por dia; validade de 30 dias renovada a cada confirmação; aviso some quando
 * "não está mais assim" passa as confirmações por 3; o autor nunca é exposto na listagem.
 */
interface ApiSafetyNote {
  safetyNoteId: number | string;
  category: string;
  period: string;
  reference: string;
  note?: string | null;
  latitude: number | string;
  longitude: number | string;
  dtCreated: string;
  dtExpires: string;
  confirmations?: number | string | null;
  outdatedReports?: number | string | null;
  myVote?: string | null;
  mine?: boolean | null;
}

const CATEGORIES: readonly SafetyNoteCategory[] = [
  'attention',
  'robbery',
  'deserted',
  'lighting',
  'avoid-time',
  'other',
];
const PERIODS: readonly SafetyNotePeriod[] = ['any', 'dawn', 'morning', 'afternoon', 'night'];

function asCategory(value: string): SafetyNoteCategory {
  return (CATEGORIES as readonly string[]).includes(value) ? (value as SafetyNoteCategory) : 'other';
}

function asPeriod(value: string): SafetyNotePeriod {
  return (PERIODS as readonly string[]).includes(value) ? (value as SafetyNotePeriod) : 'any';
}

function asVote(value: string | null | undefined): SafetyNoteVote | null {
  return value === 'confirm' || value === 'outdated' ? value : null;
}

function mapNote(item: ApiSafetyNote): SafetyNote {
  return {
    id: String(item.safetyNoteId),
    category: asCategory(item.category),
    period: asPeriod(item.period),
    reference: item.reference,
    note: item.note ?? undefined,
    // Number(): uma API que serialize como texto não pode deslocar o marcador nem virar NaN
    // silencioso; coordenada inválida é descartada depois (sanitizeSafetyNotes).
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    createdAt: item.dtCreated,
    expiresAt: item.dtExpires,
    confirmations: Math.max(0, Number(item.confirmations ?? 0) || 0),
    outdatedReports: Math.max(0, Number(item.outdatedReports ?? 0) || 0),
    myVote: asVote(item.myVote),
    mine: item.mine ?? false,
  };
}

export const safetyNotesAxiosRepository: SafetyNotesRepository = {
  async listNearby({ latitude, longitude, radiusKm = DEFAULT_NEARBY_RADIUS_KM }) {
    const { data } = await api.get<ApiSafetyNote[]>('/SafetyNote/nearby', {
      params: { latitude, longitude, radiusKm },
    });
    return (data ?? []).map(mapNote);
  },

  async create(payload) {
    const { data } = await api.post<ApiSafetyNote>('/SafetyNote', payload);
    return mapNote(data);
  },

  async vote(id, vote) {
    const { data } = await api.post<ApiSafetyNote>(`/SafetyNote/${encodeURIComponent(id)}/vote`, {
      vote,
    });
    return mapNote(data);
  },
};

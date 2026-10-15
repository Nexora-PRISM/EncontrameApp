import { DEFAULT_NEARBY_RADIUS_KM, haversineKm } from '@/lib/geo';
import { isSafetyNoteHidden, SAFETY_NOTE_VALID_DAYS } from '@/lib/safety-notes';
import type { SafetyNotesRepository } from '@/services/safety-notes/safety-notes.repository';
import type { SafetyNote, SafetyNoteVote } from '@/services/safety-notes/safety-notes.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

/** Avisos fictícios em Belo Horizonte (região dos mocks de pessoas). */
let mockNotes: SafetyNote[] = [
  {
    id: 'n1',
    category: 'robbery',
    period: 'night',
    reference: 'Rua dos Timbiras, trecho perto da praça',
    note: 'Vários relatos de celular roubado depois das 20h. Prefira a avenida, mais movimentada.',
    latitude: -19.9265,
    longitude: -43.9405,
    createdAt: daysFromNow(-3),
    expiresAt: daysFromNow(SAFETY_NOTE_VALID_DAYS - 1),
    confirmations: 12,
    outdatedReports: 1,
    myVote: null,
  },
  {
    id: 'n2',
    category: 'deserted',
    period: 'dawn',
    reference: 'Passarela da estação, lado norte',
    note: 'Quase ninguém passa de madrugada. Evite ir sozinho.',
    latitude: -19.9185,
    longitude: -43.9318,
    createdAt: daysFromNow(-6),
    expiresAt: daysFromNow(SAFETY_NOTE_VALID_DAYS - 2),
    confirmations: 7,
    outdatedReports: 0,
    myVote: null,
  },
  {
    id: 'n3',
    category: 'lighting',
    period: 'night',
    reference: 'Rua Pernambuco, entre a Bahia e a Ceará',
    latitude: -19.9338,
    longitude: -43.9312,
    createdAt: daysFromNow(-1),
    expiresAt: daysFromNow(SAFETY_NOTE_VALID_DAYS),
    confirmations: 3,
    outdatedReports: 0,
    myVote: null,
  },
  {
    id: 'n4',
    category: 'attention',
    period: 'any',
    reference: 'Ponto de ônibus em frente ao viaduto',
    note: 'Redobre a atenção com bolsa e celular.',
    latitude: -19.9221,
    longitude: -43.9466,
    createdAt: daysFromNow(-10),
    expiresAt: daysFromNow(SAFETY_NOTE_VALID_DAYS - 4),
    confirmations: 5,
    outdatedReports: 2,
    myVote: null,
  },
];

function isActive(note: SafetyNote): boolean {
  return new Date(note.expiresAt).getTime() > Date.now() && !isSafetyNoteHidden(note);
}

function applyVote(note: SafetyNote, vote: SafetyNoteVote): SafetyNote {
  let confirmations = note.confirmations;
  let outdatedReports = note.outdatedReports;
  // Troca de voto: desfaz o anterior antes de contar o novo (um voto por pessoa).
  if (note.myVote === 'confirm') confirmations -= 1;
  if (note.myVote === 'outdated') outdatedReports -= 1;
  if (vote === 'confirm') confirmations += 1;
  if (vote === 'outdated') outdatedReports += 1;

  return {
    ...note,
    confirmations: Math.max(confirmations, 0),
    outdatedReports: Math.max(outdatedReports, 0),
    myVote: vote,
    // Confirmar renova o prazo do aviso.
    expiresAt: vote === 'confirm' ? daysFromNow(SAFETY_NOTE_VALID_DAYS) : note.expiresAt,
  };
}

export const safetyNotesMockRepository: SafetyNotesRepository = {
  async listNearby({ latitude, longitude, radiusKm = DEFAULT_NEARBY_RADIUS_KM }) {
    await delay(250);
    return mockNotes.filter(
      (note) =>
        isActive(note) &&
        haversineKm(latitude, longitude, note.latitude, note.longitude) <= radiusKm,
    );
  },

  async create(payload) {
    await delay(500);
    const note: SafetyNote = {
      id: `n${Date.now()}`,
      category: payload.category,
      period: payload.period,
      reference: payload.reference.trim(),
      note: payload.note?.trim() || undefined,
      latitude: payload.latitude,
      longitude: payload.longitude,
      createdAt: new Date().toISOString(),
      expiresAt: daysFromNow(SAFETY_NOTE_VALID_DAYS),
      confirmations: 0,
      outdatedReports: 0,
      myVote: null,
      mine: true,
    };
    mockNotes = [note, ...mockNotes];
    return note;
  },

  async vote(id, vote) {
    await delay(250);
    const current = mockNotes.find((note) => note.id === id);
    if (!current) {
      throw new Error('Aviso não encontrado');
    }
    const updated = applyVote(current, vote);
    mockNotes = mockNotes.map((note) => (note.id === id ? updated : note));
    return updated;
  },
};

import { aiIndication, type ExpansionLevel, LEVEL_RADIUS_KM } from '@/lib/search-network-rules';
import type { SightingStatus } from '@/lib/sighting-report-rules';
import { peopleMockRepository } from '@/services/people/people.mock.repository';
import type { TeamRepository } from '@/services/team/team.repository';
import type {
  AiSuggestion,
  SearchOverview,
  TeamContentReport,
  TeamSightingReport,
} from '@/services/team/team.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const HOUR = 60 * 60 * 1000;
const ago = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

/**
 * Modo de demonstração do Painel da equipe: tudo aqui é fictício e fica só na memória.
 * As telas mostram o aviso "Dados de demonstração" quando `simulated` vem marcado.
 */
let reports: TeamContentReport[] = [
  { id: 'd1', target: 'MissingPerson', targetId: 'p2', reason: 'false_info', status: 'Open', createdAt: ago(5) },
  { id: 'd2', target: 'SafetyNote', targetId: '14', reason: 'abuse', status: 'Open', createdAt: ago(20) },
  { id: 'd3', target: 'GroupMessage', targetId: '88', reason: 'scam', status: 'Open', createdAt: ago(2) },
];

const sightingQueue: Record<string, TeamSightingReport[]> = {};
const overviews: Record<string, SearchOverview> = {};
const suggestions: Record<string, AiSuggestion[]> = {};

async function caseBase(caseId: string) {
  const person = await peopleMockRepository.getById(caseId);
  const center = person.coords ?? { latitude: -19.9167, longitude: -43.9345 };
  return { person, center };
}

async function ensureSightings(caseId: string): Promise<TeamSightingReport[]> {
  if (!sightingQueue[caseId]) {
    sightingQueue[caseId] = [
      {
        reportId: 'TESTE-R1',
        personId: caseId,
        status: 'pending_review',
        seenAt: ago(6),
        receivedAt: ago(5.5),
        place: 'Centro, Belo Horizonte',
        description: 'Vi uma pessoa parecida sentada perto da rodoviária, parecia perdida.',
        clothes: 'casaco cinza',
        direction: 'a pé, sentido Av. Afonso Pena',
        hasPhoto: false,
      },
      {
        reportId: 'TESTE-R2',
        personId: caseId,
        status: 'pending_review',
        seenAt: ago(4),
        receivedAt: ago(3.8),
        place: 'Funcionários, Belo Horizonte',
        description: 'Pessoa com casaco cinza entrou em um ônibus da linha 4103.',
        hasPhoto: true,
      },
    ];
  }
  return sightingQueue[caseId];
}

async function ensureOverview(caseId: string): Promise<SearchOverview> {
  if (!overviews[caseId]) {
    const { person, center } = await caseBase(caseId);
    const near = (dLat: number, dLon: number) => ({ latitude: center.latitude + dLat, longitude: center.longitude + dLon });
    overviews[caseId] = {
      level: 'city',
      radiusKm: LEVEL_RADIUS_KM.city,
      paused: false,
      notificationsSent: 1240,
      notificationsDelivered: 1105,
      reportsReceived: 7,
      activeRegions: [
        { label: 'Centro', reports: 3 },
        { label: 'Funcionários', reports: 2 },
        { label: 'Contagem', reports: 1 },
      ],
      lastUpdates: [
        { at: ago(3.8), text: 'Novo relato recebido (aguardando análise).' },
        { at: ago(26), text: 'Busca ampliada de bairro para cidade.' },
      ],
      expansions: [
        {
          id: 'x1',
          from: 'neighborhood',
          to: 'city',
          justification: 'Relatos indicam deslocamento para o centro.',
          createdAt: ago(26),
          estimatedRecipients: 980,
        },
      ],
      nodes: [
        { id: 'origin', kind: 'origin', label: person.lastSeen ?? 'Último local conhecido', ...center },
        { id: 'r-centro', kind: 'region', label: 'Centro', ...near(0.012, 0.01) },
        { id: 'r-func', kind: 'region', label: 'Funcionários', ...near(-0.008, 0.018) },
        { id: 'rel-1', kind: 'report', label: 'Relato TESTE-R1', ...near(0.015, 0.004) },
        { id: 'rel-2', kind: 'report', label: 'Relato TESTE-R2', ...near(-0.01, 0.022) },
        { id: 'r-cont', kind: 'region', label: 'Contagem', ...near(-0.02, -0.11) },
      ],
      connections: [
        { id: 'c1', from: 'origin', to: 'r-centro', status: 'validated', suggestedBy: 'person' },
        { id: 'c2', from: 'r-centro', to: 'rel-1', status: 'pending', suggestedBy: 'person' },
        { id: 'c3', from: 'origin', to: 'r-func', status: 'validated', suggestedBy: 'person' },
        { id: 'c4', from: 'r-func', to: 'rel-2', status: 'suggested', suggestedBy: 'ai', reason: 'Mesmo horário e roupa parecida.' },
        { id: 'c5', from: 'origin', to: 'r-cont', status: 'discarded', suggestedBy: 'ai', reason: 'Relato de outra pessoa.' },
      ],
      simulated: true,
    };
  }
  return overviews[caseId];
}

function ensureSuggestions(caseId: string): AiSuggestion[] {
  if (!suggestions[caseId]) {
    const raw: Omit<AiSuggestion, 'indication'>[] = [
      {
        id: 's1',
        kind: 'related_reports',
        score: 0.82,
        reasons: ['Roupa descrita igual nos dois relatos (casaco cinza).', 'Relatos com 2 horas de diferença, a 3 km um do outro.'],
        reportIds: ['TESTE-R1', 'TESTE-R2'],
        status: 'pending',
        simulated: true,
      },
      {
        id: 's2',
        kind: 'new_region',
        score: 0.55,
        reasons: ['A linha de ônibus citada no relato TESTE-R2 vai até Contagem.'],
        reportIds: ['TESTE-R2'],
        status: 'pending',
        simulated: true,
      },
      {
        id: 's3',
        kind: 'conflict',
        score: 0.4,
        reasons: ['Um relato diz "a pé" e outro diz "de ônibus" no mesmo intervalo.'],
        reportIds: ['TESTE-R1', 'TESTE-R2'],
        status: 'pending',
        simulated: true,
      },
    ];
    suggestions[caseId] = raw.map((item) => ({ ...item, indication: aiIndication(item.score) }));
  }
  return suggestions[caseId];
}

export const teamMockRepository: TeamRepository = {
  async isStaff() {
    await delay(200);
    return true;
  },

  async listReports() {
    await delay(300);
    return reports.filter((item) => item.status === 'Open');
  },

  async hideReport(id) {
    await delay(300);
    reports = reports.map((item) => (item.id === id ? { ...item, status: 'Hidden' } : item));
  },

  async dismissReport(id) {
    await delay(300);
    reports = reports.map((item) => (item.id === id ? { ...item, status: 'Dismissed' } : item));
  },

  async changeCaseStatus() {
    await delay(400);
  },

  async listSightingReports(caseId) {
    await delay(300);
    return (await ensureSightings(caseId)).filter((item) => item.status === 'pending_review' || item.status === 'in_review');
  },

  async decideSightingReport(reportId, status: SightingStatus) {
    await delay(300);
    for (const list of Object.values(sightingQueue)) {
      for (const item of list) if (item.reportId === reportId) item.status = status;
    }
  },

  async getSearchOverview(caseId) {
    await delay(350);
    return { ...(await ensureOverview(caseId)) };
  },

  async expandSearch(caseId, to: ExpansionLevel, justification) {
    await delay(400);
    const overview = await ensureOverview(caseId);
    overview.expansions = [
      ...overview.expansions,
      { id: `x${overview.expansions.length + 1}`, from: overview.level, to, justification, createdAt: new Date().toISOString() },
    ];
    overview.level = to;
    overview.radiusKm = LEVEL_RADIUS_KM[to];
  },

  async setAlertsPaused(caseId, paused) {
    await delay(300);
    (await ensureOverview(caseId)).paused = paused;
  },

  async listAiSuggestions(caseId) {
    await delay(300);
    return ensureSuggestions(caseId).filter((item) => item.status === 'pending');
  },

  async decideAiSuggestion(id, accept) {
    await delay(300);
    for (const list of Object.values(suggestions)) {
      for (const item of list) if (item.id === id) item.status = accept ? 'accepted' : 'rejected';
    }
  },
};

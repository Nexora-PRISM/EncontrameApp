import { RELATIONSHIP_OPTIONS } from '@/features/cadastrar-pessoa/legitimacy';
import type { CreatePersonPayload } from '@/services/people/people.types';

/** Valores do formulário montados a partir de um cadastro salvo neste aparelho (feito sem conta). */
export interface DraftFormValues {
  photoUri: string;
  photoBase64: string;
  fullName: string;
  nickname: string;
  age: string;
  heightCm: string;
  ethnicity: string;
  build: string;
  clothes: string;
  hair: string;
  eyes: string;
  tattoo: string;
  accessories: string;
  location: string;
  originCity: string;
  originState: string;
  originCountry: string;
  originNeighborhood: string;
  lastSeen: string;
  phone: string;
  reporterRelationship: string;
  policeReport: string;
  /** Ponto no mapa salvo com o rascunho (já arredondado). */
  point: { latitude: number; longitude: number } | null;
}

/**
 * Preenche o formulário de revisão com o rascunho local.
 *
 * A declaração de veracidade NUNCA vem marcada: o rascunho pode ter sido feito por outra pessoa
 * neste aparelho, então quem envia (a conta logada) precisa ler e aceitar de novo.
 */
export function draftToFormValues(payload: CreatePersonPayload): DraftFormValues {
  const rawPhoto = (payload.photo ?? '').trim();
  const photoBase64 = rawPhoto.startsWith('data:') ? rawPhoto.slice(rawPhoto.indexOf(',') + 1) : rawPhoto;
  // A foto em base64 continua válida mesmo quando o arquivo temporário (photoUri) já foi apagado.
  const photoUri = photoBase64 ? `data:image/jpeg;base64,${photoBase64}` : (payload.photoUri ?? '');
  const relationship = payload.reporterRelationship ?? '';

  return {
    photoUri,
    photoBase64,
    fullName: payload.fullName ?? '',
    nickname: payload.nickname ?? '',
    age: payload.age ?? '',
    heightCm: payload.heightCm ?? '',
    ethnicity: payload.ethnicity ?? '',
    build: payload.build ?? '',
    clothes: payload.clothes ?? '',
    hair: payload.hair ?? '',
    eyes: payload.eyes ?? '',
    tattoo: payload.tattoo ?? '',
    accessories: payload.accessories ?? '',
    location: payload.location ?? '',
    originCity: payload.originCity ?? '',
    originState: payload.originState ?? '',
    originCountry: payload.originCountry ?? 'Brasil',
    originNeighborhood: payload.originNeighborhood ?? '',
    lastSeen: payload.lastSeen ?? '',
    phone: payload.phone ?? '',
    // Só aceita um vínculo da lista; rascunhos antigos (sem o campo) pedem a escolha na revisão.
    reporterRelationship: (RELATIONSHIP_OPTIONS as readonly string[]).includes(relationship)
      ? relationship
      : '',
    policeReport: payload.policeReportNumber ?? '',
    point:
      payload.latitude != null && payload.longitude != null
        ? { latitude: payload.latitude, longitude: payload.longitude }
        : null,
  };
}

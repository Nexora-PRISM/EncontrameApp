import type { BrandColors } from '@/constants/brand';
import { msg } from '@/lib/i18n-msg';
import type {
  CameraAuthorization,
  CameraError,
  CameraIntegration,
  CameraSource,
  Certainty,
  Compass,
  ConfidenceBand,
  CoverageLevel,
  InfoSource,
  MatchClass,
  OperationError,
  PreservationStatus,
  RecordingStatus,
  Reliability,
  SharingCondition,
  Urgency,
  VisionAction,
  VisionRole,
  VisualFeatureKind,
} from '@/lib/vision-rules';

/** Textos do Encontra-me Vision (traduzidos na tela com `t`). Os códigos ficam em `vision-rules.ts`. */

/** Nome do módulo (marca: não é traduzido). */
export const VISION_NAME = 'Encontra-me Vision';

export const CAMERA_SOURCE_LABEL: Readonly<Record<CameraSource, string>> = {
  municipal: msg('Câmera da prefeitura'),
  traffic: msg('Câmera de trânsito'),
  official_public: msg('Câmera pública oficial'),
  commerce: msg('Comércio ou loja'),
  home: msg('Casa'),
  condo: msg('Condomínio'),
  security_company: msg('Empresa de segurança'),
  institutional: msg('Sistema de órgão público'),
};

export const INTEGRATION_LABEL: Readonly<Record<CameraIntegration, string>> = {
  manual_upload: msg('Envio do arquivo pelo responsável'),
  ip_rtsp: msg('Câmera IP (RTSP), quando permitido'),
  monitoring_api: msg('Sistema de videomonitoramento'),
  cloud_storage: msg('Gravação na nuvem do fabricante'),
  local_recorder: msg('Gravador no local (DVR/NVR)'),
};

export const AUTHORIZATION_LABEL: Readonly<Record<CameraAuthorization, string>> = {
  pending: msg('Aguardando verificação'),
  authorized: msg('Participando'),
  suspended: msg('Pausada pelo responsável'),
  revoked: msg('Participação encerrada'),
};

export function authorizationColor(brand: BrandColors, status: CameraAuthorization): string {
  switch (status) {
    case 'authorized':
      return brand.categoryAdult;
    case 'pending':
      return brand.orangeText;
    case 'suspended':
      return brand.categoryElder;
    case 'revoked':
      return brand.textMuted;
  }
}

export const SHARING_LABEL: Readonly<Record<SharingCondition, string>> = {
  preservation_request: msg('Analiso cada pedido de preservação'),
  institutional_request: msg('Só com pedido formal de autoridade'),
  court_order: msg('Só com ordem judicial'),
};

export const COVERAGE_LEVEL_LABEL: Readonly<Record<CoverageLevel, string>> = {
  high: msg('Maior cobertura'),
  medium: msg('Cobertura média'),
  low: msg('Pouca cobertura'),
};

export function coverageColor(brand: BrandColors, level: CoverageLevel): string {
  switch (level) {
    case 'high':
      return brand.categoryAdult;
    case 'medium':
      return brand.blue;
    case 'low':
      return brand.textMuted;
  }
}

export const ROLE_LABEL: Readonly<Record<VisionRole, string>> = {
  community: msg('Comunidade'),
  owner: msg('Responsável por câmera'),
  agent: msg('Agente institucional'),
  coordinator: msg('Coordenação institucional'),
  auditor: msg('Auditoria'),
  technical: msg('Equipe técnica (Nexora Prism)'),
};

export const ACTION_LABEL: Readonly<Record<VisionAction, string>> = {
  view_coverage: msg('Ver a cobertura por região'),
  manage_own_cameras: msg('Cadastrar e gerenciar as próprias câmeras'),
  answer_preservation: msg('Responder pedidos de preservação'),
  view_operations: msg('Ver operações de busca'),
  create_operation: msg('Abrir operação de busca'),
  change_radius: msg('Ampliar ou reduzir o raio'),
  request_preservation: msg('Pedir preservação de imagens'),
  view_footage: msg('Assistir a trechos autorizados'),
  classify_match: msg('Confirmar ou descartar correspondências'),
  rate_information: msg('Avaliar a confiabilidade das informações'),
  view_audit: msg('Ver a auditoria'),
  view_technical_status: msg('Ver a saúde técnica do sistema'),
};

export const RECORDING_STATUS_LABEL: Readonly<Record<RecordingStatus, string>> = {
  available: msg('Gravação dentro do prazo'),
  expiring: msg('Prazo acabando — peça a preservação já'),
  possibly_deleted: msg('Pode já ter sido apagada'),
  outside_hours: msg('Não grava nesse horário'),
  no_recording: msg('Não guarda gravações'),
};

export function recordingColor(brand: BrandColors, status: RecordingStatus): string {
  switch (status) {
    case 'available':
      return brand.categoryAdult;
    case 'expiring':
      return brand.orangeText;
    case 'possibly_deleted':
    case 'outside_hours':
    case 'no_recording':
      return brand.textMuted;
  }
}

export const PRESERVATION_STATUS_LABEL: Readonly<Record<PreservationStatus, string>> = {
  draft: msg('Preparado, ainda não enviado'),
  sent: msg('Enviado, aguardando resposta'),
  accepted: msg('Responsável aceitou preservar'),
  declined: msg('Responsável recusou'),
  images_received: msg('Imagens recebidas'),
  expired: msg('Prazo vencido'),
  cancelled: msg('Cancelado'),
};

/** Botão de cada passo do pedido (quem registra está em `preservationActor`). */
export const PRESERVATION_ACTION_LABEL: Readonly<Record<PreservationStatus, string>> = {
  draft: msg('Voltar para rascunho'),
  sent: msg('Registrar que foi enviado'),
  accepted: msg('Aceitar preservar'),
  declined: msg('Recusar'),
  images_received: msg('Registrar imagens recebidas'),
  expired: msg('Marcar prazo vencido'),
  cancelled: msg('Cancelar pedido'),
};

export function preservationColor(brand: BrandColors, status: PreservationStatus): string {
  switch (status) {
    case 'images_received':
    case 'accepted':
      return brand.categoryAdult;
    case 'sent':
    case 'draft':
      return brand.blue;
    case 'declined':
    case 'expired':
    case 'cancelled':
      return brand.textMuted;
  }
}

export const URGENCY_LABEL: Readonly<Record<Urgency, string>> = {
  overdue: msg('Prazo de guarda já passou'),
  urgent: msg('Menos de 24 horas'),
  soon: msg('Menos de 3 dias'),
  normal: msg('Dentro do prazo'),
};

export function urgencyColor(brand: BrandColors, urgency: Urgency): string {
  switch (urgency) {
    case 'overdue':
      return brand.textMuted;
    case 'urgent':
      return brand.orangeText;
    case 'soon':
      return brand.categoryElder;
    case 'normal':
      return brand.categoryAdult;
  }
}

export const MATCH_CLASS_LABEL: Readonly<Record<MatchClass, string>> = {
  confirmed: msg('Confirmada por pessoa'),
  probable: msg('Provável'),
  inconclusive: msg('Inconclusiva'),
  discarded: msg('Descartada'),
};

export const MATCH_CLASS_HINT: Readonly<Record<MatchClass, string>> = {
  confirmed: msg('Alguém da equipe assistiu ao trecho e confirmou que é compatível com a descrição.'),
  probable: msg('A IA encontrou várias características compatíveis. Ainda precisa de revisão humana.'),
  inconclusive: msg('Poucas características compatíveis ou imagem ruim. Não serve para indicar trajeto.'),
  discarded: msg('Alguém da equipe revisou e concluiu que não é a pessoa procurada.'),
};

export function matchColor(brand: BrandColors, value: MatchClass): string {
  switch (value) {
    case 'confirmed':
      return brand.categoryAdult;
    case 'probable':
      return brand.blue;
    case 'inconclusive':
      return brand.categoryElder;
    case 'discarded':
      return brand.textMuted;
  }
}

export const CONFIDENCE_BAND_LABEL: Readonly<Record<ConfidenceBand, string>> = {
  high: msg('Confiança alta'),
  medium: msg('Confiança média'),
  low: msg('Confiança baixa'),
};

export const FEATURE_KIND_LABEL: Readonly<Record<VisualFeatureKind, string>> = {
  clothing_color: msg('Cor da roupa'),
  clothing_type: msg('Tipo de roupa'),
  backpack: msg('Mochila'),
  bag: msg('Bolsa'),
  accessory: msg('Acessório'),
  direction: msg('Direção'),
  vehicle: msg('Veículo'),
  other: msg('Outra característica'),
};

export const CERTAINTY_LABEL: Readonly<Record<Certainty, string>> = {
  fact: msg('Fato informado'),
  confirmed: msg('Confirmado por pessoa'),
  hypothesis: msg('Hipótese'),
  inconclusive: msg('Inconclusivo'),
};

export function certaintyColor(brand: BrandColors, value: Certainty): string {
  switch (value) {
    case 'fact':
      return brand.navy;
    case 'confirmed':
      return brand.categoryAdult;
    case 'hypothesis':
      return brand.blue;
    case 'inconclusive':
      return brand.categoryElder;
  }
}

export const COMPASS_LABEL: Readonly<Record<Compass, string>> = {
  N: msg('norte'),
  NE: msg('nordeste'),
  E: msg('leste'),
  SE: msg('sudeste'),
  S: msg('sul'),
  SW: msg('sudoeste'),
  W: msg('oeste'),
  NW: msg('noroeste'),
};

export const INFO_SOURCE_LABEL: Readonly<Record<InfoSource, string>> = {
  resident: msg('Morador'),
  merchant: msg('Comerciante'),
  condo: msg('Condomínio'),
  company: msg('Empresa'),
  volunteer: msg('Voluntário'),
  institution: msg('Instituição'),
  public_system: msg('Sistema público participante'),
};

export const RELIABILITY_LABEL: Readonly<Record<Reliability, string>> = {
  unrated: msg('Ainda não avaliada'),
  low: msg('Confiabilidade baixa'),
  medium: msg('Confiabilidade média'),
  high: msg('Confiabilidade alta'),
};

export function reliabilityColor(brand: BrandColors, value: Reliability): string {
  switch (value) {
    case 'high':
      return brand.categoryAdult;
    case 'medium':
      return brand.blue;
    case 'low':
      return brand.categoryElder;
    case 'unrated':
      return brand.textMuted;
  }
}

export const CAMERA_ERROR_LABEL: Readonly<Record<CameraError, string>> = {
  name: msg('Dê um nome de 3 a 60 letras (ex.: "Entrada da loja").'),
  source: msg('Escolha o tipo de local.'),
  region: msg('Informe o bairro ou região.'),
  city: msg('Informe a cidade.'),
  coverage: msg('Conte em poucas palavras o que a câmera mostra.'),
  location: msg('Localização inválida. Tente usar a localização de novo.'),
  hours: msg('Use o formato 08:00 nos dois horários, ou deixe os dois em branco.'),
  retention: msg('Informe de 1 a 90 dias.'),
  integration: msg('Escolha como as imagens podem ser entregues.'),
  sharing: msg('Escolha em que condição você aceita fornecer gravações.'),
  consent: msg('Marque a declaração para continuar.'),
  secret: msg('Não escreva senha, usuário, IP ou endereço de acesso da câmera.'),
};

export const OPERATION_ERROR_LABEL: Readonly<Record<OperationError, string>> = {
  case: msg('Informe o número do caso.'),
  location: msg('Informe a localização do último local conhecido.'),
  place: msg('Descreva o último local conhecido.'),
  time: msg('Informe data e horário.'),
  future: msg('A data não pode estar no futuro.'),
  radius: msg('Escolha um raio.'),
  scope: msg('Descreva o escopo (pelo menos 10 letras).'),
  justification: msg('Escreva a justificativa (pelo menos 15 letras).'),
};

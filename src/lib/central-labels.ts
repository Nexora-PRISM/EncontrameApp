import type { BrandColors } from '@/constants/brand';
import type {
  CentralAction,
  CentralRole,
  ClosureStep,
  ExportError,
  InfoNature,
  LegalBasis,
  MobilizationArea,
  RetentionState,
  Sensitivity,
  ServiceState,
  TipContactPreference,
  TipError,
  TipLink,
  TipStatus,
} from '@/lib/central-rules';
import { msg } from '@/lib/i18n-msg';
import type { DossierFile, DossierStatus, DossierTip } from '@/services/central/central.types';

/** Textos da Central de Inteligência (traduzidos na tela com `t`). */

export const CENTRAL_ROLE_LABEL: Readonly<Record<CentralRole, string>> = {
  public: msg('Público'),
  analyst: msg('Analista institucional'),
  admin: msg('Administração institucional'),
  auditor: msg('Auditoria'),
  technical: msg('Equipe técnica (Nexora Prism)'),
};

export const CENTRAL_ACTION_LABEL: Readonly<Record<CentralAction | 'confidential_tip_received' | 'export_generated' | 'file_received', string>> = {
  view_dossiers: msg('Consultar dossiês'),
  add_note: msg('Registrar anotação'),
  review_tip: msg('Analisar pista'),
  view_witness_identity: msg('Abrir identidade de quem enviou a pista'),
  preserve_records: msg('Registrar preservação'),
  manage_mobilization: msg('Ajustar a mobilização'),
  export_dossier: msg('Exportar dossiê'),
  authorize_export: msg('Autorizar exportação'),
  manage_links: msg('Criar ou revogar link seguro'),
  close_case: msg('Encerrar caso'),
  view_audit: msg('Ver a auditoria'),
  view_technical: msg('Ver a saúde técnica'),
  request_exceptional_access: msg('Pedir acesso excepcional'),
  confidential_tip_received: msg('Pista confidencial recebida'),
  export_generated: msg('Pacote de exportação gerado'),
  file_received: msg('Arquivo recebido'),
};

export const NATURE_LABEL: Readonly<Record<InfoNature, string>> = {
  documented_fact: msg('Fato documentado'),
  unverified_report: msg('Relato não verificado'),
  hypothesis: msg('Hipótese'),
};

export function natureColor(brand: BrandColors, nature: InfoNature): string {
  switch (nature) {
    case 'documented_fact':
      return brand.navy;
    case 'unverified_report':
      return brand.orangeText;
    case 'hypothesis':
      return brand.categoryElder;
  }
}

export const DOSSIER_STATUS_LABEL: Readonly<Record<DossierStatus, string>> = {
  searching: msg('Em busca'),
  alert: msg('Alerta'),
  found: msg('Localizada'),
  closed: msg('Encerrado'),
};

export const TIP_STATUS_LABEL: Readonly<Record<TipStatus, string>> = {
  new: msg('Nova'),
  under_review: msg('Em análise'),
  relevant: msg('Relevante'),
  not_confirmed: msg('Não confirmada'),
  duplicate: msg('Repetida'),
};

export function tipStatusColor(brand: BrandColors, status: TipStatus): string {
  switch (status) {
    case 'new':
      return brand.blue;
    case 'under_review':
      return brand.orangeText;
    case 'relevant':
      return brand.categoryAdult;
    case 'not_confirmed':
    case 'duplicate':
      return brand.textMuted;
  }
}

export const TIP_CHANNEL_LABEL: Readonly<Record<DossierTip['channel'], string>> = {
  confidential: msg('Pista confidencial'),
  sighting_report: msg('Relato de avistamento'),
  phone: msg('Telefone da equipe'),
  vision: msg('Câmera (Vision)'),
  volunteer: msg('Voluntário'),
};

export const TIP_LINK_LABEL: Readonly<Record<TipLink['kind'], string>> = {
  related: msg('Podem estar ligadas (perto no tempo e no lugar)'),
  duplicate: msg('Parecem repetidas'),
  divergence: msg('Divergem: lugares distantes quase no mesmo horário'),
};

export const SENSITIVITY_LABEL: Readonly<Record<Sensitivity, string>> = {
  normal: msg('Comum'),
  personal: msg('Dados pessoais'),
  confidential: msg('Sigiloso'),
  witness_identity: msg('Identidade de testemunha'),
};

export const LEGAL_BASIS_LABEL: Readonly<Record<LegalBasis, string>> = {
  authority_request: msg('Requisição de autoridade competente'),
  court_order: msg('Ordem judicial'),
  family_consent: msg('Pedido ou consentimento da família'),
  protection_of_life: msg('Proteção da vida ou da integridade física'),
};

export const EXPORT_ERROR_LABEL: Readonly<Record<ExportError, string>> = {
  purpose: msg('Descreva a finalidade (pelo menos 15 letras).'),
  legal_basis: msg('Escolha o fundamento.'),
  recipient: msg('Informe a instituição e o nome de quem recebe.'),
  recipient_email: msg('Use um e-mail institucional (.gov.br, .jus.br, .mp.br, .def.br, .leg.br ou .mil.br).'),
  recipient_confirmed: msg('Confirme o destinatário por canal oficial antes de exportar.'),
  authorizer: msg('Informe quem autorizou.'),
  second_approval: msg('Identidade de testemunha ou documento sigiloso exige autorização de outra pessoa.'),
  empty: msg('Escolha pelo menos um item.'),
};

export const TIP_ERROR_LABEL: Readonly<Record<TipError, string>> = {
  text_short: msg('Conte com um pouco mais de detalhe (pelo menos 20 letras).'),
  text_long: msg('Texto muito longo.'),
  contact: msg('Informe um contato válido ou escolha "Não quero ser contatado".'),
  understood: msg('Marque que você leu como funciona a confidencialidade.'),
};

export const CONTACT_PREFERENCE_LABEL: Readonly<Record<TipContactPreference, string>> = {
  none: msg('Não quero ser contatado'),
  in_app: msg('Pela minha conta no app'),
  phone: msg('Por telefone'),
  email: msg('Por e-mail'),
};

export const CLOSURE_STEP_LABEL: Readonly<Record<ClosureStep, string>> = {
  status_updated: msg('Situação do caso atualizada'),
  notifications_stopped: msg('Notificações de busca interrompidas'),
  mobilization_ended: msg('Áreas de mobilização encerradas'),
  public_channels_updated: msg('Página pública e cartaz atualizados'),
  old_alerts_expired: msg('Alertas antigos marcados como encerrados'),
  records_preserved: msg('Registros preservados conforme prazos e pedidos legais'),
  identity_protected: msg('Foto, último local e detalhes retirados da área pública'),
  history_kept: msg('Histórico de mudanças mantido'),
  administrative_closure: msg('Encerramento administrativo registrado'),
};

export const AREA_STATUS_LABEL: Readonly<Record<MobilizationArea['status'], string>> = {
  active: msg('Ativa'),
  paused: msg('Pausada'),
  ended: msg('Encerrada'),
};

export const SERVICE_STATE_LABEL: Readonly<Record<ServiceState, string>> = {
  ok: msg('Funcionando'),
  degraded: msg('Lento ou instável'),
  down: msg('Fora do ar'),
  not_connected: msg('Não conectado'),
};

export function serviceColor(brand: BrandColors, state: ServiceState): string {
  switch (state) {
    case 'ok':
      return brand.categoryAdult;
    case 'degraded':
      return brand.orangeText;
    case 'down':
      return brand.error;
    case 'not_connected':
      return brand.textMuted;
  }
}

export const RETENTION_LABEL: Readonly<Record<RetentionState, string>> = {
  keep: msg('Dentro do prazo de guarda'),
  legal_hold: msg('Guarda legal (preservação ativa)'),
  review_disposal: msg('Prazo vencido: revisar descarte seguro'),
};

export const FILE_KIND_LABEL: Readonly<Record<DossierFile['kind'], string>> = {
  photo_current: msg('Foto atual'),
  photo_old: msg('Foto antiga'),
  document: msg('Documento'),
  video: msg('Vídeo'),
  other: msg('Outro arquivo'),
};

export const LINK_STATE_LABEL: Readonly<Record<'active' | 'expired' | 'revoked', string>> = {
  active: msg('Ativo'),
  expired: msg('Vencido'),
  revoked: msg('Revogado'),
};

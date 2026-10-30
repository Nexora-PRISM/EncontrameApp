import type { BrandColors } from '@/constants/brand';
import { msg } from '@/lib/i18n-msg';
import type { AiIndication, ConnectionStatus, ExpansionLevel } from '@/lib/search-network-rules';
import type { ReportReason, ReportTarget } from '@/lib/team-rules';
import type { AiSuggestionKind, NetworkNodeKind } from '@/services/team/team.types';

/** Textos do Painel da equipe (traduzidos na tela com `t`). */
export const REPORT_TARGET_LABEL: Readonly<Record<ReportTarget, string>> = {
  MissingPerson: msg('Cadastro de caso'),
  GroupMessage: msg('Mensagem do grupo de apoio'),
  SafetyNote: msg('Aviso de segurança'),
  other: msg('Outro conteúdo'),
};

export const REPORT_REASON_LABEL: Readonly<Record<ReportReason, string>> = {
  scam: msg('Golpe'),
  false_info: msg('Informação falsa'),
  abuse: msg('Abuso ou ofensa'),
  other: msg('Outro motivo'),
};

export const EXPANSION_LEVEL_LABEL: Readonly<Record<ExpansionLevel, string>> = {
  neighborhood: msg('Bairro'),
  city: msg('Cidade'),
  neighbors: msg('Cidades vizinhas'),
  state: msg('Estado'),
  country: msg('País'),
  international: msg('Outros países'),
};

export const CONNECTION_STATUS_LABEL: Readonly<Record<ConnectionStatus, string>> = {
  suggested: msg('Sugerida pela IA'),
  pending: msg('Aguardando análise'),
  validated: msg('Validada por pessoa'),
  discarded: msg('Descartada'),
};

export const NODE_KIND_LABEL: Readonly<Record<NetworkNodeKind, string>> = {
  origin: msg('Ponto inicial'),
  region: msg('Região alcançada'),
  report: msg('Informação recebida'),
  volunteer: msg('Voluntário'),
  institution: msg('Instituição'),
};

export const AI_KIND_LABEL: Readonly<Record<AiSuggestionKind, string>> = {
  related_reports: msg('Relatos que podem estar ligados'),
  duplicate_case: msg('Possível cadastro duplicado'),
  conflict: msg('Informações que se contradizem'),
  new_region: msg('Nova região de interesse'),
};

export const AI_INDICATION_LABEL: Readonly<Record<AiIndication, string>> = {
  weak: msg('Indicação fraca'),
  moderate: msg('Indicação moderada'),
  strong: msg('Indicação forte'),
};

export function connectionColor(brand: BrandColors, status: ConnectionStatus): string {
  switch (status) {
    case 'validated':
      return brand.categoryAdult;
    case 'pending':
      return brand.orangeText;
    case 'suggested':
      return brand.categoryElder;
    case 'discarded':
      return brand.textMuted;
  }
}

export function nodeColor(brand: BrandColors, kind: NetworkNodeKind): string {
  switch (kind) {
    case 'origin':
      return brand.navy;
    case 'region':
      return brand.blue;
    case 'report':
      return brand.orange;
    case 'volunteer':
      return brand.categoryAdult;
    case 'institution':
      return brand.categoryElder;
  }
}

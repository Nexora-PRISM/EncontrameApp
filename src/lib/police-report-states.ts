import { msg } from '@/lib/i18n-msg';

/**
 * Boletim de ocorrência de desaparecimento pela internet, por estado.
 *
 * Só entra aqui o que foi conferido em fonte oficial (governo do estado ou Polícia Civil) em 31/10/2026.
 * Estado sem informação conferida mostra a orientação geral — nunca um link adivinhado. Sites mudam: revise
 * esta lista de tempos em tempos (docs/evolucao/NOVIDADES.md tem as fontes).
 */
export const POLICE_REPORT_CHECKED_AT = '31/10/2026';

export const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
] as const;

export type BrazilUf = (typeof BRAZIL_STATES)[number]['uf'];

export type OnlineReportInfo = {
  /** `accepts`: a fonte oficial diz que o desaparecimento pode ser registrado pela internet.
   *  `partial`: começa pela internet, mas é preciso completar na delegacia (ou há limites).
   *  `unconfirmed`: há delegacia on-line, mas a fonte não diz se aceita desaparecimento. */
  status: 'accepts' | 'partial' | 'unconfirmed';
  /** Página oficial (https, domínio do governo). Sem ela, a tela não mostra botão. */
  url?: string;
  note: string;
};

export const ONLINE_REPORT: Partial<Record<BrazilUf, OnlineReportInfo>> = {
  SP: {
    status: 'accepts',
    url: 'https://www.delegaciaeletronica.policiacivil.sp.gov.br/ssp-de-cidadao/home',
    note: msg('A Delegacia Eletrônica da Polícia Civil registra a comunicação de desaparecimento.'),
  },
  MG: {
    status: 'accepts',
    url: 'https://www.mg.gov.br/servico/solicitar-registro-de-ocorrencia-de-desaparecimento-de-pessoa',
    note: msg('Pela Delegacia Virtual, um familiar maior de 18 anos com CPF registra o desaparecimento. Se o pedido não for validado, a polícia orienta ir a uma unidade.'),
  },
  PR: {
    status: 'partial',
    url: 'https://www.parana.pr.gov.br/servicos/Servicos/BOs/Registrar-Boletim-de-Ocorrencia-de-pessoa-desaparecida-xv3KM5o1',
    note: msg('Pela internet, para pessoas a partir de 12 anos. Para crianças com menos de 12 anos, vá a uma delegacia da Polícia Civil.'),
  },
  GO: {
    status: 'accepts',
    url: 'https://goias.gov.br/policiacivil/delegacia-virtual/',
    note: msg('A Delegacia Virtual da Polícia Civil aceita o registro de desaparecimento de pessoas.'),
  },
  DF: {
    status: 'partial',
    note: msg('O registro pode começar pela Delegacia Eletrônica da Polícia Civil, no site oficial da PCDF; depois um familiar vai à delegacia para completar.'),
  },
  BA: {
    status: 'unconfirmed',
    url: 'https://www.ba.gov.br/policiacivil/646/delegacia-virtual',
    note: msg('Há Delegacia Virtual, mas a página oficial não diz se ela aceita desaparecimento. Se não aceitar, vá à delegacia.'),
  },
};

/** Só abre link oficial: https e domínio de governo brasileiro. */
export function isOfficialGovUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && /(^|\.)gov\.br$/.test(parsed.hostname);
  } catch {
    return false;
  }
}

export function onlineReportFor(uf: string): OnlineReportInfo | null {
  const info = ONLINE_REPORT[uf as BrazilUf];
  if (!info) return null;
  if (info.url && !isOfficialGovUrl(info.url)) return { ...info, url: undefined };
  return info;
}

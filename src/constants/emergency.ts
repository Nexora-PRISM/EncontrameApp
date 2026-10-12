import { msg } from '@/lib/i18n-msg';

/** Emergência da Polícia Militar no Brasil (denúncias / ocorrências). */
export const POLICE_REPORT_PHONE = '190';

export type EmergencyLine = {
  number: string;
  name: string;
  /** Quando usar, em linguagem simples. */
  when: string;
  /** Linhas principais aparecem em destaque na folha "Pedir ajuda". */
  primary: boolean;
};

/**
 * Canais públicos e gratuitos do Brasil. O app só abre o discador do celular;
 * não há integração automática com nenhum deles.
 */
export const EMERGENCY_LINES: EmergencyLine[] = [
  {
    number: POLICE_REPORT_PHONE,
    name: msg('Polícia Militar'),
    when: msg('Você ou alguém está em perigo agora.'),
    primary: true,
  },
  {
    number: '180',
    name: msg('Central de Atendimento à Mulher'),
    when: msg('Violência contra a mulher. 24 horas, gratuito.'),
    primary: true,
  },
  {
    number: '100',
    name: msg('Disque Direitos Humanos'),
    when: msg('Violência ou risco contra criança ou adolescente.'),
    primary: true,
  },
  { number: '192', name: msg('SAMU'), when: msg('Emergência médica.'), primary: false },
  { number: '193', name: msg('Bombeiros'), when: msg('Resgate e incêndio.'), primary: false },
];

import { msg } from '@/lib/i18n-msg';

/**
 * Direitos de quem procura alguém. Cada item cita a lei federal de onde vem (texto conferido em 31/10/2026).
 * Informação geral: não substitui orientação jurídica.
 */
export const RIGHTS_ITEMS: { text: string; source: string }[] = [
  {
    text: msg('Não existe prazo de espera de 24 horas. A busca e a localização de pessoas desaparecidas são prioridade com caráter de urgência para o poder público.'),
    source: msg('Lei 13.812/2019, art. 3º'),
  },
  {
    text: msg('Ao receber a comunicação, a polícia deve adotar as providências para localizar a pessoa, e o desaparecimento é registrado imediatamente no Cadastro Nacional de Pessoas Desaparecidas.'),
    source: msg('Lei 13.812/2019, art. 8º'),
  },
  {
    text: msg('As investigações continuam até a pessoa ser localizada.'),
    source: msg('Lei 13.812/2019, art. 9º'),
  },
  {
    text: msg('Para crianças e adolescentes, a investigação começa imediatamente, com aviso a portos, aeroportos, Polícia Rodoviária e empresas de transporte.'),
    source: msg('Estatuto da Criança e do Adolescente, art. 208, § 2º (Lei 11.259/2005)'),
  },
];

import type { MaterialCommunityIcons } from '@expo/vector-icons';

import { msg } from '@/lib/i18n-msg';

/**
 * Conteúdo da Central de Apoio às Famílias. Fica no app (não depende da API).
 * Regra da Central de Ajuda: só orientar o que é verdade e o que o app faz hoje.
 */
export const SUPPORT_SECTIONS: {
  key: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  items: string[];
}[] = [
  {
    key: 'first-hours',
    title: msg('Nas primeiras horas'),
    icon: 'clock-alert-outline',
    items: [
      msg('Não espere: não existe prazo mínimo para comunicar um desaparecimento. A lei trata a busca como urgente.'),
      msg('Se houver risco imediato, ligue 190.'),
      msg('Registre o boletim de ocorrência na delegacia mais próxima ou na delegacia on-line, se o seu estado oferecer.'),
      msg('Para crianças e adolescentes, a investigação deve começar imediatamente.'),
      msg('Avise pessoas próximas: família, amigos e conhecidos.'),
      msg('Procure em hospitais e serviços de acolhimento da região.'),
    ],
  },
  {
    key: 'police-report',
    title: msg('Como registrar o boletim de ocorrência'),
    icon: 'file-document-outline',
    items: [
      msg('Leve um documento seu e, se tiver, um documento da pessoa.'),
      msg('Leve uma foto recente e nítida.'),
      msg('Informe o último local e o horário em que a pessoa foi vista.'),
      msg('Conte as roupas, as características e qualquer condição de saúde (isso é para a polícia, não para publicar).'),
      msg('Guarde o número do boletim: ele é pedido no cadastro do Encontra-me.'),
    ],
  },
  {
    key: 'scams',
    title: msg('Cuidado com golpes'),
    icon: 'alert-octagon-outline',
    items: [
      msg('Ninguém cobra para encontrar uma pessoa. Desconfie de pedidos de dinheiro.'),
      msg('Não pague nenhum "resgate" sem falar com a polícia.'),
      msg('Não publique seu endereço nem documentos nas redes.'),
      msg('Divulgue só o cartaz e o link oficiais do caso.'),
    ],
  },
  {
    key: 'found',
    title: msg('Quando a pessoa for encontrada'),
    icon: 'flag-checkered',
    items: [
      msg('Avise a polícia para atualizar o boletim de ocorrência.'),
      msg('Peça o encerramento do caso no Encontra-me, em "Pedir correção ou atualização", na página do caso.'),
      msg('Peça para apagarem cartazes e publicações antigas.'),
      msg('A privacidade da pessoa encontrada vem primeiro: não divulgue onde ela está nem o que aconteceu.'),
    ],
  },
];

/** Lista do que reunir. A marcação fica salva só neste aparelho. */
export const SUPPORT_CHECKLIST: { key: string; label: string }[] = [
  { key: 'photo', label: msg('Foto recente e nítida') },
  { key: 'clothes', label: msg('Roupas que a pessoa usava') },
  { key: 'traits', label: msg('Altura, cabelo, olhos e sinais') },
  { key: 'last-seen', label: msg('Último local e horário em que foi vista') },
  { key: 'phone', label: msg('Celular e redes sociais da pessoa') },
  { key: 'places', label: msg('Lugares que ela costuma frequentar') },
  { key: 'contacts', label: msg('Amigos e contatos próximos') },
  { key: 'health', label: msg('Condições de saúde e remédios (só para a polícia)') },
  { key: 'report', label: msg('Número do boletim de ocorrência') },
];

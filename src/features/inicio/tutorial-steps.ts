import { msg } from '@/lib/i18n-msg';

/**
 * Passo a passo de como usar o app (aparece na primeira vez e pelo botão "?" do Início).
 * Frases curtas e diretas, pensadas para quem nunca usou o app, pessoas idosas e leigas.
 * Cada passo mostra, no desenho, o mesmo botão que a pessoa vai encontrar na tela.
 * Ao mudar uma funcionalidade citada aqui, atualize o texto (regra de honestidade da interface).
 */
export type TutorialIllustration =
  | 'welcome'
  | 'alerts'
  | 'map'
  | 'sighting'
  | 'emergency'
  | 'bottom-bar'
  | 'start';

export type TutorialStep = {
  illustration: TutorialIllustration;
  title: string;
  message: string;
};

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    illustration: 'welcome',
    title: msg('Oi! Eu sou a Sofia.'),
    message: msg(
      'Vou te mostrar, em poucos passos, como usar o Encontra-me. Se já conhece, toque em "Pular".',
    ),
  },
  {
    illustration: 'alerts',
    title: msg('Veja quem está desaparecido perto de você'),
    message: msg(
      'No alto da tela ficam os alertas. Toque em um cartão para ver a foto e os detalhes da pessoa.',
    ),
  },
  {
    illustration: 'map',
    title: msg('Use o mapa'),
    message: msg(
      'Cada foto no mapa é uma pessoa procurada. Os botões coloridos mostram só crianças, adultos ou idosos.',
    ),
  },
  {
    illustration: 'sighting',
    title: msg('Viu alguém? Avise.'),
    message: msg(
      'Na página da pessoa, toque em "Vi essa pessoa por perto" e marque onde você viu. Isso ajuda a família.',
    ),
  },
  {
    illustration: 'emergency',
    title: msg('Em perigo? Botão vermelho.'),
    message: msg(
      'O botão "Pedir ajuda" fica sempre embaixo, no meio. Ele mostra os números de emergência, como o 190. O app não chama a polícia sozinho.',
    ),
  },
  {
    illustration: 'bottom-bar',
    title: msg('Cadastrar e Menu'),
    message: msg(
      'Para comunicar um desaparecimento, toque em "Cadastrar". No "Menu" ficam a Sofia, o seu perfil, as configurações e a ajuda.',
    ),
  },
  {
    illustration: 'start',
    title: msg('Pronto! Como você quer começar?'),
    message: msg('Para ver este passo a passo de novo, toque no "?" no alto da tela.'),
  },
];

export const TUTORIAL_LAST_STEP = TUTORIAL_STEPS.length - 1;

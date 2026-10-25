import { env } from '@/lib/env';
import { msg } from '@/lib/i18n-msg';

/**
 * Passo a passo de como usar o app (aparece na primeira vez e pelo Menu, em "Como usar o app").
 * Frases curtas e diretas, pensadas para quem nunca usou o app, pessoas idosas e leigas.
 * Cada passo mostra, no desenho, o mesmo botão que a pessoa vai encontrar na tela.
 * Ao mudar uma funcionalidade citada aqui, atualize o texto (regra de honestidade da interface).
 */
export type TutorialIllustration =
  | 'welcome'
  | 'alerts'
  | 'map'
  | 'safety'
  | 'sighting'
  | 'emergency'
  | 'bottom-bar'
  | 'start';

export type TutorialStep = {
  illustration: TutorialIllustration;
  title: string;
  message: string;
};

const ALL_STEPS: readonly TutorialStep[] = [
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
      'No alto da tela ficam as pessoas procuradas perto de você. Os dois botões ao lado do título trocam entre foto, com o nome embaixo, e cartão. Arraste o mapa para baixo para ver a lista e role para carregar mais. Toque para abrir o caso.',
    ),
  },
  {
    illustration: 'map',
    title: msg('Use o mapa'),
    message: msg(
      'Cada foto no mapa é uma pessoa procurada: toque nela para ver um resumo. Os botões no alto filtram por idade. A borda usa a cor do tema e o botão escolhido fica preenchido.',
    ),
  },
  {
    illustration: 'safety',
    title: msg('Avisos de segurança'),
    message: msg(
      'Os losangos amarelos são avisos da comunidade, como "rua deserta à noite". Toque para ver e confirmar. Para avisar sobre um lugar, use "Adicionar aviso".',
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
    message: msg('Para ver este passo a passo de novo, abra o Menu e toque em "Como usar o app".'),
  },
];

/** O passo dos avisos só aparece quando o recurso está ligado nesta versão do app. */
export const TUTORIAL_STEPS: readonly TutorialStep[] = ALL_STEPS.filter(
  (step) => step.illustration !== 'safety' || env.safetyNotesEnabled,
);

export const TUTORIAL_LAST_STEP = TUTORIAL_STEPS.length - 1;

import { msg } from '@/lib/i18n-msg';

/**
 * Regras de uso e resumo de privacidade exibidos no app (/regras).
 * Regra: só afirmar o que o app faz de verdade. A política completa está em
 * `public/privacidade/index.html`. Os Termos de Uso completos ainda não foram publicados.
 */
export type RulesSection = {
  id: string;
  title: string;
  items: string[];
};

export const RULES_INTRO =
  msg('O Encontra-me existe para ajudar a encontrar pessoas desaparecidas, com prioridade para crianças e mulheres. Para funcionar com segurança, todas as pessoas que usam o app seguem estas regras.');

export const RULES_SECTIONS: RulesSection[] = [
  {
    id: 'comunidade',
    title: msg('Regras da comunidade'),
    items: [
      msg('Publique só informações verdadeiras e que você conhece.'),
      msg('Cadastre uma pessoa apenas se você tem vínculo com ela ou autorização da família. Para crianças e adolescentes, informe o número do boletim de ocorrência.'),
      msg('Não use o app para procurar alguém que se afastou para se proteger, nem para perseguir, vigiar ou expor qualquer pessoa.'),
      msg('Não publique endereço de casa, escola, rotina ou documentos.'),
      msg('Em avistamentos, informe só o que você viu. Em perigo, ligue 190.'),
      msg('Não peça nem ofereça dinheiro por informações. Denuncie golpes.'),
      msg('Respeite as famílias: nada de ofensas, acusações sem prova, assédio ou discriminação.'),
      msg('Viu algo errado ou abusivo? Denuncie o cadastro, a mensagem do grupo ou o aviso de segurança. Dá para bloquear a conta de quem publicou: o conteúdo dela some da sua lista.'),
    ],
  },
  {
    id: 'responsabilidade',
    title: msg('Responsabilidade'),
    items: [
      msg('Cada cadastro, avistamento e mensagem fica ligado à conta de quem publicou.'),
      msg('Cadastros feitos sem conta ficam só neste aparelho. Eles só são enviados depois que alguém entra na conta, revisa os dados e confirma a declaração — e passam a ficar ligados a essa conta.'),
      msg('Conteúdo falso, golpe, assédio ou uso malicioso pode ser removido e levar ao bloqueio da conta.'),
      msg('Quem publica informações falsas pode responder civil e criminalmente.'),
      msg('Os dados de identificação podem ser entregues às autoridades quando houver ordem judicial ou outra obrigação legal. Por isso, o uso do app não é anônimo.'),
    ],
  },
  {
    id: 'dados',
    title: msg('Seus dados (resumo)'),
    items: [
      msg('Conta: nome, CPF, e-mail, celular e CEP — para identificar quem usa o app e apurar abusos.'),
      msg('Seu CPF não aparece para outras pessoas no app.'),
      msg('Cadastros de pessoas: foto e características, para ajudar na busca.'),
      msg('Localização: usada só com o app aberto, para mostrar casos próximos, marcar avistamentos e, quando você pede, mandar sua localização a um contato.'),
      msg('Contatos de confiança: ficam salvos só neste aparelho e não vão para o servidor.'),
      msg('Digital ou rosto: conferidos pelo próprio celular. O app não recebe sua biometria.'),
      msg('Você pode pedir acesso, correção ou exclusão dos seus dados (LGPD) pela Central de Ajuda.'),
    ],
  },
];

export const RULES_LEGAL_NOTE =
  msg('A Política de Privacidade completa está publicada. Os Termos de Uso completos ainda estão em revisão jurídica.');

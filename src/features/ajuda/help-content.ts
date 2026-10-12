import type { MaterialCommunityIcons } from '@expo/vector-icons';

import { msg } from '@/lib/i18n-msg';
import { formatBRL, PREMIUM_PLAN } from '@/lib/premium-plan';

/**
 * Perguntas frequentes da Central de Ajuda.
 * Regra: só descrever o que o app faz HOJE. Recurso que ainda não existe é dito como tal.
 * Ao lançar uma funcionalidade nova, atualize a resposta correspondente aqui.
 */
export type HelpCategoryId =
  | 'protecao'
  | 'inicio'
  | 'alertas'
  | 'relatos'
  | 'emergencia'
  | 'rotas'
  | 'conta'
  | 'privacidade'
  | 'golpes'
  | 'sofia'
  | 'premium';

export type HelpCategory = {
  id: HelpCategoryId;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export type HelpArticle = {
  id: string;
  category: HelpCategoryId;
  question: string;
  answer: string;
  /** Palavras extras para a busca (sinônimos). */
  keywords?: string;
};

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: 'protecao', title: msg('Crianças e mulheres'), icon: 'heart-outline' },
  { id: 'inicio', title: msg('Primeiros passos'), icon: 'compass-outline' },
  { id: 'alertas', title: msg('Pessoas desaparecidas'), icon: 'account-search-outline' },
  { id: 'relatos', title: msg('Avistamentos e mapa'), icon: 'map-marker-radius-outline' },
  { id: 'emergencia', title: msg('Emergência'), icon: 'phone-alert' },
  { id: 'rotas', title: msg('Rotas e círculo familiar'), icon: 'map-marker-path' },
  { id: 'conta', title: msg('Cadastro, login e senha'), icon: 'account-key-outline' },
  { id: 'privacidade', title: msg('Privacidade e localização'), icon: 'shield-lock-outline' },
  { id: 'golpes', title: msg('Segurança e golpes'), icon: 'alert-octagon-outline' },
  { id: 'sofia', title: msg('Sofia e grupo de apoio'), icon: 'robot-happy-outline' },
  { id: 'premium', title: msg('Premium e pagamentos'), icon: 'star-outline' },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'prioridade',
    category: 'protecao',
    question: msg('O Encontra-me é só para crianças e mulheres?'),
    answer:
      msg('Não. Qualquer pessoa pode usar o app e cadastrar quem desapareceu. A proteção de crianças e de mulheres é uma prioridade do projeto, por isso há atalhos e orientações específicas para elas.'),
    keywords: msg('público todos prioridade'),
  },
  {
    id: 'crianca-desapareceu',
    category: 'protecao',
    question: msg('Uma criança desapareceu. O que faço primeiro?'),
    answer:
      msg('Ligue 190 e procure a delegacia mais próxima imediatamente. Não é preciso esperar 24 horas: a lei determina que a busca por crianças e adolescentes desaparecidos comece logo após a comunicação. Depois, cadastre a criança no app com uma foto recente.'),
    keywords: msg('criança filho filha menor desaparecida 24 horas'),
  },
  {
    id: 'ligue-180',
    category: 'protecao',
    question: msg('Estou sofrendo violência. Para onde ligo?'),
    answer:
      msg('Em perigo agora, ligue 190. Para orientação e denúncia de violência contra a mulher, ligue 180 (Central de Atendimento à Mulher, 24 horas e gratuito). Os dois números estão no botão vermelho "Pedir ajuda".'),
    keywords: msg('violência doméstica mulher 180 agressão'),
  },
  {
    id: 'medida-protetiva',
    category: 'protecao',
    question: msg('O que é medida protetiva?'),
    answer:
      msg('É uma proteção que a Justiça pode dar à mulher em situação de violência doméstica, como afastar o agressor. O pedido pode ser feito na delegacia, de preferência na Delegacia da Mulher (Lei Maria da Penha).'),
    keywords: msg('maria da penha protetiva delegacia mulher'),
  },
  {
    id: 'disque-100',
    category: 'protecao',
    question: msg('Como denuncio risco ou violência contra uma criança?'),
    answer:
      msg('Ligue 100 (Disque Direitos Humanos), gratuito. Se a criança estiver em perigo agora, ligue 190. Você também pode procurar o Conselho Tutelar da sua cidade.'),
    keywords: msg('criança abuso violência conselho tutelar 100'),
  },
  {
    id: 'foto-crianca',
    category: 'protecao',
    question: msg('Que cuidados tomar ao divulgar uma criança?'),
    answer:
      msg('Use uma foto recente só do rosto, sem uniforme ou nome da escola. Não publique endereço, rotina, escola nem documentos. Ao divulgar em redes sociais, inclua só o essencial: nome, foto, cidade e data.'),
    keywords: msg('foto imagem criança exposição escola'),
  },
  {
    id: 'o-que-e',
    category: 'inicio',
    question: msg('O que é o Encontra-me?'),
    answer:
      msg('É um aplicativo de mobilização social para ajudar a encontrar pessoas desaparecidas. Você pode ver casos perto de você no mapa, cadastrar uma pessoa desaparecida e informar onde viu alguém. O Encontra-me é um produto da Nexora Prism.'),
    keywords: msg('sobre app objetivo'),
  },
  {
    id: 'ver-proximos',
    category: 'inicio',
    question: msg('Como vejo pessoas desaparecidas perto de mim?'),
    answer:
      msg('Na tela Início, permita o acesso à localização. O mapa e o carrossel mostram casos próximos. Para ver a busca e a lista, arraste o mapa para baixo. Dá para filtrar por cidade, estado, bairro, idade e situação. O menu na barra inferior também abre "Pessoas desaparecidas".'),
    keywords: msg('mapa lista perto localização filtro'),
  },
  {
    id: 'rever-tutorial',
    category: 'inicio',
    question: msg('Como vejo a apresentação do app de novo?'),
    answer:
      msg('Vá em Configurações > Aparência e acessibilidade > "Ver a apresentação novamente". Ela aparece na próxima vez que você abrir o Início.'),
    keywords: msg('tutorial apresentação onboarding'),
  },
  {
    id: 'tema',
    category: 'inicio',
    question: msg('Como deixo o app claro ou escuro?'),
    answer:
      msg('No menu do Início (ícone de três linhas na barra inferior), em "Tema do app", escolha Auto, Claro ou Escuro. A mesma opção fica em Configurações › Aparência e acessibilidade. Auto (automático) acompanha o modo do celular.'),
    keywords: msg('tema escuro claro modo noturno dark aparência cores'),
  },
  {
    id: 'idioma',
    category: 'inicio',
    question: msg('Como mudo o idioma do app?'),
    answer:
      msg('No menu do Início (barra inferior), em "Idioma", toque em PT (português), EN (inglês), ES (espanhol) ou Auto. A mesma opção fica em Configurações › Idioma. Auto segue o idioma do celular; se ele estiver em outro idioma, o app aparece em inglês. Não são traduzidos: o que as pessoas escrevem nos casos e nas conversas e as respostas da Sofia. Os números de emergência continuam os do Brasil (190, 180, 100, 192 e 193).'),
    keywords: msg('idioma língua linguagem inglês espanhol português tradução english español language'),
  },
  {
    id: 'cadastrar',
    category: 'alertas',
    question: msg('Como cadastro uma pessoa desaparecida?'),
    answer:
      msg('Toque em "Cadastrar" na barra inferior ou abra o menu e escolha "Cadastrar uma pessoa". Preencha o nome completo, a localidade onde a pessoa foi vista pela última vez, a idade e um telefone de contato. No fim do formulário, informe seu vínculo com a pessoa e confirme a declaração de veracidade. Foto, cidade, estado, país e características físicas são opcionais, mas ajudam muito.'),
    keywords: msg('novo alerta cadastro registrar'),
  },
  {
    id: 'divulgar-caso',
    category: 'alertas',
    question: msg('Como divulgo um caso?'),
    answer:
      msg('Abra o caso e toque em "Divulgar este caso". O texto pronto — nome, idade, onde e quando a pessoa foi vista e características — abre no compartilhamento do celular para você mandar por WhatsApp ou redes sociais. Ele não inclui telefone nem endereço.'),
    keywords: msg('divulgar compartilhar whatsapp redes sociais espalhar'),
  },
  {
    id: 'cadastrar-sem-conta',
    category: 'alertas',
    question: msg('Posso cadastrar sem ter conta?'),
    answer:
      msg('Sim, mas o cadastro fica salvo só neste aparelho e aparece como "Cadastro pendente" — ninguém mais o vê. Para enviá-lo, entre na sua conta e toque em "Revisar e enviar" no próprio cadastro ou em Meu perfil: você confere os dados, completa o que faltar e confirma a declaração. Nada é enviado sem essa revisão, nem quando alguém entra numa conta neste aparelho. Você pode apagar esses cadastros em Configurações > Privacidade e localização.'),
    keywords: msg('offline visitante pendente revisar enviar'),
  },
  {
    id: 'vinculo-bo',
    category: 'alertas',
    question: msg('Por que o app pede meu vínculo e o boletim de ocorrência?'),
    answer:
      msg('Para proteger quem está desaparecido e evitar cadastros falsos ou feitos para perseguir alguém — por exemplo, uma mulher que se afastou para se proteger. Você informa seu vínculo com a pessoa e confirma que as informações são verdadeiras. Para crianças e adolescentes (menos de 18 anos), o número do boletim de ocorrência é obrigatório; para adultos, é recomendado. Não é preciso esperar 24 horas para registrar o boletim.'),
    keywords: msg('boletim ocorrência bo vínculo declaração menor criança adolescente'),
  },
  {
    id: 'status',
    category: 'alertas',
    question: msg('O que significam as situações de cada caso?'),
    answer:
      msg('Cada caso mostra uma situação, como Pendente, Procurado, Alerta ou Encontrado. "Cadastro pendente" indica um cadastro que ainda está só no seu aparelho e não foi enviado.'),
    keywords: msg('status pendente procurado alerta encontrado'),
  },
  {
    id: 'encerrar-caso',
    category: 'alertas',
    question: msg('A pessoa foi encontrada. Como encerro o caso?'),
    answer:
      msg('Abra o caso e, no fim da página, toque em "Pedir correção ou atualização". Seu app de e-mail abre com a identificação do caso: conte o que mudou e envie. O pedido só chega à equipe quando você enviar o e-mail. O encerramento direto pelo app ainda não existe.'),
    keywords: msg('encontrada localizada encerrar fechar'),
  },
  {
    id: 'avistamento',
    category: 'relatos',
    question: msg('Como informo que vi uma pessoa?'),
    answer:
      msg('Abra o caso da pessoa e toque para informar um avistamento. Você pode usar sua localização atual, digitar o endereço ou ajustar o ponto no mapa. É preciso estar com a conta conectada.'),
    keywords: msg('vi avistei relato informar'),
  },
  {
    id: 'avistamento-confirmado',
    category: 'relatos',
    question: msg('Um avistamento significa que a pessoa foi encontrada?'),
    answer:
      msg('Não. Um avistamento é uma informação enviada por alguém da comunidade e não é uma confirmação. Em situação urgente, ligue para a polícia (190).'),
    keywords: msg('confirmado verdade verificado'),
  },
  {
    id: 'historico-mapa',
    category: 'relatos',
    question: msg('O que é o histórico no mapa de um caso?'),
    answer:
      msg('São os locais informados para aquela pessoa, em ordem de data. O ponto mais recente aparece destacado.'),
    keywords: msg('histórico trajeto rastro'),
  },
  {
    id: 'botao-telefone',
    category: 'emergencia',
    question: msg('O que faz o botão vermelho "Pedir ajuda"?'),
    answer:
      msg('Ele fica no centro da barra inferior. Ao tocar, você pode acionar o alerta de emergência (com contagem de 10 segundos), escolher para quem ligar (190, 180, 100, 192 ou 193), mandar sua localização a alguém de confiança ou comunicar um desaparecimento. A ligação é feita pelo seu celular, como uma chamada comum: o aplicativo não avisa a polícia sozinho.'),
    keywords: msg('emergência 190 polícia ligar socorro botão vermelho pânico'),
  },
  {
    id: 'numeros-emergencia',
    category: 'emergencia',
    question: msg('Quais números de emergência posso usar?'),
    answer:
      msg('190 — Polícia Militar. 180 — Central de Atendimento à Mulher. 100 — Disque Direitos Humanos (crianças e adolescentes). 192 — SAMU. 193 — Bombeiros. 188 — CVV (apoio emocional, 24 horas). As ligações são gratuitas.'),
    keywords: msg('samu bombeiros cvv telefone'),
  },
  {
    id: 'botao-panico',
    category: 'emergencia',
    question: msg('Como funciona o alerta de emergência?'),
    answer:
      msg('Em "Pedir ajuda", toque em "Acionar alerta de emergência". Começa uma contagem de 10 segundos com um botão grande para cancelar — assim um toque sem querer não vira alerta. Ao fim, o telefone abre com o 190 (você toca em ligar) e sua localização fica pronta para mandar aos seus contatos de confiança por WhatsApp ou SMS. O envio automático do alerta para o Encontra-me só aparece quando estiver disponível, e a tela só diz que ele foi recebido depois da confirmação do servidor.'),
    keywords: msg('pânico alerta contagem 10 segundos cancelar socorro contatos'),
  },
  {
    id: 'contatos-confianca',
    category: 'emergencia',
    question: msg('O que são os contatos de confiança?'),
    answer:
      msg('São até 5 pessoas para quem você manda sua localização com um toque, por WhatsApp ou SMS. Cadastre em Configurações › Emergência › Contatos de confiança. A lista fica salva só neste aparelho e não vai para o servidor. O app abre o WhatsApp ou o SMS com a mensagem pronta: ela só chega quando você toca em enviar.'),
    keywords: msg('contatos confiança família avisar whatsapp sms'),
  },
  {
    id: 'compartilhar-localizacao',
    category: 'emergencia',
    question: msg('Como mando minha localização para alguém?'),
    answer:
      msg('Em "Pedir ajuda", toque em "Compartilhar minha localização" (também em Configurações › Emergência). O app pega sua posição atual e monta uma mensagem com o link do mapa. Escolha um contato de confiança (WhatsApp ou SMS) ou outro aplicativo do celular. Sem permissão de localização, a mensagem vai sem o link.'),
    keywords: msg('localização compartilhar mandar onde estou mapa whatsapp'),
  },
  {
    id: 'atalho-emergencia',
    category: 'emergencia',
    question: msg('Posso pedir ajuda sem abrir o app?'),
    answer:
      msg('Sim, no Android. Entre na sua conta, vá em Configurações › Emergência e ative "Atalho na tela inicial". Depois toque em "Adicionar à tela inicial" e confirme na janela do Android. O ícone vermelho "Pedir ajuda" abre direto a tela de emergência, onde você escolhe o número com um toque. Se o seu celular não adicionar o ícone sozinho, toque e segure o ícone do Encontra-me e arraste "Pedir ajuda" para a tela inicial.'),
    keywords: msg('atalho widget tela inicial sem abrir rápido botão emergência'),
  },
  {
    id: 'atalho-seguranca',
    category: 'emergencia',
    question: msg('O atalho liga ou envia algo sozinho?'),
    answer:
      msg('Não. O atalho só abre a tela "Pedir ajuda". Nada é ligado ou enviado sem você tocar no número ou confirmar a mensagem. Ligar para 190, 180 ou 100 e mandar sua localização nunca exigem login. Para desligar o atalho, vá em Configurações › Emergência.'),
    keywords: msg('atalho seguro acidental desativar'),
  },
  {
    id: 'rotas',
    category: 'rotas',
    question: msg('Posso acompanhar meu trajeto até chegar em casa?'),
    answer:
      msg('O monitoramento ampliado de trajetos fará parte do plano Premium e ainda não está disponível. Quando for lançado, só funcionará com sua permissão e terminará assim que você chegar ao destino. Mandar sua localização atual para um contato já funciona e é grátis.'),
    keywords: msg('rota trajeto acompanhar caminho'),
  },
  {
    id: 'circulo',
    category: 'rotas',
    question: msg('O que é o círculo familiar?'),
    answer:
      msg('É um recurso futuro do plano Premium para compartilhar sua segurança com pessoas de confiança, sempre com convite e aceite de cada uma. Ele ainda não está disponível e nunca permitirá acompanhar alguém sem que essa pessoa saiba e concorde.'),
    keywords: msg('família círculo compartilhar'),
  },
  {
    id: 'criar-conta',
    category: 'conta',
    question: msg('Como crio minha conta?'),
    answer:
      msg('Na tela de entrada, escolha criar conta. São pedidos nome, CPF, e-mail, celular e CEP, o aceite das regras de uso e, depois, uma senha. Também é possível começar com sua conta Google. Seu CPF não aparece para outras pessoas no app.'),
    keywords: msg('cadastro registrar criar conta google'),
  },
  {
    id: 'regras',
    category: 'conta',
    question: msg('Quais são as regras de uso?'),
    answer:
      msg('Estão em Configurações > Regras de uso e privacidade. Em resumo: cadastre só casos reais, com vínculo ou autorização da família; não use o app para expor ou perseguir ninguém; e saiba que o uso não é anônimo — seus dados de cadastro identificam sua conta e podem ser usados para apurar abusos. Os Termos de Uso e a Política de Privacidade completos estão em revisão jurídica.'),
    keywords: msg('regras termos uso política privacidade responsabilidade'),
  },
  {
    id: 'esqueci-senha',
    category: 'conta',
    question: msg('Esqueci minha senha. E agora?'),
    answer:
      msg('A recuperação de senha pelo próprio app ainda não está disponível. Use "Falar com o suporte", escolha "Cadastro, login ou senha" e escreva o e-mail da sua conta. Nunca envie sua senha para ninguém, nem para o suporte.'),
    keywords: msg('senha esqueci recuperar acesso'),
  },
  {
    id: 'biometria',
    category: 'conta',
    question: msg('Posso entrar com a digital ou o rosto?'),
    answer:
      msg('Sim, no celular. Ative em Configurações > Segurança > "Entrar com biometria". Com ela ligada, ao sair o app só trava a conta; para sair de vez, desligue a biometria antes.'),
    keywords: msg('digital face id biometria'),
  },
  {
    id: 'excluir-conta',
    category: 'conta',
    question: msg('Como excluo minha conta?'),
    answer:
      msg('Em Configurações > Minha conta, toque em "Solicitar exclusão da conta". Seu app de e-mail abre com o pedido pronto; a solicitação só chega até nós quando você enviar o e-mail.'),
    keywords: msg('excluir apagar conta deletar'),
  },
  {
    id: 'localizacao',
    category: 'privacidade',
    question: msg('Quando o app usa minha localização?'),
    answer:
      msg('Só enquanto o app está aberto: para mostrar casos perto de você e, quando você pede, para marcar o local de um avistamento ou mandar sua localização a um contato. O Encontra-me não acompanha sua localização em segundo plano.'),
    keywords: msg('gps localização rastreio segundo plano'),
  },
  {
    id: 'permissoes',
    category: 'privacidade',
    question: msg('Como mudo as permissões de localização, câmera ou fotos?'),
    answer:
      msg('Em Configurações > Privacidade e localização, toque em "Abrir ajustes do aparelho". Lá você liga ou desliga cada permissão do Encontra-me.'),
    keywords: msg('permissão câmera fotos galeria'),
  },
  {
    id: 'meus-dados',
    category: 'privacidade',
    question: msg('Como peço acesso ou correção dos meus dados?'),
    answer:
      msg('Use "Falar com o suporte" e escolha "Privacidade e meus dados". Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir acesso, correção e exclusão dos seus dados pessoais.'),
    keywords: msg('lgpd dados pessoais acesso correção'),
  },
  {
    id: 'golpe-dinheiro',
    category: 'golpes',
    question: msg('Alguém pediu dinheiro dizendo ter informações. É golpe?'),
    answer:
      msg('Desconfie. O Encontra-me nunca pede pagamento para divulgar um caso ou passar informações. Não faça depósitos nem PIX para desconhecidos, não envie códigos recebidos por SMS e procure a polícia. Você também pode nos avisar em "Denunciar conteúdo ou golpe".'),
    keywords: msg('golpe pix dinheiro extorsão resgate'),
  },
  {
    id: 'denunciar-cadastro',
    category: 'golpes',
    question: msg('Como denuncio um cadastro falso ou que coloca alguém em risco?'),
    answer:
      msg('Abra o caso e, no fim da página, toque em "Denunciar este cadastro". Seu app de e-mail abre com a identificação do caso: conte o motivo e envie. Use também se você é a pessoa cadastrada, está em segurança e não quer ser localizada. Em perigo, ligue 190.'),
    keywords: msg('denúncia denunciar falso remover retirar sou eu perseguição'),
  },
  {
    id: 'golpe-dados',
    category: 'golpes',
    question: msg('Como me proteger ao divulgar um caso?'),
    answer:
      msg('Evite publicar endereço de casa, rotina da família e documentos. Use um telefone de contato que você possa atender e confirme qualquer informação recebida com a polícia antes de agir.'),
    keywords: msg('segurança exposição endereço'),
  },
  {
    id: 'sofia',
    category: 'sofia',
    question: msg('Quem é a Sofia?'),
    answer:
      msg('A Sofia é uma inteligência artificial para conversar e oferecer apoio. Ela não substitui psicólogo, médico ou atendimento de emergência. Em crise, ligue 188 (CVV) ou 192 (SAMU).'),
    keywords: msg('ia inteligência artificial chat apoio'),
  },
  {
    id: 'grupo',
    category: 'sofia',
    question: msg('O que é o grupo de apoio?'),
    answer:
      msg('É uma conversa entre pessoas que usam o app, para troca de apoio. Não compartilhe dados pessoais, endereço ou documentos no grupo.'),
    keywords: msg('grupo conversa comunidade'),
  },
  {
    id: 'premium',
    category: 'premium',
    question: msg('O Encontra-me é pago?'),
    answer:
      msg('Não. A busca de pessoas desaparecidas e as funções de emergência são gratuitas e vão continuar assim. O plano Premium está em preparação, com preço de referência de {price} por mês; a venda ainda não começou e nada é cobrado no app. O primeiro recurso Premium já pronto é o cadastro e a divulgação de pets desaparecidos. Veja o que é grátis e o que é Premium em Configurações › Premium.'),
    keywords: msg('premium assinatura pagamento preço grátis mensalidade'),
  },
  {
    id: 'premium-recursos',
    category: 'premium',
    question: msg('O que o Premium vai oferecer?'),
    answer:
      msg('Recursos extras de segurança e para pets: monitoramento ampliado de trajetos, com histórico das rotas; localização em tempo real com contatos autorizados; círculo de proteção familiar, sempre com aceite de cada pessoa; alertas personalizados; e, para pets, passeios com trajeto, histórico e avisos de atraso e afastamento, além da organização dos perfis dos animais. Hoje o recurso pronto é o cadastro de pets desaparecidos; os outros aparecem no app quando estiverem prontos. Sobre os passeios: o celular do tutor registra o trajeto enquanto está com ele — sem um rastreador no animal, o app não consegue localizá-lo sozinho.'),
    keywords: msg('premium recursos benefícios trajeto rota tempo real círculo família alertas pet passeio perfil'),
  },
  {
    id: 'pets',
    category: 'premium',
    question: msg('Posso cadastrar meu animal de estimação desaparecido?'),
    answer:
      msg('O cadastro de pets desaparecidos fará parte do plano Premium, que ainda não foi lançado. Quando estiver disponível, ele aparece no menu em "Pets desaparecidos": você publica o pet com foto, cidade e telefone, e qualquer pessoa pode divulgar o caso. Para sua segurança, não publique seu endereço completo.'),
    keywords: msg('pet cachorro gato animal bicho perdido premium'),
  },
];

/** Normaliza para busca sem acento e sem maiúsculas. */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Busca nas perguntas. Com `t`, procura também no texto traduzido (no idioma da tela) —
 * as palavras-chave em português continuam valendo.
 */
/** Valores que os textos da ajuda usam (ex.: {price}) — vêm da configuração, não ficam fixos no texto. */
export const HELP_TEXT_VARS = { price: formatBRL(PREMIUM_PLAN.monthlyPriceCents) };

export function searchHelp(
  query: string,
  t?: (text: string, vars?: Record<string, string | number>) => string,
): HelpArticle[] {
  const needle = normalizeSearch(query);
  if (!needle) return HELP_ARTICLES;
  const terms = needle.split(/\s+/);
  return HELP_ARTICLES.filter((article) => {
    const original = `${article.question} ${article.answer} ${article.keywords ?? ''}`;
    const translated = t
      ? ` ${t(article.question)} ${t(article.answer, HELP_TEXT_VARS)} ${article.keywords ? t(article.keywords) : ''}`
      : '';
    const haystack = normalizeSearch(original + translated);
    return terms.every((term) => haystack.includes(term));
  });
}

import { msg } from '@/lib/i18n-msg';

/**
 * Título da aba do navegador (web) por rota, indexado pelo primeiro segmento da URL.
 * Rota nova sem título aqui fica só com "Encontra-me". Nunca use dados da pessoa (nome, idade):
 * o título vai para o histórico e para a lista de abas.
 */
const PAGE_TITLES: Readonly<Record<string, string>> = {
  login: msg('Entrar'),
  signup: msg('Criar uma conta'),
  'signup-password': msg('Criar uma conta'),
  inicio: msg('Início'),
  'cadastrar-pessoa': msg('Cadastrar pessoa'),
  'pessoas-proximas': msg('Pessoas próximas'),
  'pessoas-desaparecidas': msg('Pessoas desaparecidas'),
  pessoa: msg('Pessoa desaparecida'),
  chat: msg('Conversar com a Sofia'),
  'sofia-welcome': msg('Conversar com a Sofia'),
  'sofia-theme': msg('Personalizar Sofia'),
  'sofia-perfil': msg('Sofia'),
  exercises: msg('Exercícios rápidos'),
  'grupo-chat': msg('Grupo de apoio'),
  perfil: msg('Meu perfil'),
  configuracoes: msg('Configurações'),
  ajuda: msg('Ajuda e suporte'),
  sobre: msg('Sobre o app'),
  'pedir-ajuda': msg('Pedir ajuda'),
  regras: msg('Regras de uso e privacidade'),
  'alerta-emergencia': msg('Alerta de emergência'),
  'compartilhar-localizacao': msg('Compartilhar localização'),
  'contatos-confianca': msg('Contatos de confiança'),
  'aviso-seguranca': msg('Novo aviso de segurança'),
};

/** Título da página em português (chave de tradução), ou `null` na abertura e em rotas sem título. */
export function pageTitleFor(pathname: string): string | null {
  const segment = pathname.split('/').find(Boolean);
  return segment ? (PAGE_TITLES[segment] ?? null) : null;
}

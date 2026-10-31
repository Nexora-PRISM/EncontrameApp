# Novidades (branch `evolucao-novidades`)

Linha separada, criada em 31/10/2026 a partir da `evolucao-revisao-auditoria` (commit `7f92be8`). Nada daqui foi
publicado: sem pull request, merge, deploy, loja ou EAS Update. Integrar e publicar ficam com o dono do app.

O backend correspondente está na API em Node.js, branch `api-node-novidades` do repositório da API (privado).

---

## 1. Nossos apoiadores

Área institucional para reconhecer empresas e organizações que apoiam o projeto. Variável:
`EXPO_PUBLIC_ENABLE_SUPPORTERS` (vazia: ligada em dev com empresas **fictícias**, desligada em produção).

**Onde aparece**

- **Fim da lista do Início**: ao abrir a lista de alertas (arrastar o mapa para baixo), depois das pessoas. No
  computador, no fim da lista lateral "Pessoas próximas". Nunca acima dos casos.
- **Sobre o app**, depois dos documentos.
- **Menu › Apoio › Nossos apoiadores** e a página **`/apoiadores`**, com todos os publicados agrupados em
  Patrocinadores, Parceiros e Apoiadores, nome e domínio do site, e "Quer apoiar o Encontra-me?" (abre o e-mail
  com a mensagem pronta; nada é enviado sozinho).
- A seção some sozinha quando a variável está desligada, quando a API não responde ou quando não há marca publicada.

**Visual.** Título discreto "NOSSOS APOIADORES" entre filetes, o texto de apresentação pedido, grade de logotipos em
quadros claros (2 colunas no celular, 3 a 4 no tablet, 5 no computador), logotipo inteiro com `contain` (sem
distorção), sem logotipo aparece o nome. Entrada suave em fade, que o sistema desliga com "reduzir movimento". No
tema escuro o quadro continua claro, para a marca aparecer com as cores originais.

**Links externos.** Só `https`. Antes de abrir, o app pergunta "Abrir o site de …?" e mostra o domínio.

**Administração (Painel da equipe › Institucional › Nossos apoiadores)** — não é um painel novo; usa o acesso da
equipe que já existe (contas comuns veem "Esta área é só para a equipe").

- Lista com logotipo, categoria, domínio, situação ("Publicado", "No Início") e a autorização ("Autorização
  confirmada em …" ou "Sem autorização da marca").
- Atalhos: Editar, Publicar / Tirar do ar, Mostrar no Início / Tirar do Início, subir e descer na ordem.
- Formulário: nome, site oficial, categoria (com explicação; nenhuma depende de valor), logotipo (escolher, trocar,
  remover, com pré-visualização), **Autorização confirmada** + "Onde está a autorização", Publicar no app, Mostrar
  no Início e no Sobre, Excluir (com confirmação).
- **Publicar exige a autorização confirmada**, no app e na API. Desmarcar a autorização tira a marca do ar.
- Logotipo: PNG, JPG ou WebP, até 300 KB, tipo conferido pelo conteúdo do arquivo no app e de novo na API; sem SVG.
  No celular vem da galeria, sem recorte nem recompressão, para preservar transparência e proporção.

**Dados de demonstração.** Só nomes fictícios ("Empresa Exemplo A", "Instituto Exemplo B"…), sem logotipo de marca
real, e a tela avisa que são fictícios. Nenhuma das empresas citadas como exemplo no pedido foi cadastrada.

**Arquivos**

| Situação | Arquivo |
|---|---|
| Criado | `src/lib/supporter-rules.ts` (regras sem dependências) e `tests/supporter-rules.test.mjs` |
| Criado | `src/lib/supporter-labels.ts` (categorias e texto de apresentação) |
| Criado | `src/services/supporters/` (tipos, repositório, mock fictício, axios, hooks) |
| Criado | `src/components/supporters-grid.tsx` (grade responsiva reutilizada em todas as telas) |
| Criado | `src/features/apoiadores/` (seção resumida, página, abertura de site) e `src/pages/apoiadores/index.tsx` |
| Criado | `src/features/equipe/apoiadores-admin.controller.ts`, `apoiador-form.controller.ts` e as duas seções |
| Criado | `src/pages/equipe/apoiadores/index.tsx` e `src/pages/equipe/apoiadores/[id]/index.tsx` (`novo` cadastra) |
| Alterado | `src/lib/env.ts` (`supportersEnabled`), `.env.example` |
| Alterado | `src/constants/brand.ts` e `src/global.css` (tokens `logoTile` e `onLogoTile`) |
| Alterado | `src/lib/use-photo-picker.ts` (modo logotipo opcional; aviso em KB quando o limite é menor que 1 MB) |
| Alterado | Início: `inicio-alerts-section.tsx` e `inicio-people-sidebar-section.tsx` (rodapé da lista), menu e `home-shell.controller.ts` |
| Alterado | `src/pages/sobre/index.tsx`, `src/pages/equipe/index.tsx`, `src/features/equipe/equipe.controller.ts` |
| Alterado | `src/features/ajuda/help-content.ts` (pergunta "Quem são os apoiadores", só com o recurso ligado) |
| Alterado | Traduções `en.ts` e `es.ts`; `AGENTS.md`; `CONTRATOS-API.md`; checagem do GitHub (flag no build de demonstração, fumaça e prints) |

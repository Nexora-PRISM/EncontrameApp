# Relatório de testes

## Novidades — branch `evolucao-novidades` (31/10/2026)

Checagem automática do GitHub no commit `33e6859`: **job verde**. O passo de formatação (Biome) continua só informativo,
como antes desta branch.

| Verificação | Como | Resultado |
|---|---|---|
| Tipos, lint (com as regras do React Compiler), build web e build de demonstração | Checagem do GitHub | Passou |
| Traduções | `npm run i18n:check` na checagem; `--strict` no ambiente da IA | Passou: 2235 textos em inglês e espanhol, nenhum faltando |
| Regras de negócio | `npm test` | **132 de 132** (20 novos: apoiadores, ponto no mapa, ficha de identificação, chegada segura, links oficiais do B.O.) |
| Telas no navegador (Chromium, 412 px, dados fictícios) | `.github/scripts/smoke-routes.js` | **54 de 54**, entre elas: `/apoiadores`, seção no Sobre, cadastro de apoiador pelo Painel da equipe até aparecer na página pública; criar ficha, "Mostrar para a polícia" e cadastro preenchido **sem** a informação de saúde; chegada segura (começar, contagem, "Cheguei bem"); Central de Apoio com MG e os direitos |
| Prints (claro e escuro; apoiadores também em 820 e 1280 px) | `.github/scripts/preview-screenshots.js` | Gerados no artefato `prints-das-telas` da checagem. **Não revisados aqui**: o download de artefatos é bloqueado neste ambiente |
| API Node.js dos apoiadores | `npm test` com Postgres local (branch `api-node-novidades`) | **102 de 102** |
| Celular físico, leitor de tela, notificação real da chegada segura, impressão da ficha | Manual | **Pendente** |

## Central de Inteligência — branch `evolucao-central` (31/10/2026)

Checagem automática do GitHub no commit `1012e70`: **tudo verde**.

| Verificação | Como | Resultado |
|---|---|---|
| Tipos, lint, traduções | Checagem do GitHub | Passou (o lint pegou `Buffer` sem importar num teste; corrigido em `1012e70`). 2018 textos em inglês e espanhol |
| Regras de negócio | `npm test` | **112 de 112** (17 novos: funções e MFA, auditoria encadeada, pista confidencial, ocultação, exportação, manifesto, links, cruzamento de pistas, mobilização, encerramento, retenção, SHA-256, ZIP, Base64, pacote criptografado) |
| SHA-256 | Comparado com o `crypto` do Node e o vetor oficial "abc" | Igual em todos os casos |
| ZIP | Lido pelo Python (`zipfile.testzip`) e pelo `unzip`, com nomes acentuados | Íntegro |
| Pacote criptografado | Aberto no Chromium: senha errada recusada; senha certa baixa o ZIP original | Passou |
| Build web e build de demonstração | `npx expo export --platform web` | Passou |
| Telas no navegador (Chromium, 412 px) | `.github/scripts/smoke-routes.js` | **39 de 39**: as 21 do Vision e da evolução + informação confidencial, verificação de integridade, Central com troca de perfil, dossiê e as 8 abas, auditoria encadeada |
| Exportação de ponta a ponta | Na mesma fumaça: preencher a revisão, gerar o pacote criptografado, abrir com a senha mostrada, conferir **cada SHA-256 do manifesto** com os arquivos do ZIP, garantir que identidade de testemunha não saiu, e conferir um arquivo na tela "Verificar integridade" | Passou |
| Aparelho físico, leitor de tela, app nativo | Manual | **Pendente** |


## Encontra-me Vision e verificação geral (30/10/2026)

Checagem automática do GitHub no commit `c49b5e5` da branch `evolucao`: **tudo verde**.

| Verificação | Como | Resultado |
|---|---|---|
| Tipos (TypeScript, dependências reais) | `npm run typecheck` na checagem | Passou |
| Lint (ESLint + regras do React Compiler) | `npx eslint .` na checagem, com anotações por arquivo | Passou (a regra de `setState` em efeito pegou "Quero ajudar"; corrigido em `b4a443e`) |
| Traduções | `npm run i18n:check` na checagem; `--strict` no ambiente da IA | Passou: 1723 textos em inglês e espanhol, nenhum faltando |
| Regras de negócio | `npm test` | **95 de 95** (19 novos do Vision) |
| Build web (Netlify) e build de demonstração | `npx expo export --platform web` | Passou |
| Telas no navegador (Chromium, celular 412 px, dados fictícios) | `.github/scripts/smoke-routes.js` no build de demonstração | **21 de 21**: `/vision`, `/central-de-apoio`, `/quero-ajudar`, linha do tempo, cartaz, minhas câmeras, cadastro de câmera, ambiente institucional (pedido de habilitação), "Meus relatos", troca para coordenação, operação e as 6 abas, operação sem evidência ("Evidências insuficientes"), auditoria e nova operação — sem erro de JavaScript |
| Três ambientes e permissões do Vision | Testes de `can`/`decideAccess` + fumaça com perfis | Passou |
| Aparelho físico, leitor de tela e app nativo | Manual | **Pendente** |

Observações:

- No primeiro teste de fumaça, as operações apareceram como "só para autoridades" depois de recarregar a página: o
  perfil de demonstração ficava só na memória. Agora o navegador lembra o perfil escolhido (`c49b5e5`).
- O cartaz de um caso "Pendente" mostra "disponível depois que a equipe aprovar" (comportamento esperado); a fumaça
  usa um caso em busca.


## Etapa 3 — Cartaz digital com QR Code (30/10/2026)

| Verificação | Como | Resultado |
|---|---|---|
| Regras de todas as etapas | `npm test` (53 testes, 22 novos) | 53 de 53 passaram, no ambiente da IA |
| QR Code lido por um leitor de verdade | 71 QR Codes gerados (versões 1 a 10, links de casos, acentos e emoji) renderizados em PNG e lidos com OpenCV (`cv2.QRCodeDetector`) | 71 de 71 lidos com o texto exato. Na primeira tentativa (8 px por módulo), 66 de 71; os outros 5 foram lidos em outro tamanho de imagem — limitação conhecida do detector do OpenCV, não do código (as mesmas versões e máscaras foram lidas em outros casos) |
| Traduções | `node scripts/check-i18n.js --strict` | OK: 1139 textos |
| Tipos entre os arquivos da evolução | `tsc` com declarações simplificadas | Nenhum erro |
| Tipos completos, lint, build web e prints | Checagem automática do GitHub | **Pendente**: roda no GitHub depois do envio da branch |
| Impressão no navegador e leitura do QR impresso com celular | Manual | **Pendente** |

Roteiro manual: abrir um caso em busca › "Cartaz com QR Code"; trocar o formato; desligar idade, data e
características; no computador, "Imprimir ou salvar em PDF" (deve sair só o cartaz, com as cores); ler o QR com a
câmera do celular (deve abrir a página do caso). Abrir o cartaz de um caso Encontrado ou Pendente: não deve gerar.


## Etapa 2 — Linha do tempo do caso (30/10/2026)

| Verificação | Como | Resultado |
|---|---|---|
| Regras da linha do tempo e do relato | `npm test` (31 testes no total, 14 novos) | 31 de 31 passaram, no ambiente da IA |
| Traduções | `node scripts/check-i18n.js --strict` | OK: 1108 textos, nenhum faltando |
| Tipos entre os arquivos novos e alterados | `tsc` com declarações simplificadas das bibliotecas | Nenhum erro nos arquivos das etapas 1 e 2 |
| Tipos completos, lint e build web | Checagem automática do GitHub | **Pendente**: roda no GitHub depois do envio da branch |

Casos cobertos: classificação e tipo vindos da API (inclusive em português; tipo desconhecido é descartado e
classificação desconhecida vira "Não confirmado"); local resumido sem rua, número, CEP nem texto genérico; linha do
tempo montada com os dados de hoje (com e sem avistamentos, sem inventar a data do desaparecimento); ordem e contagem.

Roteiro manual: abrir um caso › "Linha do tempo do caso"; conferir datas, classificações, locais só com bairro e
cidade; repetir com `EXPO_PUBLIC_ENABLE_CASE_TIMELINE=false` (linha do tempo montada com os dados de hoje).


## Etapa 1 — Relato de avistamento (30/10/2026)

| Verificação | Como | Resultado |
|---|---|---|
| Regras do relato (situações, recebimento, data e horário, textos, limite de envio) | `npm test` (17 testes, `node --test`) | 17 de 17 passaram, no ambiente da IA |
| Traduções em inglês e espanhol | `node scripts/check-i18n.js --strict` | OK: 1072 textos, nenhum faltando, nenhum erro |
| Sintaxe dos arquivos alterados | Compilador TypeScript, arquivo por arquivo | OK |
| Tipos entre os arquivos novos e alterados | `tsc` com declarações simplificadas das bibliotecas (sem `node_modules`) | Nenhum erro nos arquivos da etapa |
| Tipos completos, lint (ESLint) e build web | Checagem automática do GitHub | **Pendente**: roda no GitHub depois do envio da branch |
| Teste visual (celular, claro e escuro) | Prints gerados pela checagem automática | **Pendente**: roda no GitHub depois do envio da branch |
| Teste em aparelho | Expo Go ou build de validação | Não feito |

### Casos cobertos pelos testes automáticos

- Os 6 valores de situação do contrato; nomes em português com e sem acento; valor desconhecido vira "Recebido".
- Recebimento só é confirmado com número **e** horário válidos.
- Data inexistente (31/02), formato errado, ano antes de 1900, data futura, horário inválido e horário futuro além
  da tolerância de 5 minutos são recusados.
- Descrição obrigatória com pelo menos 10 letras; limites de tamanho dos campos opcionais; campo vazio não vai à API.
- Limite de 3 envios em 10 minutos, com o tempo de espera certo e mínimo de 1 minuto na tela.

### Roteiro de teste manual (para fazer quando houver build)

1. Com a conta conectada, abrir um caso e tocar em "Vi essa pessoa por perto".
2. Enviar sem descrição: os campos ficam destacados e aparece "Confira os campos destacados."
3. Pôr um horário no futuro: "O horário não pode estar no futuro."
4. Preencher tudo, anexar foto e enviar: aparece "Relato recebido · nº TESTE-…", a situação "Recebido" e o aviso de
   demonstração. O último local do caso **não** muda.
5. "Ver meus relatos": o relato aparece com a situação e "com foto".
6. Enviar mais 3 relatos seguidos no mesmo caso: o quarto é bloqueado com o tempo de espera.
7. Com `EXPO_PUBLIC_MOCK_SIGHTING_FAIL=true`: a tela diz que o envio não foi confirmado.
8. Com `EXPO_PUBLIC_ENABLE_SIGHTING_REPORTS=false`: o formulário volta a ser o registro simples de hoje.

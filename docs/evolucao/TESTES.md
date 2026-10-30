# Relatório de testes

## Etapa 2 — Linha do tempo do caso (30/10/2026)

| Verificação | Como | Resultado |
|---|---|---|
| Regras da linha do tempo e do relato | `npm test` (31 testes no total, 14 novos) | 31 de 31 passaram, no ambiente da IA |
| Traduções | `node scripts/check-i18n.js --strict` | OK: 1108 textos, nenhum faltando |
| Tipos entre os arquivos novos e alterados | `tsc` com declarações simplificadas das bibliotecas | Nenhum erro nos arquivos das etapas 1 e 2 |
| Tipos completos, lint e build web | Checagem automática do GitHub | **Pendente**: depende do repositório privado |

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
| Tipos completos, lint (ESLint) e build web | Checagem automática do GitHub | **Pendente**: depende do repositório privado |
| Teste visual (celular, claro e escuro) | Prints gerados pela checagem automática | **Pendente**: depende do repositório privado |
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

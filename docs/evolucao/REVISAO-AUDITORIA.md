# Revisão e consolidação do app — branch `evolucao-revisao-auditoria` (31/10/2026)

Branch criada a partir da `evolucao-central` (commit `fb05935`), que já reúne as etapas 1 a 10, o Vision e a
Central. Nada foi publicado nem integrado à `main`. O backend é tratado em separado (repositório privado) e não
aparece neste documento, que é público.

## O que foi revisado

402 arquivos de `src/`: rotas, controllers, services e repositórios (mock e API), regras puras, traduções,
chaves de ambiente e documentação. Para cada chamada à API foi conferido o caminho, os campos enviados e como a
resposta é lida.

## Alterado nesta branch

| Item | Situação |
|---|---|
| `src/features/home` (controller + 3 seções) não era usado por nenhuma rota desde a mudança para `/inicio`. Removido, com as 2 traduções que só ele usava | Concluído |
| "Último local" repetia o texto ("Praça Sete, BH, Praça Sete, BH"), porque o cadastro manda a Localidade também como cidade e a API junta os dois. O app agora mostra cada trecho uma vez (`src/lib/address-text.ts`, com teste) | Concluído |
| Comentários desatualizados no cadastro de caso (diziam que a API não tinha `contactPhone`, vínculo e declaração) | Concluído |

## Encontrado e não alterado (precisa de decisão ou do backend)

| Item | Por que não foi alterado | Situação |
|---|---|---|
| O cadastro de caso não envia latitude e longitude. Com a API real, o caso só entra no mapa "perto de você" e nos avisos de proximidade depois que alguém registra um avistamento com localização | Exige decidir como coletar o ponto (marcar no mapa, usar a posição do aparelho ou buscar o endereço) | Pendente — decisão de produto |
| A Localidade (texto livre) vai também no campo cidade, para a busca por cidade achar o caso | Separar cidade e localidade muda o formulário | Pendente — decisão de produto |
| As listas (busca, mapa) recebem a foto de cada caso inteira, em base64 (até 2 MB por foto, até 100 casos no mapa) | Pede um endereço de foto e miniaturas na API, e o app passar a usá-los | Pendente — backend |
| `google-services.json` (chave do Firebase para Android) está na `main`, que é pública | Essa chave vai dentro do app de qualquer forma; o importante é restringi-la ao pacote e à assinatura do app no Google Cloud | Pendente — dono da conta Google |
| `EXPO_PUBLIC_APP_KEY` vai dentro do app e da versão web | Serve para filtrar tráfego, não como proteção: os dados sensíveis dependem do login | Informativo |
| Cálculo de distância existe em `lib/geo.ts` e em `lib/vision-rules.ts` | Duplicação intencional: as regras do Vision não têm imports para rodar direto nos testes | Mantido |

## Módulos pedidos × o que existe

| Módulo | No app | Situação |
|---|---|---|
| Cadastro e gerenciamento de desaparecidos | Cadastro com vínculo, declaração e B.O. para menores; detalhe, busca, filtros, cartaz, linha do tempo | Funciona com a API (linha do tempo completa e relato detalhado dependem de endpoints novos) |
| Geolocalização e mapas | Mapa, casos perto, avistamentos, avisos de segurança | Funciona (ver coordenadas no cadastro acima) |
| Rede colaborativa | Avistamentos, "Vi essa pessoa", voluntários, rede de busca | Avistamento simples funciona; o resto espera a API |
| Alertas regionais | Notificações de caso perto e na região, acompanhar caso | Funciona com a API e o Expo Push configurados |
| Alertas nacionais | — | Não existe |
| Botão de alerta | Contagem de 10 s, discador do 190, envio ao servidor | Funciona (o app não liga sozinho nem avisa autoridades) |
| Apoio aos familiares | Central de Apoio às Famílias, Sofia, grupos | Funciona |
| Prevenção | Proteção de crianças no cadastro, avisos de segurança, contatos de confiança, compartilhar localização | Funciona |
| Inteligência Artificial | Sofia (conversa); sugestões no Painel da equipe | Sofia funciona; sugestões são demonstração |
| Encontra-me Vision / rede de câmeras | Três ambientes completos | Demonstração com dados fictícios |
| Central de Inteligência | Dossiês, pistas, exportação segura | Demonstração com dados fictícios |
| Reconhecimento e comparação de imagens | — | Não existe (biometria desligada de propósito até avaliação jurídica) |
| Identificação de pessoas encontradas | Situação "Encontrado" marcada pela equipe | Parcial |
| Integração com autoridades | Pacote de exportação manual na Central | Parcial: nada é enviado sozinho; sem convênio |
| Hospitais, abrigos e instituições | — | Não existe |
| Trajeto monitorado | — | Não existe |
| Estatísticas | Números do Painel da equipe | Parcial |

Também existem e não estavam na lista: Sofia e exercícios, grupos de apoio, avisos de segurança, contatos de
confiança, compartilhar localização, atalho "Pedir ajuda" no Android, cartaz com QR Code, denúncia e bloqueio,
três idiomas, tema claro/escuro. Premium e pets seguem como demanda futura (`CLAUDE.md`).

## Testes

- `npm test`: regras puras (113 testes, 1 novo para o "último local").
- `npm run check` (tipos, lint e traduções), build web e teste de fumaça das telas: rodam na checagem automática
  do GitHub desta branch.

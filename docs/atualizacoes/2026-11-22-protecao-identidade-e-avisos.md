# 2026-11-22 — Proteção de identidade, publicação responsável e correção dos avisos de segurança

- **Branch / PR**: `feature/protecao-identidade` → `main` (pull request, sem merge automático).
- **Pedidos**: (1–10) proteção de identidade, contestação e prevenção contra perseguição; (11) correção do bug do
  aviso sobre local perigoso; (12) política de publicação com vínculo e boletim de ocorrência.
- **Regra combinada**: o que precisa de API nova ficou documentado em `atualizacao-futura/` (sem código ligado).

## 11 — Bug dos avisos de segurança

### Causa

Eram várias falhas que se somavam:

1. **Coordenada errada ao publicar.** O mapa do formulário (`/aviso-seguranca`) nunca saía do centro padrão
   (Belo Horizonte): o mapa nativo usava a região só na montagem e o da web começava fixo em BH. O marcador do GPS
   podia ficar fora da tela e quem estava em outra cidade tocava no mapa de BH — o aviso era gravado no lugar errado
   (e depois "aparecia indevidamente" lá). O mapa do Início também não ia até a pessoa.
2. **Sem GPS, nenhum aviso.** A busca dependia só da posição do GPS. Com a permissão negada ou o GPS desligado, a
   camada ficava vazia e o contador mostrava 0, como se a região não tivesse avisos.
3. **GPS desligado travava a localização.** `getCurrentPositionAsync` rejeitava (serviço de localização desligado) e
   o erro não era tratado: o app ficava esperando a posição para sempre (o Início mostrava carregamento sem fim).
4. **Relato apresentado como certeza (ou o contrário).** O cartão dizia "não verificado" até para avisos com 12
   confirmações, e o título afirmava o perigo sem dizer o quanto foi confirmado.
5. **Duplicados.** Nada impedia o mesmo aviso, no mesmo ponto, publicado várias vezes.
6. **Internet instável.** A consulta de fundo abria o modal geral de erro a cada nova tentativa.

### O que foi corrigido

| Problema | Correção | Arquivos |
|---|---|---|
| Coordenada errada | `BrandMap` ganhou `focus` (leva a câmera ao ponto quando a chave muda) e `onRegionChange`. O formulário vai até o GPS e até "Usar minha localização"; mostra a sua posição; pede confirmação se o ponto estiver a mais de 30 km de você. | `components/brand-map.tsx`, `brand-map.web.tsx`, `lib/google-maps-web.ts`, `features/aviso-seguranca/*` |
| Proximidade | Busca em volta da área vista no mapa (ou do GPS); distância real até você no cartão (`formatDistanceKm`). | `features/inicio/inicio.controller.ts`, `lib/geo.ts`, `sections/inicio-map-preview-section.tsx` |
| GPS | Leitura tolerante a falha (`unavailable`), última posição conhecida primeiro, descarta 0,0/NaN, `retryUserLocation()`. | `lib/use-user-location.ts`, `features/inicio/home-shell.controller.ts` |
| Registro válido | `sanitizeSafetyNotes`: só coordenada válida, dentro do prazo e não derrubado; coordenada da API convertida com `Number()`. | `lib/safety-notes.ts`, `services/safety-notes/*` |
| Duplicados | Remove repetidos pelo id, junta o mesmo tipo no mesmo ponto; antes de publicar, sugere confirmar aviso igual a até 60 m. | `lib/safety-notes.ts`, `features/aviso-seguranca/aviso-seguranca.controller.ts` |
| Relato x confirmado | Selo "Ainda não confirmado" / "Confirmado por N pessoas" / "Informações divergentes"; pin mais claro para relato não confirmado; texto de rodapé conforme o caso. | `lib/safety-notes.ts`, `sections/inicio-map-preview-section.tsx`, `inicio.controller.ts` |
| Mudança de lugar | A busca acompanha o mapa e o GPS (cache por ~1 km), mantém os avisos anteriores enquanto carrega e atualiza a cada 5 min e ao voltar a internet. | `services/safety-notes/safety-notes.service.ts` |
| Sem internet | Sem modal repetido; o mapa mostra "Avisos de segurança não carregaram. Tentar de novo". Sem GPS: "Sem localização: avisos da área vista no mapa". | `lib/axios.ts`, `sections/inicio-map-section.tsx` |

O recurso não foi escondido nem desligado.

## 1–10 — Proteção de identidade

- **`/protecao`** ("Sou a pessoa procurada" e "Estou sofrendo perseguição"): sem login, sem pedir localização,
  ligações 190/180 no topo. Com conta e caso publicado, registra denúncia na fila da equipe (API atual,
  `POST /Moderation/reports`, motivo `abuse` para risco/perseguição). Sempre prepara o e-mail para a equipe
  (`URGENTE`/`PRIORITÁRIO` no assunto). Avisa se a pessoa escreveu um endereço. Resultado honesto: "registrado" só
  com resposta da API; o e-mail só chega quando enviado.
- Entradas: página do caso ("É você neste alerta?") e Central de Ajuda (atalho e 3 perguntas novas).
- **Avistamentos públicos**: só os 5 mais recentes, ponto aproximado (~100 m), sem número de casa/CEP
  (`lib/sighting-privacy.ts`). O app não tem rastreamento em tempo real de pessoas.

## 12 — Publicação responsável

- 10 vínculos em 4 grupos (`lib/case-relationship.ts`); boletim obrigatório para menores **e** para quem não é da
  família; política explicada por grupo no formulário; a API recebe o valor equivalente que ela aceita hoje.
- **`/possivel-desaparecimento`** ("Encontrei alguém perdido", também em "Pedir ajuda"): ligar primeiro (190, 100,
  192), o que fazer, procurar casos existentes e avisar a equipe por e-mail; nada é publicado.

## Testes realizados

- `npm run test:regras` (novo, dentro do `npm run check`): **27 cenários** — coordenadas válidas/inválidas;
  distâncias de 500 m e BH–SP; formatação; relato x confirmado x divergente; horários nas bordas; aviso vencido,
  derrubado, sem data, 0,0 e NaN; duplicados por id e no mesmo ponto; aviso igual a 40 m (achado) e 90 m (não);
  busca por região em BH, em São Paulo (sem registros) e com raios de 1 e 50 km; cenários 1, 2, 3, 4, 5, 6 e 8 do
  pedido 12; endereço digitado; histórico de avistamentos.
- `npm run check` completo (tipos, lint, traduções, testes) e build web no GitHub Actions.
- Traduções: inglês e espanhol completos (`--strict` sem pendências).

## Limitações

- GPS desligado, internet instável e permissão negada foram tratados no código e cobertos pela lógica testada; **não
  foram testados num aparelho físico** nesta entrega.
- Foto de verificação, estados da contestação, Central de Segurança, anexo do boletim, verificação institucional e
  fila prioritária de possível desaparecimento dependem da API (`atualizacao-futura/`).
- A restrição real de quem vê o histórico de avistamentos é da API; o app reduz o que mostra.
- A API ainda aceita só os 6 vínculos antigos; o app envia o equivalente até ela ser atualizada.

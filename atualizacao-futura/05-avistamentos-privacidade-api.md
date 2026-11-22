# 05 — Avistamentos: quem vê o quê (API)

## Hoje

- `GET /MissingPerson/{id}/last-seen` (histórico) devolve **todos** os avistamentos com coordenada exata para
  qualquer um.
- O app já reduz o que **mostra** (`src/lib/sighting-privacy.ts`): 5 regiões mais recentes, cada ponto trocado pelo
  centro de uma região de ~10 km (grade de 0,1°), só cidade e estado. Mas a resposta da API ainda traz tudo — quem inspecionar a rede vê.

## Proposta

| Quem pede | Recebe |
|---|---|
| Público (sem conta ou conta comum) | Até 5 avistamentos mais recentes, coordenada trocada pelo centro da grade de 0,1° (~10 km), só `city`/`state` (sem `location` nem `neighborhood`); nada mais antigo que 30 dias. |
| Criador do caso | Mesma coisa do público + data/hora exatas. **Sem** acompanhamento contínuo: no máximo 1 consulta por minuto. |
| Equipe (`moderator`/`security`) | Histórico completo e exato, com registro de acesso. |

Regras:
- O app **não tem** e não deve ter rastreamento GPS em tempo real de pessoa desaparecida; o servidor não aceita
  envio periódico de localização de terceiros.
- Avistamento novo: limite de 10 por conta por dia e 1 por caso a cada 10 minutos (evita "seguir" alguém
  relatando a posição a todo momento).
- Caso **suspenso** por pedido de proteção (ver `01`): histórico oculto para todos, menos a equipe.
- Nunca devolver avistamentos de um caso a quem foi bloqueado pela pessoa/criador.

## Testes

Integração: público recebe ≤ 5, coordenadas no centro da grade de ~10 km e sem rua/bairro; equipe recebe tudo; caso suspenso → lista vazia para o
público; limite de avistamentos → 429.

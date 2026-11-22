# 05 — Avistamentos: quem vê o quê (API)

## Hoje

- `GET /MissingPerson/{id}/last-seen` (histórico) devolve **todos** os avistamentos com coordenada exata para
  qualquer um.
- O app já reduz o que **mostra** (`src/lib/sighting-privacy.ts`): 5 mais recentes, ponto aproximado (~100 m), sem
  número de casa/CEP. Mas a resposta da API ainda traz tudo — quem inspecionar a rede vê.

## Proposta

| Quem pede | Recebe |
|---|---|
| Público (sem conta ou conta comum) | Até 5 avistamentos mais recentes, coordenada arredondada a 3 casas, sem `location` com número; nada mais antigo que 30 dias. |
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

Integração: público recebe ≤ 5 e coordenadas arredondadas; equipe recebe tudo; caso suspenso → lista vazia para o
público; limite de avistamentos → 429.

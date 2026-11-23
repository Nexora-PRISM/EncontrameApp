# 2026-11-22 — Foto do perfil, círculo familiar e trajetos compartilhados

- **Branch / PR**: `feature/conta-e-sessoes` (PR #6). API: `revisao-conta-e-sessoes` (EncontrameApi PR #3).
- **Pedido**: "Preciso que esses em breves se tornem funcional."

## O que saiu do "Em breve"

| Item | Onde | Como funciona |
|---|---|---|
| Foto do perfil | Editar perfil; avatar do Início | JPEG/PNG até 2 MB. Só a própria pessoa vê (nem o círculo recebe). |
| Círculo familiar | Perfil › Círculo familiar (`/circulo`) | Uma pessoa gera um código (8 caracteres, 24 h, uso único) e a outra digita. Vínculo dos dois lados, até 10 pessoas, qualquer um sai quando quiser. |
| Rotas (trajeto compartilhado) | Perfil › Compartilhar um trajeto (`/trajeto`) | Destino opcional + "em quanto tempo chego". O círculo vê o caminho só enquanto está ligado. "Cheguei"/"Parar" encerram e o caminho é apagado. Passou do horário: o servidor avisa o círculo uma vez. |
| Avisos do círculo | Configurações › Notificações › Trajetos do círculo familiar | Desligado por padrão. O toque abre o trajeto. |

Tudo só aparece quando a API publicada informa o recurso (`GET /Auth/capabilities`).

## Limites (de propósito)

- A posição só é enviada **com a tela do trajeto aberta**. Enviar com o app fechado exige localização em segundo plano
  (pacote novo, permissão "o tempo todo" e declaração na Google Play) — fica para depois, com decisão dos sócios.
- Nada de rastreamento contínuo: cada trajeto é ligado pela pessoa e termina sozinho até 6 h depois do horário previsto.
- O app não avisa a polícia; a tela de atraso orienta ligar 190.

## Continua "Em breve"

- **Termos de uso**: não há texto oficial publicado. Assim que existir uma página (ex.: `/termos` no site), basta ligar
  o link em Sobre.

## Testes

- `npm run test:regras`: 38 cenários (5 novos: quando mandar ponto, limites, minutos até chegar, lotes, foto).
- API: testes unitários e de integração do círculo, trajetos, foto e da preferência de aviso (GitHub Actions).
- Não testado num aparelho físico.

# 2026-11-22 — Conta: editar perfil, alterar e recuperar senha, aparelhos conectados

- **Branch / PR**: `feature/conta-e-sessoes` (em cima de `feature/protecao-identidade`). API: `revisao-conta-e-sessoes`
  no EncontrameApi.
- **Pedido**: "O que estiver em breve tente subir".

## O que saiu do "Em breve"

| Item | Agora | Depende de |
|---|---|---|
| Editar perfil | `/editar-perfil`: nome, celular e CEP. E-mail e CPF não mudam pelo app. | API com `GET`/`PUT /Auth/me` |
| Alterar senha | `/alterar-senha`: pede a senha atual; desconecta os outros aparelhos. | API com `POST /Auth/password` |
| Recuperar senha | "Esqueci minha senha" no login → `/recuperar-senha`: código de 8 caracteres por e-mail. | API + e-mail (SMTP) configurado |
| Sessões ativas | `/sessoes` ("Aparelhos conectados"): este aparelho e os outros; desconectar um ou todos. | API com `/Auth/sessions` |

O app pergunta à API o que ela tem (`GET /Auth/capabilities`). Com a API atual (sem a rota), tudo continua "Em breve" —
nada de botão que não funciona. Quando a API nova for publicada, os itens aparecem sozinhos; a recuperação de senha só
aparece depois que o e-mail for configurado no servidor.

## Continua "Em breve" (e por quê)

- **Foto do perfil**: precisa de coluna nova no banco e decidir onde a foto fica guardada.
- **Rotas e círculo familiar**: é compartilhamento de localização entre pessoas — exatamente o tipo de recurso que pode
  ser usado para perseguir alguém. Precisa de decisão dos sócios sobre consentimento, quem vê o quê e por quanto tempo.
  Já existe um esboço de API em Node (`api-node-trajeto`), fora da `main`.
- **Termos de uso**: em revisão jurídica; o texto não pode ser escrito pela IA.

## Testes

- `npm run test:regras`: 33 cenários (4 novos: perfil, senha nova, código, ordem dos aparelhos).
- API: `dotnet test` no GitHub Actions — 313/313.
- Não testado num aparelho físico nem contra a API publicada.

# 03 — Central de Segurança (painel da equipe)

Painel para a equipe analisar contestações, perseguição, documentos e alertas suspeitos. Pode ser uma seção do
próprio app (rota protegida `/central-seguranca`, visível só para quem tem papel na API) ou do painel web da equipe.
Em ambos os casos **a permissão é decidida pela API** — a tela só esconde o que a API já negaria.

## Papéis

| Papel | Pode |
|---|---|
| `moderator` (hoje: `Moderation:StaffUserIds`) | Ver fila de denúncias, ocultar conteúdo, aprovar casos sem documento sensível. |
| `security` (novo, lista separada `Moderation:SecurityUserIds`) | Tudo acima + ver fotos de verificação, boletins e documentos; decidir contestações e perseguição. |

## Seções da tela

1. **Contestações recebidas** e **Denúncias de perseguição** — prioridade alta primeiro, depois por data.
2. **Alertas suspeitos** — casos com documento reutilizado, criador com histórico de rejeições, vários pedidos de
   proteção, ou denúncias repetidas.
3. **Solicitações de retirada**.
4. **Documentos para análise** (boletins, provas de vínculo e institucionais).
5. **Possível desaparecimento** (fila urgente).
6. **Histórico de decisões** — quem decidiu, quando, o quê e a justificativa.

Cada item permite: ver os dados necessários, ler a justificativa do pedido, **suspender temporariamente**, aprovar
retirada, rejeitar **com justificativa**, pedir informações adicionais (e-mail ao solicitante), e registra o
administrador responsável.

## Registro de acesso (obrigatório)

```text
security_access_log
  id, staff_user_id, action ('view_request'|'view_photo'|'view_document'|'decide'|'suspend'|'denied'),
  target_type, target_id, ip_hash, dt_registration
```

Toda abertura de foto/documento e toda tentativa negada (403) gera uma linha. A lista é somente leitura para a equipe
e exportável para auditoria.

## Telas no app (quando existir a API)

- Service `src/services/security-center/` (mock + axios), flag `EXPO_PUBLIC_ENABLE_SECURITY_CENTER`.
- Entrada no menu só se `GET /SecurityCenter/me` responder `{ roles: [...] }` com algum papel.
- Foto/documento abre em visualizador sem botão de salvar/compartilhar; `Cache-Control: no-store`.
- Decisão sempre pede justificativa (campo obrigatório no controller e na API).

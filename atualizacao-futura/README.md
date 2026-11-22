# Atualização futura — proteção de identidade, publicação responsável e Central de Segurança

> Pasta de **planejamento**. Nada aqui é compilado, publicado ou usado pelo app. Cada arquivo descreve uma parte que
> **depende de mudanças na API** (backend), com contrato, regras, permissões e testes, para ser implementada quando a
> API estiver pronta. O que já funciona hoje está no app e foi registrado em
> `docs/atualizacoes/2026-11-22-protecao-identidade-e-avisos.md`.

## Análise técnica do que existe (22/11/2026)

| Peça | O que já existe e foi reaproveitado |
|---|---|
| App | Expo SDK 57 + React Native + Expo Router; camadas página → seção → controller → service (React Query) → repositório (mock ou axios). |
| API | .NET 8 + EF Core 9 + PostgreSQL (`encontrameapi`), JWT + refresh token, header `X-App-Key` para consultas públicas. |
| Banco | PostgreSQL, schema `encontra_me`; datas em `timestamp with time zone`. |
| Autenticação | Conta com CPF (nunca exibido), login por e-mail/senha e Google; papel de equipe por `Moderation:StaffUserIds`. |
| Moderação | `POST /Moderation/reports` (alvos `MissingPerson`, `SafetyNote`, `GroupMessage`; motivos `abuse`, `false_info`, `scam`, `other`), lista e ocultação pela equipe; bloqueio de usuário. |
| Publicação de casos | Todo caso nasce **Pendente** e só fica público quando a equipe aprova (`POST /Moderation/missing-person/{id}/status`). |
| Fotos | Foto do caso enviada em base64 no cadastro e servida pela API. **Não existe armazenamento privado de arquivos** (documentos, fotos de verificação). |
| Notificações | Expo Push com fila (`IPushQueue`), textos genéricos sem nome/idade/foto. |

**Nenhuma API externa paga é necessária.** Reconhecimento facial não é usado (nem como critério único, nem como apoio).
Arquivos privados (boletim, foto de verificação) podem ficar no próprio PostgreSQL (tabela com `bytea`) ou no
armazenamento que a hospedagem atual já oferecer, sempre fora de pasta pública.

## O que já foi entregue no app (sem API nova)

| Pedido | Como funciona hoje |
|---|---|
| "Sou a pessoa procurada" / "Estou sofrendo perseguição" | Tela `/protecao`, sem login e sem pedir localização. Com conta e caso publicado, registra denúncia na fila da equipe (API atual). Sempre prepara o e-mail para a equipe. Nunca mostra nada a quem criou o alerta. |
| Proteção contra localização indevida | Avistamentos públicos: só os 5 mais recentes, ponto aproximado (~100 m), sem número de casa nem CEP. O app não tem rastreamento em tempo real de pessoas. |
| Vínculo e boletim de ocorrência | 10 vínculos em 4 grupos; boletim obrigatório para menores e para quem não é da família; textos de política por grupo. |
| Alerta de possível desaparecimento | Tela `/possivel-desaparecimento`: ligar primeiro, o que fazer, procurar casos existentes e avisar a equipe por e-mail; nada é publicado. |
| Bug dos avisos de segurança | Corrigido (ver registro em `docs/atualizacoes/`). |

## O que depende da API (esta pasta)

| Arquivo | Assunto |
|---|---|
| [`01-contestacao-e-protecao.md`](01-contestacao-e-protecao.md) | Pedidos de contestação/perseguição com estados, foto privada, suspensão preventiva, notificações. |
| [`02-publicacao-responsavel.md`](02-publicacao-responsavel.md) | Vínculos novos na API, anexo do boletim, verificação institucional, fila prioritária de possível desaparecimento, antifraude. |
| [`03-central-de-seguranca.md`](03-central-de-seguranca.md) | Painel da equipe: filas, decisões com justificativa, histórico, permissões e registro de acessos. |
| [`04-avisos-de-seguranca-api.md`](04-avisos-de-seguranca-api.md) | Reforços no servidor: duplicados, coordenadas, verificação e limites. |
| [`05-avistamentos-privacidade-api.md`](05-avistamentos-privacidade-api.md) | Quem vê o histórico completo de avistamentos; limites contra acompanhamento contínuo. |
| [`06-lgpd-retencao.md`](06-lgpd-retencao.md) | Retenção, exclusão, registro de acesso e base legal. |

## Ordem sugerida

1. `02` (vínculos novos aceitos pela API) — pequeno e destrava dados mais precisos.
2. `01` + `03` juntos — contestação com estados e o painel que a analisa.
3. `05` e `04` — reforços de privacidade e qualidade no servidor.
4. `06` — rotinas de retenção.

Cada item segue o checklist do `AGENTS.md` da API: entidade + mapping + migration, repositório, DTOs + service,
controller, DI e **testes unitários e de integração** (`dotnet test` limpo). No app: service com repositório mock +
axios e flag `EXPO_PUBLIC_ENABLE_*` desligada em produção até a API estar no ar.

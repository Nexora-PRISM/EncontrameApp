# 06 — LGPD: retenção, acesso e uso dos dados sensíveis

| Dado | Base legal (LGPD) | Retenção | Quem acessa |
|---|---|---|---|
| Foto de verificação (contestação) | Art. 11, II, "a"/"g" — proteção da vida e prevenção à fraude | Apagar **30 dias** após a decisão | Papel `security`, com registro |
| Boletim de ocorrência / provas de vínculo | Art. 7º, IX e art. 11, II, "g" | Enquanto o caso existir + 90 dias; casos rejeitados: 90 dias | Papel `security`, com registro |
| Pedido de proteção (texto e situações) | Art. 7º, IX | 2 anos (defesa em processo), depois anonimizar | Papel `security` |
| Registro de acesso (`security_access_log`) | Art. 37 (registro das operações) | 2 anos | Somente leitura, equipe |

Regras:
- Coletar só o necessário: o pedido de proteção **não** tem campo de localização.
- Fotos e documentos **não** são usados para treinar IA e **não** passam por reconhecimento facial automático.
- Exclusão: rotina diária (`IHostedService`) apaga arquivos com `delete_after` vencido e grava o evento.
- A pessoa que pediu proteção pode pedir a exclusão do próprio pedido depois de encerrado (e-mail ao suporte, ou
  `DELETE /Protection/requests/{id}` quando existir).
- A Política de Privacidade (`public/privacidade/index.html`) precisa citar esses tratamentos antes de ligar a API.

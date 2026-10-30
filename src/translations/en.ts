/**
 * Traduções para o inglês, indexadas pelo texto original em português (o texto-fonte do app).
 * Depois de criar ou mudar um texto no app, rode `npm run i18n:check` (scripts/check-i18n.js).
 * Nomes próprios e da marca (Encontra-me, Sofia, WhatsApp, CPF…) ficam iguais de propósito.
 */
export const en: Readonly<Record<string, string>> = {
  // components/bottom-bar.tsx
  'Pedir ajuda': 'Get help',
  'Mostra os números de emergência e como comunicar um desaparecimento':
    'Shows the emergency numbers and how to report a disappearance',
  'Início': 'Home',
  'Cadastrar': 'Register',
  // components/brand-field.tsx
  '{label}, obrigatório': '{label}, required',
  // components/brand-map.tsx
  'Você está aqui': 'You are here',
  // components/brand-map.web.tsx
  'Defina EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY no ambiente':
    'Set EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY in the environment',
  'Não foi possível carregar o mapa': 'Could not load the map',
  // components/brand-select.tsx
  'Escolher': 'Choose',
  // components/chat-typing-dots.tsx
  'Sofia está escrevendo': 'Sofia is typing',
  // components/emergency-sheet.tsx
  'Fechar': 'Close',
  'Escolha o que está acontecendo.': 'Choose what is happening.',
  'Acionar alerta de emergência. Contagem de 10 segundos, com opção de cancelar.':
    'Trigger emergency alert. 10-second countdown, with the option to cancel.',
  'Acionar alerta de emergência': 'Trigger emergency alert',
  'Contagem de 10 segundos para cancelar. Depois abre o 190 e deixa sua localização pronta para seus contatos.':
    '10-second countdown to cancel. Then it opens 190 and gets your location ready for your contacts.',
  'Perigo agora — ligar': 'Danger now — call',
  'Ligar {number}, {name}. {when}': 'Call {number}, {name}. {when}',
  'Ligar {number}, {name}': 'Call {number}, {name}',
  'Não foi possível abrir o telefone. Ligue manualmente para {number}.':
    'Could not open the phone. Dial {number} manually.',
  'Abrindo o telefone para ligar para {number}. Se nada acontecer, disque {number} manualmente.':
    'Opening the phone to call {number}. If nothing happens, dial {number} manually.',
  'Avisar alguém de confiança': 'Tell someone you trust',
  'Compartilhar minha localização': 'Share my location',
  'Mande onde você está por WhatsApp, SMS ou outro aplicativo.':
    'Send where you are by WhatsApp, SMS or another app.',
  'Desaparecimento': 'Disappearance',
  'Comunicar um desaparecimento': 'Report a disappearance',
  'Cadastre a pessoa no app. Faça também o boletim de ocorrência — não é preciso esperar 24 horas.':
    'Register the person in the app. Also file a police report — there is no need to wait 24 hours.',
  'Vi uma pessoa desaparecida': 'I saw a missing person',
  'Encontre o caso e informe onde a viu. Se ela estiver em perigo, ligue 190.':
    'Find the case and tell us where you saw them. If they are in danger, call 190.',
  'A ligação é feita pelo seu celular. O Encontra-me não avisa a polícia sozinho, e sua localização só chega aos seus contatos quando você envia a mensagem.':
    'The call is made from your phone. Encontra-me does not alert the police by itself, and your location only reaches your contacts when you send the message.',
  // components/google-auth-button.tsx
  'Continuar com Google': 'Continue with Google',
  // components/map-my-location-fab.tsx
  'Centralizar na minha localização': 'Center on my location',
  // components/person-alert-icon.tsx
  'Alerta': 'Alert',
  // components/register-fab.tsx
  'Cadastrar uma pessoa': 'Register a person',
  // components/screen-header.tsx
  'Voltar': 'Back',
  // components/settings-list.tsx
  'Em breve': 'Coming soon',
  'em breve': 'coming soon',
  // components/sofia-fab.tsx
  'Conversar com a Sofia': 'Talk to Sofia',
  // constants/emergency.ts
  'Polícia Militar': 'Military Police',
  'Você ou alguém está em perigo agora.': 'You or someone else is in danger right now.',
  'Central de Atendimento à Mulher': "Women's Helpline",
  'Violência contra a mulher. 24 horas, gratuito.':
    'Violence against women. 24 hours, free of charge.',
  'Disque Direitos Humanos': 'Human Rights Hotline',
  'Violência ou risco contra criança ou adolescente.': 'Violence or risk to a child or teenager.',
  'SAMU': 'SAMU (ambulance)',
  'Emergência médica.': 'Medical emergency.',
  'Bombeiros': 'Fire Department',
  'Resgate e incêndio.': 'Rescue and fire.',
  // constants/sofia-palettes.ts
  'Verde acolhedor': 'Welcoming green',
  'Azul sereno': 'Serene blue',
  'Lavanda suave': 'Soft lavender',
  'Areia quente': 'Warm sand',
  // features/ajuda/ajuda.controller.ts
  'Escreva pelo menos {MESSAGE_MIN} caracteres para podermos ajudar.':
    'Write at least {MESSAGE_MIN} characters so we can help.',
  // features/ajuda/help-content.ts
  'Crianças e mulheres': 'Children and women',
  'Primeiros passos': 'Getting started',
  'Pessoas desaparecidas': 'Missing people',
  'Avistamentos e mapa': 'Sightings and map',
  'Emergência': 'Emergency',
  'Rotas e círculo familiar': 'Routes and family circle',
  'Cadastro, login e senha': 'Registration, sign-in and password',
  'Privacidade e localização': 'Privacy and location',
  'Segurança e golpes': 'Safety and scams',
  'Sofia e grupo de apoio': 'Sofia and support group',
  'O Encontra-me é só para crianças e mulheres?': 'Is Encontra-me only for children and women?',
  'Não. Qualquer pessoa pode usar o app e cadastrar quem desapareceu. A proteção de crianças e de mulheres é uma prioridade do projeto, por isso há atalhos e orientações específicas para elas.':
    'No. Anyone can use the app and register someone who has disappeared. Protecting children and women is a priority of the project, which is why there are specific shortcuts and guidance for them.',
  'público todos prioridade': 'audience everyone priority',
  'Uma criança desapareceu. O que faço primeiro?': 'A child has disappeared. What do I do first?',
  'Ligue 190 e procure a delegacia mais próxima imediatamente. Não é preciso esperar 24 horas: a lei determina que a busca por crianças e adolescentes desaparecidos comece logo após a comunicação. Depois, cadastre a criança no app com uma foto recente.':
    'Call 190 and go to the nearest police station right away. There is no need to wait 24 hours: Brazilian law requires the search for missing children and teenagers to start as soon as it is reported. Then register the child in the app with a recent photo.',
  'criança filho filha menor desaparecida 24 horas': 'child son daughter minor missing 24 hours',
  'Estou sofrendo violência. Para onde ligo?': 'I am suffering violence. Who do I call?',
  'Em perigo agora, ligue 190. Para orientação e denúncia de violência contra a mulher, ligue 180 (Central de Atendimento à Mulher, 24 horas e gratuito). Os dois números estão no botão vermelho "Pedir ajuda".':
    'If you are in danger now, call 190. For guidance and to report violence against women, call 180 (Women\'s Helpline, 24 hours and free of charge). Both numbers are on the red "Get help" button.',
  'violência doméstica mulher 180 agressão': 'domestic violence woman 180 assault abuse',
  'O que é medida protetiva?': 'What is a protective order?',
  'É uma proteção que a Justiça pode dar à mulher em situação de violência doméstica, como afastar o agressor. O pedido pode ser feito na delegacia, de preferência na Delegacia da Mulher (Lei Maria da Penha).':
    "It is protection that the courts can grant to a woman experiencing domestic violence, such as keeping the aggressor away. You can request it at a police station, preferably at a Women's Police Station (Maria da Penha Law).",
  'maria da penha protetiva delegacia mulher':
    'maria da penha protective order police station woman',
  'Como denuncio risco ou violência contra uma criança?':
    'How do I report risk or violence against a child?',
  'Ligue 100 (Disque Direitos Humanos), gratuito. Se a criança estiver em perigo agora, ligue 190. Você também pode procurar o Conselho Tutelar da sua cidade.':
    'Call 100 (Human Rights Hotline), free of charge. If the child is in danger right now, call 190. You can also contact the Guardianship Council (Conselho Tutelar) in your city.',
  'criança abuso violência conselho tutelar 100': 'child abuse violence guardianship council 100',
  'Que cuidados tomar ao divulgar uma criança?':
    "What precautions should I take when sharing a child's case?",
  'Use uma foto recente só do rosto, sem uniforme ou nome da escola. Não publique endereço, rotina, escola nem documentos. Ao divulgar em redes sociais, inclua só o essencial: nome, foto, cidade e data.':
    "Use a recent photo of the face only, without a school uniform or the school's name. Do not publish the address, routine, school or documents. When sharing on social media, include only the essentials: name, photo, city and date.",
  'foto imagem criança exposição escola': 'photo picture child exposure school',
  'O que é o Encontra-me?': 'What is Encontra-me?',
  'É um aplicativo de mobilização social para ajudar a encontrar pessoas desaparecidas. Você pode ver casos perto de você no mapa, cadastrar uma pessoa desaparecida e informar onde viu alguém. O Encontra-me é um produto da Nexora Prism.':
    'It is a social mobilization app to help find missing people. You can see cases near you on the map, register a missing person and report where you saw someone. Encontra-me is a Nexora Prism product.',
  'sobre app objetivo': 'about app purpose',
  'Como vejo pessoas desaparecidas perto de mim?': 'How do I see missing people near me?',
  'Como deixo o app claro ou escuro?': 'How do I make the app light or dark?',
  'No menu do Início (ícone de três linhas na barra inferior), em "Tema do app", escolha Auto, Claro ou Escuro. A mesma opção fica em Configurações › Aparência e acessibilidade. Auto (automático) acompanha o modo do celular.':
    'In the Home menu (three-line icon on the bottom bar), under "App theme", choose Auto, Light or Dark. The same option is in Settings › Appearance and accessibility. Auto (automatic) follows your phone\'s mode.',
  'tema escuro claro modo noturno dark aparência cores':
    'theme dark light night mode appearance colors',
  'Como mudo o idioma do app?': "How do I change the app's language?",
  'No menu do Início (barra inferior), em "Idioma", toque em PT (português), EN (inglês), ES (espanhol) ou Auto. A mesma opção fica em Configurações › Idioma. Auto segue o idioma do celular; se ele estiver em outro idioma, o app aparece em inglês. Não são traduzidos: o que as pessoas escrevem nos casos e nas conversas e as respostas da Sofia. Os números de emergência continuam os do Brasil (190, 180, 100, 192 e 193).':
    'In the Home menu (bottom bar), under "Language", tap PT (Portuguese), EN (English), ES (Spanish) or Auto. The same option is in Settings › Language. Auto follows your phone\'s language; if it is set to another language, the app appears in English. Not translated: what people write in cases and conversations, and Sofia\'s replies. The emergency numbers are still the Brazilian ones (190, 180, 100, 192 and 193).',
  'idioma língua linguagem inglês espanhol português tradução english español language':
    'language languages english spanish portuguese translation idioma',
  'Como cadastro uma pessoa desaparecida?': 'How do I register a missing person?',
  'Toque em "Cadastrar" na barra inferior, no botão laranja "Cadastrar pessoa" embaixo do mapa no computador, ou abra o menu e escolha "Cadastrar uma pessoa". Preencha o nome completo, a localidade onde a pessoa foi vista pela última vez, a idade e um telefone de contato. No fim do formulário, informe seu vínculo com a pessoa e confirme a declaração de veracidade. Foto, cidade, estado, país e características físicas são opcionais, mas ajudam muito.':
    'Tap "Register" on the bottom bar, the orange "Register a person" button under the map on a computer, or open the menu and choose "Register a person". Fill in the full name, the place where the person was last seen, the age and a contact phone number. At the end of the form, state your relationship to the person and confirm the truthfulness statement. Photo, city, state, country and physical features are optional, but they help a lot.',
  'novo alerta cadastro registrar': 'new alert registration register report',
  'Como divulgo um caso?': 'How do I share a case?',
  'Abra o caso e toque em "Divulgar este caso". O texto pronto — nome, idade, onde e quando a pessoa foi vista e características — abre no compartilhamento do celular para você mandar por WhatsApp ou redes sociais. Ele não inclui telefone nem endereço.':
    'Open the case and tap "Share this case". The ready-made text — name, age, where and when the person was seen, and features — opens in your phone\'s share menu so you can send it by WhatsApp or social media. It does not include a phone number or address.',
  'divulgar compartilhar whatsapp redes sociais espalhar':
    'share spread whatsapp social media publicize',
  'Posso cadastrar sem ter conta?': 'Can I register without an account?',
  'Sim, mas o cadastro fica salvo só neste aparelho e aparece como "Cadastro pendente" — ninguém mais o vê. Para enviá-lo, entre na sua conta e toque em "Revisar e enviar" no próprio cadastro ou em Meu perfil: você confere os dados, completa o que faltar e confirma a declaração. Nada é enviado sem essa revisão, nem quando alguém entra numa conta neste aparelho. Você pode apagar esses cadastros em Configurações > Privacidade e localização.':
    'Yes, but the registration is saved only on this device and appears as "Pending registration" — no one else sees it. To send it, sign in to your account and tap "Review and send" on the registration itself or in My profile: you check the data, fill in what is missing and confirm the statement. Nothing is sent without this review, not even when someone signs in to an account on this device. You can delete these registrations in Settings > Privacy and location.',
  'offline visitante pendente revisar enviar': 'offline visitor pending review send',
  'Por que o app pede meu vínculo e o boletim de ocorrência?':
    'Why does the app ask for my relationship and the police report?',
  'Para proteger quem está desaparecido e evitar cadastros falsos ou feitos para perseguir alguém — por exemplo, uma mulher que se afastou para se proteger. Você informa seu vínculo com a pessoa e confirma que as informações são verdadeiras. Para crianças e adolescentes (menos de 18 anos), o número do boletim de ocorrência é obrigatório; para adultos, é recomendado. Não é preciso esperar 24 horas para registrar o boletim.':
    'To protect the person who is missing and to prevent false registrations or ones made to stalk someone — for example, a woman who left to protect herself. You state your relationship to the person and confirm that the information is true. For children and teenagers (under 18), the police report number (boletim de ocorrência) is required; for adults, it is recommended. There is no need to wait 24 hours to file the report.',
  'boletim ocorrência bo vínculo declaração menor criança adolescente':
    'police report bo relationship statement minor child teenager',
  'O que significam as situações de cada caso?': 'What does each case status mean?',
  'Cada caso mostra uma situação, como Pendente, Procurado, Alerta ou Encontrado. "Cadastro pendente" indica um cadastro que ainda está só no seu aparelho e não foi enviado.':
    'Each case shows a status, such as Pending, Missing, Alert or Found. "Pending registration" means a registration that is still only on your device and has not been sent.',
  'status pendente procurado alerta encontrado': 'status pending missing alert found',
  'A pessoa foi encontrada. Como encerro o caso?': 'The person was found. How do I close the case?',
  'Abra o caso e, no fim da página, toque em "Pedir correção ou atualização". Seu app de e-mail abre com a identificação do caso: conte o que mudou e envie. O pedido só chega à equipe quando você enviar o e-mail. O encerramento direto pelo app ainda não existe.':
    'Open the case and, at the bottom of the page, tap "Request a correction or update". Your email app opens with the case identification: tell us what changed and send it. The request only reaches the team when you send the email. Closing a case directly in the app does not exist yet.',
  'encontrada localizada encerrar fechar': 'found located close end',
  'Como informo que vi uma pessoa?': 'How do I report that I saw a person?',
  'Abra o caso da pessoa e toque para informar um avistamento. Você pode usar sua localização atual, digitar o endereço ou ajustar o ponto no mapa. É preciso estar com a conta conectada.':
    "Open the person's case and tap to report a sighting. You can use your current location, type the address or adjust the point on the map. You must be signed in to your account.",
  'vi avistei relato informar': 'saw spotted sighting report',
  'Um avistamento significa que a pessoa foi encontrada?':
    'Does a sighting mean the person was found?',
  'Não. Um avistamento é uma informação enviada por alguém da comunidade e não é uma confirmação. Em situação urgente, ligue para a polícia (190).':
    'No. A sighting is information sent by someone in the community and is not a confirmation. In an urgent situation, call the police (190).',
  'confirmado verdade verificado': 'confirmed true verified',
  'O que é o histórico no mapa de um caso?': 'What is the map history of a case?',
  'São os locais informados para aquela pessoa, em ordem de data. O ponto mais recente aparece destacado.':
    'These are the places reported for that person, in date order. The most recent point is highlighted.',
  'histórico trajeto rastro': 'history route trail',
  'O que faz o botão vermelho "Pedir ajuda"?': 'What does the red "Get help" button do?',
  'No celular ele fica no centro da barra inferior; no computador, no alto da tela, ao lado da busca. Ao tocar, você pode acionar o alerta de emergência (com contagem de 10 segundos), escolher para quem ligar (190, 180, 100, 192 ou 193), mandar sua localização a alguém de confiança ou comunicar um desaparecimento. A ligação é feita pelo seu celular, como uma chamada comum: o aplicativo não avisa a polícia sozinho.':
    'On a phone it is in the center of the bottom bar; on a computer, at the top of the screen, next to search. When you tap it, you can trigger the emergency alert (with a 10-second countdown), choose whom to call (190, 180, 100, 192 or 193), send your location to someone you trust or report a disappearance. The call is made from your phone, like a regular call: the app does not alert the police by itself.',
  'emergência 190 polícia ligar socorro botão vermelho pânico':
    'emergency 190 police call help red button panic',
  'Quais números de emergência posso usar?': 'Which emergency numbers can I use?',
  '190 — Polícia Militar. 180 — Central de Atendimento à Mulher. 100 — Disque Direitos Humanos (crianças e adolescentes). 192 — SAMU. 193 — Bombeiros. 188 — CVV (apoio emocional, 24 horas). As ligações são gratuitas.':
    "190 — Military Police. 180 — Women's Helpline. 100 — Human Rights Hotline (children and teenagers). 192 — SAMU (ambulance). 193 — Fire Department. 188 — CVV (emotional support, 24 hours). Calls are free of charge.",
  'samu bombeiros cvv telefone': 'ambulance samu fire department cvv phone',
  'Como funciona o alerta de emergência?': 'How does the emergency alert work?',
  'Em "Pedir ajuda", toque em "Acionar alerta de emergência". Começa uma contagem de 10 segundos com um botão grande para cancelar — assim um toque sem querer não vira alerta. Ao fim, o telefone abre com o 190 (você toca em ligar) e sua localização fica pronta para mandar aos seus contatos de confiança por WhatsApp ou SMS. O envio automático do alerta para o Encontra-me só aparece quando estiver disponível, e a tela só diz que ele foi recebido depois da confirmação do servidor.':
    'In "Get help", tap "Trigger emergency alert". A 10-second countdown starts with a large button to cancel — so an accidental tap does not become an alert. At the end, the phone opens with 190 (you tap call) and your location is ready to send to your trusted contacts by WhatsApp or SMS. Automatic sending of the alert to Encontra-me only appears when it is available, and the screen only says it was received after the server confirms it.',
  'pânico alerta contagem 10 segundos cancelar socorro contatos':
    'panic alert countdown 10 seconds cancel help contacts',
  'O que são os contatos de confiança?': 'What are trusted contacts?',
  'São até 5 pessoas para quem você manda sua localização com um toque, por WhatsApp ou SMS. Cadastre em Configurações › Emergência › Contatos de confiança. A lista fica salva só neste aparelho e não vai para o servidor. O app abre o WhatsApp ou o SMS com a mensagem pronta: ela só chega quando você toca em enviar.':
    'They are up to 5 people to whom you send your location with one tap, by WhatsApp or SMS. Add them in Settings › Emergency › Trusted contacts. The list is saved only on this device and does not go to the server. The app opens WhatsApp or SMS with the message ready: it only arrives when you tap send.',
  'contatos confiança família avisar whatsapp sms': 'trusted contacts family notify whatsapp sms',
  'Como mando minha localização para alguém?': 'How do I send my location to someone?',
  'Em "Pedir ajuda", toque em "Compartilhar minha localização" (também em Configurações › Emergência). O app pega sua posição atual e monta uma mensagem com o link do mapa. Escolha um contato de confiança (WhatsApp ou SMS) ou outro aplicativo do celular. Sem permissão de localização, a mensagem vai sem o link.':
    'In "Get help", tap "Share my location" (also in Settings › Emergency). The app gets your current position and builds a message with the map link. Choose a trusted contact (WhatsApp or SMS) or another app on your phone. Without location permission, the message goes without the link.',
  'localização compartilhar mandar onde estou mapa whatsapp':
    'location share send where am i map whatsapp',
  'Posso pedir ajuda sem abrir o app?': 'Can I ask for help without opening the app?',
  'Sim, no Android. Entre na sua conta, vá em Configurações › Emergência e ative "Atalho na tela inicial". Depois toque em "Adicionar à tela inicial" e confirme na janela do Android. O ícone vermelho "Pedir ajuda" abre direto a tela de emergência, onde você escolhe o número com um toque. Se o seu celular não adicionar o ícone sozinho, toque e segure o ícone do Encontra-me e arraste "Pedir ajuda" para a tela inicial.':
    'Yes, on Android. Sign in to your account, go to Settings › Emergency and turn on "Home screen shortcut". Then tap "Add to home screen" and confirm in the Android window. The red "Get help" icon opens the emergency screen directly, where you choose the number with one tap. If your phone does not add the icon by itself, touch and hold the Encontra-me icon and drag "Get help" to the home screen.',
  'atalho widget tela inicial sem abrir rápido botão emergência':
    'shortcut widget home screen without opening quick button emergency',
  'O atalho liga ou envia algo sozinho?': 'Does the shortcut call or send anything by itself?',
  'Não. O atalho só abre a tela "Pedir ajuda". Nada é ligado ou enviado sem você tocar no número ou confirmar a mensagem. Ligar para 190, 180 ou 100 e mandar sua localização nunca exigem login. Para desligar o atalho, vá em Configurações › Emergência.':
    'No. The shortcut only opens the "Get help" screen. Nothing is called or sent unless you tap the number or confirm the message. Calling 190, 180 or 100 and sending your location never require signing in. To turn off the shortcut, go to Settings › Emergency.',
  'atalho seguro acidental desativar': 'shortcut safe accidental turn off',
  'Posso acompanhar meu trajeto até chegar em casa?': 'Can I track my route until I get home?',
  'rota trajeto acompanhar caminho': 'route path track way',
  'O que é o círculo familiar?': 'What is the family circle?',
  'família círculo compartilhar': 'family circle share',
  'Como crio minha conta?': 'How do I create my account?',
  'Na tela de entrada, escolha criar conta. São pedidos nome, CPF, e-mail, celular e CEP, o aceite das regras de uso e, depois, uma senha. Também é possível começar com sua conta Google. Seu CPF não aparece para outras pessoas no app.':
    'On the welcome screen, choose to create an account. You are asked for your name, CPF (Brazilian taxpayer ID), email, mobile number and CEP (postal code), to accept the terms of use and then to choose a password. You can also start with your Google account. Your CPF is not shown to other people in the app.',
  'cadastro registrar criar conta google': 'registration register create account google sign up',
  'Quais são as regras de uso?': 'What are the terms of use?',
  'Estão em Configurações > Regras de uso e privacidade. Em resumo: cadastre só casos reais, com vínculo ou autorização da família; não use o app para expor ou perseguir ninguém; e saiba que o uso não é anônimo — seus dados de cadastro identificam sua conta e podem ser usados para apurar abusos. A Política de Privacidade completa está publicada no site e em Sobre. Os Termos de Uso completos ainda estão em revisão jurídica.':
    "They are in Settings > Terms of use and privacy. In short: register only real cases, with a relationship to the person or the family's authorization; do not use the app to expose or stalk anyone; and know that use is not anonymous — your registration data identifies your account and may be used to investigate abuse. The full Privacy Policy is published on the website and in About. The full Terms of Use are still under legal review.",
  'regras termos uso política privacidade responsabilidade':
    'rules terms use policy privacy responsibility',
  'Esqueci minha senha. E agora?': 'I forgot my password. What now?',
  'A recuperação de senha pelo próprio app ainda não está disponível. Use "Falar com o suporte", escolha "Cadastro, login ou senha" e escreva o e-mail da sua conta. Nunca envie sua senha para ninguém, nem para o suporte.':
    'Password recovery in the app itself is not available yet. Use "Contact support", choose "Registration, sign-in or password" and write your account\'s email. Never send your password to anyone, not even to support.',
  'senha esqueci recuperar acesso': 'password forgot recover access',
  'Posso entrar com a digital ou o rosto?': 'Can I sign in with my fingerprint or face?',
  'Sim, no celular. Ative em Configurações > Segurança > "Entrar com biometria". Com ela ligada, ao sair o app só trava a conta; para sair de vez, desligue a biometria antes.':
    'Yes, on your phone. Turn it on in Settings > Security > "Sign in with biometrics". With it on, signing out only locks the account; to sign out completely, turn off biometrics first.',
  'digital face id biometria': 'fingerprint face id biometrics',
  'Como excluo minha conta?': 'How do I delete my account?',
  'Em Configurações > Minha conta, toque em "Excluir minha conta" e confirme. A conta e os dados pessoais são apagados na hora. Cadastros de pessoas desaparecidas que você publicou podem continuar no ar. Sem o app instalado, o pedido também pode ser feito pela página da política de privacidade.':
    'In Settings > My account, tap "Delete my account" and confirm. The account and personal data are deleted right away. Missing-person listings you published may stay up. Without the app installed, you can also ask on the privacy policy page.',
  'excluir apagar conta deletar': 'delete erase remove account',
  'Quando o app usa minha localização?': 'When does the app use my location?',
  'Só enquanto o app está aberto: para mostrar casos perto de você e, quando você pede, para marcar o local de um avistamento ou mandar sua localização a um contato. O Encontra-me não acompanha sua localização em segundo plano.':
    'Only while the app is open: to show cases near you and, when you ask, to mark the place of a sighting or send your location to a contact. Encontra-me does not track your location in the background.',
  'gps localização rastreio segundo plano': 'gps location tracking background',
  'Como mudo as permissões de localização, câmera ou fotos?':
    'How do I change the location, camera or photo permissions?',
  'Em Configurações > Privacidade e localização, toque em "Abrir ajustes do aparelho". Lá você liga ou desliga cada permissão do Encontra-me.':
    'In Settings > Privacy and location, tap "Open device settings". There you turn each Encontra-me permission on or off.',
  'permissão câmera fotos galeria': 'permission camera photos gallery',
  'Como peço acesso ou correção dos meus dados?':
    'How do I request access to or correction of my data?',
  'Use "Falar com o suporte" e escolha "Privacidade e meus dados". Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir acesso, correção e exclusão dos seus dados pessoais.':
    'Use "Contact support" and choose "Privacy and my data". Under Brazil\'s General Data Protection Law (LGPD), you can request access to, correction of and deletion of your personal data.',
  'lgpd dados pessoais acesso correção': 'lgpd personal data access correction privacy',
  'Alguém pediu dinheiro dizendo ter informações. É golpe?':
    'Someone asked for money claiming to have information. Is it a scam?',
  'Desconfie. O Encontra-me nunca pede pagamento para divulgar um caso ou passar informações. Não faça depósitos nem PIX para desconhecidos, não envie códigos recebidos por SMS e procure a polícia. Você também pode nos avisar em "Denunciar conteúdo ou golpe".':
    'Be suspicious. Encontra-me never asks for payment to share a case or pass on information. Do not make deposits or PIX transfers to strangers, do not send codes received by SMS, and go to the police. You can also let us know in "Report content or scam".',
  'golpe pix dinheiro extorsão resgate': 'scam pix money extortion ransom fraud',
  'Como denuncio um cadastro falso ou que coloca alguém em risco?':
    'How do I report a fake registration or one that puts someone at risk?',
  'Abra o caso e, no fim da página, toque em "Denunciar este cadastro". A denúncia fica registrada para a equipe. Dá para bloquear quem publicou, e o conteúdo dessa conta sai da sua lista. No grupo, cada mensagem de outra pessoa tem Denunciar e Bloquear. Em perigo, ligue 190.':
    'Open the case and, at the bottom of the page, tap "Report this registration". The report is recorded for the team. You can block the person who published it, and that account\'s content leaves your list. In the group, each other person\'s message has Report and Block. If you are in danger, call 190.',
  'denúncia denunciar falso remover retirar sou eu perseguição':
    'report fake remove take down it is me stalking',
  'Como me proteger ao divulgar um caso?': 'How do I protect myself when sharing a case?',
  'Evite publicar endereço de casa, rotina da família e documentos. Use um telefone de contato que você possa atender e confirme qualquer informação recebida com a polícia antes de agir.':
    "Avoid publishing your home address, your family's routine and documents. Use a contact phone number you can answer and confirm any information you receive with the police before acting.",
  'segurança exposição endereço': 'safety exposure address',
  'Quem é a Sofia?': 'Who is Sofia?',
  'A Sofia é uma inteligência artificial para conversar e oferecer apoio. Ela não substitui psicólogo, médico ou atendimento de emergência. Em crise, ligue 188 (CVV) ou 192 (SAMU).':
    'Sofia is an artificial intelligence for conversation and support. She does not replace a psychologist, a doctor or emergency services. In a crisis, call 188 (CVV) or 192 (SAMU).',
  'ia inteligência artificial chat apoio': 'ai artificial intelligence chat support',
  'O que é o grupo de apoio?': 'What is the support group?',
  'É uma conversa entre pessoas que usam o app, para troca de apoio. Não compartilhe dados pessoais, endereço ou documentos no grupo.':
    'It is a conversation among people who use the app, to exchange support. Do not share personal data, addresses or documents in the group.',
  'grupo conversa comunidade': 'group conversation community',
  // features/ajuda/sections/ajuda-contact-section.tsx
  'Ainda precisa de ajuda?': 'Still need help?',
  'Relatar um problema': 'Report a problem',
  'Falar com o suporte': 'Contact support',
  'Denunciar conteúdo ou golpe': 'Report content or scam',
  'Mensagem pronta no seu e-mail': 'Message ready in your email',
  'Abrimos seu app de e-mail com a mensagem preenchida. Ela só chega até nós quando você tocar em enviar. Você recebe a resposta no seu e-mail.':
    'We opened your email app with the message filled in. It only reaches us when you tap send. You will receive the reply by email.',
  'Ainda não geramos número de protocolo pelo app. Guarde o e-mail enviado como comprovante.':
    'The app does not generate a ticket number yet. Keep the email you sent as proof.',
  'Fechar formulário': 'Close form',
  'Assunto': 'Subject',
  'Mensagem': 'Message',
  'Conte o que aconteceu. Não escreva sua senha.':
    'Tell us what happened. Do not write your password.',
  'Mensagem para o suporte': 'Message to support',
  'Não encontramos um app de e-mail neste aparelho. Escreva para {supportEmail} a partir de qualquer e-mail.':
    'We could not find an email app on this device. Write to {supportEmail} from any email account.',
  'Ao continuar, seu app de e-mail abre com a mensagem para {supportEmail}. A mensagem só é enviada quando você confirmar no e-mail.':
    'When you continue, your email app opens with the message to {supportEmail}. The message is only sent when you confirm it in your email.',
  'Continuar no e-mail': 'Continue in email',
  // features/ajuda/sections/ajuda-faq-section.tsx
  'Pesquisar na ajuda (ex.: senha, avistamento)': 'Search help (e.g., password, sighting)',
  'Pesquisar na ajuda': 'Search help',
  'Limpar pesquisa': 'Clear search',
  'Voltar para as categorias': 'Back to categories',
  'Todas as categorias': 'All categories',
  '1 resultado': '1 result',
  '{count} resultados': '{count} results',
  'Não encontramos nada com essas palavras. Tente outro termo ou fale com o suporte.':
    'We found nothing with those words. Try another term or contact support.',
  // features/alerta-emergencia/alerta-emergencia.controller.ts
  'Alerta recebido pelo servidor do Encontra-me.': 'Alert received by the Encontra-me server.',
  'Alerta de emergência em {ALERT_COUNTDOWN_SECONDS} segundos. Toque em cancelar para parar.':
    'Emergency alert in {ALERT_COUNTDOWN_SECONDS} seconds. Tap cancel to stop.',
  'Alerta cancelado. Nada foi enviado.': 'Alert cancelled. Nothing was sent.',
  // features/alerta-emergencia/sections/alerta-countdown-section.tsx
  'Contagem pausada: responda sobre a localização':
    'Countdown paused: answer the location question',
  'O alerta começa em': 'The alert starts in',
  '1 segundo': '1 second',
  '{count} segundos': '{count} seconds',
  'segundo': 'second',
  'segundos': 'seconds',
  'Cancelar alerta': 'Cancel alert',
  'Quando a contagem terminar:': 'When the countdown ends:',
  'O telefone abre com o {callNumber}. Você toca em ligar.':
    'The phone opens with {callNumber}. You tap call.',
  'Um alerta com sua localização vai para o Encontra-me. Esta tela mostra quando ele for recebido.':
    'An alert with your location goes to Encontra-me. This screen shows when it is received.',
  'Sua localização fica pronta para você mandar a seus contatos de confiança.':
    'Your location is ready for you to send to your trusted contacts.',
  'Não esperar: abrir o telefone com o {callNumber} agora':
    'Do not wait: open the phone with {callNumber} now',
  'Não esperar — ligar {callNumber} agora': 'Do not wait — call {callNumber} now',
  // features/alerta-emergencia/sections/alerta-result-section.tsx
  'Telefone aberto com o {callNumber}': 'Phone opened with {callNumber}',
  'Toque em ligar para falar com a Polícia Militar. Se o telefone não abriu, disque {callNumber}.':
    'Tap call to speak with the Military Police. If the phone did not open, dial {callNumber}.',
  'Não foi possível abrir o telefone': 'Could not open the phone',
  'Disque {callNumber} manualmente.': 'Dial {callNumber} manually.',
  'Ligue para o {callNumber}': 'Call {callNumber}',
  'Toque no botão abaixo para abrir o telefone.': 'Tap the button below to open the phone.',
  'Ligar {callNumber}': 'Call {callNumber}',
  'Alerta automático ainda não disponível': 'Automatic alert not available yet',
  'Por enquanto o Encontra-me não envia o alerta sozinho para ninguém. Avise seus contatos abaixo.':
    'For now, Encontra-me does not send the alert to anyone by itself. Notify your contacts below.',
  'Alerta não enviado: entre na sua conta': 'Alert not sent: sign in to your account',
  'Com a conta conectada, o alerta vai para o Encontra-me. Ligar e mandar a localização funcionam sem conta.':
    'With your account connected, the alert goes to Encontra-me. Calling and sending your location work without an account.',
  'Entrar na conta': 'Sign in',
  'Enviando o alerta… aguarde a confirmação do servidor.':
    "Sending the alert… wait for the server's confirmation.",
  'Alerta recebido pelo Encontra-me': 'Alert received by Encontra-me',
  'Recebido às {time} · protocolo {alertId}.': 'Received at {time} · reference {alertId}.',
  'O servidor avisou 1 contato.': 'The server notified 1 contact.',
  'O servidor avisou {count} contatos.': 'The server notified {count} contacts.',
  'Teste do modo de desenvolvimento: nenhum alerta real foi enviado.':
    'Development mode test: no real alert was sent.',
  'Envio do alerta não confirmado': 'Alert delivery not confirmed',
  'O alerta pode não ter chegado. Ligue {callNumber} e avise seus contatos.':
    'The alert may not have arrived. Call {callNumber} and notify your contacts.',
  'Tentar enviar de novo': 'Try sending again',
  'Avise seus contatos': 'Notify your contacts',
  'Outros números': 'Other numbers',
  'Voltar ao início': 'Back to home',
  // features/biometric/sections/biometric-enroll-section.tsx
  'Agora não': 'Not now',
  // features/cadastrar-pessoa/cadastrar-pessoa.controller.ts
  'Branca': 'White',
  'Preta': 'Black',
  'Parda': 'Mixed race (parda)',
  'Amarela': 'Asian descent (amarela)',
  'Indígena': 'Indigenous',
  'Magro': 'Slim',
  'Médio': 'Medium',
  'Atlético': 'Athletic',
  'Forte': 'Heavy-set',
  'Entre na sua conta': 'Sign in to your account',
  'Para revisar e enviar um cadastro feito neste aparelho, entre na sua conta.':
    'To review and send a registration made on this device, sign in to your account.',
  'Cadastro não encontrado': 'Registration not found',
  'Ele pode já ter sido enviado ou apagado deste aparelho.':
    'It may have already been sent or deleted from this device.',
  'Não foi possível abrir o cadastro': 'Could not open the registration',
  'Tente novamente em instantes.': 'Try again in a moment.',
  'Foto muito grande': 'Photo too large',
  'A foto deve ter no máximo 2 MB.': 'The photo must be at most 2 MB.',
  'Foto inválida': 'Invalid photo',
  'Não foi possível ler a imagem selecionada.': 'Could not read the selected image.',
  'Permissão necessária': 'Permission required',
  'Autorize o acesso à galeria para escolher uma foto.':
    'Allow access to the gallery to choose a photo.',
  'Autorize o acesso à câmera para tirar uma foto.': 'Allow access to the camera to take a photo.',
  'Não foi possível ler a imagem capturada.': 'Could not read the captured image.',
  'Formato inválido': 'Invalid format',
  'Envie apenas fotos PNG ou JPG.': 'Only PNG or JPG photos are accepted.',
  'Não foi possível ler o arquivo selecionado.': 'Could not read the selected file.',
  'Adicionar foto': 'Add photo',
  'Escolha a origem da imagem': 'Choose the image source',
  'Câmera': 'Camera',
  'Galeria': 'Gallery',
  'Cancelar': 'Cancel',
  'Falta pouco': 'Almost there',
  'No fim do formulário, informe seu vínculo com a pessoa, o boletim de ocorrência (obrigatório para crianças e adolescentes) e confirme a declaração.':
    'At the end of the form, state your relationship to the person, the police report number (required for children and teenagers) and confirm the statement.',
  'Sua sessão terminou. Entre de novo para enviar este cadastro.':
    'Your session has ended. Sign in again to send this registration.',
  'Cadastro enviado': 'Registration sent',
  'O caso foi enviado pela sua conta e saiu da lista de cadastros deste aparelho.':
    'The case was sent from your account and left the list of registrations on this device.',
  'Cadastro concluído': 'Registration complete',
  'A pessoa foi cadastrada com sucesso.': 'The person was registered successfully.',
  'Cadastro salvo só neste aparelho. Para enviá-lo, entre na sua conta e toque em "Revisar e enviar" no próprio cadastro ou em Meu perfil.':
    'Registration saved only on this device. To send it, sign in to your account and tap "Review and send" on the registration itself or in My profile.',
  // features/cadastrar-pessoa/legitimacy.ts
  'Mãe ou pai': 'Mother or father',
  'Responsável legal': 'Legal guardian',
  'Outro familiar': 'Other relative',
  'Cônjuge ou companheiro(a)': 'Spouse or partner',
  'Amigo(a)': 'Friend',
  'Outro': 'Other',
  // features/cadastrar-pessoa/sections/cadastrar-pessoa-basic-section.tsx
  'Cadastro feito neste aparelho': 'Registration made on this device',
  'Carregando o cadastro…': 'Loading the registration…',
  'Confira os dados, complete o que faltar e confirme a declaração no fim. Ao enviar, o caso fica ligado à sua conta.':
    'Check the data, fill in what is missing and confirm the statement at the end. When you send it, the case is linked to your account.',
  'Proteja quem você procura': 'Protect the person you are looking for',
  'Não informe endereço de casa, escola, rotina nem documentos — principalmente de crianças e de mulheres em situação de risco. Faça também o boletim de ocorrência: não é preciso esperar 24 horas.':
    'Do not give a home address, school, routine or documents — especially for children and for women at risk. Also file a police report: there is no need to wait 24 hours.',
  'Nome completo': 'Full name',
  'Fulano Beltrano da Silva': 'John Doe',
  'Localidade': 'Location',
  'Ex.: Savassi, Belo Horizonte - MG': 'E.g., Savassi, Belo Horizonte - MG',
  'Onde a pessoa foi vista pela última vez: bairro ou ponto de referência e cidade.':
    'Where the person was last seen: neighborhood or landmark, and city.',
  'De onde a pessoa é (opcional)': 'Where the person is from (optional)',
  'Cidade': 'City',
  'Ex.: Belo Horizonte': 'E.g., Belo Horizonte',
  'Estado': 'State',
  'Ex.: MG': 'E.g., MG',
  'País': 'Country',
  'Ex.: Brasil': 'E.g., Brazil',
  'Bairro': 'Neighborhood',
  'Ex.: Savassi': 'E.g., Savassi',
  'Telefone': 'Phone',
  'Da família ou de quem cadastra, para receber informações sobre a pessoa.':
    "The family's or the registrant's, to receive information about the person.",
  'Foto': 'Photo',
  'Foto escolhida': 'Selected photo',
  'Remover foto': 'Remove photo',
  'Recente e nítida, de preferência só do rosto. PNG ou JPG, até 2 MB.':
    'Recent and sharp, preferably of the face only. PNG or JPG, up to 2 MB.',
  'Apelido': 'Nickname',
  'Fulano': 'Johnny',
  'Idade': 'Age',
  'Porte físico': 'Build',
  'Altura': 'Height',
  '180 cm': '180 cm',
  'Cor/Etnia': 'Skin color/Ethnicity',
  'Roupas': 'Clothes',
  'Camisa branca, calça jeans etc.': 'White shirt, jeans, etc.',
  // features/cadastrar-pessoa/sections/cadastrar-pessoa-details-section.tsx
  'Cabelo': 'Hair',
  'Cabelo preto cacheado': 'Curly black hair',
  'Olhos': 'Eyes',
  'Olhos castanhos': 'Brown eyes',
  'Tatuagem': 'Tattoo',
  'Tatuagem de leão no braço esquerdo': 'Lion tattoo on the left arm',
  'Acessórios': 'Accessories',
  'Brincos, colar, pulseiras etc.': 'Earrings, necklace, bracelets, etc.',
  'Data em que foi vista pela última vez': 'Date last seen',
  'dd/mm/aaaa': 'dd/mm/yyyy',
  'Enviar cadastro': 'Send registration',
  // features/cadastrar-pessoa/sections/cadastrar-pessoa-responsibility-section.tsx
  'Sobre quem está cadastrando': 'About the person registering',
  'Seu vínculo com a pessoa *': 'Your relationship to the person *',
  'Escolha': 'Choose',
  'Número do boletim de ocorrência': 'Police report number',
  'Ex.: 2026-123456': 'E.g., 2026-123456',
  'Para crianças e adolescentes, o número do boletim de ocorrência é obrigatório. Registre na delegacia mais próxima ou, se o seu estado permitir, na delegacia on-line — não é preciso esperar 24 horas.':
    'For children and teenagers, the police report number (boletim de ocorrência) is required. File it at the nearest police station or, if your state allows it, at the online police station — there is no need to wait 24 hours.',
  'Recomendado. Com o boletim de ocorrência, o caso fica mais confiável para a comunidade.':
    'Recommended. With the police report, the case is more trustworthy for the community.',
  'Declaro que as informações são verdadeiras, que tenho vínculo com a pessoa ou autorização da família e que o cadastro não tem como objetivo perseguir ou expor ninguém':
    "I declare that the information is true, that I have a relationship with the person or the family's authorization, and that this registration is not meant to stalk or expose anyone",
  'Declaro que as informações são verdadeiras, que tenho vínculo com a pessoa ou autorização da família e que o cadastro não tem como objetivo perseguir ou expor ninguém. Sei que informações falsas podem levar ao bloqueio da conta e à responsabilização civil e criminal.':
    "I declare that the information is true, that I have a relationship with the person or the family's authorization, and that this registration is not meant to stalk or expose anyone. I know that false information can lead to the account being blocked and to civil and criminal liability.",
  'Ver regras de uso': 'See the terms of use',
  // features/chat/sections/chat-disclaimer-section.tsx
  'Antes de conversar com a Sofia': 'Before talking to Sofia',
  'Sofia é uma inteligência artificial criada para conversar e oferecer apoio e informações. Ela não substitui um terapeuta, psicólogo, psiquiatra, médico ou outro profissional de saúde qualificado.\n\nSofia não realiza diagnósticos, tratamentos ou atendimento de emergência.\n\nSe você estiver em perigo ou passando por uma situação de emergência, procure ajuda profissional ou um serviço de emergência da sua região.':
    'Sofia is an artificial intelligence created to talk and offer support and information. She does not replace a therapist, psychologist, psychiatrist, doctor or other qualified health professional.\n\nSofia does not provide diagnoses, treatment or emergency care.\n\nIf you are in danger or going through an emergency, seek professional help or an emergency service in your area.',
  'Em emergência no Brasil, ligue:': 'In an emergency in Brazil, call:',
  '188 · CVV (apoio emocional)\n192 · SAMU\n193 · Bombeiros\n190 · Polícia Militar':
    '188 · CVV (emotional support)\n192 · SAMU (ambulance)\n193 · Fire Department\n190 · Military Police',
  'Entendi, continuar': 'Got it, continue',
  // features/chat/sections/chat-header-section.tsx
  'Sobre a Sofia': 'About Sofia',
  'Sofia': 'Sofia',
  'aqui com você': 'here with you',
  'Exercícios rápidos': 'Quick exercises',
  'Apagar conversa': 'Delete conversation',
  // features/chat/sections/chat-input-section.tsx
  'Escreva o que está sentindo…': 'Write what you are feeling…',
  'Enviar': 'Send',
  // features/chat/sections/chat-messages-section.tsx
  'Um momento…': 'One moment…',
  // features/compartilhar-localizacao/sections/location-share-section.tsx
  'Enviar minha localização': 'Send my location',
  'Localização obtida às {value}': 'Location obtained at {value}',
  'Buscando sua localização…': 'Getting your location…',
  'Sem permissão de localização': 'No location permission',
  'Não foi possível obter a localização': 'Could not get your location',
  'Precisão não informada pelo GPS.': 'Accuracy not reported by the GPS.',
  'Isso leva alguns segundos.': 'This takes a few seconds.',
  'Você ainda pode avisar seus contatos: a mensagem vai sem o link do mapa.':
    'You can still notify your contacts: the message goes without the map link.',
  'Verifique se o GPS está ligado. A mensagem vai sem o link do mapa.':
    'Check that the GPS is on. The message goes without the map link.',
  'Permitir nos ajustes': 'Allow in settings',
  'Atualizar localização': 'Update location',
  'Enviar por WhatsApp para {name}': 'Send by WhatsApp to {name}',
  'WhatsApp': 'WhatsApp',
  'Enviar SMS para {name}': 'Send SMS to {name}',
  'SMS': 'SMS',
  'Você ainda não tem contatos de confiança. Cadastre até 5 pessoas para avisar com um toque.':
    'You do not have trusted contacts yet. Add up to 5 people to notify with one tap.',
  'Escolher no celular': 'Choose on the phone',
  'Gerenciar contatos de confiança': 'Manage trusted contacts',
  'Cadastrar contatos de confiança': 'Add trusted contacts',
  'Abrimos {opened}. A mensagem só chega quando você tocar em enviar.':
    'We opened {opened}. The message only arrives when you tap send.',
  'O app não envia nada sozinho: ele abre o WhatsApp, o SMS ou o compartilhamento com a mensagem pronta e você confirma o envio.':
    'The app does not send anything by itself: it opens WhatsApp, SMS or the share menu with the message ready, and you confirm sending it.',
  // features/compartilhar-localizacao/use-location-share.ts
  'Não foi possível abrir': 'Could not open',
  'Tente outra opção ou toque em "Escolher no celular".':
    'Try another option or tap "Choose on the phone".',
  'Número inválido': 'Invalid number',
  'Confira o celular de {name} em Contatos de confiança.':
    "Check {name}'s mobile number in Trusted contacts.",
  'Abra os ajustes do celular e permita a localização.':
    "Open your phone's settings and allow location.",
  'o WhatsApp com a mensagem para {name}': 'WhatsApp with the message for {name}',
  'o SMS com a mensagem para {name}': 'SMS with the message for {name}',
  'Minha localização': 'My location',
  'o compartilhamento do celular': "the phone's share menu",
  // features/configuracoes/configuracoes.controller.ts
  'Permitida': 'Allowed',
  'Negada': 'Denied',
  'Não definida': 'Not set',
  'Entrar com biometria': 'Sign in with biometrics',
  'Confirme para ativar o login com biometria.': 'Confirm to turn on biometric sign-in.',
  'Abra os ajustes do celular e procure por Encontra-me.':
    "Open your phone's settings and look for Encontra-me.",
  'Apagar cadastros deste aparelho?': 'Delete registrations on this device?',
  'Os cadastros que ainda não foram enviados serão apagados e não poderão ser recuperados.':
    'Registrations that have not been sent yet will be deleted and cannot be recovered.',
  'Apagar': 'Delete',
  'Pronto': 'Done',
  'Os cadastros salvos neste aparelho foram apagados.':
    'The registrations saved on this device were deleted.',
  'Não foi possível apagar': 'Could not delete',
  'Sair da conta?': 'Sign out?',
  'Com a biometria ligada, sua conta fica travada neste aparelho até você entrar de novo.':
    'With biometrics on, your account stays locked on this device until you sign in again.',
  'Você precisará entrar de novo para enviar cadastros e avistamentos.':
    'You will need to sign in again to send registrations and sightings.',
  'Sair': 'Sign out',
  'Excluir a conta?': 'Delete the account?',
  'A conta e os dados pessoais são apagados agora. Cadastros de pessoas desaparecidas que você publicou podem continuar no ar.':
    'The account and personal data are deleted now. Missing-person listings you published may stay up.',
  'Excluir conta': 'Delete account',
  'Não foi possível excluir a conta': 'Could not delete the account',
  'Tente de novo. Se o app não abrir, escreva para {supportEmail}.':
    'Try again. If the app will not open, write to {supportEmail}.',
  'Conta excluída': 'Account deleted',
  'Seus dados pessoais foram apagados.': 'Your personal data has been deleted.',
  'Apaga a conta e os dados pessoais ligados a ela.': 'Deletes the account and the personal data tied to it.',
  'Para denunciar ou bloquear, entre na sua conta.': 'To report or block, sign in to your account.',
  'Denunciar esta mensagem?': 'Report this message?',
  'A denúncia fica registrada para a equipe analisar.': 'The report is recorded for the team to review.',
  'Denúncia registrada': 'Report recorded',
  'A equipe pode analisar esta denúncia.': 'The team can review this report.',
  'Não foi possível registrar': 'Could not record it',
  'Tente de novo em alguns instantes.': 'Try again in a few moments.',
  'Bloquear esta pessoa?': 'Block this person?',
  'Você deixa de ver as mensagens e os cadastros publicados por esta conta.':
    'You will no longer see messages and listings published by this account.',
  'Bloquear': 'Block',
  'Pessoa bloqueada': 'Person blocked',
  'O conteúdo desta conta saiu da sua lista.': 'This account\'s content left your list.',
  'Não foi possível bloquear': 'Could not block',
  'Denunciar esta mensagem': 'Report this message',
  'Bloquear esta pessoa': 'Block this person',
  'Para denunciar um aviso, entre na sua conta.': 'To report a notice, sign in to your account.',
  'Para denunciar um cadastro, entre na sua conta.': 'To report a listing, sign in to your account.',
  'Para bloquear quem publicou, entre na sua conta.': 'To block the person who published it, sign in to your account.',
  'Bloquear quem publicou?': 'Block the person who published it?',
  'Você deixa de ver os cadastros e as mensagens desta conta.':
    'You will no longer see listings and messages from this account.',
  'Bloquear quem publicou': 'Block the person who published it',
  'A correção abre o seu app de e-mail. A denúncia fica registrada no app para a equipe analisar.':
    'A correction opens your email app. The report is recorded in the app for the team to review.',
  'Continuar': 'Continue',
  'Usa o idioma do navegador. Agora: {language}.': "Uses the browser's language. Now: {language}.",
  'Usa o idioma do celular. Agora: {language}.': "Uses the phone's language. Now: {language}.",
  // features/configuracoes/sections/configuracoes-groups-section.tsx
  'Disponível no aplicativo Android.': 'Available in the Android app.',
  'Atualize o Encontra-me para usar este recurso.': 'Update Encontra-me to use this feature.',
  'Requer Android 7.1 ou mais recente.': 'Requires Android 7.1 or later.',
  'Minha conta': 'My account',
  'Editar perfil e foto': 'Edit profile and photo',
  'Depende de atualização da API.': 'Depends on an API update.',
  'Alterar ou recuperar senha': 'Change or recover password',
  'Enquanto não está no app, peça pela Central de Ajuda.':
    'Until it is in the app, ask through the Help Center.',
  'Saindo…': 'Signing out…',
  'Sair da conta': 'Sign out',
  'Entrar ou criar conta': 'Sign in or create an account',
  'Necessário para enviar cadastros e avistamentos.':
    'Required to send registrations and sightings.',
  'O atalho abre direto a tela "Pedir ajuda". Nada liga ou é enviado sozinho: você toca no número ou confirma o envio da mensagem. Ligar para 190, 180 ou 100 e mandar sua localização nunca exigem login.':
    'The shortcut opens the "Get help" screen directly. Nothing is called or sent by itself: you tap the number or confirm sending the message. Calling 190, 180 or 100 and sending your location never require signing in.',
  'Alerta de emergência': 'Emergency alert',
  'Contagem de 10 segundos para cancelar; depois abre o 190.':
    '10-second countdown to cancel; then it opens 190.',
  'Contatos de confiança': 'Trusted contacts',
  'Para quem mandar sua localização com um toque.': 'Who to send your location to with one tap.',
  'Nenhum contato ainda. Cadastre até 5.': 'No contacts yet. Add up to 5.',
  '1 contato salvo neste aparelho.': '1 contact saved on this device.',
  '{count} contatos salvos neste aparelho.': '{count} contacts saved on this device.',
  'Por WhatsApp, SMS ou outro aplicativo.': 'By WhatsApp, SMS or another app.',
  'Atalho na tela inicial': 'Home screen shortcut',
  'Ativado neste celular.': 'Turned on on this phone.',
  'Peça ajuda sem precisar abrir o app.': 'Ask for help without opening the app.',
  'Entre na sua conta para ativar.': 'Sign in to your account to turn it on.',
  'Adicionar à tela inicial': 'Add to home screen',
  'Coloca o ícone vermelho "Pedir ajuda" ao lado dos seus apps.':
    'Puts the red "Get help" icon next to your apps.',
  'Como funciona': 'How it works',
  'Notificações': 'Notifications',
  'Os avisos são um apoio e podem atrasar ou não chegar. O Encontra-me não avisa a polícia: em emergência, ligue 190. Na tela bloqueada, a notificação não mostra nome nem foto.':
    'Alerts are a support tool and may be delayed or not arrive. Encontra-me does not notify the police: in an emergency, call 190. On the lock screen, the notification shows no name or photo.',
  'Por enquanto, o Encontra-me só envia o lembrete de cadastros salvos neste aparelho. Os avisos de casos ainda não foram lançados.':
    'For now, Encontra-me only sends the reminder about reports saved on this device. Case alerts have not been launched yet.',
  'Notificações bloqueadas no celular': 'Notifications blocked on this phone',
  'Toque para abrir os ajustes e permitir.': 'Tap to open settings and allow them.',
  'Lembrete de cadastros salvos': 'Saved reports reminder',
  'Uma vez por dia, às 19h, enquanto houver cadastro feito neste aparelho aguardando envio.':
    'Once a day, at 7 p.m., while a report made on this device is waiting to be sent.',
  'Casos perto de mim': 'Cases near me',
  'Novos casos perto da sua região aproximada. Usa a localização só se você já permitiu.':
    'New cases near your approximate area. Uses your location only if you have already allowed it.',
  'Novos cadastros da minha região': 'New reports in my region',
  'Pessoas desaparecidas recém-cadastradas na sua cidade e estado.':
    'Missing people recently reported in your city and state.',
  'Atualizações dos casos que acompanho': 'Updates on cases I follow',
  'Quando um caso que você acompanha muda de situação ou recebe avistamento.':
    'When a case you follow changes status or gets a sighting.',
  'Notificações desligadas': 'Notifications turned off',
  'Permita as notificações do Encontra-me nos ajustes do celular para receber avisos.':
    "Allow Encontra-me notifications in your phone's settings to receive alerts.",
  'Abrir ajustes': 'Open settings',
  'Não disponível neste aparelho': 'Not available on this device',
  'Atualize o Encontra-me para receber notificações.': 'Update Encontra-me to receive notifications.',
  'Confira sua conexão e tente de novo.': 'Check your connection and try again.',
  'Avisos indisponíveis neste aparelho': 'Alerts unavailable on this device',
  'Este aparelho não recebe avisos do servidor. Instale o Encontra-me pela loja de aplicativos em um celular.':
    'This device does not receive alerts from the server. Install Encontra-me from the app store on a phone.',
  'Para acompanhar um caso, entre na sua conta.': 'To follow a case, sign in to your account.',
  'Não foi possível parar de acompanhar': 'Could not stop following',
  'Para receber as novidades deste caso, permita as notificações do Encontra-me nos ajustes do celular.':
    "To get updates on this case, allow Encontra-me notifications in your phone's settings.",
  'Você está acompanhando este caso': 'You are following this case',
  'Avisamos quando ele mudar de situação ou receber um novo avistamento. A notificação pode atrasar.':
    'We will let you know when it changes status or gets a new sighting. The notification may be delayed.',
  'Não foi possível acompanhar': 'Could not follow',
  'Acompanhando este caso': 'Following this case',
  'Acompanhar este caso': 'Follow this case',
  'Casos e lembretes': 'Cases and reminders',
  'O app envia notificações?': 'Does the app send notifications?',
  'Só se você ligar, em Configurações › Notificações, no aplicativo de celular. O "Lembrete de cadastros salvos" avisa uma vez por dia, às 19h, enquanto houver cadastro feito neste aparelho aguardando envio; ele só é enviado quando você revisa e confirma. Os avisos de casos perto de você, de novos cadastros da sua região e dos casos que você acompanha aparecem como "Em breve" enquanto não forem lançados. Quando estiverem disponíveis, você precisa estar com a conta conectada. Na tela bloqueada, a notificação não mostra nome nem foto. Os avisos podem atrasar e o app não avisa a polícia: em emergência, ligue 190.':
    'Only if you turn them on, in Settings › Notifications, in the phone app. The "Saved reports reminder" alerts you once a day, at 7 p.m., while a report made on this device is waiting to be sent; it is only sent when you review and confirm it. Alerts about cases near you, new reports in your region and cases you follow show as "Coming soon" until they are launched. When they are available, you need to be signed in. On the lock screen, the notification shows no name or photo. Alerts may be delayed and the app does not notify the police: in an emergency, call 190.',
  'notificação aviso lembrete alerta push acompanhar seguir': 'notification alert reminder push follow',
  'Como acompanho um caso?': 'How do I follow a case?',
  'Quando o recurso estiver disponível no seu aplicativo, a página da pessoa mostra o botão "Acompanhar este caso". Com a conta conectada, toque nele e permita as notificações: você recebe um aviso quando o caso mudar de situação ou receber um novo avistamento. Toque de novo para parar. Para desligar todos esses avisos, use Configurações › Notificações.':
    'When the feature is available in your app, the person\'s page shows the "Follow this case" button. Signed in, tap it and allow notifications: you get an alert when the case changes status or gets a new sighting. Tap again to stop. To turn off all these alerts, use Settings › Notifications.',
  'acompanhar seguir caso atualização notificação': 'follow case update notification',
  'Cadastro aguardando envio': 'Report waiting to be sent',
  'Você tem 1 cadastro salvo neste aparelho. Ele só é enviado quando você revisa e confirma.':
    'You have 1 report saved on this device. It is only sent when you review and confirm it.',
  'Você tem {count} cadastros salvos neste aparelho. Eles só são enviados quando você revisa e confirma.':
    'You have {count} reports saved on this device. They are only sent when you review and confirm them.',
  'O app usa sua localização só enquanto está aberto, para mostrar casos próximos, marcar avistamentos e, quando você pede, mandar sua localização a um contato.':
    'The app uses your location only while it is open, to show nearby cases, mark sightings and, when you ask, send your location to a contact.',
  'Permissão de localização': 'Location permission',
  'No navegador': 'In the browser',
  'No navegador, a permissão é controlada nas configurações do site.':
    'In the browser, the permission is controlled in the site settings.',
  'Abrir ajustes do aparelho': 'Open device settings',
  'Ligue ou desligue localização, câmera e fotos.': 'Turn location, camera and photos on or off.',
  'Cadastros salvos neste aparelho': 'Registrations saved on this device',
  'Não foi possível verificar.': 'Could not check.',
  'Nenhum cadastro aguardando envio.': 'No registrations waiting to be sent.',
  '{localPendingCount} aguardando envio. Toque para apagar.':
    '{localPendingCount} waiting to be sent. Tap to delete.',
  'Como usamos seus dados': 'How we use your data',
  'Resumo no app. A política completa está no site.':
    'Summary in the app. The full policy is on the website.',
  'Segurança': 'Security',
  'Pede sua digital ou rosto para abrir a conta neste celular.':
    'Asks for your fingerprint or face to open the account on this phone.',
  'Disponível só no aplicativo de celular.': 'Available only in the mobile app.',
  'Este aparelho não tem biometria cadastrada.': 'This device has no biometrics set up.',
  'Dicas contra golpes': 'Tips against scams',
  'Sessões ativas': 'Active sessions',
  'Idioma': 'Language',
  'Não são traduzidos: o que as pessoas escrevem nos casos e nas conversas e as respostas da Sofia. Os números de emergência continuam os do Brasil.':
    "Not translated: what people write in cases and conversations, and Sofia's replies. The emergency numbers are still the Brazilian ones.",
  'Idioma do app': 'App language',
  'Aparência e acessibilidade': 'Appearance and accessibility',
  'Tema: Automático segue o modo claro ou escuro do celular. O tamanho do texto acompanha a configuração de fonte do aparelho.':
    "Theme: Automatic follows your phone's light or dark mode. The text size follows the device's font setting.",
  'Tema': 'Theme',
  'Cores do chat da Sofia': 'Sofia chat colors',
  'Ajuda e informações': 'Help and information',
  'Ajuda e suporte': 'Help and support',
  'Sobre o Encontra-me': 'About Encontra-me',
  'Regras de uso e privacidade': 'Terms of use and privacy',
  // features/configuracoes/use-emergency-shortcut-settings.ts
  'Confirme no Android': 'Confirm on Android',
  'Na janela do Android, toque em "Adicionar" para colocar o ícone "Pedir ajuda" na tela inicial.':
    'In the Android window, tap "Add" to put the "Get help" icon on the home screen.',
  'Adicione manualmente': 'Add it manually',
  'Toque e segure o ícone do Encontra-me na tela inicial e arraste "Pedir ajuda" para onde quiser.':
    'Touch and hold the Encontra-me icon on the home screen and drag "Get help" wherever you want.',
  'Desativar o atalho de emergência?': 'Turn off the emergency shortcut?',
  'O ícone "Pedir ajuda" da tela inicial vai parar de funcionar neste celular.':
    'The "Get help" icon on the home screen will stop working on this phone.',
  'Desativar': 'Turn off',
  'Confirme para ativar o atalho de emergência.': 'Confirm to turn on the emergency shortcut.',
  'Não foi possível ativar': 'Could not turn it on',
  'Tente de novo. Se continuar, atualize o Encontra-me pela loja de aplicativos.':
    'Try again. If it keeps happening, update Encontra-me from the app store.',
  'Atalho ativado': 'Shortcut turned on',
  'Quer colocar o ícone "Pedir ajuda" na tela inicial agora?':
    'Do you want to put the "Get help" icon on the home screen now?',
  'Adicionar': 'Add',
  'Depois': 'Later',
  'Toque e segure o ícone do Encontra-me para ver "Pedir ajuda". Você pode arrastá-lo para a tela inicial.':
    'Touch and hold the Encontra-me icon to see "Get help". You can drag it to the home screen.',
  // features/contatos-confianca/contatos-confianca.controller.ts
  'Não foi possível salvar': 'Could not save',
  '{name} foi adicionado(a) aos seus contatos de confiança.':
    '{name} was added to your trusted contacts.',
  'Remover {name}?': 'Remove {name}?',
  'O contato sai só desta lista. Nada é avisado a ele.':
    'The contact is removed only from this list. They are not notified.',
  'Remover': 'Remove',
  '{name} saiu da lista.': '{name} was removed from the list.',
  // features/contatos-confianca/sections/contatos-confianca-section.tsx
  'Pessoas para quem você manda sua localização com um toque, por WhatsApp ou SMS — no alerta de emergência ou em "Compartilhar localização". A lista fica salva só neste aparelho e o app não envia nada sozinho.':
    'People to whom you send your location with one tap, by WhatsApp or SMS — in the emergency alert or in "Share location". The list is saved only on this device and the app does not send anything by itself.',
  'Nenhum contato ainda. Adicione até {max} pessoas.': 'No contacts yet. Add up to {max} people.',
  'Remover {name}': 'Remove {name}',
  'Você chegou ao limite de {max} contatos. Remova um para adicionar outro.':
    'You have reached the limit of {max} contacts. Remove one to add another.',
  'Adicionar contato': 'Add contact',
  'Nome': 'Name',
  'Ex.: Mãe': 'E.g., Mom',
  'Celular com DDD': 'Mobile number with area code',
  'Combine antes com essas pessoas o que fazer ao receber um pedido de ajuda — por exemplo, ligar para você e, se não atender, ligar para o 190.':
    'Agree beforehand with these people on what to do when they receive a request for help — for example, call you and, if you do not answer, call 190.',
  // features/exercises/exercises.controller.ts
  'Inspire': 'Breathe in',
  'Segure': 'Hold',
  'Expire': 'Breathe out',
  // features/exercises/sections/exercise-gratitude-section.tsx
  'Pelo que você é grata(o) agora?': 'What are you grateful for right now?',
  'Escreva algo aqui…': 'Write something here…',
  'Guardado com carinho': 'Saved with care',
  'Guardar': 'Save',
  // features/exercises/sections/exercise-grounding-section.tsx
  'Encontre com calma:\n5 coisas que você vê\n4 que pode tocar\n3 que ouve\n2 que sente cheiro\n1 que pode saborear':
    'Calmly find:\n5 things you can see\n4 you can touch\n3 you can hear\n2 you can smell\n1 you can taste',
  // features/exercises/sections/exercises-list-section.tsx
  'Pequenos gestos que fazem muita diferença': 'Small gestures that make a big difference',
  // features/google-auth/use-google-auth.ts
  'Não foi possível entrar com o Google.': 'Could not sign in with Google.',
  // features/grupo-chat/sections/grupo-chat-input-section.tsx
  'Digite sua mensagem aqui...': 'Type your message here...',
  // features/grupo-chat/sections/grupo-chat-messages-section.tsx
  'Usuário': 'User',
  // features/home/sections/home-actions-section.tsx
  'Começar': 'Get started',
  'Já possuo uma conta ›': 'I already have an account ›',
  // features/home/sections/home-desktop-auth-section.tsx
  'Criar uma conta': 'Create an account',
  // features/inicio/sections/inicio-onboarding-section.tsx
  'Passo {value} de {count}': 'Step {value} of {count}',
  'Avistei uma pessoa — quero reportar': 'I spotted a person — I want to report it',
  'Quero cadastrar uma pessoa desaparecida': 'I want to register a missing person',
  // features/inicio/sections/inicio-alerts-section.tsx
  'Nenhuma pessoa próxima.': 'No people nearby.',
  'Pessoas desaparecidas. Deslize para o lado para ver mais.':
    'Missing people. Swipe sideways to see more.',
  'Ver todas': 'See all',
  'Ver detalhes de {fullName}': 'See details for {fullName}',
  // features/inicio/sections/inicio-people-sidebar-section.tsx
  'Pessoas próximas': 'People nearby',
  'Idade: {age}': 'Age: {age}',
  // features/inicio/sections/inicio-top-bar-section.tsx
  'Chat com a Sofia (IA)': 'Chat with Sofia (AI)',
  'Grupo de apoio': 'Support group',
  'Meu perfil': 'My profile',
  'Configurações': 'Settings',
  'Entrar': 'Sign in',
  'Nome, bairro ou cidade': 'Name, neighborhood or city',
  'Buscar pessoas': 'Search people',
  'Limpar busca': 'Clear search',
  'Buscar': 'Search',
  'Ative a localização para ver pessoas próximas.': 'Turn on location to see people nearby.',
  'Fechar menu': 'Close menu',
  'Menu': 'Menu',
  'Tema do app': 'App theme',
  // features/login/login.controller.ts
  'Não foi possível entrar com a digital. Use e-mail e senha.':
    'Could not sign in with your fingerprint. Use email and password.',
  'Entrar com a digital': 'Sign in with fingerprint',
  // features/login/sections/login-form-section.tsx
  'ou': 'or',
  'E-mail / CPF': 'Email / CPF',
  'exemplo@email.com': 'example@email.com',
  'Senha': 'Password',
  'Ocultar senha': 'Hide password',
  'Mostrar senha': 'Show password',
  'Se cadastrar': 'Sign up',
  'Usar outra conta': 'Use another account',
  // features/perfil/sections/perfil-activity-section.tsx
  'Cadastrar pessoa': 'Register a person',
  'Ver casos': 'See cases',
  'Falar com a Sofia': 'Talk to Sofia',
  'Minhas atividades': 'My activity',
  'cadastro aguardando envio': 'registration waiting to be sent',
  'cadastros aguardando envio': 'registrations waiting to be sent',
  'Em breve você verá aqui os alertas que publicou e os avistamentos que enviou.':
    'Soon you will see here the alerts you published and the sightings you sent.',
  'Revisar e enviar': 'Review and send',
  'Estes cadastros foram feitos neste aparelho sem conta. Nada é enviado sem a sua revisão: confira os dados, aceite a declaração e o caso passa a ficar ligado à sua conta.':
    'These registrations were made on this device without an account. Nothing is sent without your review: check the data, accept the statement and the case becomes linked to your account.',
  'Cadastro sem nome': 'Unnamed registration',
  'Toque para revisar e enviar': 'Tap to review and send',
  'Atalhos': 'Shortcuts',
  'Para mandar sua localização com um toque.': 'To send your location with one tap.',
  'Círculo familiar': 'Family circle',
  'Mais': 'More',
  // features/perfil/sections/perfil-hero-section.tsx
  'Visitante': 'Visitor',
  // features/pessoa-detalhe/case-feedback.ts
  'Caso: {name}': 'Case: {name}',
  'Identificação do caso: {id}': 'Case ID: {id}',
  'O que precisa mudar (por exemplo: a pessoa foi encontrada, há um dado errado, tenho uma foto mais recente):':
    'What needs to change (for example: the person was found, some information is wrong, I have a more recent photo):',
  'Meu vínculo com a pessoa:': 'My relationship to the person:',
  'Motivo (cadastro falso, golpe ou pedido de dinheiro, exposição indevida, sou a pessoa cadastrada e estou em segurança, outro):':
    'Reason (fake registration, scam or request for money, improper exposure, I am the registered person and I am safe, other):',
  'Detalhes:': 'Details:',
  // features/pessoa-detalhe/person-share.ts
  'roupas: {clothes}': 'clothes: {clothes}',
  'PESSOA DESAPARECIDA: {name}, {age} anos': 'MISSING PERSON: {name}, {age} years old',
  'PESSOA DESAPARECIDA: {name}': 'MISSING PERSON: {name}',
  'Conhecida como {nickname}.': 'Known as {nickname}.',
  'Vista pela última vez em {place}, em {date}.': 'Last seen in {place}, on {date}.',
  'Vista pela última vez em {place}.': 'Last seen in {place}.',
  'Vista pela última vez em {date}.': 'Last seen on {date}.',
  'Características: {traits}.': 'Features: {traits}.',
  'Se você viu esta pessoa, ligue 190 ou informe pelo app {app}.':
    'If you have seen this person, call 190 or report it through the {app} app.',
  'Veja o caso: {url}': 'See the case: {url}',
  'Divulgado pelo {app} — {slogan}.': 'Shared via {app} — {slogan}.',
  // features/pessoa-detalhe/pessoa-detalhe.controller.ts
  'Este cadastro está salvo só neste aparelho. Entre na sua conta para revisar e enviar — depois disso ele pode receber avistamentos.':
    'This registration is saved only on this device. Sign in to your account to review and send it — after that it can receive sightings.',
  'Este cadastro foi feito neste aparelho e ainda não foi enviado. Revise os dados e confirme para enviá-lo pela sua conta.':
    'This registration was made on this device and has not been sent yet. Review the data and confirm to send it from your account.',
  'Não foi possível abrir o e-mail': 'Could not open the email',
  'Escreva para {supportEmail} e informe a identificação do caso: {id}.':
    'Write to {supportEmail} and include the case ID: {id}.',
  'Permita o acesso à localização para usar este recurso.':
    'Allow location access to use this feature.',
  'Localização atual': 'Current location',
  'Não foi possível obter sua localização.': 'Could not get your location.',
  'Não encontramos esse endereço. Tente outro ou use sua localização.':
    'We could not find that address. Try another one or use your location.',
  'Local não informado': 'Place not provided',
  'Escolha um endereço da lista.': 'Choose an address from the list.',
  'Não foi possível registrar o avistamento. Tente novamente.':
    'Could not record the sighting. Try again.',
  'Pessoa desaparecida': 'Missing person',
  // features/pessoa-detalhe/sections/pessoa-detalhe-feedback-section.tsx
  'Algo errado neste cadastro?': 'Something wrong with this registration?',
  'Peça a correção se houver dados errados ou se a pessoa já foi encontrada. Denuncie se o cadastro for falso, um golpe ou puder colocar alguém em risco — inclusive se você é a pessoa cadastrada, está em segurança e não quer ser localizada.':
    'Request a correction if there is wrong information or if the person has already been found. Report it if the registration is fake, a scam or could put someone at risk — including if you are the registered person, you are safe and you do not want to be found.',
  'Pedir correção ou atualização': 'Request a correction or update',
  'Denunciar este cadastro': 'Report this registration',
  // features/pessoa-detalhe/sections/pessoa-detalhe-hero-section.tsx
  '{age} anos': '{age} years old',
  // features/pessoa-detalhe/sections/pessoa-detalhe-history-section.tsx
  'Histórico de avistamentos': 'Sighting history',
  'Não foi possível carregar o histórico.': 'Could not load the history.',
  'Ainda não há avistamentos com localização.': 'There are no sightings with a location yet.',
  // features/pessoa-detalhe/sections/pessoa-detalhe-info-section.tsx
  'Último local': 'Last place',
  'Visto em': 'Seen on',
  'Etnia': 'Ethnicity',
  'Divulgar este caso': 'Share this case',
  // features/pessoa-detalhe/sections/pessoa-detalhe-sighting-section.tsx
  'Vi essa pessoa por perto': 'I saw this person nearby',
  'Onde você viu?': 'Where did you see them?',
  'Digite para buscar o endereço': 'Type to search for the address',
  'Buscando endereços…': 'Searching addresses…',
  'Toque no mapa ou arraste o pin para indicar o local.':
    'Tap the map or drag the pin to mark the place.',
  'Usar minha localização': 'Use my location',
  'Registrar avistamento': 'Record sighting',
  // features/pessoa-detalhe/sections/pessoa-detalhe-thanks-section.tsx
  'Obrigada por ajudar': 'Thank you for helping',
  'Cada avistamento pode ser o passo que faltava para encontrar {personName}. Sua ajuda é muito importante — de verdade.':
    'Every sighting can be the missing step to find {personName}. Your help really matters.',
  'Cada avistamento pode ser o passo que faltava para alguém voltar para casa. Sua ajuda é muito importante — de verdade.':
    'Every sighting can be the missing step for someone to come home. Your help really matters.',
  'Voltar para o início': 'Back to home',
  // features/pessoas-desaparecidas/pessoas-desaparecidas.controller.ts
  'Todos': 'All',
  'Procurado': 'Missing',
  'Encontrado': 'Found',
  'Última vez vista': 'Last seen',
  'De onde é': 'Where they are from',
  // features/pessoas-desaparecidas/sections/pessoas-desaparecidas-filters-section.tsx
  'Pesquisar': 'Search',
  'Nome ou apelido': 'Name or nickname',
  'Faixa de idade': 'Age range',
  'Todas as idades': 'All ages',
  'Crianças e adolescentes': 'Children and teenagers',
  'Ocultar filtros': 'Hide filters',
  'Filtros (ativos)': 'Filters (active)',
  'Filtros': 'Filters',
  'Status': 'Status',
  'Idade mínima': 'Minimum age',
  'Idade máxima': 'Maximum age',
  'Endereço considerado': 'Address to consider',
  'Belo Horizonte': 'Belo Horizonte',
  'MG': 'MG',
  'Savassi': 'Savassi',
  'Brasil': 'Brazil',
  // features/pessoas-desaparecidas/sections/pessoas-desaparecidas-list-section.tsx
  'Nenhuma pessoa encontrada com esses filtros.': 'No people found with these filters.',
  'Idade: {value}': 'Age: {value}',
  '{count} pessoa': '{count} person',
  '{count} pessoas': '{count} people',
  // features/regras/regras-content.ts
  'O Encontra-me existe para ajudar a encontrar pessoas desaparecidas, com prioridade para crianças e mulheres. Para funcionar com segurança, todas as pessoas que usam o app seguem estas regras.':
    'Encontra-me exists to help find missing people, with priority for children and women. To work safely, everyone who uses the app follows these rules.',
  'Regras da comunidade': 'Community rules',
  'Publique só informações verdadeiras e que você conhece.':
    'Publish only information that is true and that you know.',
  'Cadastre uma pessoa apenas se você tem vínculo com ela ou autorização da família. Para crianças e adolescentes, informe o número do boletim de ocorrência.':
    "Register a person only if you have a relationship with them or the family's authorization. For children and teenagers, provide the police report number.",
  'Não use o app para procurar alguém que se afastou para se proteger, nem para perseguir, vigiar ou expor qualquer pessoa.':
    'Do not use the app to look for someone who left to protect themselves, or to stalk, watch or expose anyone.',
  'Não publique endereço de casa, escola, rotina ou documentos.':
    'Do not publish home addresses, schools, routines or documents.',
  'Em avistamentos, informe só o que você viu. Em perigo, ligue 190.':
    'In sightings, report only what you saw. If someone is in danger, call 190.',
  'Não peça nem ofereça dinheiro por informações. Denuncie golpes.':
    'Do not ask for or offer money for information. Report scams.',
  'Respeite as famílias: nada de ofensas, acusações sem prova, assédio ou discriminação.':
    'Respect the families: no insults, accusations without proof, harassment or discrimination.',
  'Viu algo errado ou abusivo? Denuncie o cadastro, a mensagem do grupo ou o aviso de segurança. Dá para bloquear a conta de quem publicou: o conteúdo dela some da sua lista.':
    'Did you see something wrong or abusive? Report the listing, the group message or the safety notice. You can block the account that published it: their content leaves your list.',
  'Responsabilidade': 'Responsibility',
  'Cada cadastro, avistamento e mensagem fica ligado à conta de quem publicou.':
    'Every registration, sighting and message is linked to the account of whoever published it.',
  'Cadastros feitos sem conta ficam só neste aparelho. Eles só são enviados depois que alguém entra na conta, revisa os dados e confirma a declaração — e passam a ficar ligados a essa conta.':
    'Registrations made without an account stay only on this device. They are only sent after someone signs in, reviews the data and confirms the statement — and they then become linked to that account.',
  'Conteúdo falso, golpe, assédio ou uso malicioso pode ser removido e levar ao bloqueio da conta.':
    'Fake content, scams, harassment or malicious use may be removed and lead to the account being blocked.',
  'Quem publica informações falsas pode responder civil e criminalmente.':
    'Anyone who publishes false information may be held civilly and criminally liable.',
  'Os dados de identificação podem ser entregues às autoridades quando houver ordem judicial ou outra obrigação legal. Por isso, o uso do app não é anônimo.':
    'Identification data may be handed over to the authorities when there is a court order or another legal obligation. That is why using the app is not anonymous.',
  'Seus dados (resumo)': 'Your data (summary)',
  'Conta: nome, CPF, e-mail, celular e CEP — para identificar quem usa o app e apurar abusos.':
    'Account: name, CPF, email, mobile number and CEP — to identify who uses the app and investigate abuse.',
  'Seu CPF não aparece para outras pessoas no app.':
    'Your CPF is not shown to other people in the app.',
  'Cadastros de pessoas: foto e características, para ajudar na busca.':
    'Registrations of people: photo and features, to help with the search.',
  'Localização: usada só com o app aberto, para mostrar casos próximos, marcar avistamentos e, quando você pede, mandar sua localização a um contato.':
    'Location: used only while the app is open, to show nearby cases, mark sightings and, when you ask, send your location to a contact.',
  'Contatos de confiança: ficam salvos só neste aparelho e não vão para o servidor.':
    'Trusted contacts: saved only on this device and never sent to the server.',
  'Digital ou rosto: conferidos pelo próprio celular. O app não recebe sua biometria.':
    'Fingerprint or face: checked by the phone itself. The app does not receive your biometrics.',
  'Você pode pedir acesso, correção ou exclusão dos seus dados (LGPD) pela Central de Ajuda.':
    'You can request access to, correction of or deletion of your data (LGPD) through the Help Center.',
  'A Política de Privacidade completa está publicada. Os Termos de Uso completos ainda estão em revisão jurídica.':
    'The full Privacy Policy is published. The full Terms of Use are still under legal review.',
  'Ler a política de privacidade': 'Read the privacy policy',
  // features/regras/sections/regras-content-section.tsx
  'Dúvidas sobre seus dados': 'Questions about your data',
  // features/signup-password/sections/signup-password-form-section.tsx
  'Pelo menos 8 caracteres, com letras e números. Não use a mesma senha de outros sites.':
    'At least 8 characters, with letters and numbers. Do not use the same password as on other sites.',
  'Confirmar senha': 'Confirm password',
  // features/signup/sections/signup-form-section.tsx
  'CPF': 'CPF',
  'E-mail': 'Email',
  'CEP': 'CEP (postal code)',
  'Li e aceito as regras de uso e a forma como meus dados são usados':
    'I have read and accept the terms of use and how my data is used',
  'Li e aceito as': 'I have read and accept the',
  'regras de uso e privacidade': 'terms of use and privacy',
  '. Sei que meus dados identificam minha conta e podem ser usados para apurar abusos.':
    '. I know that my data identifies my account and may be used to investigate abuse.',
  'Criar conta': 'Create account',
  'Próximo': 'Next',
  // features/signup/sections/signup-google-controls.tsx
  'ou preencha os dados': 'or fill in your details',
  // features/signup/signup.controller.ts
  'A sessão do Google expirou. Toque em Continuar com Google novamente.':
    'The Google session expired. Tap Continue with Google again.',
  'Não foi possível concluir o cadastro.': 'Could not complete the registration.',
  // features/sobre/sections/sobre-info-section.tsx
  'Logo do {name}': '{name} logo',
  'Aplicativo': 'App',
  'Versão': 'Version',
  'Empresa responsável': 'Company responsible',
  'Contato': 'Contact',
  'Site da Nexora Prism': 'Nexora Prism website',
  'Documentos': 'Documents',
  'A política de privacidade está publicada. Os termos de uso completos ainda estão em revisão jurídica.':
    'The privacy policy is published. The full terms of use are still under legal review.',
  'Texto completo, publicado no site.': 'Full text, published on the website.',
  'Resumo das regras da comunidade e do uso dos seus dados.':
    'Summary of the community rules and how your data is used.',
  'Termos de uso': 'Terms of use',
  'Política de privacidade': 'Privacy policy',
  // features/sobre/sobre.controller.ts
  'Escreva para {email}.': 'Write to {email}.',
  'Acesse {site}.': 'Visit {site}.',
  // features/sofia-perfil/sections/sofia-perfil-hero-section.tsx
  'IA de apoio emocional do Encontra-me': "Encontra-me's emotional support AI",
  'Conversar': 'Talk',
  'Exercícios': 'Exercises',
  'Personalizar cores': 'Customize colors',
  'Cores': 'Colors',
  'Sobre': 'About',
  'Sofia é uma inteligência artificial criada para conversar e oferecer apoio. Ela não é psicóloga, terapeuta ou médica e não substitui atendimento humano profissional. Não realiza diagnósticos, tratamentos ou atendimento de emergência.':
    'Sofia is an artificial intelligence created to talk and offer support. She is not a psychologist, therapist or doctor and does not replace professional human care. She does not provide diagnoses, treatment or emergency care.',
  'Em emergência no Brasil': 'In an emergency in Brazil',
  // features/sofia-theme/sections/sofia-theme-picker-section.tsx
  'Aparência': 'Appearance',
  'Tema claro': 'Light theme',
  'Claro': 'Light',
  'Tema escuro': 'Dark theme',
  'Escuro': 'Dark',
  'Cor da Sofia': "Sofia's color",
  // features/sofia-welcome/sections/sofia-welcome-hero-section.tsx
  'Espaço seguro • 100% confidencial': 'Safe space • 100% confidential',
  'Oi, eu sou a Sofia': "Hi, I'm Sofia",
  'Uma IA de apoio emocional, pronta para te escutar sem pressa e sem julgamento. Não substitui um profissional.':
    'An emotional support AI, ready to listen to you without hurry and without judgment. She does not replace a professional.',
  // lib/api-error-modal.tsx
  'Algo deu errado': 'Something went wrong',
  'Entendi': 'Got it',
  // lib/api-errors.ts
  'A requisição demorou demais. Tente novamente.': 'The request took too long. Try again.',
  'Não foi possível conectar. Verifique sua internet.':
    'Could not connect. Check your internet connection.',
  // lib/app-info.ts
  'Mobilização social para encontrar pessoas desaparecidas, com prioridade para a proteção de crianças e mulheres — e aberta a toda a sociedade.':
    'Social mobilization to find missing people, with priority on protecting children and women — and open to all of society.',
  // lib/biometric.ts
  'Entrar com Face ID?': 'Sign in with Face ID?',
  'Quer entrar com a Face ID deste celular da próxima vez?':
    "Do you want to sign in with this phone's Face ID next time?",
  'Usar Face ID': 'Use Face ID',
  'Confirme com a Face ID para ativar o login rápido.':
    'Confirm with Face ID to turn on quick sign-in.',
  'Entrar com Face ID': 'Sign in with Face ID',
  'Use a Face ID para entrar': 'Use Face ID to sign in',
  'Entrar com a digital?': 'Sign in with fingerprint?',
  'Quer entrar com a digital deste celular da próxima vez?':
    "Do you want to sign in with this phone's fingerprint next time?",
  'Usar digital': 'Use fingerprint',
  'Confirme com a digital para ativar o login rápido.':
    'Confirm with your fingerprint to turn on quick sign-in.',
  'Use a digital para entrar': 'Use your fingerprint to sign in',
  'Entrar com biometria?': 'Sign in with biometrics?',
  'Quer entrar com a biometria deste celular da próxima vez?':
    "Do you want to sign in with this phone's biometrics next time?",
  'Usar biometria': 'Use biometrics',
  'Confirme a biometria para ativar o login rápido.':
    'Confirm with biometrics to turn on quick sign-in.',
  'Use a biometria para entrar': 'Use biometrics to sign in',
  // lib/brand-theme.tsx
  'Automático': 'Automatic',
  // lib/dialog.ts
  'Confirmar': 'Confirm',
  // lib/emergency-shortcut.ts
  'Encontra-me: pedir ajuda': 'Encontra-me: get help',
  'Atalho desativado. Para usar de novo, ative em Configurações no Encontra-me.':
    'Shortcut turned off. To use it again, turn it on in Encontra-me Settings.',
  // lib/error-messages.ts
  'Campo obrigatório.': 'Required field.',
  'Formato inválido.': 'Invalid format.',
  'Muito curto.': 'Too short.',
  'Valor fora do permitido.': 'Value out of the allowed range.',
  'Já cadastrado.': 'Already registered.',
  'Imagem inválida.': 'Invalid image.',
  'Imagem vazia.': 'Empty image.',
  'A imagem deve ter no máximo 2 MB.': 'The image must be at most 2 MB.',
  'CPF inválido.': 'Invalid CPF.',
  'Este CPF já está cadastrado.': 'This CPF is already registered.',
  'Informe um e-mail válido.': 'Enter a valid email.',
  'Este e-mail já está cadastrado.': 'This email is already registered.',
  'Informe DDD e número, como (31) 99999-9999.':
    'Enter the area code and number, like (31) 99999-9999.',
  'O CEP deve ter 8 dígitos.': 'The CEP must have 8 digits.',
  'Informe o nome completo.': 'Enter the full name.',
  'A senha deve ter ao menos 8 caracteres.': 'The password must have at least 8 characters.',
  'Use letras e números na senha.': 'Use letters and numbers in the password.',
  'A confirmação não corresponde à senha.': 'The confirmation does not match the password.',
  'Idade inválida.': 'Invalid age.',
  'Informe a idade (pode ser aproximada).': 'Enter the age (it can be approximate).',
  'Use o formato dd/mm/aaaa, com uma data que já passou.':
    'Use the dd/mm/yyyy format, with a date in the past.',
  'Para criar a conta, aceite as regras de uso.': 'To create the account, accept the terms of use.',
  'Informe seu vínculo com a pessoa.': 'State your relationship to the person.',
  'Para crianças e adolescentes, informe o número do boletim de ocorrência.':
    'For children and teenagers, provide the police report number.',
  'Confira o número do boletim de ocorrência.': 'Check the police report number.',
  'Confirme a declaração para continuar.': 'Confirm the statement to continue.',
  'Este número já está na sua lista.': 'This number is already on your list.',
  'Informe o nome do contato.': "Enter the contact's name.",
  'Altura inválida.': 'Invalid height.',
  'Informe o endereço ou use sua localização.': 'Enter the address or use your location.',
  'Informe onde a pessoa foi vista pela última vez.': 'Enter where the person was last seen.',
  'O raio deve ser de até 200 km.': 'The radius must be up to 200 km.',
  'Campo inválido.': 'Invalid field.',
  'Verifique os campos destacados.': 'Check the highlighted fields.',
  'Estes dados já estão cadastrados.': 'This data is already registered.',
  'E-mail/CPF ou senha inválidos.': 'Invalid email/CPF or password.',
  'Não autorizado.': 'Not authorized.',
  'Registro não encontrado.': 'Record not found.',
  'A Sofia está indisponível no momento. Tente novamente em instantes.':
    'Sofia is unavailable right now. Try again in a moment.',
  'Não foi possível concluir. Tente novamente.': 'Could not complete. Try again.',
  // lib/location-share.ts
  'precisão de cerca de {meters} m': 'accuracy of about {meters} m',
  'PRECISO DE AJUDA.': 'I NEED HELP.',
  'às {time}': 'at {time}',
  'Minha localização agora: {link} ({details}).': 'My location now: {link} ({details}).',
  'Não consegui pegar minha localização pelo GPS.': 'I could not get my location from the GPS.',
  'Se não conseguir falar comigo, ligue 190.': 'If you cannot reach me, call 190.',
  'Enviado pelo app Encontra-me.': 'Sent from the Encontra-me app.',
  // lib/person-status.ts
  'Cadastro pendente': 'Pending registration',
  'Pendente': 'Pending',
  'Procurando': 'Searching',
  'Cancelado': 'Cancelled',
  // lib/share.ts
  'Copie o texto para enviar': 'Copy the text to send it',
  // lib/support.ts
  'Dúvida sobre o app': 'Question about the app',
  'Cadastro, login ou senha': 'Registration, sign-in or password',
  'Corrigir ou atualizar um caso': 'Correct or update a case',
  'Privacidade e meus dados': 'Privacy and my data',
  'Excluir minha conta': 'Delete my account',
  // lib/use-photo-picker.ts
  'A foto deve ter no máximo {maxMb} MB.': 'The photo must be at most {maxMb} MB.',
  // pages/alerta-emergencia/index.tsx
  'Alerta cancelado': 'Alert cancelled',
  'Nada foi enviado e o telefone não foi aberto.': 'Nothing was sent and the phone was not opened.',
  'Acionar de novo': 'Trigger again',
  // pages/chat/index.tsx
  'Apagar toda a conversa?': 'Delete the whole conversation?',
  // pages/compartilhar-localizacao/index.tsx
  'Compartilhar localização': 'Share location',
  'Mande onde você está agora para alguém de confiança — por exemplo, ao voltar para casa sozinha ou ao sair com alguém que acabou de conhecer.':
    'Send where you are right now to someone you trust — for example, when going home alone or when going out with someone you just met.',
  // pages/pessoa/[id]/index.tsx
  'Este cadastro não está mais neste aparelho: ele pode ter sido enviado ou apagado.':
    'This registration is no longer on this device: it may have been sent or deleted.',
  'Não encontramos essa pessoa.': 'We could not find this person.',
  // pages/sobre/index.tsx
  'Sobre o app': 'About the app',
  // pages/sofia-theme/index.tsx
  'Personalizar Sofia': 'Customize Sofia',
  'Começar a conversar': 'Start talking',
  // services/emergency/emergency.types.ts
  'O servidor não confirmou o recebimento do alerta.':
    'The server did not confirm receipt of the alert.',
  // features/ajuda/help-content.ts — rotas e círculo familiar
  'O monitoramento ampliado de trajetos é um recurso futuro e ainda não está disponível. Quando for lançado, só funcionará com sua permissão e terminará assim que você chegar ao destino. Mandar sua localização atual para um contato já funciona e é grátis.':
    'Extended route monitoring is a future feature and is not available yet. When it is launched, it will only work with your permission and will end as soon as you reach your destination. Sending your current location to a contact already works and is free.',
  'É um recurso futuro para compartilhar sua segurança com pessoas de confiança, sempre com convite e aceite de cada uma. Ele ainda não está disponível e nunca permitirá acompanhar alguém sem que essa pessoa saiba e concorde.':
    "It is a future feature for sharing your safety with people you trust, always with each person's invitation and consent. It is not available yet and will never allow tracking someone without that person knowing and agreeing.",
  // Rodada 3 — Início novo, passo a passo e filtros por idade
  'Na tela Início, permita o acesso à localização. As fotos de "Alertas recentes" e o mapa mostram casos próximos. Arraste o mapa para baixo para abrir a lista e role para ver mais. Os botões ao lado de "Alertas recentes" trocam entre foto, com o nome embaixo, e cartão. Os botões no alto do mapa filtram por idade: a borda usa a cor do tema e o botão escolhido fica preenchido. O botão de satélite troca a imagem do mapa. Para buscar por nome ou ver a lista completa, toque na lupa no alto da tela ou em "Ver todos": lá dá para filtrar por cidade, estado, bairro, idade e situação. No celular, o botão Filtros fica acima dos atalhos de idade. Na lista, os botões ao lado do total trocam entre os cartões horizontais e fotos quadradas só com o nome embaixo. O número abaixo dos filtros é o total dessa busca.':
    'On the Home screen, allow location access. The photos in "Recent alerts" and the map show nearby cases. Drag the map down to open the list and scroll to see more. The buttons next to "Recent alerts" switch between a photo with the name underneath and a card. The buttons at the top of the map filter by age: the border uses the theme color and the chosen button fills in. The satellite button switches the map image. To search by name or see the full list, tap the magnifying glass at the top of the screen or "See all": there you can filter by city, state, neighborhood, age and status. On a phone, the Filters button sits above the age shortcuts. On the list, the buttons next to the total switch between the horizontal cards and square photos with only the name underneath. The number below the filters is the total for that search.',
  'mapa lista perto localização filtro satélite crianças idosos':
    'map list near location filter satellite children older people',
  'Como vejo o passo a passo do app de novo?': 'How do I see the app walkthrough again?',
  'Abra o Menu e toque em "Como usar o app". Também dá em Configurações > Aparência e acessibilidade > "Ver o passo a passo de novo". Em qualquer passo, "Pular" fecha o passo a passo.':
    'Open the Menu and tap "How to use the app". You can also go to Settings > Appearance and accessibility > "See the walkthrough again". On any step, "Skip" closes the walkthrough.',
  'tutorial apresentação onboarding passo a passo como usar ajuda':
    'tutorial walkthrough onboarding step by step how to use help',
  'Passo a passo reativado': 'Walkthrough turned back on',
  'Ele vai aparecer quando você voltar ao Início.': 'It will appear when you go back to Home.',
  'Ver o passo a passo de novo': 'See the walkthrough again',
  'Alertas recentes': 'Recent alerts',
  'Ver todas as pessoas desaparecidas': 'See all missing people',
  'Ver todos': 'See all',
  'Nenhum alerta nesta faixa de idade por aqui.': 'No alerts for this age group around here.',
  'Ver só as fotos': 'See only the photos',
  'Ver cartões com detalhes': 'See cards with details',
  'Ver mais pessoas': 'See more people',
  'Voltar à fileira': 'Back to the row',
  'Arraste o mapa para baixo para ver mais pessoas. Arraste para cima para voltar à fileira.':
    'Drag the map down to see more people. Drag up to go back to the row.',
  'Como usar o app': 'How to use the app',
  'Ver mapa comum': 'See regular map',
  'Ver imagem de satélite': 'See satellite image',
  'Nenhuma pessoa no mapa por aqui.': 'No one on the map around here.',
  'Nenhuma pessoa desta faixa de idade no mapa.': 'No one from this age group on the map.',
  'Filtrar por faixa de idade': 'Filter by age group',
  'Pessoas': 'People',
  'Apoio': 'Support',
  'Sua conta': 'Your account',
  'Pular': 'Skip',
  'Fecha o passo a passo. Você pode ver de novo pelo Menu, em "Como usar o app".':
    'Closes the walkthrough. You can see it again from the Menu, in "How to use the app".',
  'Começar a usar': 'Start using',
  'Começar o passo a passo': 'Start the walkthrough',
  'Crianças': 'Children',
  'Idosos': 'Older people',
  'Oi! Eu sou a Sofia.': 'Hi! I\'m Sofia.',
  'Vou te mostrar, em poucos passos, como usar o Encontra-me. Se já conhece, toque em "Pular".':
    'In a few steps, I will show you how to use Encontra-me. If you already know it, tap "Skip".',
  'Veja quem está desaparecido perto de você': 'See who is missing near you',
  'No alto da tela ficam as pessoas procuradas perto de você. Os dois botões ao lado do título trocam entre foto, com o nome embaixo, e cartão. Arraste o mapa para baixo para ver a lista e role para carregar mais. Toque para abrir o caso.':
    'The people being searched for near you are at the top of the screen. The two buttons next to the title switch between a photo with the name underneath and a card. Drag the map down to see the list and scroll to load more. Tap to open the case.',
  'Use o mapa': 'Use the map',
  'Viu alguém? Avise.': 'Saw someone? Let us know.',
  'Na página da pessoa, toque em "Vi essa pessoa por perto" e marque onde você viu. Isso ajuda a família.':
    'On the person\'s page, tap "I saw this person nearby" and mark where you saw them. This helps the family.',
  'Em perigo? Botão vermelho.': 'In danger? Red button.',
  'O botão vermelho "Pedir ajuda" fica sempre à vista. No celular, no meio da barra de baixo; no computador, no alto da tela. Ele mostra os números de emergência, como o 190. O app não chama a polícia sozinho.':
    'The red "Get help" button is always in view. On a phone, it sits in the middle of the bottom bar; on a computer, at the top of the screen. It shows the emergency numbers, like 190. The app does not call the police on its own.',
  'Cadastrar e Menu': 'Register and Menu',
  'Para comunicar um desaparecimento, toque em "Cadastrar". No computador, use o botão laranja "Cadastrar pessoa" embaixo do mapa. No "Menu" ficam a Sofia, o seu perfil, as configurações e a ajuda.':
    'To report a disappearance, tap "Register". On a computer, use the orange "Register a person" button under the map. The "Menu" has Sofia, your profile, settings and help.',
  'Pronto! Como você quer começar?': 'All set! How do you want to start?',
  'Para ver este passo a passo de novo, abra o Menu e toque em "Como usar o app".':
    'To see this walkthrough again, open the Menu and tap "How to use the app".',
  'Adultos': 'Adults',
  'Adolescente': 'Teenager',
  'Criança': 'Child',
  'Pessoa idosa': 'Older person',
  'Adulto': 'Adult',
  // Rodada 4 — Avisos de segurança no mapa e cartão flutuante
  'Posso avisar sobre uma rua perigosa?': 'Can I warn about a dangerous street?',
  'O mapa do Início mostra losangos amarelos com avisos da comunidade, como "assaltos frequentes" ou "rua deserta à noite". Toque num aviso para ver o horário e a referência do lugar e marcar "Continua assim" ou "Não está mais assim". Para avisar, entre na sua conta e toque em "Adicionar aviso". Fale do lugar, nunca de pessoas: sem nomes, placas ou telefones. O aviso some em 30 dias se ninguém confirmar. São relatos da comunidade, não verificados, e não substituem a polícia: em perigo, use "Pedir ajuda".':
    'The Home map shows yellow diamonds with community notes, such as "frequent robberies" or "deserted street at night". Tap a note to see the time and the place reference and mark "Still like this" or "No longer like this". To add one, sign in and tap "Add note". Talk about the place, never about people: no names, license plates or phone numbers. A note disappears after 30 days if nobody confirms it. They are unverified community reports and do not replace the police: if you are in danger, use "Get help".',
  'aviso rua perigosa assalto deserta escura iluminação horário segurança comunidade mapa':
    'note dangerous street robbery deserted dark lighting time safety community map',
  'Localização indisponível': 'Location unavailable',
  'Permita o acesso à localização ou toque no mapa para marcar o lugar.':
    'Allow location access or tap the map to mark the place.',
  'Não coloque telefone, CPF, e-mail ou perfil. Fale do lugar, não de pessoas.':
    'Do not include phone numbers, CPF, e-mail or profiles. Talk about the place, not about people.',
  'Marque o local no mapa.': 'Mark the place on the map.',
  'Escolha o tipo de aviso.': 'Choose the type of note.',
  'Escreva uma referência do local (rua, praça ou ponto conhecido).':
    'Write a reference for the place (street, square or landmark).',
  'Confirme a declaração para publicar.': 'Confirm the statement to publish.',
  'Aviso publicado': 'Note published',
  'Ele aparece no mapa para quem estiver por perto e fica {days} dias, ou mais se outras pessoas confirmarem.':
    'It shows on the map for people nearby and stays for {days} days, or longer if others confirm it.',
  'Não foi possível publicar': 'Could not publish',
  'Tente de novo em instantes.': 'Try again in a moment.',
  'Local do aviso': 'Note location',
  'Ajude quem passa por aqui': 'Help people who pass by here',
  'Avise sobre um lugar, não sobre pessoas. É um relato da comunidade e não substitui a polícia: em perigo, use "Pedir ajuda".':
    'Warn about a place, not about people. It is a community report and does not replace the police: if you are in danger, use "Get help".',
  'Onde?': 'Where?',
  'Toque no mapa ou arraste o marcador para ajustar.': 'Tap the map or drag the marker to adjust.',
  'Toque no mapa para marcar o lugar.': 'Tap the map to mark the place.',
  'O que acontece neste lugar?': 'What happens at this place?',
  'Em que horário?': 'At what time?',
  'Referência do local': 'Place reference',
  'Rua, praça ou ponto conhecido': 'Street, square or landmark',
  'Ex.: Rua das Flores, perto da praça': 'E.g.: Rua das Flores, near the square',
  'Observação (opcional)': 'Note (optional)',
  'Ex.: Prefira a avenida depois das 20h.': 'E.g.: Use the avenue after 8 p.m.',
  'Antes de publicar': 'Before publishing',
  'Fale do lugar, não de pessoas: sem nomes, placas, telefones ou aparência de ninguém.':
    'Talk about the place, not about people: no names, license plates, phone numbers or anyone\'s appearance.',
  'Seu nome não aparece no mapa, mas o aviso fica ligado à sua conta. Não é anônimo.':
    'Your name does not appear on the map, but the note is linked to your account. It is not anonymous.',
  'O aviso some em {days} dias se ninguém confirmar. Quem passar por lá pode marcar "Não está mais assim".':
    'The note disappears after {days} days if nobody confirms it. People who pass by can mark "No longer like this".',
  'Avisos falsos, ofensivos ou preconceituosos violam as regras de uso e podem ser removidos.':
    'False, offensive or prejudiced notes break the rules of use and may be removed.',
  'Ler as regras de uso': 'Read the rules of use',
  'Declaro que este aviso é verdadeiro, fala só do lugar e não cita pessoas.':
    'I declare that this note is true, talks only about the place and does not mention people.',
  'Publicar aviso': 'Publish note',
  'Para confirmar ou atualizar um aviso, entre na sua conta. Assim cada pessoa vota uma vez.':
    'To confirm or update a note, sign in. That way each person votes once.',
  'Ver detalhes': 'See details',
  'Na página da pessoa você pode avisar que a viu por perto.':
    'On the person\'s page you can report that you saw them nearby.',
  'Aviso da comunidade': 'Community note',
  '{count} confirmação': '{count} confirmation',
  '{count} confirmações': '{count} confirmations',
  'Continua assim': 'Still like this',
  'Não está mais assim': 'No longer like this',
  'Relato da comunidade, não verificado. Em perigo, use "Pedir ajuda".':
    'Unverified community report. If you are in danger, use "Get help".',
  'Denunciar este aviso': 'Report this note',
  'Denunciar': 'Report',
  'Esconder avisos de segurança': 'Hide safety notes',
  'Mostrar avisos de segurança': 'Show safety notes',
  'Adicionar aviso de segurança': 'Add safety note',
  'Avise sobre uma rua ou lugar perigoso': 'Warn about a dangerous street or place',
  'Adicionar aviso': 'Add note',
  'Avisar sobre um lugar perigoso': 'Warn about a dangerous place',
  'Cada foto no mapa é uma pessoa procurada: toque nela para ver um resumo. Os botões no alto filtram por idade. A borda usa a cor do tema e o botão escolhido fica preenchido.':
    'Each photo on the map is a person being searched for: tap it to see a summary. The buttons at the top filter by age. The border uses the theme color and the chosen button fills in.',
  'Avisos de segurança': 'Safety notes',
  'Os losangos amarelos são avisos da comunidade, como "rua deserta à noite". Toque para ver e confirmar. Para avisar sobre um lugar, use "Adicionar aviso".':
    'The yellow diamonds are community notes, such as "deserted street at night". Tap to see and confirm them. To warn about a place, use "Add note".',
  'Atenção redobrada': 'Extra caution',
  'Lugar arriscado: fique atento ao passar.': 'Risky place: stay alert when passing by.',
  'Assaltos frequentes': 'Frequent robberies',
  'Relatos repetidos de roubo ou furto.': 'Repeated reports of robbery or theft.',
  'Rua deserta': 'Deserted street',
  'Pouco movimento e pouca gente por perto.': 'Little movement and few people around.',
  'Iluminação ruim': 'Poor lighting',
  'Rua escura ou postes apagados.': 'Dark street or street lights off.',
  'Evite neste horário': 'Avoid at this time',
  'Tranquilo em parte do dia, arriscado em outra.': 'Calm at some times of day, risky at others.',
  'Outro cuidado': 'Other caution',
  'Outro motivo para redobrar a atenção.': 'Another reason to be extra careful.',
  'Qualquer horário': 'Any time',
  'Madrugada': 'Early morning',
  'Manhã': 'Morning',
  'Tarde': 'Afternoon',
  'Noite': 'Night',
  'Publicado hoje': 'Published today',
  'Publicado ontem': 'Published yesterday',
  'Publicado há {count} dias': 'Published {count} days ago',
  'Aviso de segurança: {reference}': 'Safety note: {reference}',
  'Identificação do aviso: {id}': 'Note ID: {id}',
  'Motivo (aviso falso, ofensivo, preconceituoso, cita pessoas, já não é verdade, outro):':
    'Reason (false, offensive, prejudiced, mentions people, no longer true, other):',
  'Novo aviso de segurança': 'New safety note',
  '{name}: voltar ao início': '{name}: back to home',
  // evolução · relato de avistamento ("Eu vi essa pessoa") e "Meus relatos"
  'Situação: {status}': 'Status: {status}',
  'O que acontece depois que envio um relato de avistamento?':
    'What happens after I send a sighting report?',
  'O relato recebe um número e a situação "Recebido". Ele não é publicado: a equipe analisa antes de qualquer mudança no caso, e a situação pode passar para "Aguardando análise", "Em análise", "Considerado relevante", "Não confirmado" ou "Encerrado". A foto, se você anexar, vai só para a análise. Acompanhe tudo em Perfil › Meus relatos. Se o envio não for confirmado, a tela avisa e você pode tentar de novo.':
    'The report gets a number and the status "Received". It is not published: the team reviews it before any change to the case, and the status may change to "Awaiting review", "Under review", "Considered relevant", "Not confirmed" or "Closed". If you attach a photo, it goes only to the review. Follow everything in Profile › My reports. If sending is not confirmed, the screen tells you and you can try again.',
  'relato número situação análise meus relatos foto':
    'report number status review my reports photo',
  'Este recurso ainda não está disponível no seu aplicativo.':
    'This feature is not available in your app yet.',
  'Entre na sua conta para ver os relatos que você enviou.':
    'Sign in to see the reports you sent.',
  'Não foi possível carregar seus relatos.': 'Could not load your reports.',
  'Tentar de novo': 'Try again',
  'Você ainda não enviou relatos': 'You haven\'t sent any reports yet',
  'Quando você informar que viu alguém, o relato aparece aqui com a situação da análise.':
    'When you report that you saw someone, the report shows up here with its review status.',
  'Caso nº {id}': 'Case #{id}',
  'Abre a página do caso': 'Opens the case page',
  'Visto em {date}': 'Seen on {date}',
  'Relato nº {id} · enviado em {date}': 'Report #{id} · sent on {date}',
  'com foto': 'with photo',
  'A situação muda conforme a análise da equipe. "Considerado relevante" não quer dizer que a pessoa foi encontrada.':
    'The status changes as the team reviews it. "Considered relevant" does not mean the person was found.',
  'Meus relatos': 'My reports',
  'Os avistamentos que você enviou ficam em "Meus relatos". Em breve você verá aqui também os alertas que publicou.':
    'The sightings you sent are in "My reports". Soon you will also see the alerts you published here.',
  'Você enviou vários relatos sobre este caso há pouco. Para evitar repetições, espere {minutes} min para enviar outro.':
    'You sent several reports about this case a moment ago. To avoid repeats, wait {minutes} min before sending another.',
  'O envio não foi confirmado: seu relato pode não ter chegado. Tente de novo em alguns instantes. Se a pessoa estiver em perigo agora, ligue 190.':
    'Sending was not confirmed: your report may not have arrived. Try again in a few moments. If the person is in danger right now, call 190.',
  'Confira os campos destacados.': 'Check the highlighted fields.',
  'Relato de avistamento': 'Sighting report',
  'Caso: {name} · nº {id}': 'Case: {name} · #{id}',
  'Se a pessoa parece estar em perigo agora, ligue 190 antes de preencher. Não aborde nem siga a pessoa.':
    'If the person seems to be in danger right now, call 190 before filling this in. Do not approach or follow the person.',
  'Ponto de referência': 'Landmark',
  'Ex.: em frente à farmácia': 'E.g., in front of the pharmacy',
  'Data': 'Date',
  'Horário': 'Time',
  'hh:mm': 'hh:mm',
  'O horário é aproximado': 'The time is approximate',
  'O que você viu?': 'What did you see?',
  'Ex.: estava sentada no ponto de ônibus e parecia confusa.':
    'E.g., she was sitting at the bus stop and seemed confused.',
  'Roupa que a pessoa usava': 'Clothes the person was wearing',
  'Ex.: casaco azul e calça jeans': 'E.g., blue coat and jeans',
  'Características visíveis': 'Visible features',
  'Ex.: cabelo preso, mochila vermelha': 'E.g., hair tied up, red backpack',
  'Para onde a pessoa seguia': 'Where the person was heading',
  'Ex.: a pé, em direção ao centro': 'E.g., on foot, toward downtown',
  'Foto (opcional)': 'Photo (optional)',
  'Foto anexada ao relato': 'Photo attached to the report',
  'A foto vai só para a equipe de análise e não é publicada. Não se aproxime nem se arrisque para fotografar.':
    'The photo goes only to the review team and is not published. Do not get close or take risks to take a photo.',
  'Informações complementares': 'Additional information',
  'Algo mais que possa ajudar a análise': 'Anything else that may help the review',
  'Seu relato não é publicado. Ele fica ligado à sua conta e passa por análise antes de qualquer mudança no caso. O local exato não aparece para outras pessoas.':
    'Your report is not published. It stays linked to your account and is reviewed before any change to the case. The exact location is not shown to other people.',
  'Enviar relato': 'Send report',
  'Relato recebido · nº {id}': 'Report received · #{id}',
  'Ele passa por análise antes de qualquer mudança no caso. Acompanhe a situação em "Meus relatos".':
    'It is reviewed before any change to the case. Follow its status in "My reports".',
  'Modo de demonstração: nada foi enviado de verdade.':
    'Demo mode: nothing was actually sent.',
  'Ver meus relatos': 'See my reports',
  'Informe a data.': 'Enter the date.',
  'Use o formato dd/mm/aaaa.': 'Use the format dd/mm/yyyy.',
  'A data não pode estar no futuro.': 'The date cannot be in the future.',
  'Informe o horário, mesmo que aproximado.': 'Enter the time, even if approximate.',
  'Use o formato hh:mm (ex.: 14:30).': 'Use the format hh:mm (e.g., 14:30).',
  'O horário não pode estar no futuro.': 'The time cannot be in the future.',
  'Conte o que você viu.': 'Tell us what you saw.',
  'Escreva pelo menos 10 letras.': 'Write at least 10 characters.',
  'Texto muito longo.': 'The text is too long.',
  'Recebido': 'Received',
  'O servidor recebeu o relato.': 'The server received the report.',
  'Aguardando análise': 'Awaiting review',
  'O relato está na fila da equipe de análise.': 'The report is in the review team\'s queue.',
  'Em análise': 'Under review',
  'Uma pessoa da equipe está verificando o relato.':
    'Someone on the team is checking the report.',
  'Considerado relevante': 'Considered relevant',
  'A equipe considerou a informação útil para o caso. Isso não confirma que era a pessoa.':
    'The team found the information useful for the case. This does not confirm it was the person.',
  'Não confirmado': 'Not confirmed',
  'Não foi possível confirmar a informação.': 'The information could not be confirmed.',
  'Encerrado': 'Closed',
  'A análise deste relato terminou.': 'The review of this report has ended.',
};

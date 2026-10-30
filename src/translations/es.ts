/**
 * Traducciones al español, indexadas por el texto original en portugués (el texto fuente de la app).
 * Tras crear o cambiar un texto en la app, ejecuta `npm run i18n:check` (scripts/check-i18n.js).
 * Los nombres propios y de la marca (Encontra-me, Sofia, WhatsApp, CPF…) se mantienen a propósito.
 */
export const es: Readonly<Record<string, string>> = {
  // components/bottom-bar.tsx
  'Pedir ajuda': 'Pedir ayuda',
  'Mostra os números de emergência e como comunicar um desaparecimento':
    'Muestra los números de emergencia y cómo comunicar una desaparición',
  'Início': 'Inicio',
  'Cadastrar': 'Registrar',
  // components/brand-field.tsx
  '{label}, obrigatório': '{label}, obligatorio',
  // components/brand-map.tsx
  'Você está aqui': 'Estás aquí',
  // components/brand-map.web.tsx
  'Defina EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY no ambiente':
    'Define EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY en el entorno',
  'Não foi possível carregar o mapa': 'No se pudo cargar el mapa',
  // components/brand-select.tsx
  'Escolher': 'Elegir',
  // components/chat-typing-dots.tsx
  'Sofia está escrevendo': 'Sofia está escribiendo',
  // components/emergency-sheet.tsx
  'Fechar': 'Cerrar',
  'Escolha o que está acontecendo.': 'Elige lo que está pasando.',
  'Acionar alerta de emergência. Contagem de 10 segundos, com opção de cancelar.':
    'Activar alerta de emergencia. Cuenta regresiva de 10 segundos, con opción de cancelar.',
  'Acionar alerta de emergência': 'Activar alerta de emergencia',
  'Contagem de 10 segundos para cancelar. Depois abre o 190 e deixa sua localização pronta para seus contatos.':
    'Cuenta regresiva de 10 segundos para cancelar. Después abre el 190 y deja tu ubicación lista para tus contactos.',
  'Perigo agora — ligar': 'Peligro ahora — llamar',
  'Ligar {number}, {name}. {when}': 'Llamar al {number}, {name}. {when}',
  'Ligar {number}, {name}': 'Llamar al {number}, {name}',
  'Não foi possível abrir o telefone. Ligue manualmente para {number}.':
    'No se pudo abrir el teléfono. Marca el {number} manualmente.',
  'Abrindo o telefone para ligar para {number}. Se nada acontecer, disque {number} manualmente.':
    'Abriendo el teléfono para llamar al {number}. Si no pasa nada, marca el {number} manualmente.',
  'Avisar alguém de confiança': 'Avisar a alguien de confianza',
  'Compartilhar minha localização': 'Compartir mi ubicación',
  'Mande onde você está por WhatsApp, SMS ou outro aplicativo.':
    'Envía dónde estás por WhatsApp, SMS u otra aplicación.',
  'Desaparecimento': 'Desaparición',
  'Comunicar um desaparecimento': 'Comunicar una desaparición',
  'Cadastre a pessoa no app. Faça também o boletim de ocorrência — não é preciso esperar 24 horas.':
    'Registra a la persona en la app. Haz también la denuncia policial — no hace falta esperar 24 horas.',
  'Vi uma pessoa desaparecida': 'Vi a una persona desaparecida',
  'Encontre o caso e informe onde a viu. Se ela estiver em perigo, ligue 190.':
    'Busca el caso e informa dónde la viste. Si está en peligro, llama al 190.',
  'A ligação é feita pelo seu celular. O Encontra-me não avisa a polícia sozinho, e sua localização só chega aos seus contatos quando você envia a mensagem.':
    'La llamada se hace desde tu celular. Encontra-me no avisa a la policía por sí solo, y tu ubicación solo llega a tus contactos cuando envías el mensaje.',
  // components/google-auth-button.tsx
  'Continuar com Google': 'Continuar con Google',
  // components/map-my-location-fab.tsx
  'Centralizar na minha localização': 'Centrar en mi ubicación',
  // components/person-alert-icon.tsx
  'Alerta': 'Alerta',
  // components/register-fab.tsx
  'Cadastrar uma pessoa': 'Registrar a una persona',
  // components/screen-header.tsx
  'Voltar': 'Volver',
  // components/settings-list.tsx
  'Em breve': 'Próximamente',
  'em breve': 'próximamente',
  // components/sofia-fab.tsx
  'Conversar com a Sofia': 'Hablar con Sofia',
  // constants/emergency.ts
  'Polícia Militar': 'Policía Militar',
  'Você ou alguém está em perigo agora.': 'Tú u otra persona están en peligro ahora.',
  'Central de Atendimento à Mulher': 'Central de Atención a la Mujer',
  'Violência contra a mulher. 24 horas, gratuito.':
    'Violencia contra la mujer. 24 horas, gratuito.',
  'Disque Direitos Humanos': 'Línea de Derechos Humanos',
  'Violência ou risco contra criança ou adolescente.':
    'Violencia o riesgo contra un niño, niña o adolescente.',
  'SAMU': 'SAMU (ambulancia)',
  'Emergência médica.': 'Emergencia médica.',
  'Bombeiros': 'Bomberos',
  'Resgate e incêndio.': 'Rescate e incendio.',
  // constants/sofia-palettes.ts
  'Verde acolhedor': 'Verde acogedor',
  'Azul sereno': 'Azul sereno',
  'Lavanda suave': 'Lavanda suave',
  'Areia quente': 'Arena cálida',
  // features/ajuda/ajuda.controller.ts
  'Escreva pelo menos {MESSAGE_MIN} caracteres para podermos ajudar.':
    'Escribe al menos {MESSAGE_MIN} caracteres para que podamos ayudar.',
  // features/ajuda/help-content.ts
  'Crianças e mulheres': 'Niños y mujeres',
  'Primeiros passos': 'Primeros pasos',
  'Pessoas desaparecidas': 'Personas desaparecidas',
  'Avistamentos e mapa': 'Avistamientos y mapa',
  'Emergência': 'Emergencia',
  'Rotas e círculo familiar': 'Rutas y círculo familiar',
  'Cadastro, login e senha': 'Registro, inicio de sesión y contraseña',
  'Privacidade e localização': 'Privacidad y ubicación',
  'Segurança e golpes': 'Seguridad y estafas',
  'Sofia e grupo de apoio': 'Sofia y grupo de apoyo',
  'O Encontra-me é só para crianças e mulheres?': '¿Encontra-me es solo para niños y mujeres?',
  'Não. Qualquer pessoa pode usar o app e cadastrar quem desapareceu. A proteção de crianças e de mulheres é uma prioridade do projeto, por isso há atalhos e orientações específicas para elas.':
    'No. Cualquier persona puede usar la app y registrar a quien desapareció. La protección de niños y mujeres es una prioridad del proyecto, por eso hay atajos y orientaciones específicas para ellos.',
  'público todos prioridade': 'público todos prioridad',
  'Uma criança desapareceu. O que faço primeiro?': 'Un niño desapareció. ¿Qué hago primero?',
  'Ligue 190 e procure a delegacia mais próxima imediatamente. Não é preciso esperar 24 horas: a lei determina que a busca por crianças e adolescentes desaparecidos comece logo após a comunicação. Depois, cadastre a criança no app com uma foto recente.':
    'Llama al 190 y ve a la comisaría más cercana de inmediato. No hace falta esperar 24 horas: la ley brasileña determina que la búsqueda de niños y adolescentes desaparecidos empiece apenas se comunica. Después, registra al niño en la app con una foto reciente.',
  'criança filho filha menor desaparecida 24 horas':
    'niño niña hijo hija menor desaparecido 24 horas',
  'Estou sofrendo violência. Para onde ligo?': 'Estoy sufriendo violencia. ¿A dónde llamo?',
  'Em perigo agora, ligue 190. Para orientação e denúncia de violência contra a mulher, ligue 180 (Central de Atendimento à Mulher, 24 horas e gratuito). Os dois números estão no botão vermelho "Pedir ajuda".':
    'Si estás en peligro ahora, llama al 190. Para orientación y denuncias de violencia contra la mujer, llama al 180 (Central de Atención a la Mujer, 24 horas y gratuito). Los dos números están en el botón rojo "Pedir ayuda".',
  'violência doméstica mulher 180 agressão': 'violencia doméstica mujer 180 agresión',
  'O que é medida protetiva?': '¿Qué es una medida de protección?',
  'É uma proteção que a Justiça pode dar à mulher em situação de violência doméstica, como afastar o agressor. O pedido pode ser feito na delegacia, de preferência na Delegacia da Mulher (Lei Maria da Penha).':
    'Es una protección que la Justicia puede dar a la mujer en situación de violencia doméstica, como alejar al agresor. Se puede pedir en la comisaría, de preferencia en la Comisaría de la Mujer (Ley Maria da Penha).',
  'maria da penha protetiva delegacia mulher': 'maria da penha medida protección comisaría mujer',
  'Como denuncio risco ou violência contra uma criança?':
    '¿Cómo denuncio un riesgo o violencia contra un niño?',
  'Ligue 100 (Disque Direitos Humanos), gratuito. Se a criança estiver em perigo agora, ligue 190. Você também pode procurar o Conselho Tutelar da sua cidade.':
    'Llama al 100 (Línea de Derechos Humanos), gratuito. Si el niño está en peligro ahora, llama al 190. También puedes acudir al Consejo Tutelar (Conselho Tutelar) de tu ciudad.',
  'criança abuso violência conselho tutelar 100': 'niño abuso violencia consejo tutelar 100',
  'Que cuidados tomar ao divulgar uma criança?':
    '¿Qué cuidados tener al difundir el caso de un niño?',
  'Use uma foto recente só do rosto, sem uniforme ou nome da escola. Não publique endereço, rotina, escola nem documentos. Ao divulgar em redes sociais, inclua só o essencial: nome, foto, cidade e data.':
    'Usa una foto reciente solo del rostro, sin uniforme ni nombre de la escuela. No publiques dirección, rutina, escuela ni documentos. Al difundir en redes sociales, incluye solo lo esencial: nombre, foto, ciudad y fecha.',
  'foto imagem criança exposição escola': 'foto imagen niño exposición escuela',
  'O que é o Encontra-me?': '¿Qué es Encontra-me?',
  'É um aplicativo de mobilização social para ajudar a encontrar pessoas desaparecidas. Você pode ver casos perto de você no mapa, cadastrar uma pessoa desaparecida e informar onde viu alguém. O Encontra-me é um produto da Nexora Prism.':
    'Es una aplicación de movilización social para ayudar a encontrar personas desaparecidas. Puedes ver casos cerca de ti en el mapa, registrar a una persona desaparecida e informar dónde viste a alguien. Encontra-me es un producto de Nexora Prism.',
  'sobre app objetivo': 'sobre app objetivo',
  'Como vejo pessoas desaparecidas perto de mim?': '¿Cómo veo personas desaparecidas cerca de mí?',
  'Como deixo o app claro ou escuro?': '¿Cómo pongo la app en modo claro u oscuro?',
  'No menu do Início (ícone de três linhas na barra inferior), em "Tema do app", escolha Auto, Claro ou Escuro. A mesma opção fica em Configurações › Aparência e acessibilidade. Auto (automático) acompanha o modo do celular.':
    'En el menú de Inicio (ícono de tres líneas en la barra inferior), en "Tema de la app", elige Auto, Claro u Oscuro. La misma opción está en Configuración › Apariencia y accesibilidad. Auto (automático) sigue el modo del celular.',
  'tema escuro claro modo noturno dark aparência cores':
    'tema oscuro claro modo nocturno apariencia colores',
  'Como mudo o idioma do app?': '¿Cómo cambio el idioma de la app?',
  'No menu do Início (barra inferior), em "Idioma", toque em PT (português), EN (inglês), ES (espanhol) ou Auto. A mesma opção fica em Configurações › Idioma. Auto segue o idioma do celular; se ele estiver em outro idioma, o app aparece em inglês. Não são traduzidos: o que as pessoas escrevem nos casos e nas conversas e as respostas da Sofia. Os números de emergência continuam os do Brasil (190, 180, 100, 192 e 193).':
    'En el menú de Inicio (barra inferior), en "Idioma", toca PT (portugués), EN (inglés), ES (español) o Auto. La misma opción está en Configuración › Idioma. Auto sigue el idioma del celular; si está en otro idioma, la app aparece en inglés. No se traducen: lo que las personas escriben en los casos y en las conversaciones, ni las respuestas de Sofia. Los números de emergencia siguen siendo los de Brasil (190, 180, 100, 192 y 193).',
  'idioma língua linguagem inglês espanhol português tradução english español language':
    'idioma lengua inglés español portugués traducción language',
  'Como cadastro uma pessoa desaparecida?': '¿Cómo registro a una persona desaparecida?',
  'Toque em "Cadastrar" na barra inferior, no botão laranja "Cadastrar pessoa" embaixo do mapa no computador, ou abra o menu e escolha "Cadastrar uma pessoa". Preencha o nome completo, a localidade onde a pessoa foi vista pela última vez, a idade e um telefone de contato. No fim do formulário, informe seu vínculo com a pessoa e confirme a declaração de veracidade. Foto, cidade, estado, país e características físicas são opcionais, mas ajudam muito.':
    'Toca "Registrar" en la barra inferior, el botón naranja "Registrar persona" debajo del mapa en la computadora, o abre el menú y elige "Registrar a una persona". Completa el nombre completo, el lugar donde la persona fue vista por última vez, la edad y un teléfono de contacto. Al final del formulario, indica tu vínculo con la persona y confirma la declaración de veracidad. Foto, ciudad, estado, país y características físicas son opcionales, pero ayudan mucho.',
  'novo alerta cadastro registrar': 'nueva alerta registro registrar',
  'Como divulgo um caso?': '¿Cómo difundo un caso?',
  'Abra o caso e toque em "Divulgar este caso". O texto pronto — nome, idade, onde e quando a pessoa foi vista e características — abre no compartilhamento do celular para você mandar por WhatsApp ou redes sociais. Ele não inclui telefone nem endereço.':
    'Abre el caso y toca "Difundir este caso". El texto listo — nombre, edad, dónde y cuándo fue vista la persona y sus características — se abre en el menú para compartir del celular, para que lo envíes por WhatsApp o redes sociales. No incluye teléfono ni dirección.',
  'divulgar compartilhar whatsapp redes sociais espalhar':
    'difundir compartir whatsapp redes sociales',
  'Posso cadastrar sem ter conta?': '¿Puedo registrar sin tener cuenta?',
  'Sim, mas o cadastro fica salvo só neste aparelho e aparece como "Cadastro pendente" — ninguém mais o vê. Para enviá-lo, entre na sua conta e toque em "Revisar e enviar" no próprio cadastro ou em Meu perfil: você confere os dados, completa o que faltar e confirma a declaração. Nada é enviado sem essa revisão, nem quando alguém entra numa conta neste aparelho. Você pode apagar esses cadastros em Configurações > Privacidade e localização.':
    'Sí, pero el registro queda guardado solo en este dispositivo y aparece como "Registro pendiente" — nadie más lo ve. Para enviarlo, entra en tu cuenta y toca "Revisar y enviar" en el propio registro o en Mi perfil: revisas los datos, completas lo que falte y confirmas la declaración. Nada se envía sin esa revisión, ni siquiera cuando alguien entra en una cuenta en este dispositivo. Puedes borrar esos registros en Configuración > Privacidad y ubicación.',
  'offline visitante pendente revisar enviar': 'sin conexión visitante pendiente revisar enviar',
  'Por que o app pede meu vínculo e o boletim de ocorrência?':
    '¿Por qué la app pide mi vínculo y la denuncia policial?',
  'Para proteger quem está desaparecido e evitar cadastros falsos ou feitos para perseguir alguém — por exemplo, uma mulher que se afastou para se proteger. Você informa seu vínculo com a pessoa e confirma que as informações são verdadeiras. Para crianças e adolescentes (menos de 18 anos), o número do boletim de ocorrência é obrigatório; para adultos, é recomendado. Não é preciso esperar 24 horas para registrar o boletim.':
    'Para proteger a quien está desaparecido y evitar registros falsos o hechos para perseguir a alguien — por ejemplo, una mujer que se alejó para protegerse. Indicas tu vínculo con la persona y confirmas que la información es verdadera. Para niños y adolescentes (menores de 18 años), el número de la denuncia policial (boletim de ocorrência) es obligatorio; para adultos, se recomienda. No hace falta esperar 24 horas para hacer la denuncia.',
  'boletim ocorrência bo vínculo declaração menor criança adolescente':
    'denuncia policial bo vínculo declaración menor niño adolescente',
  'O que significam as situações de cada caso?': '¿Qué significan las situaciones de cada caso?',
  'Cada caso mostra uma situação, como Pendente, Procurado, Alerta ou Encontrado. "Cadastro pendente" indica um cadastro que ainda está só no seu aparelho e não foi enviado.':
    'Cada caso muestra una situación, como Pendiente, En búsqueda, Alerta o Encontrado. "Registro pendiente" indica un registro que todavía está solo en tu dispositivo y no fue enviado.',
  'status pendente procurado alerta encontrado':
    'situación estado pendiente búsqueda alerta encontrado',
  'A pessoa foi encontrada. Como encerro o caso?':
    'La persona fue encontrada. ¿Cómo cierro el caso?',
  'Abra o caso e, no fim da página, toque em "Pedir correção ou atualização". Seu app de e-mail abre com a identificação do caso: conte o que mudou e envie. O pedido só chega à equipe quando você enviar o e-mail. O encerramento direto pelo app ainda não existe.':
    'Abre el caso y, al final de la página, toca "Pedir corrección o actualización". Tu app de correo se abre con la identificación del caso: cuenta lo que cambió y envía. El pedido solo llega al equipo cuando envías el correo. El cierre directo desde la app todavía no existe.',
  'encontrada localizada encerrar fechar': 'encontrada localizada cerrar terminar',
  'Como informo que vi uma pessoa?': '¿Cómo informo que vi a una persona?',
  'Abra o caso da pessoa e toque para informar um avistamento. Você pode usar sua localização atual, digitar o endereço ou ajustar o ponto no mapa. É preciso estar com a conta conectada.':
    'Abre el caso de la persona y toca para informar un avistamiento. Puedes usar tu ubicación actual, escribir la dirección o ajustar el punto en el mapa. Es necesario tener la sesión iniciada.',
  'vi avistei relato informar': 'vi avisté avistamiento informar',
  'Um avistamento significa que a pessoa foi encontrada?':
    '¿Un avistamiento significa que la persona fue encontrada?',
  'Não. Um avistamento é uma informação enviada por alguém da comunidade e não é uma confirmação. Em situação urgente, ligue para a polícia (190).':
    'No. Un avistamiento es una información enviada por alguien de la comunidad y no es una confirmación. En una situación urgente, llama a la policía (190).',
  'confirmado verdade verificado': 'confirmado verdad verificado',
  'O que é o histórico no mapa de um caso?': '¿Qué es el historial en el mapa de un caso?',
  'São os locais informados para aquela pessoa, em ordem de data. O ponto mais recente aparece destacado.':
    'Son los lugares informados para esa persona, en orden de fecha. El punto más reciente aparece destacado.',
  'histórico trajeto rastro': 'historial trayecto rastro',
  'O que faz o botão vermelho "Pedir ajuda"?': '¿Qué hace el botón rojo "Pedir ayuda"?',
  'No celular ele fica no centro da barra inferior; no computador, no alto da tela, ao lado da busca. Ao tocar, você pode acionar o alerta de emergência (com contagem de 10 segundos), escolher para quem ligar (190, 180, 100, 192 ou 193), mandar sua localização a alguém de confiança ou comunicar um desaparecimento. A ligação é feita pelo seu celular, como uma chamada comum: o aplicativo não avisa a polícia sozinho.':
    'En el celular está en el centro de la barra inferior; en la computadora, arriba de la pantalla, junto a la búsqueda. Al tocarlo, puedes activar la alerta de emergencia (con cuenta regresiva de 10 segundos), elegir a quién llamar (190, 180, 100, 192 o 193), enviar tu ubicación a alguien de confianza o comunicar una desaparición. La llamada se hace desde tu celular, como una llamada común: la aplicación no avisa a la policía por sí sola.',
  'emergência 190 polícia ligar socorro botão vermelho pânico':
    'emergencia 190 policía llamar socorro botón rojo pánico',
  'Quais números de emergência posso usar?': '¿Qué números de emergencia puedo usar?',
  '190 — Polícia Militar. 180 — Central de Atendimento à Mulher. 100 — Disque Direitos Humanos (crianças e adolescentes). 192 — SAMU. 193 — Bombeiros. 188 — CVV (apoio emocional, 24 horas). As ligações são gratuitas.':
    '190 — Policía Militar. 180 — Central de Atención a la Mujer. 100 — Línea de Derechos Humanos (niños y adolescentes). 192 — SAMU (ambulancia). 193 — Bomberos. 188 — CVV (apoyo emocional, 24 horas). Las llamadas son gratuitas.',
  'samu bombeiros cvv telefone': 'samu ambulancia bomberos cvv teléfono',
  'Como funciona o alerta de emergência?': '¿Cómo funciona la alerta de emergencia?',
  'Em "Pedir ajuda", toque em "Acionar alerta de emergência". Começa uma contagem de 10 segundos com um botão grande para cancelar — assim um toque sem querer não vira alerta. Ao fim, o telefone abre com o 190 (você toca em ligar) e sua localização fica pronta para mandar aos seus contatos de confiança por WhatsApp ou SMS. O envio automático do alerta para o Encontra-me só aparece quando estiver disponível, e a tela só diz que ele foi recebido depois da confirmação do servidor.':
    'En "Pedir ayuda", toca "Activar alerta de emergencia". Empieza una cuenta regresiva de 10 segundos con un botón grande para cancelar — así un toque sin querer no se convierte en alerta. Al final, el teléfono se abre con el 190 (tú tocas llamar) y tu ubicación queda lista para enviarla a tus contactos de confianza por WhatsApp o SMS. El envío automático de la alerta a Encontra-me solo aparece cuando esté disponible, y la pantalla solo dice que fue recibida después de la confirmación del servidor.',
  'pânico alerta contagem 10 segundos cancelar socorro contatos':
    'pánico alerta cuenta regresiva 10 segundos cancelar socorro contactos',
  'O que são os contatos de confiança?': '¿Qué son los contactos de confianza?',
  'São até 5 pessoas para quem você manda sua localização com um toque, por WhatsApp ou SMS. Cadastre em Configurações › Emergência › Contatos de confiança. A lista fica salva só neste aparelho e não vai para o servidor. O app abre o WhatsApp ou o SMS com a mensagem pronta: ela só chega quando você toca em enviar.':
    'Son hasta 5 personas a las que envías tu ubicación con un toque, por WhatsApp o SMS. Regístralos en Configuración › Emergencia › Contactos de confianza. La lista queda guardada solo en este dispositivo y no va al servidor. La app abre WhatsApp o el SMS con el mensaje listo: solo llega cuando tocas enviar.',
  'contatos confiança família avisar whatsapp sms':
    'contactos confianza familia avisar whatsapp sms',
  'Como mando minha localização para alguém?': '¿Cómo envío mi ubicación a alguien?',
  'Em "Pedir ajuda", toque em "Compartilhar minha localização" (também em Configurações › Emergência). O app pega sua posição atual e monta uma mensagem com o link do mapa. Escolha um contato de confiança (WhatsApp ou SMS) ou outro aplicativo do celular. Sem permissão de localização, a mensagem vai sem o link.':
    'En "Pedir ayuda", toca "Compartir mi ubicación" (también en Configuración › Emergencia). La app obtiene tu posición actual y arma un mensaje con el enlace del mapa. Elige un contacto de confianza (WhatsApp o SMS) u otra aplicación del celular. Sin permiso de ubicación, el mensaje va sin el enlace.',
  'localização compartilhar mandar onde estou mapa whatsapp':
    'ubicación compartir enviar dónde estoy mapa whatsapp',
  'Posso pedir ajuda sem abrir o app?': '¿Puedo pedir ayuda sin abrir la app?',
  'Sim, no Android. Entre na sua conta, vá em Configurações › Emergência e ative "Atalho na tela inicial". Depois toque em "Adicionar à tela inicial" e confirme na janela do Android. O ícone vermelho "Pedir ajuda" abre direto a tela de emergência, onde você escolhe o número com um toque. Se o seu celular não adicionar o ícone sozinho, toque e segure o ícone do Encontra-me e arraste "Pedir ajuda" para a tela inicial.':
    'Sí, en Android. Entra en tu cuenta, ve a Configuración › Emergencia y activa "Atajo en la pantalla de inicio". Después toca "Añadir a la pantalla de inicio" y confirma en la ventana de Android. El ícono rojo "Pedir ayuda" abre directamente la pantalla de emergencia, donde eliges el número con un toque. Si tu celular no añade el ícono solo, mantén presionado el ícono de Encontra-me y arrastra "Pedir ayuda" a la pantalla de inicio.',
  'atalho widget tela inicial sem abrir rápido botão emergência':
    'atajo widget pantalla de inicio sin abrir rápido botón emergencia',
  'O atalho liga ou envia algo sozinho?': '¿El atajo llama o envía algo por sí solo?',
  'Não. O atalho só abre a tela "Pedir ajuda". Nada é ligado ou enviado sem você tocar no número ou confirmar a mensagem. Ligar para 190, 180 ou 100 e mandar sua localização nunca exigem login. Para desligar o atalho, vá em Configurações › Emergência.':
    'No. El atajo solo abre la pantalla "Pedir ayuda". Nada se llama ni se envía sin que toques el número o confirmes el mensaje. Llamar al 190, 180 o 100 y enviar tu ubicación nunca requieren iniciar sesión. Para desactivar el atajo, ve a Configuración › Emergencia.',
  'atalho seguro acidental desativar': 'atajo seguro accidental desactivar',
  'Posso acompanhar meu trajeto até chegar em casa?':
    '¿Puedo seguir mi trayecto hasta llegar a casa?',
  'rota trajeto acompanhar caminho': 'ruta trayecto seguir camino',
  'O que é o círculo familiar?': '¿Qué es el círculo familiar?',
  'família círculo compartilhar': 'familia círculo compartir',
  'Como crio minha conta?': '¿Cómo creo mi cuenta?',
  'Na tela de entrada, escolha criar conta. São pedidos nome, CPF, e-mail, celular e CEP, o aceite das regras de uso e, depois, uma senha. Também é possível começar com sua conta Google. Seu CPF não aparece para outras pessoas no app.':
    'En la pantalla de entrada, elige crear cuenta. Se piden nombre, CPF (documento brasileño), correo electrónico, celular y CEP (código postal), la aceptación de las reglas de uso y, después, una contraseña. También es posible empezar con tu cuenta de Google. Tu CPF no aparece para otras personas en la app.',
  'cadastro registrar criar conta google': 'registro registrar crear cuenta google',
  'Quais são as regras de uso?': '¿Cuáles son las reglas de uso?',
  'Estão em Configurações > Regras de uso e privacidade. Em resumo: cadastre só casos reais, com vínculo ou autorização da família; não use o app para expor ou perseguir ninguém; e saiba que o uso não é anônimo — seus dados de cadastro identificam sua conta e podem ser usados para apurar abusos. A Política de Privacidade completa está publicada no site e em Sobre. Os Termos de Uso completos ainda estão em revisão jurídica.':
    'Están en Configuración > Reglas de uso y privacidad. En resumen: registra solo casos reales, con vínculo o autorización de la familia; no uses la app para exponer o perseguir a nadie; y ten en cuenta que el uso no es anónimo — tus datos de registro identifican tu cuenta y pueden usarse para investigar abusos. La Política de Privacidad completa está publicada en el sitio y en Acerca de. Los Términos de Uso completos siguen en revisión jurídica.',
  'regras termos uso política privacidade responsabilidade':
    'reglas términos uso política privacidad responsabilidad',
  'Esqueci minha senha. E agora?': 'Olvidé mi contraseña. ¿Y ahora?',
  'A recuperação de senha pelo próprio app ainda não está disponível. Use "Falar com o suporte", escolha "Cadastro, login ou senha" e escreva o e-mail da sua conta. Nunca envie sua senha para ninguém, nem para o suporte.':
    'La recuperación de contraseña desde la propia app todavía no está disponible. Usa "Hablar con soporte", elige "Registro, inicio de sesión o contraseña" y escribe el correo de tu cuenta. Nunca envíes tu contraseña a nadie, ni siquiera a soporte.',
  'senha esqueci recuperar acesso': 'contraseña olvidé recuperar acceso',
  'Posso entrar com a digital ou o rosto?': '¿Puedo entrar con la huella o el rostro?',
  'Sim, no celular. Ative em Configurações > Segurança > "Entrar com biometria". Com ela ligada, ao sair o app só trava a conta; para sair de vez, desligue a biometria antes.':
    'Sí, en el celular. Actívalo en Configuración > Seguridad > "Entrar con biometría". Con ella activada, al salir la app solo bloquea la cuenta; para salir del todo, desactiva antes la biometría.',
  'digital face id biometria': 'huella face id biometría',
  'Como excluo minha conta?': '¿Cómo elimino mi cuenta?',
  'Em Configurações > Minha conta, toque em "Excluir minha conta" e confirme. A conta e os dados pessoais são apagados na hora. Cadastros de pessoas desaparecidas que você publicou podem continuar no ar. Sem o app instalado, o pedido também pode ser feito pela página da política de privacidade.':
    'En Configuración > Mi cuenta, toca "Excluir minha conta" y confirma. La cuenta y los datos personales se borran en el momento. Los registros de personas desaparecidas que publicaste pueden seguir visibles. Sin la app instalada, el pedido también se hace en la página de la política de privacidad.',
  'excluir apagar conta deletar': 'eliminar borrar cuenta',
  'Quando o app usa minha localização?': '¿Cuándo usa la app mi ubicación?',
  'Só enquanto o app está aberto: para mostrar casos perto de você e, quando você pede, para marcar o local de um avistamento ou mandar sua localização a um contato. O Encontra-me não acompanha sua localização em segundo plano.':
    'Solo mientras la app está abierta: para mostrar casos cerca de ti y, cuando lo pides, para marcar el lugar de un avistamiento o enviar tu ubicación a un contacto. Encontra-me no sigue tu ubicación en segundo plano.',
  'gps localização rastreio segundo plano': 'gps ubicación rastreo segundo plano',
  'Como mudo as permissões de localização, câmera ou fotos?':
    '¿Cómo cambio los permisos de ubicación, cámara o fotos?',
  'Em Configurações > Privacidade e localização, toque em "Abrir ajustes do aparelho". Lá você liga ou desliga cada permissão do Encontra-me.':
    'En Configuración > Privacidad y ubicación, toca "Abrir ajustes del dispositivo". Allí activas o desactivas cada permiso de Encontra-me.',
  'permissão câmera fotos galeria': 'permiso cámara fotos galería',
  'Como peço acesso ou correção dos meus dados?': '¿Cómo pido acceso o corrección de mis datos?',
  'Use "Falar com o suporte" e escolha "Privacidade e meus dados". Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir acesso, correção e exclusão dos seus dados pessoais.':
    'Usa "Hablar con soporte" y elige "Privacidad y mis datos". Por la Ley General de Protección de Datos de Brasil (LGPD), puedes pedir acceso, corrección y eliminación de tus datos personales.',
  'lgpd dados pessoais acesso correção': 'lgpd datos personales acceso corrección',
  'Alguém pediu dinheiro dizendo ter informações. É golpe?':
    'Alguien pidió dinero diciendo que tiene información. ¿Es una estafa?',
  'Desconfie. O Encontra-me nunca pede pagamento para divulgar um caso ou passar informações. Não faça depósitos nem PIX para desconhecidos, não envie códigos recebidos por SMS e procure a polícia. Você também pode nos avisar em "Denunciar conteúdo ou golpe".':
    'Desconfía. Encontra-me nunca pide pago para difundir un caso ni para pasar información. No hagas depósitos ni PIX a desconocidos, no envíes códigos recibidos por SMS y acude a la policía. También puedes avisarnos en "Denunciar contenido o estafa".',
  'golpe pix dinheiro extorsão resgate': 'estafa pix dinero extorsión rescate',
  'Como denuncio um cadastro falso ou que coloca alguém em risco?':
    '¿Cómo denuncio un registro falso o que pone a alguien en riesgo?',
  'Abra o caso e, no fim da página, toque em "Denunciar este cadastro". A denúncia fica registrada para a equipe. Dá para bloquear quem publicou, e o conteúdo dessa conta sai da sua lista. No grupo, cada mensagem de outra pessoa tem Denunciar e Bloquear. Em perigo, ligue 190.':
    'Abre el caso y, al final de la página, toca "Denunciar este registro". La denuncia queda registrada para el equipo. Se puede bloquear a quien publicó, y el contenido de esa cuenta sale de tu lista. En el grupo, cada mensaje de otra persona tiene Denunciar y Bloquear. Si estás en peligro, llama al 190.',
  'denúncia denunciar falso remover retirar sou eu perseguição':
    'denuncia denunciar falso eliminar retirar soy yo persecución',
  'Como me proteger ao divulgar um caso?': '¿Cómo protegerme al difundir un caso?',
  'Evite publicar endereço de casa, rotina da família e documentos. Use um telefone de contato que você possa atender e confirme qualquer informação recebida com a polícia antes de agir.':
    'Evita publicar la dirección de tu casa, la rutina de la familia y documentos. Usa un teléfono de contacto que puedas atender y confirma cualquier información recibida con la policía antes de actuar.',
  'segurança exposição endereço': 'seguridad exposición dirección',
  'Quem é a Sofia?': '¿Quién es Sofia?',
  'A Sofia é uma inteligência artificial para conversar e oferecer apoio. Ela não substitui psicólogo, médico ou atendimento de emergência. Em crise, ligue 188 (CVV) ou 192 (SAMU).':
    'Sofia es una inteligencia artificial para conversar y ofrecer apoyo. No reemplaza a un psicólogo, a un médico ni la atención de emergencia. En una crisis, llama al 188 (CVV) o al 192 (SAMU).',
  'ia inteligência artificial chat apoio': 'ia inteligencia artificial chat apoyo',
  'O que é o grupo de apoio?': '¿Qué es el grupo de apoyo?',
  'É uma conversa entre pessoas que usam o app, para troca de apoio. Não compartilhe dados pessoais, endereço ou documentos no grupo.':
    'Es una conversación entre personas que usan la app, para intercambiar apoyo. No compartas datos personales, dirección ni documentos en el grupo.',
  'grupo conversa comunidade': 'grupo conversación comunidad',
  // features/ajuda/sections/ajuda-contact-section.tsx
  'Ainda precisa de ajuda?': '¿Todavía necesitas ayuda?',
  'Relatar um problema': 'Informar un problema',
  'Falar com o suporte': 'Hablar con soporte',
  'Denunciar conteúdo ou golpe': 'Denunciar contenido o estafa',
  'Mensagem pronta no seu e-mail': 'Mensaje listo en tu correo',
  'Abrimos seu app de e-mail com a mensagem preenchida. Ela só chega até nós quando você tocar em enviar. Você recebe a resposta no seu e-mail.':
    'Abrimos tu app de correo con el mensaje completo. Solo nos llega cuando tocas enviar. Recibirás la respuesta en tu correo.',
  'Ainda não geramos número de protocolo pelo app. Guarde o e-mail enviado como comprovante.':
    'La app todavía no genera número de protocolo. Guarda el correo enviado como comprobante.',
  'Fechar formulário': 'Cerrar formulario',
  'Assunto': 'Asunto',
  'Mensagem': 'Mensaje',
  'Conte o que aconteceu. Não escreva sua senha.': 'Cuenta lo que pasó. No escribas tu contraseña.',
  'Mensagem para o suporte': 'Mensaje para soporte',
  'Não encontramos um app de e-mail neste aparelho. Escreva para {supportEmail} a partir de qualquer e-mail.':
    'No encontramos una app de correo en este dispositivo. Escribe a {supportEmail} desde cualquier correo.',
  'Ao continuar, seu app de e-mail abre com a mensagem para {supportEmail}. A mensagem só é enviada quando você confirmar no e-mail.':
    'Al continuar, tu app de correo se abre con el mensaje para {supportEmail}. El mensaje solo se envía cuando lo confirmas en el correo.',
  'Continuar no e-mail': 'Continuar en el correo',
  // features/ajuda/sections/ajuda-faq-section.tsx
  'Pesquisar na ajuda (ex.: senha, avistamento)':
    'Buscar en la ayuda (ej.: contraseña, avistamiento)',
  'Pesquisar na ajuda': 'Buscar en la ayuda',
  'Limpar pesquisa': 'Borrar búsqueda',
  'Voltar para as categorias': 'Volver a las categorías',
  'Todas as categorias': 'Todas las categorías',
  '1 resultado': '1 resultado',
  '{count} resultados': '{count} resultados',
  'Não encontramos nada com essas palavras. Tente outro termo ou fale com o suporte.':
    'No encontramos nada con esas palabras. Prueba otro término o habla con soporte.',
  // features/alerta-emergencia/alerta-emergencia.controller.ts
  'Alerta recebido pelo servidor do Encontra-me.':
    'Alerta recibida por el servidor de Encontra-me.',
  'Alerta de emergência em {ALERT_COUNTDOWN_SECONDS} segundos. Toque em cancelar para parar.':
    'Alerta de emergencia en {ALERT_COUNTDOWN_SECONDS} segundos. Toca cancelar para detenerla.',
  'Alerta cancelado. Nada foi enviado.': 'Alerta cancelada. No se envió nada.',
  // features/alerta-emergencia/sections/alerta-countdown-section.tsx
  'Contagem pausada: responda sobre a localização': 'Cuenta pausada: responde sobre la ubicación',
  'O alerta começa em': 'La alerta empieza en',
  '1 segundo': '1 segundo',
  '{count} segundos': '{count} segundos',
  'segundo': 'segundo',
  'segundos': 'segundos',
  'Cancelar alerta': 'Cancelar alerta',
  'Quando a contagem terminar:': 'Cuando termine la cuenta regresiva:',
  'O telefone abre com o {callNumber}. Você toca em ligar.':
    'El teléfono se abre con el {callNumber}. Tú tocas llamar.',
  'Um alerta com sua localização vai para o Encontra-me. Esta tela mostra quando ele for recebido.':
    'Una alerta con tu ubicación va a Encontra-me. Esta pantalla muestra cuándo se recibe.',
  'Sua localização fica pronta para você mandar a seus contatos de confiança.':
    'Tu ubicación queda lista para que la envíes a tus contactos de confianza.',
  'Não esperar: abrir o telefone com o {callNumber} agora':
    'No esperar: abrir el teléfono con el {callNumber} ahora',
  'Não esperar — ligar {callNumber} agora': 'No esperar — llamar al {callNumber} ahora',
  // features/alerta-emergencia/sections/alerta-result-section.tsx
  'Telefone aberto com o {callNumber}': 'Teléfono abierto con el {callNumber}',
  'Toque em ligar para falar com a Polícia Militar. Se o telefone não abriu, disque {callNumber}.':
    'Toca llamar para hablar con la Policía Militar. Si el teléfono no se abrió, marca el {callNumber}.',
  'Não foi possível abrir o telefone': 'No se pudo abrir el teléfono',
  'Disque {callNumber} manualmente.': 'Marca el {callNumber} manualmente.',
  'Ligue para o {callNumber}': 'Llama al {callNumber}',
  'Toque no botão abaixo para abrir o telefone.': 'Toca el botón de abajo para abrir el teléfono.',
  'Ligar {callNumber}': 'Llamar al {callNumber}',
  'Alerta automático ainda não disponível': 'Alerta automática todavía no disponible',
  'Por enquanto o Encontra-me não envia o alerta sozinho para ninguém. Avise seus contatos abaixo.':
    'Por ahora Encontra-me no envía la alerta a nadie por sí solo. Avisa a tus contactos abajo.',
  'Alerta não enviado: entre na sua conta': 'Alerta no enviada: entra en tu cuenta',
  'Com a conta conectada, o alerta vai para o Encontra-me. Ligar e mandar a localização funcionam sem conta.':
    'Con la cuenta conectada, la alerta va a Encontra-me. Llamar y enviar la ubicación funcionan sin cuenta.',
  'Entrar na conta': 'Entrar en la cuenta',
  'Enviando o alerta… aguarde a confirmação do servidor.':
    'Enviando la alerta… espera la confirmación del servidor.',
  'Alerta recebido pelo Encontra-me': 'Alerta recibida por Encontra-me',
  'Recebido às {time} · protocolo {alertId}.': 'Recibida a las {time} · protocolo {alertId}.',
  'O servidor avisou 1 contato.': 'El servidor avisó a 1 contacto.',
  'O servidor avisou {count} contatos.': 'El servidor avisó a {count} contactos.',
  'Teste do modo de desenvolvimento: nenhum alerta real foi enviado.':
    'Prueba del modo de desarrollo: no se envió ninguna alerta real.',
  'Envio do alerta não confirmado': 'Envío de la alerta no confirmado',
  'O alerta pode não ter chegado. Ligue {callNumber} e avise seus contatos.':
    'Puede que la alerta no haya llegado. Llama al {callNumber} y avisa a tus contactos.',
  'Tentar enviar de novo': 'Intentar enviar de nuevo',
  'Avise seus contatos': 'Avisa a tus contactos',
  'Outros números': 'Otros números',
  'Voltar ao início': 'Volver al inicio',
  // features/biometric/sections/biometric-enroll-section.tsx
  'Agora não': 'Ahora no',
  // features/cadastrar-pessoa/cadastrar-pessoa.controller.ts
  'Branca': 'Blanca',
  'Preta': 'Negra',
  'Parda': 'Parda (mestiza)',
  'Amarela': 'Amarilla (asiática)',
  'Indígena': 'Indígena',
  'Magro': 'Delgado',
  'Médio': 'Mediano',
  'Atlético': 'Atlético',
  'Forte': 'Robusto',
  'Entre na sua conta': 'Entra en tu cuenta',
  'Para revisar e enviar um cadastro feito neste aparelho, entre na sua conta.':
    'Para revisar y enviar un registro hecho en este dispositivo, entra en tu cuenta.',
  'Cadastro não encontrado': 'Registro no encontrado',
  'Ele pode já ter sido enviado ou apagado deste aparelho.':
    'Puede que ya se haya enviado o borrado de este dispositivo.',
  'Não foi possível abrir o cadastro': 'No se pudo abrir el registro',
  'Tente novamente em instantes.': 'Inténtalo de nuevo en unos instantes.',
  'Foto muito grande': 'Foto demasiado grande',
  'A foto deve ter no máximo 2 MB.': 'La foto debe tener como máximo 2 MB.',
  'Foto inválida': 'Foto no válida',
  'Não foi possível ler a imagem selecionada.': 'No se pudo leer la imagen seleccionada.',
  'Permissão necessária': 'Permiso necesario',
  'Autorize o acesso à galeria para escolher uma foto.':
    'Autoriza el acceso a la galería para elegir una foto.',
  'Autorize o acesso à câmera para tirar uma foto.':
    'Autoriza el acceso a la cámara para tomar una foto.',
  'Não foi possível ler a imagem capturada.': 'No se pudo leer la imagen capturada.',
  'Formato inválido': 'Formato no válido',
  'Envie apenas fotos PNG ou JPG.': 'Envía solo fotos PNG o JPG.',
  'Não foi possível ler o arquivo selecionado.': 'No se pudo leer el archivo seleccionado.',
  'Adicionar foto': 'Añadir foto',
  'Escolha a origem da imagem': 'Elige el origen de la imagen',
  'Câmera': 'Cámara',
  'Galeria': 'Galería',
  'Cancelar': 'Cancelar',
  'Falta pouco': 'Falta poco',
  'No fim do formulário, informe seu vínculo com a pessoa, o boletim de ocorrência (obrigatório para crianças e adolescentes) e confirme a declaração.':
    'Al final del formulario, indica tu vínculo con la persona, la denuncia policial (obligatoria para niños y adolescentes) y confirma la declaración.',
  'Sua sessão terminou. Entre de novo para enviar este cadastro.':
    'Tu sesión terminó. Entra de nuevo para enviar este registro.',
  'Cadastro enviado': 'Registro enviado',
  'O caso foi enviado pela sua conta e saiu da lista de cadastros deste aparelho.':
    'El caso se envió desde tu cuenta y salió de la lista de registros de este dispositivo.',
  'Cadastro concluído': 'Registro completado',
  'A pessoa foi cadastrada com sucesso.': 'La persona fue registrada con éxito.',
  'Cadastro salvo só neste aparelho. Para enviá-lo, entre na sua conta e toque em "Revisar e enviar" no próprio cadastro ou em Meu perfil.':
    'Registro guardado solo en este dispositivo. Para enviarlo, entra en tu cuenta y toca "Revisar y enviar" en el propio registro o en Mi perfil.',
  // features/cadastrar-pessoa/legitimacy.ts
  'Mãe ou pai': 'Madre o padre',
  'Responsável legal': 'Tutor legal',
  'Outro familiar': 'Otro familiar',
  'Cônjuge ou companheiro(a)': 'Cónyuge o pareja',
  'Amigo(a)': 'Amigo(a)',
  'Outro': 'Otro',
  // features/cadastrar-pessoa/sections/cadastrar-pessoa-basic-section.tsx
  'Cadastro feito neste aparelho': 'Registro hecho en este dispositivo',
  'Carregando o cadastro…': 'Cargando el registro…',
  'Confira os dados, complete o que faltar e confirme a declaração no fim. Ao enviar, o caso fica ligado à sua conta.':
    'Revisa los datos, completa lo que falte y confirma la declaración al final. Al enviarlo, el caso queda vinculado a tu cuenta.',
  'Proteja quem você procura': 'Protege a quien buscas',
  'Não informe endereço de casa, escola, rotina nem documentos — principalmente de crianças e de mulheres em situação de risco. Faça também o boletim de ocorrência: não é preciso esperar 24 horas.':
    'No indiques dirección de casa, escuela, rutina ni documentos — principalmente de niños y de mujeres en situación de riesgo. Haz también la denuncia policial: no hace falta esperar 24 horas.',
  'Nome completo': 'Nombre completo',
  'Fulano Beltrano da Silva': 'Fulano de Tal',
  'Localidade': 'Localidad',
  'Ex.: Savassi, Belo Horizonte - MG': 'Ej.: Savassi, Belo Horizonte - MG',
  'Onde a pessoa foi vista pela última vez: bairro ou ponto de referência e cidade.':
    'Dónde fue vista la persona por última vez: barrio o punto de referencia, y ciudad.',
  'De onde a pessoa é (opcional)': 'De dónde es la persona (opcional)',
  'Cidade': 'Ciudad',
  'Ex.: Belo Horizonte': 'Ej.: Belo Horizonte',
  'Estado': 'Estado',
  'Ex.: MG': 'Ej.: MG',
  'País': 'País',
  'Ex.: Brasil': 'Ej.: Brasil',
  'Bairro': 'Barrio',
  'Ex.: Savassi': 'Ej.: Savassi',
  'Telefone': 'Teléfono',
  'Da família ou de quem cadastra, para receber informações sobre a pessoa.':
    'De la familia o de quien registra, para recibir información sobre la persona.',
  'Foto': 'Foto',
  'Foto escolhida': 'Foto elegida',
  'Remover foto': 'Quitar foto',
  'Recente e nítida, de preferência só do rosto. PNG ou JPG, até 2 MB.':
    'Reciente y nítida, de preferencia solo del rostro. PNG o JPG, hasta 2 MB.',
  'Apelido': 'Apodo',
  'Fulano': 'Fulano',
  'Idade': 'Edad',
  'Porte físico': 'Complexión',
  'Altura': 'Altura',
  '180 cm': '180 cm',
  'Cor/Etnia': 'Color/Etnia',
  'Roupas': 'Ropa',
  'Camisa branca, calça jeans etc.': 'Camisa blanca, pantalón vaquero, etc.',
  // features/cadastrar-pessoa/sections/cadastrar-pessoa-details-section.tsx
  'Cabelo': 'Cabello',
  'Cabelo preto cacheado': 'Cabello negro rizado',
  'Olhos': 'Ojos',
  'Olhos castanhos': 'Ojos marrones',
  'Tatuagem': 'Tatuaje',
  'Tatuagem de leão no braço esquerdo': 'Tatuaje de león en el brazo izquierdo',
  'Acessórios': 'Accesorios',
  'Brincos, colar, pulseiras etc.': 'Aretes, collar, pulseras, etc.',
  'Data em que foi vista pela última vez': 'Fecha en que fue vista por última vez',
  'dd/mm/aaaa': 'dd/mm/aaaa',
  'Enviar cadastro': 'Enviar registro',
  // features/cadastrar-pessoa/sections/cadastrar-pessoa-responsibility-section.tsx
  'Sobre quem está cadastrando': 'Sobre quien registra',
  'Seu vínculo com a pessoa *': 'Tu vínculo con la persona *',
  'Escolha': 'Elige',
  'Número do boletim de ocorrência': 'Número de la denuncia policial',
  'Ex.: 2026-123456': 'Ej.: 2026-123456',
  'Para crianças e adolescentes, o número do boletim de ocorrência é obrigatório. Registre na delegacia mais próxima ou, se o seu estado permitir, na delegacia on-line — não é preciso esperar 24 horas.':
    'Para niños y adolescentes, el número de la denuncia policial (boletim de ocorrência) es obligatorio. Regístrala en la comisaría más cercana o, si tu estado lo permite, en la comisaría en línea — no hace falta esperar 24 horas.',
  'Recomendado. Com o boletim de ocorrência, o caso fica mais confiável para a comunidade.':
    'Recomendado. Con la denuncia policial, el caso es más confiable para la comunidad.',
  'Declaro que as informações são verdadeiras, que tenho vínculo com a pessoa ou autorização da família e que o cadastro não tem como objetivo perseguir ou expor ninguém':
    'Declaro que la información es verdadera, que tengo vínculo con la persona o autorización de la familia y que el registro no tiene como objetivo perseguir ni exponer a nadie',
  'Declaro que as informações são verdadeiras, que tenho vínculo com a pessoa ou autorização da família e que o cadastro não tem como objetivo perseguir ou expor ninguém. Sei que informações falsas podem levar ao bloqueio da conta e à responsabilização civil e criminal.':
    'Declaro que la información es verdadera, que tengo vínculo con la persona o autorización de la familia y que el registro no tiene como objetivo perseguir ni exponer a nadie. Sé que la información falsa puede llevar al bloqueo de la cuenta y a la responsabilidad civil y penal.',
  'Ver regras de uso': 'Ver reglas de uso',
  // features/chat/sections/chat-disclaimer-section.tsx
  'Antes de conversar com a Sofia': 'Antes de conversar con Sofia',
  'Sofia é uma inteligência artificial criada para conversar e oferecer apoio e informações. Ela não substitui um terapeuta, psicólogo, psiquiatra, médico ou outro profissional de saúde qualificado.\n\nSofia não realiza diagnósticos, tratamentos ou atendimento de emergência.\n\nSe você estiver em perigo ou passando por uma situação de emergência, procure ajuda profissional ou um serviço de emergência da sua região.':
    'Sofia es una inteligencia artificial creada para conversar y ofrecer apoyo e información. No reemplaza a un terapeuta, psicólogo, psiquiatra, médico u otro profesional de salud calificado.\n\nSofia no realiza diagnósticos, tratamientos ni atención de emergencia.\n\nSi estás en peligro o pasando por una situación de emergencia, busca ayuda profesional o un servicio de emergencia de tu región.',
  'Em emergência no Brasil, ligue:': 'En una emergencia en Brasil, llama al:',
  '188 · CVV (apoio emocional)\n192 · SAMU\n193 · Bombeiros\n190 · Polícia Militar':
    '188 · CVV (apoyo emocional)\n192 · SAMU (ambulancia)\n193 · Bomberos\n190 · Policía Militar',
  'Entendi, continuar': 'Entendido, continuar',
  // features/chat/sections/chat-header-section.tsx
  'Sobre a Sofia': 'Sobre Sofia',
  'Sofia': 'Sofia',
  'aqui com você': 'aquí contigo',
  'Exercícios rápidos': 'Ejercicios rápidos',
  'Apagar conversa': 'Borrar conversación',
  // features/chat/sections/chat-input-section.tsx
  'Escreva o que está sentindo…': 'Escribe lo que estás sintiendo…',
  'Enviar': 'Enviar',
  // features/chat/sections/chat-messages-section.tsx
  'Um momento…': 'Un momento…',
  // features/compartilhar-localizacao/sections/location-share-section.tsx
  'Enviar minha localização': 'Enviar mi ubicación',
  'Localização obtida às {value}': 'Ubicación obtenida a las {value}',
  'Buscando sua localização…': 'Buscando tu ubicación…',
  'Sem permissão de localização': 'Sin permiso de ubicación',
  'Não foi possível obter a localização': 'No se pudo obtener la ubicación',
  'Precisão não informada pelo GPS.': 'Precisión no informada por el GPS.',
  'Isso leva alguns segundos.': 'Esto tarda unos segundos.',
  'Você ainda pode avisar seus contatos: a mensagem vai sem o link do mapa.':
    'Aún puedes avisar a tus contactos: el mensaje va sin el enlace del mapa.',
  'Verifique se o GPS está ligado. A mensagem vai sem o link do mapa.':
    'Verifica que el GPS esté activado. El mensaje va sin el enlace del mapa.',
  'Permitir nos ajustes': 'Permitir en los ajustes',
  'Atualizar localização': 'Actualizar ubicación',
  'Enviar por WhatsApp para {name}': 'Enviar por WhatsApp a {name}',
  'WhatsApp': 'WhatsApp',
  'Enviar SMS para {name}': 'Enviar SMS a {name}',
  'SMS': 'SMS',
  'Você ainda não tem contatos de confiança. Cadastre até 5 pessoas para avisar com um toque.':
    'Todavía no tienes contactos de confianza. Registra hasta 5 personas para avisarles con un toque.',
  'Escolher no celular': 'Elegir en el celular',
  'Gerenciar contatos de confiança': 'Administrar contactos de confianza',
  'Cadastrar contatos de confiança': 'Registrar contactos de confianza',
  'Abrimos {opened}. A mensagem só chega quando você tocar em enviar.':
    'Abrimos {opened}. El mensaje solo llega cuando tocas enviar.',
  'O app não envia nada sozinho: ele abre o WhatsApp, o SMS ou o compartilhamento com a mensagem pronta e você confirma o envio.':
    'La app no envía nada por sí sola: abre WhatsApp, el SMS o el menú para compartir con el mensaje listo y tú confirmas el envío.',
  // features/compartilhar-localizacao/use-location-share.ts
  'Não foi possível abrir': 'No se pudo abrir',
  'Tente outra opção ou toque em "Escolher no celular".':
    'Prueba otra opción o toca "Elegir en el celular".',
  'Número inválido': 'Número no válido',
  'Confira o celular de {name} em Contatos de confiança.':
    'Revisa el celular de {name} en Contactos de confianza.',
  'Abra os ajustes do celular e permita a localização.':
    'Abre los ajustes del celular y permite la ubicación.',
  'o WhatsApp com a mensagem para {name}': 'WhatsApp con el mensaje para {name}',
  'o SMS com a mensagem para {name}': 'el SMS con el mensaje para {name}',
  'Minha localização': 'Mi ubicación',
  'o compartilhamento do celular': 'el menú para compartir del celular',
  // features/configuracoes/configuracoes.controller.ts
  'Permitida': 'Permitida',
  'Negada': 'Denegada',
  'Não definida': 'No definida',
  'Entrar com biometria': 'Entrar con biometría',
  'Confirme para ativar o login com biometria.':
    'Confirma para activar el inicio de sesión con biometría.',
  'Abra os ajustes do celular e procure por Encontra-me.':
    'Abre los ajustes del celular y busca Encontra-me.',
  'Apagar cadastros deste aparelho?': '¿Borrar los registros de este dispositivo?',
  'Os cadastros que ainda não foram enviados serão apagados e não poderão ser recuperados.':
    'Los registros que todavía no se enviaron se borrarán y no podrán recuperarse.',
  'Apagar': 'Borrar',
  'Pronto': 'Listo',
  'Os cadastros salvos neste aparelho foram apagados.':
    'Se borraron los registros guardados en este dispositivo.',
  'Não foi possível apagar': 'No se pudo borrar',
  'Sair da conta?': '¿Cerrar sesión?',
  'Com a biometria ligada, sua conta fica travada neste aparelho até você entrar de novo.':
    'Con la biometría activada, tu cuenta queda bloqueada en este dispositivo hasta que vuelvas a entrar.',
  'Você precisará entrar de novo para enviar cadastros e avistamentos.':
    'Tendrás que entrar de nuevo para enviar registros y avistamientos.',
  'Sair': 'Salir',
  'Excluir a conta?': '¿Eliminar la cuenta?',
  'A conta e os dados pessoais são apagados agora. Cadastros de pessoas desaparecidas que você publicou podem continuar no ar.':
    'La cuenta y los datos personales se borran ahora. Los registros de personas desaparecidas que publicaste pueden seguir visibles.',
  'Excluir conta': 'Eliminar cuenta',
  'Não foi possível excluir a conta': 'No fue posible eliminar la cuenta',
  'Tente de novo. Se o app não abrir, escreva para {supportEmail}.':
    'Inténtalo de nuevo. Si la app no abre, escribe a {supportEmail}.',
  'Conta excluída': 'Cuenta eliminada',
  'Seus dados pessoais foram apagados.': 'Tus datos personales fueron borrados.',
  'Apaga a conta e os dados pessoais ligados a ela.': 'Borra la cuenta y los datos personales ligados a ella.',
  'Para denunciar ou bloquear, entre na sua conta.': 'Para denunciar o bloquear, entra en tu cuenta.',
  'Denunciar esta mensagem?': '¿Denunciar este mensaje?',
  'A denúncia fica registrada para a equipe analisar.': 'La denuncia queda registrada para que el equipo la analice.',
  'Denúncia registrada': 'Denuncia registrada',
  'A equipe pode analisar esta denúncia.': 'El equipo puede analizar esta denuncia.',
  'Não foi possível registrar': 'No fue posible registrar',
  'Tente de novo em alguns instantes.': 'Inténtalo de nuevo en unos instantes.',
  'Bloquear esta pessoa?': '¿Bloquear a esta persona?',
  'Você deixa de ver as mensagens e os cadastros publicados por esta conta.':
    'Dejas de ver los mensajes y los registros publicados por esta cuenta.',
  'Bloquear': 'Bloquear',
  'Pessoa bloqueada': 'Persona bloqueada',
  'O conteúdo desta conta saiu da sua lista.': 'El contenido de esta cuenta salió de tu lista.',
  'Não foi possível bloquear': 'No fue posible bloquear',
  'Denunciar esta mensagem': 'Denunciar este mensaje',
  'Bloquear esta pessoa': 'Bloquear a esta persona',
  'Para denunciar um aviso, entre na sua conta.': 'Para denunciar un aviso, entra en tu cuenta.',
  'Para denunciar um cadastro, entre na sua conta.': 'Para denunciar un registro, entra en tu cuenta.',
  'Para bloquear quem publicou, entre na sua conta.': 'Para bloquear a quien publicó, entra en tu cuenta.',
  'Bloquear quem publicou?': '¿Bloquear a quien publicó?',
  'Você deixa de ver os cadastros e as mensagens desta conta.':
    'Dejas de ver los registros y los mensajes de esta cuenta.',
  'Bloquear quem publicou': 'Bloquear a quien publicó',
  'A correção abre o seu app de e-mail. A denúncia fica registrada no app para a equipe analisar.':
    'La corrección abre tu app de correo. La denuncia queda registrada en la app para que el equipo la analice.',
  'Continuar': 'Continuar',
  'Usa o idioma do navegador. Agora: {language}.':
    'Usa el idioma del navegador. Ahora: {language}.',
  'Usa o idioma do celular. Agora: {language}.': 'Usa el idioma del celular. Ahora: {language}.',
  // features/configuracoes/sections/configuracoes-groups-section.tsx
  'Disponível no aplicativo Android.': 'Disponible en la aplicación para Android.',
  'Atualize o Encontra-me para usar este recurso.': 'Actualiza Encontra-me para usar esta función.',
  'Requer Android 7.1 ou mais recente.': 'Requiere Android 7.1 o más reciente.',
  'Minha conta': 'Mi cuenta',
  'Editar perfil e foto': 'Editar perfil y foto',
  'Depende de atualização da API.': 'Depende de una actualización de la API.',
  'Alterar ou recuperar senha': 'Cambiar o recuperar contraseña',
  'Enquanto não está no app, peça pela Central de Ajuda.':
    'Mientras no esté en la app, pídelo en el Centro de Ayuda.',
  'Saindo…': 'Saliendo…',
  'Sair da conta': 'Cerrar sesión',
  'Entrar ou criar conta': 'Entrar o crear cuenta',
  'Necessário para enviar cadastros e avistamentos.':
    'Necesario para enviar registros y avistamientos.',
  'O atalho abre direto a tela "Pedir ajuda". Nada liga ou é enviado sozinho: você toca no número ou confirma o envio da mensagem. Ligar para 190, 180 ou 100 e mandar sua localização nunca exigem login.':
    'El atajo abre directamente la pantalla "Pedir ayuda". Nada llama ni se envía por sí solo: tú tocas el número o confirmas el envío del mensaje. Llamar al 190, 180 o 100 y enviar tu ubicación nunca requieren iniciar sesión.',
  'Alerta de emergência': 'Alerta de emergencia',
  'Contagem de 10 segundos para cancelar; depois abre o 190.':
    'Cuenta regresiva de 10 segundos para cancelar; después abre el 190.',
  'Contatos de confiança': 'Contactos de confianza',
  'Para quem mandar sua localização com um toque.': 'A quién enviar tu ubicación con un toque.',
  'Nenhum contato ainda. Cadastre até 5.': 'Ningún contacto todavía. Registra hasta 5.',
  '1 contato salvo neste aparelho.': '1 contacto guardado en este dispositivo.',
  '{count} contatos salvos neste aparelho.': '{count} contactos guardados en este dispositivo.',
  'Por WhatsApp, SMS ou outro aplicativo.': 'Por WhatsApp, SMS u otra aplicación.',
  'Atalho na tela inicial': 'Atajo en la pantalla de inicio',
  'Ativado neste celular.': 'Activado en este celular.',
  'Peça ajuda sem precisar abrir o app.': 'Pide ayuda sin necesidad de abrir la app.',
  'Entre na sua conta para ativar.': 'Entra en tu cuenta para activarlo.',
  'Adicionar à tela inicial': 'Añadir a la pantalla de inicio',
  'Coloca o ícone vermelho "Pedir ajuda" ao lado dos seus apps.':
    'Pone el ícono rojo "Pedir ayuda" junto a tus apps.',
  'Como funciona': 'Cómo funciona',
  'Notificações': 'Notificaciones',
  'Os avisos são um apoio e podem atrasar ou não chegar. O Encontra-me não avisa a polícia: em emergência, ligue 190. Na tela bloqueada, a notificação não mostra nome nem foto.':
    'Los avisos son un apoyo y pueden demorarse o no llegar. Encontra-me no avisa a la policía: en una emergencia, llama al 190. En la pantalla de bloqueo, la notificación no muestra nombre ni foto.',
  'Por enquanto, o Encontra-me só envia o lembrete de cadastros salvos neste aparelho. Os avisos de casos ainda não foram lançados.':
    'Por ahora, Encontra-me solo envía el recordatorio de registros guardados en este dispositivo. Los avisos de casos todavía no se lanzaron.',
  'Notificações bloqueadas no celular': 'Notificaciones bloqueadas en el celular',
  'Toque para abrir os ajustes e permitir.': 'Toca para abrir los ajustes y permitirlas.',
  'Lembrete de cadastros salvos': 'Recordatorio de registros guardados',
  'Uma vez por dia, às 19h, enquanto houver cadastro feito neste aparelho aguardando envio.':
    'Una vez al día, a las 19 h, mientras haya un registro hecho en este dispositivo esperando envío.',
  'Casos perto de mim': 'Casos cerca de mí',
  'Novos casos perto da sua região aproximada. Usa a localização só se você já permitiu.':
    'Casos nuevos cerca de tu zona aproximada. Usa la ubicación solo si ya la permitiste.',
  'Novos cadastros da minha região': 'Registros nuevos en mi región',
  'Pessoas desaparecidas recém-cadastradas na sua cidade e estado.':
    'Personas desaparecidas registradas hace poco en tu ciudad y estado.',
  'Atualizações dos casos que acompanho': 'Novedades de los casos que sigo',
  'Quando um caso que você acompanha muda de situação ou recebe avistamento.':
    'Cuando un caso que sigues cambia de situación o recibe un avistamiento.',
  'Notificações desligadas': 'Notificaciones desactivadas',
  'Permita as notificações do Encontra-me nos ajustes do celular para receber avisos.':
    'Permite las notificaciones de Encontra-me en los ajustes del celular para recibir avisos.',
  'Abrir ajustes': 'Abrir ajustes',
  'Não disponível neste aparelho': 'No disponible en este dispositivo',
  'Atualize o Encontra-me para receber notificações.': 'Actualiza Encontra-me para recibir notificaciones.',
  'Confira sua conexão e tente de novo.': 'Revisa tu conexión e inténtalo de nuevo.',
  'Avisos indisponíveis neste aparelho': 'Avisos no disponibles en este dispositivo',
  'Este aparelho não recebe avisos do servidor. Instale o Encontra-me pela loja de aplicativos em um celular.':
    'Este dispositivo no recibe avisos del servidor. Instala Encontra-me desde la tienda de aplicaciones en un celular.',
  'Para acompanhar um caso, entre na sua conta.': 'Para seguir un caso, entra en tu cuenta.',
  'Não foi possível parar de acompanhar': 'No se pudo dejar de seguir',
  'Para receber as novidades deste caso, permita as notificações do Encontra-me nos ajustes do celular.':
    'Para recibir las novedades de este caso, permite las notificaciones de Encontra-me en los ajustes del celular.',
  'Você está acompanhando este caso': 'Estás siguiendo este caso',
  'Avisamos quando ele mudar de situação ou receber um novo avistamento. A notificação pode atrasar.':
    'Te avisamos cuando cambie de situación o reciba un nuevo avistamiento. La notificación puede demorarse.',
  'Não foi possível acompanhar': 'No se pudo seguir el caso',
  'Acompanhando este caso': 'Siguiendo este caso',
  'Acompanhar este caso': 'Seguir este caso',
  'Casos e lembretes': 'Casos y recordatorios',
  'O app envia notificações?': '¿La app envía notificaciones?',
  'Só se você ligar, em Configurações › Notificações, no aplicativo de celular. O "Lembrete de cadastros salvos" avisa uma vez por dia, às 19h, enquanto houver cadastro feito neste aparelho aguardando envio; ele só é enviado quando você revisa e confirma. Os avisos de casos perto de você, de novos cadastros da sua região e dos casos que você acompanha aparecem como "Em breve" enquanto não forem lançados. Quando estiverem disponíveis, você precisa estar com a conta conectada. Na tela bloqueada, a notificação não mostra nome nem foto. Os avisos podem atrasar e o app não avisa a polícia: em emergência, ligue 190.':
    'Solo si las activas, en Configuración › Notificaciones, en la app del celular. El "Recordatorio de registros guardados" avisa una vez al día, a las 19 h, mientras haya un registro hecho en este dispositivo esperando envío; solo se envía cuando lo revisas y confirmas. Los avisos de casos cerca de ti, de registros nuevos en tu región y de los casos que sigues aparecen como "Próximamente" mientras no se lancen. Cuando estén disponibles, necesitas tener la cuenta conectada. En la pantalla de bloqueo, la notificación no muestra nombre ni foto. Los avisos pueden demorarse y la app no avisa a la policía: en una emergencia, llama al 190.',
  'notificação aviso lembrete alerta push acompanhar seguir': 'notificación aviso recordatorio alerta push seguir',
  'Como acompanho um caso?': '¿Cómo sigo un caso?',
  'Quando o recurso estiver disponível no seu aplicativo, a página da pessoa mostra o botão "Acompanhar este caso". Com a conta conectada, toque nele e permita as notificações: você recebe um aviso quando o caso mudar de situação ou receber um novo avistamento. Toque de novo para parar. Para desligar todos esses avisos, use Configurações › Notificações.':
    'Cuando la función esté disponible en tu app, la página de la persona muestra el botón "Seguir este caso". Con la cuenta conectada, tócalo y permite las notificaciones: recibes un aviso cuando el caso cambie de situación o reciba un nuevo avistamiento. Toca de nuevo para dejar de seguirlo. Para desactivar todos estos avisos, usa Configuración › Notificaciones.',
  'acompanhar seguir caso atualização notificação': 'seguir caso novedad notificación',
  'Cadastro aguardando envio': 'Registro esperando envío',
  'Você tem 1 cadastro salvo neste aparelho. Ele só é enviado quando você revisa e confirma.':
    'Tienes 1 registro guardado en este dispositivo. Solo se envía cuando lo revisas y confirmas.',
  'Você tem {count} cadastros salvos neste aparelho. Eles só são enviados quando você revisa e confirma.':
    'Tienes {count} registros guardados en este dispositivo. Solo se envían cuando los revisas y confirmas.',
  'O app usa sua localização só enquanto está aberto, para mostrar casos próximos, marcar avistamentos e, quando você pede, mandar sua localização a um contato.':
    'La app usa tu ubicación solo mientras está abierta, para mostrar casos cercanos, marcar avistamientos y, cuando lo pides, enviar tu ubicación a un contacto.',
  'Permissão de localização': 'Permiso de ubicación',
  'No navegador': 'En el navegador',
  'No navegador, a permissão é controlada nas configurações do site.':
    'En el navegador, el permiso se controla en la configuración del sitio.',
  'Abrir ajustes do aparelho': 'Abrir ajustes del dispositivo',
  'Ligue ou desligue localização, câmera e fotos.': 'Activa o desactiva ubicación, cámara y fotos.',
  'Cadastros salvos neste aparelho': 'Registros guardados en este dispositivo',
  'Não foi possível verificar.': 'No se pudo verificar.',
  'Nenhum cadastro aguardando envio.': 'Ningún registro esperando envío.',
  '{localPendingCount} aguardando envio. Toque para apagar.':
    '{localPendingCount} esperando envío. Toca para borrar.',
  'Como usamos seus dados': 'Cómo usamos tus datos',
  'Resumo no app. A política completa está no site.':
    'Resumen en la app. La política completa está en el sitio.',
  'Segurança': 'Seguridad',
  'Pede sua digital ou rosto para abrir a conta neste celular.':
    'Pide tu huella o tu rostro para abrir la cuenta en este celular.',
  'Disponível só no aplicativo de celular.': 'Disponible solo en la aplicación para celular.',
  'Este aparelho não tem biometria cadastrada.': 'Este dispositivo no tiene biometría registrada.',
  'Dicas contra golpes': 'Consejos contra estafas',
  'Sessões ativas': 'Sesiones activas',
  'Idioma': 'Idioma',
  'Não são traduzidos: o que as pessoas escrevem nos casos e nas conversas e as respostas da Sofia. Os números de emergência continuam os do Brasil.':
    'No se traducen: lo que las personas escriben en los casos y en las conversaciones, ni las respuestas de Sofia. Los números de emergencia siguen siendo los de Brasil.',
  'Idioma do app': 'Idioma de la app',
  'Aparência e acessibilidade': 'Apariencia y accesibilidad',
  'Tema: Automático segue o modo claro ou escuro do celular. O tamanho do texto acompanha a configuração de fonte do aparelho.':
    'Tema: Automático sigue el modo claro u oscuro del celular. El tamaño del texto sigue la configuración de fuente del dispositivo.',
  'Tema': 'Tema',
  'Cores do chat da Sofia': 'Colores del chat de Sofia',
  'Ajuda e informações': 'Ayuda e información',
  'Ajuda e suporte': 'Ayuda y soporte',
  'Sobre o Encontra-me': 'Sobre Encontra-me',
  'Regras de uso e privacidade': 'Reglas de uso y privacidad',
  // features/configuracoes/use-emergency-shortcut-settings.ts
  'Confirme no Android': 'Confirma en Android',
  'Na janela do Android, toque em "Adicionar" para colocar o ícone "Pedir ajuda" na tela inicial.':
    'En la ventana de Android, toca "Añadir" para poner el ícono "Pedir ayuda" en la pantalla de inicio.',
  'Adicione manualmente': 'Añádelo manualmente',
  'Toque e segure o ícone do Encontra-me na tela inicial e arraste "Pedir ajuda" para onde quiser.':
    'Mantén presionado el ícono de Encontra-me en la pantalla de inicio y arrastra "Pedir ayuda" adonde quieras.',
  'Desativar o atalho de emergência?': '¿Desactivar el atajo de emergencia?',
  'O ícone "Pedir ajuda" da tela inicial vai parar de funcionar neste celular.':
    'El ícono "Pedir ayuda" de la pantalla de inicio dejará de funcionar en este celular.',
  'Desativar': 'Desactivar',
  'Confirme para ativar o atalho de emergência.': 'Confirma para activar el atajo de emergencia.',
  'Não foi possível ativar': 'No se pudo activar',
  'Tente de novo. Se continuar, atualize o Encontra-me pela loja de aplicativos.':
    'Inténtalo de nuevo. Si continúa, actualiza Encontra-me desde la tienda de aplicaciones.',
  'Atalho ativado': 'Atajo activado',
  'Quer colocar o ícone "Pedir ajuda" na tela inicial agora?':
    '¿Quieres poner el ícono "Pedir ayuda" en la pantalla de inicio ahora?',
  'Adicionar': 'Añadir',
  'Depois': 'Después',
  'Toque e segure o ícone do Encontra-me para ver "Pedir ajuda". Você pode arrastá-lo para a tela inicial.':
    'Mantén presionado el ícono de Encontra-me para ver "Pedir ayuda". Puedes arrastrarlo a la pantalla de inicio.',
  // features/contatos-confianca/contatos-confianca.controller.ts
  'Não foi possível salvar': 'No se pudo guardar',
  '{name} foi adicionado(a) aos seus contatos de confiança.':
    '{name} se añadió a tus contactos de confianza.',
  'Remover {name}?': '¿Quitar a {name}?',
  'O contato sai só desta lista. Nada é avisado a ele.':
    'El contacto sale solo de esta lista. No se le avisa nada.',
  'Remover': 'Quitar',
  '{name} saiu da lista.': '{name} salió de la lista.',
  // features/contatos-confianca/sections/contatos-confianca-section.tsx
  'Pessoas para quem você manda sua localização com um toque, por WhatsApp ou SMS — no alerta de emergência ou em "Compartilhar localização". A lista fica salva só neste aparelho e o app não envia nada sozinho.':
    'Personas a las que envías tu ubicación con un toque, por WhatsApp o SMS — en la alerta de emergencia o en "Compartir ubicación". La lista queda guardada solo en este dispositivo y la app no envía nada por sí sola.',
  'Nenhum contato ainda. Adicione até {max} pessoas.':
    'Ningún contacto todavía. Añade hasta {max} personas.',
  'Remover {name}': 'Quitar a {name}',
  'Você chegou ao limite de {max} contatos. Remova um para adicionar outro.':
    'Llegaste al límite de {max} contactos. Quita uno para añadir otro.',
  'Adicionar contato': 'Añadir contacto',
  'Nome': 'Nombre',
  'Ex.: Mãe': 'Ej.: Mamá',
  'Celular com DDD': 'Celular con código de área',
  'Combine antes com essas pessoas o que fazer ao receber um pedido de ajuda — por exemplo, ligar para você e, se não atender, ligar para o 190.':
    'Acuerda antes con estas personas qué hacer al recibir un pedido de ayuda — por ejemplo, llamarte y, si no contestas, llamar al 190.',
  // features/exercises/exercises.controller.ts
  'Inspire': 'Inhala',
  'Segure': 'Mantén',
  'Expire': 'Exhala',
  // features/exercises/sections/exercise-gratitude-section.tsx
  'Pelo que você é grata(o) agora?': '¿Por qué estás agradecida(o) ahora?',
  'Escreva algo aqui…': 'Escribe algo aquí…',
  'Guardado com carinho': 'Guardado con cariño',
  'Guardar': 'Guardar',
  // features/exercises/sections/exercise-grounding-section.tsx
  'Encontre com calma:\n5 coisas que você vê\n4 que pode tocar\n3 que ouve\n2 que sente cheiro\n1 que pode saborear':
    'Encuentra con calma:\n5 cosas que ves\n4 que puedes tocar\n3 que oyes\n2 que hueles\n1 que puedes saborear',
  // features/exercises/sections/exercises-list-section.tsx
  'Pequenos gestos que fazem muita diferença': 'Pequeños gestos que hacen mucha diferencia',
  // features/google-auth/use-google-auth.ts
  'Não foi possível entrar com o Google.': 'No se pudo entrar con Google.',
  // features/grupo-chat/sections/grupo-chat-input-section.tsx
  'Digite sua mensagem aqui...': 'Escribe tu mensaje aquí...',
  // features/grupo-chat/sections/grupo-chat-messages-section.tsx
  'Usuário': 'Usuario',
  // features/home/sections/home-actions-section.tsx
  'Começar': 'Empezar',
  'Já possuo uma conta ›': 'Ya tengo una cuenta ›',
  // features/home/sections/home-desktop-auth-section.tsx
  'Criar uma conta': 'Crear una cuenta',
  // features/inicio/sections/inicio-onboarding-section.tsx
  'Passo {value} de {count}': 'Paso {value} de {count}',
  'Avistei uma pessoa — quero reportar': 'Vi a una persona — quiero informarlo',
  'Quero cadastrar uma pessoa desaparecida': 'Quiero registrar a una persona desaparecida',
  // features/inicio/sections/inicio-alerts-section.tsx
  'Nenhuma pessoa próxima.': 'Ninguna persona cercana.',
  'Pessoas desaparecidas. Deslize para o lado para ver mais.':
    'Personas desaparecidas. Desliza hacia un lado para ver más.',
  'Ver todas': 'Ver todas',
  'Ver detalhes de {fullName}': 'Ver detalles de {fullName}',
  // features/inicio/sections/inicio-people-sidebar-section.tsx
  'Pessoas próximas': 'Personas cercanas',
  'Idade: {age}': 'Edad: {age}',
  // features/inicio/sections/inicio-top-bar-section.tsx
  'Chat com a Sofia (IA)': 'Chat con Sofia (IA)',
  'Grupo de apoio': 'Grupo de apoyo',
  'Meu perfil': 'Mi perfil',
  'Configurações': 'Configuración',
  'Entrar': 'Entrar',
  'Nome, bairro ou cidade': 'Nombre, barrio o ciudad',
  'Buscar pessoas': 'Buscar personas',
  'Limpar busca': 'Borrar búsqueda',
  'Buscar': 'Buscar',
  'Ative a localização para ver pessoas próximas.':
    'Activa la ubicación para ver personas cercanas.',
  'Fechar menu': 'Cerrar menú',
  'Menu': 'Menú',
  'Tema do app': 'Tema de la app',
  // features/login/login.controller.ts
  'Não foi possível entrar com a digital. Use e-mail e senha.':
    'No se pudo entrar con la huella. Usa correo y contraseña.',
  'Entrar com a digital': 'Entrar con la huella',
  // features/login/sections/login-form-section.tsx
  'ou': 'o',
  'E-mail / CPF': 'Correo / CPF',
  'exemplo@email.com': 'ejemplo@email.com',
  'Senha': 'Contraseña',
  'Ocultar senha': 'Ocultar contraseña',
  'Mostrar senha': 'Mostrar contraseña',
  'Se cadastrar': 'Registrarse',
  'Usar outra conta': 'Usar otra cuenta',
  // features/perfil/sections/perfil-activity-section.tsx
  'Cadastrar pessoa': 'Registrar persona',
  'Ver casos': 'Ver casos',
  'Falar com a Sofia': 'Hablar con Sofia',
  'Minhas atividades': 'Mis actividades',
  'cadastro aguardando envio': 'registro esperando envío',
  'cadastros aguardando envio': 'registros esperando envío',
  'Em breve você verá aqui os alertas que publicou e os avistamentos que enviou.':
    'Pronto verás aquí las alertas que publicaste y los avistamientos que enviaste.',
  'Revisar e enviar': 'Revisar y enviar',
  'Estes cadastros foram feitos neste aparelho sem conta. Nada é enviado sem a sua revisão: confira os dados, aceite a declaração e o caso passa a ficar ligado à sua conta.':
    'Estos registros se hicieron en este dispositivo sin cuenta. Nada se envía sin tu revisión: revisa los datos, acepta la declaración y el caso pasa a quedar vinculado a tu cuenta.',
  'Cadastro sem nome': 'Registro sin nombre',
  'Toque para revisar e enviar': 'Toca para revisar y enviar',
  'Atalhos': 'Atajos',
  'Para mandar sua localização com um toque.': 'Para enviar tu ubicación con un toque.',
  'Círculo familiar': 'Círculo familiar',
  'Mais': 'Más',
  // features/perfil/sections/perfil-hero-section.tsx
  'Visitante': 'Visitante',
  // features/pessoa-detalhe/case-feedback.ts
  'Caso: {name}': 'Caso: {name}',
  'Identificação do caso: {id}': 'Identificación del caso: {id}',
  'O que precisa mudar (por exemplo: a pessoa foi encontrada, há um dado errado, tenho uma foto mais recente):':
    'Qué hay que cambiar (por ejemplo: la persona fue encontrada, hay un dato incorrecto, tengo una foto más reciente):',
  'Meu vínculo com a pessoa:': 'Mi vínculo con la persona:',
  'Motivo (cadastro falso, golpe ou pedido de dinheiro, exposição indevida, sou a pessoa cadastrada e estou em segurança, outro):':
    'Motivo (registro falso, estafa o pedido de dinero, exposición indebida, soy la persona registrada y estoy a salvo, otro):',
  'Detalhes:': 'Detalles:',
  // features/pessoa-detalhe/person-share.ts
  'roupas: {clothes}': 'ropa: {clothes}',
  'PESSOA DESAPARECIDA: {name}, {age} anos': 'PERSONA DESAPARECIDA: {name}, {age} años',
  'PESSOA DESAPARECIDA: {name}': 'PERSONA DESAPARECIDA: {name}',
  'Conhecida como {nickname}.': 'Conocida como {nickname}.',
  'Vista pela última vez em {place}, em {date}.': 'Vista por última vez en {place}, el {date}.',
  'Vista pela última vez em {place}.': 'Vista por última vez en {place}.',
  'Vista pela última vez em {date}.': 'Vista por última vez el {date}.',
  'Características: {traits}.': 'Características: {traits}.',
  'Se você viu esta pessoa, ligue 190 ou informe pelo app {app}.':
    'Si viste a esta persona, llama al 190 o informa por la app {app}.',
  'Veja o caso: {url}': 'Mira el caso: {url}',
  'Divulgado pelo {app} — {slogan}.': 'Difundido por {app} — {slogan}.',
  // features/pessoa-detalhe/pessoa-detalhe.controller.ts
  'Este cadastro está salvo só neste aparelho. Entre na sua conta para revisar e enviar — depois disso ele pode receber avistamentos.':
    'Este registro está guardado solo en este dispositivo. Entra en tu cuenta para revisarlo y enviarlo — después de eso puede recibir avistamientos.',
  'Este cadastro foi feito neste aparelho e ainda não foi enviado. Revise os dados e confirme para enviá-lo pela sua conta.':
    'Este registro se hizo en este dispositivo y todavía no se envió. Revisa los datos y confirma para enviarlo desde tu cuenta.',
  'Não foi possível abrir o e-mail': 'No se pudo abrir el correo',
  'Escreva para {supportEmail} e informe a identificação do caso: {id}.':
    'Escribe a {supportEmail} e indica la identificación del caso: {id}.',
  'Permita o acesso à localização para usar este recurso.':
    'Permite el acceso a la ubicación para usar esta función.',
  'Localização atual': 'Ubicación actual',
  'Não foi possível obter sua localização.': 'No se pudo obtener tu ubicación.',
  'Não encontramos esse endereço. Tente outro ou use sua localização.':
    'No encontramos esa dirección. Prueba otra o usa tu ubicación.',
  'Local não informado': 'Lugar no informado',
  'Escolha um endereço da lista.': 'Elige una dirección de la lista.',
  'Não foi possível registrar o avistamento. Tente novamente.':
    'No se pudo registrar el avistamiento. Inténtalo de nuevo.',
  'Pessoa desaparecida': 'Persona desaparecida',
  // features/pessoa-detalhe/sections/pessoa-detalhe-feedback-section.tsx
  'Algo errado neste cadastro?': '¿Algo mal en este registro?',
  'Peça a correção se houver dados errados ou se a pessoa já foi encontrada. Denuncie se o cadastro for falso, um golpe ou puder colocar alguém em risco — inclusive se você é a pessoa cadastrada, está em segurança e não quer ser localizada.':
    'Pide la corrección si hay datos incorrectos o si la persona ya fue encontrada. Denuncia si el registro es falso, una estafa o puede poner a alguien en riesgo — incluso si eres la persona registrada, estás a salvo y no quieres ser localizada.',
  'Pedir correção ou atualização': 'Pedir corrección o actualización',
  'Denunciar este cadastro': 'Denunciar este registro',
  // features/pessoa-detalhe/sections/pessoa-detalhe-hero-section.tsx
  '{age} anos': '{age} años',
  // features/pessoa-detalhe/sections/pessoa-detalhe-history-section.tsx
  'Histórico de avistamentos': 'Historial de avistamientos',
  'Não foi possível carregar o histórico.': 'No se pudo cargar el historial.',
  'Ainda não há avistamentos com localização.': 'Todavía no hay avistamientos con ubicación.',
  // features/pessoa-detalhe/sections/pessoa-detalhe-info-section.tsx
  'Último local': 'Último lugar',
  'Visto em': 'Visto el',
  'Etnia': 'Etnia',
  'Divulgar este caso': 'Difundir este caso',
  // features/pessoa-detalhe/sections/pessoa-detalhe-sighting-section.tsx
  'Vi essa pessoa por perto': 'Vi a esta persona cerca',
  'Onde você viu?': '¿Dónde la viste?',
  'Digite para buscar o endereço': 'Escribe para buscar la dirección',
  'Buscando endereços…': 'Buscando direcciones…',
  'Toque no mapa ou arraste o pin para indicar o local.':
    'Toca el mapa o arrastra el pin para indicar el lugar.',
  'Usar minha localização': 'Usar mi ubicación',
  'Registrar avistamento': 'Registrar avistamiento',
  // features/pessoa-detalhe/sections/pessoa-detalhe-thanks-section.tsx
  'Obrigada por ajudar': 'Gracias por ayudar',
  'Cada avistamento pode ser o passo que faltava para encontrar {personName}. Sua ajuda é muito importante — de verdade.':
    'Cada avistamiento puede ser el paso que faltaba para encontrar a {personName}. Tu ayuda es muy importante — de verdad.',
  'Cada avistamento pode ser o passo que faltava para alguém voltar para casa. Sua ajuda é muito importante — de verdade.':
    'Cada avistamiento puede ser el paso que faltaba para que alguien vuelva a casa. Tu ayuda es muy importante — de verdad.',
  'Voltar para o início': 'Volver al inicio',
  // features/pessoas-desaparecidas/pessoas-desaparecidas.controller.ts
  'Todos': 'Todos',
  'Procurado': 'En búsqueda',
  'Encontrado': 'Encontrado',
  'Última vez vista': 'Última vez vista',
  'De onde é': 'De dónde es',
  // features/pessoas-desaparecidas/sections/pessoas-desaparecidas-filters-section.tsx
  'Pesquisar': 'Buscar',
  'Nome ou apelido': 'Nombre o apodo',
  'Faixa de idade': 'Rango de edad',
  'Todas as idades': 'Todas las edades',
  'Crianças e adolescentes': 'Niños y adolescentes',
  'Ocultar filtros': 'Ocultar filtros',
  'Filtros (ativos)': 'Filtros (activos)',
  'Filtros': 'Filtros',
  'Status': 'Situación',
  'Idade mínima': 'Edad mínima',
  'Idade máxima': 'Edad máxima',
  'Endereço considerado': 'Dirección considerada',
  'Belo Horizonte': 'Belo Horizonte',
  'MG': 'MG',
  'Savassi': 'Savassi',
  'Brasil': 'Brasil',
  // features/pessoas-desaparecidas/sections/pessoas-desaparecidas-list-section.tsx
  'Nenhuma pessoa encontrada com esses filtros.':
    'No se encontró ninguna persona con esos filtros.',
  'Idade: {value}': 'Edad: {value}',
  '{count} pessoa': '{count} persona',
  '{count} pessoas': '{count} personas',
  // features/regras/regras-content.ts
  'O Encontra-me existe para ajudar a encontrar pessoas desaparecidas, com prioridade para crianças e mulheres. Para funcionar com segurança, todas as pessoas que usam o app seguem estas regras.':
    'Encontra-me existe para ayudar a encontrar personas desaparecidas, con prioridad para niños y mujeres. Para funcionar con seguridad, todas las personas que usan la app siguen estas reglas.',
  'Regras da comunidade': 'Reglas de la comunidad',
  'Publique só informações verdadeiras e que você conhece.':
    'Publica solo información verdadera y que conoces.',
  'Cadastre uma pessoa apenas se você tem vínculo com ela ou autorização da família. Para crianças e adolescentes, informe o número do boletim de ocorrência.':
    'Registra a una persona solo si tienes vínculo con ella o autorización de la familia. Para niños y adolescentes, indica el número de la denuncia policial.',
  'Não use o app para procurar alguém que se afastou para se proteger, nem para perseguir, vigiar ou expor qualquer pessoa.':
    'No uses la app para buscar a alguien que se alejó para protegerse, ni para perseguir, vigilar o exponer a ninguna persona.',
  'Não publique endereço de casa, escola, rotina ou documentos.':
    'No publiques dirección de casa, escuela, rutina ni documentos.',
  'Em avistamentos, informe só o que você viu. Em perigo, ligue 190.':
    'En los avistamientos, informa solo lo que viste. Si hay peligro, llama al 190.',
  'Não peça nem ofereça dinheiro por informações. Denuncie golpes.':
    'No pidas ni ofrezcas dinero por información. Denuncia las estafas.',
  'Respeite as famílias: nada de ofensas, acusações sem prova, assédio ou discriminação.':
    'Respeta a las familias: nada de insultos, acusaciones sin prueba, acoso ni discriminación.',
  'Viu algo errado ou abusivo? Denuncie o cadastro, a mensagem do grupo ou o aviso de segurança. Dá para bloquear a conta de quem publicou: o conteúdo dela some da sua lista.':
    '¿Viste algo incorrecto o abusivo? Denuncia el registro, el mensaje del grupo o el aviso de seguridad. Se puede bloquear la cuenta de quien publicó: su contenido sale de tu lista.',
  'Responsabilidade': 'Responsabilidad',
  'Cada cadastro, avistamento e mensagem fica ligado à conta de quem publicou.':
    'Cada registro, avistamiento y mensaje queda vinculado a la cuenta de quien lo publicó.',
  'Cadastros feitos sem conta ficam só neste aparelho. Eles só são enviados depois que alguém entra na conta, revisa os dados e confirma a declaração — e passam a ficar ligados a essa conta.':
    'Los registros hechos sin cuenta quedan solo en este dispositivo. Solo se envían después de que alguien entra en la cuenta, revisa los datos y confirma la declaración — y pasan a quedar vinculados a esa cuenta.',
  'Conteúdo falso, golpe, assédio ou uso malicioso pode ser removido e levar ao bloqueio da conta.':
    'El contenido falso, las estafas, el acoso o el uso malicioso pueden eliminarse y llevar al bloqueo de la cuenta.',
  'Quem publica informações falsas pode responder civil e criminalmente.':
    'Quien publica información falsa puede responder civil y penalmente.',
  'Os dados de identificação podem ser entregues às autoridades quando houver ordem judicial ou outra obrigação legal. Por isso, o uso do app não é anônimo.':
    'Los datos de identificación pueden entregarse a las autoridades cuando haya una orden judicial u otra obligación legal. Por eso, el uso de la app no es anónimo.',
  'Seus dados (resumo)': 'Tus datos (resumen)',
  'Conta: nome, CPF, e-mail, celular e CEP — para identificar quem usa o app e apurar abusos.':
    'Cuenta: nombre, CPF, correo, celular y CEP — para identificar a quien usa la app e investigar abusos.',
  'Seu CPF não aparece para outras pessoas no app.':
    'Tu CPF no aparece para otras personas en la app.',
  'Cadastros de pessoas: foto e características, para ajudar na busca.':
    'Registros de personas: foto y características, para ayudar en la búsqueda.',
  'Localização: usada só com o app aberto, para mostrar casos próximos, marcar avistamentos e, quando você pede, mandar sua localização a um contato.':
    'Ubicación: se usa solo con la app abierta, para mostrar casos cercanos, marcar avistamientos y, cuando lo pides, enviar tu ubicación a un contacto.',
  'Contatos de confiança: ficam salvos só neste aparelho e não vão para o servidor.':
    'Contactos de confianza: quedan guardados solo en este dispositivo y no van al servidor.',
  'Digital ou rosto: conferidos pelo próprio celular. O app não recebe sua biometria.':
    'Huella o rostro: los verifica el propio celular. La app no recibe tu biometría.',
  'Você pode pedir acesso, correção ou exclusão dos seus dados (LGPD) pela Central de Ajuda.':
    'Puedes pedir acceso, corrección o eliminación de tus datos (LGPD) en el Centro de Ayuda.',
  'A Política de Privacidade completa está publicada. Os Termos de Uso completos ainda estão em revisão jurídica.':
    'La Política de Privacidad completa está publicada. Los Términos de Uso completos siguen en revisión jurídica.',
  'Ler a política de privacidade': 'Leer la política de privacidad',
  // features/regras/sections/regras-content-section.tsx
  'Dúvidas sobre seus dados': 'Dudas sobre tus datos',
  // features/signup-password/sections/signup-password-form-section.tsx
  'Pelo menos 8 caracteres, com letras e números. Não use a mesma senha de outros sites.':
    'Al menos 8 caracteres, con letras y números. No uses la misma contraseña de otros sitios.',
  'Confirmar senha': 'Confirmar contraseña',
  // features/signup/sections/signup-form-section.tsx
  'CPF': 'CPF',
  'E-mail': 'Correo electrónico',
  'CEP': 'CEP (código postal)',
  'Li e aceito as regras de uso e a forma como meus dados são usados':
    'Leí y acepto las reglas de uso y la forma en que se usan mis datos',
  'Li e aceito as': 'Leí y acepto las',
  'regras de uso e privacidade': 'reglas de uso y privacidad',
  '. Sei que meus dados identificam minha conta e podem ser usados para apurar abusos.':
    '. Sé que mis datos identifican mi cuenta y pueden usarse para investigar abusos.',
  'Criar conta': 'Crear cuenta',
  'Próximo': 'Siguiente',
  // features/signup/sections/signup-google-controls.tsx
  'ou preencha os dados': 'o completa los datos',
  // features/signup/signup.controller.ts
  'A sessão do Google expirou. Toque em Continuar com Google novamente.':
    'La sesión de Google expiró. Toca Continuar con Google de nuevo.',
  'Não foi possível concluir o cadastro.': 'No se pudo completar el registro.',
  // features/sobre/sections/sobre-info-section.tsx
  'Logo do {name}': 'Logo de {name}',
  'Aplicativo': 'Aplicación',
  'Versão': 'Versión',
  'Empresa responsável': 'Empresa responsable',
  'Contato': 'Contacto',
  'Site da Nexora Prism': 'Sitio de Nexora Prism',
  'Documentos': 'Documentos',
  'A política de privacidade está publicada. Os termos de uso completos ainda estão em revisão jurídica.':
    'La política de privacidad está publicada. Los términos de uso completos siguen en revisión jurídica.',
  'Texto completo, publicado no site.': 'Texto completo, publicado en el sitio.',
  'Resumo das regras da comunidade e do uso dos seus dados.':
    'Resumen de las reglas de la comunidad y del uso de tus datos.',
  'Termos de uso': 'Términos de uso',
  'Política de privacidade': 'Política de privacidad',
  // features/sobre/sobre.controller.ts
  'Escreva para {email}.': 'Escribe a {email}.',
  'Acesse {site}.': 'Visita {site}.',
  // features/sofia-perfil/sections/sofia-perfil-hero-section.tsx
  'IA de apoio emocional do Encontra-me': 'IA de apoyo emocional de Encontra-me',
  'Conversar': 'Conversar',
  'Exercícios': 'Ejercicios',
  'Personalizar cores': 'Personalizar colores',
  'Cores': 'Colores',
  'Sobre': 'Sobre',
  'Sofia é uma inteligência artificial criada para conversar e oferecer apoio. Ela não é psicóloga, terapeuta ou médica e não substitui atendimento humano profissional. Não realiza diagnósticos, tratamentos ou atendimento de emergência.':
    'Sofia es una inteligencia artificial creada para conversar y ofrecer apoyo. No es psicóloga, terapeuta ni médica y no reemplaza la atención humana profesional. No realiza diagnósticos, tratamientos ni atención de emergencia.',
  'Em emergência no Brasil': 'En una emergencia en Brasil',
  // features/sofia-theme/sections/sofia-theme-picker-section.tsx
  'Aparência': 'Apariencia',
  'Tema claro': 'Tema claro',
  'Claro': 'Claro',
  'Tema escuro': 'Tema oscuro',
  'Escuro': 'Oscuro',
  'Cor da Sofia': 'Color de Sofia',
  // features/sofia-welcome/sections/sofia-welcome-hero-section.tsx
  'Espaço seguro • 100% confidencial': 'Espacio seguro • 100% confidencial',
  'Oi, eu sou a Sofia': 'Hola, soy Sofia',
  'Uma IA de apoio emocional, pronta para te escutar sem pressa e sem julgamento. Não substitui um profissional.':
    'Una IA de apoyo emocional, lista para escucharte sin prisa y sin juicios. No reemplaza a un profesional.',
  // lib/api-error-modal.tsx
  'Algo deu errado': 'Algo salió mal',
  'Entendi': 'Entendido',
  // lib/api-errors.ts
  'A requisição demorou demais. Tente novamente.':
    'La solicitud tardó demasiado. Inténtalo de nuevo.',
  'Não foi possível conectar. Verifique sua internet.':
    'No se pudo conectar. Verifica tu conexión a internet.',
  // lib/app-info.ts
  'Mobilização social para encontrar pessoas desaparecidas, com prioridade para a proteção de crianças e mulheres — e aberta a toda a sociedade.':
    'Movilización social para encontrar personas desaparecidas, con prioridad para la protección de niños y mujeres — y abierta a toda la sociedad.',
  // lib/biometric.ts
  'Entrar com Face ID?': '¿Entrar con Face ID?',
  'Quer entrar com a Face ID deste celular da próxima vez?':
    '¿Quieres entrar con el Face ID de este celular la próxima vez?',
  'Usar Face ID': 'Usar Face ID',
  'Confirme com a Face ID para ativar o login rápido.':
    'Confirma con Face ID para activar el inicio de sesión rápido.',
  'Entrar com Face ID': 'Entrar con Face ID',
  'Use a Face ID para entrar': 'Usa Face ID para entrar',
  'Entrar com a digital?': '¿Entrar con la huella?',
  'Quer entrar com a digital deste celular da próxima vez?':
    '¿Quieres entrar con la huella de este celular la próxima vez?',
  'Usar digital': 'Usar huella',
  'Confirme com a digital para ativar o login rápido.':
    'Confirma con la huella para activar el inicio de sesión rápido.',
  'Use a digital para entrar': 'Usa la huella para entrar',
  'Entrar com biometria?': '¿Entrar con biometría?',
  'Quer entrar com a biometria deste celular da próxima vez?':
    '¿Quieres entrar con la biometría de este celular la próxima vez?',
  'Usar biometria': 'Usar biometría',
  'Confirme a biometria para ativar o login rápido.':
    'Confirma la biometría para activar el inicio de sesión rápido.',
  'Use a biometria para entrar': 'Usa la biometría para entrar',
  // lib/brand-theme.tsx
  'Automático': 'Automático',
  // lib/dialog.ts
  'Confirmar': 'Confirmar',
  // lib/emergency-shortcut.ts
  'Encontra-me: pedir ajuda': 'Encontra-me: pedir ayuda',
  'Atalho desativado. Para usar de novo, ative em Configurações no Encontra-me.':
    'Atajo desactivado. Para usarlo de nuevo, actívalo en Configuración de Encontra-me.',
  // lib/error-messages.ts
  'Campo obrigatório.': 'Campo obligatorio.',
  'Formato inválido.': 'Formato no válido.',
  'Muito curto.': 'Demasiado corto.',
  'Valor fora do permitido.': 'Valor fuera de lo permitido.',
  'Já cadastrado.': 'Ya registrado.',
  'Imagem inválida.': 'Imagen no válida.',
  'Imagem vazia.': 'Imagen vacía.',
  'A imagem deve ter no máximo 2 MB.': 'La imagen debe tener como máximo 2 MB.',
  'CPF inválido.': 'CPF no válido.',
  'Este CPF já está cadastrado.': 'Este CPF ya está registrado.',
  'Informe um e-mail válido.': 'Ingresa un correo válido.',
  'Este e-mail já está cadastrado.': 'Este correo ya está registrado.',
  'Informe DDD e número, como (31) 99999-9999.':
    'Ingresa el código de área y el número, como (31) 99999-9999.',
  'O CEP deve ter 8 dígitos.': 'El CEP debe tener 8 dígitos.',
  'Informe o nome completo.': 'Ingresa el nombre completo.',
  'A senha deve ter ao menos 8 caracteres.': 'La contraseña debe tener al menos 8 caracteres.',
  'Use letras e números na senha.': 'Usa letras y números en la contraseña.',
  'A confirmação não corresponde à senha.': 'La confirmación no coincide con la contraseña.',
  'Idade inválida.': 'Edad no válida.',
  'Informe a idade (pode ser aproximada).': 'Ingresa la edad (puede ser aproximada).',
  'Use o formato dd/mm/aaaa, com uma data que já passou.':
    'Usa el formato dd/mm/aaaa, con una fecha que ya pasó.',
  'Para criar a conta, aceite as regras de uso.': 'Para crear la cuenta, acepta las reglas de uso.',
  'Informe seu vínculo com a pessoa.': 'Indica tu vínculo con la persona.',
  'Para crianças e adolescentes, informe o número do boletim de ocorrência.':
    'Para niños y adolescentes, indica el número de la denuncia policial.',
  'Confira o número do boletim de ocorrência.': 'Revisa el número de la denuncia policial.',
  'Confirme a declaração para continuar.': 'Confirma la declaración para continuar.',
  'Este número já está na sua lista.': 'Este número ya está en tu lista.',
  'Informe o nome do contato.': 'Ingresa el nombre del contacto.',
  'Altura inválida.': 'Altura no válida.',
  'Informe o endereço ou use sua localização.': 'Ingresa la dirección o usa tu ubicación.',
  'Informe onde a pessoa foi vista pela última vez.':
    'Indica dónde fue vista la persona por última vez.',
  'O raio deve ser de até 200 km.': 'El radio debe ser de hasta 200 km.',
  'Campo inválido.': 'Campo no válido.',
  'Verifique os campos destacados.': 'Revisa los campos destacados.',
  'Estes dados já estão cadastrados.': 'Estos datos ya están registrados.',
  'E-mail/CPF ou senha inválidos.': 'Correo/CPF o contraseña no válidos.',
  'Não autorizado.': 'No autorizado.',
  'Registro não encontrado.': 'Registro no encontrado.',
  'A Sofia está indisponível no momento. Tente novamente em instantes.':
    'Sofia no está disponible en este momento. Inténtalo de nuevo en unos instantes.',
  'Não foi possível concluir. Tente novamente.': 'No se pudo completar. Inténtalo de nuevo.',
  // lib/location-share.ts
  'precisão de cerca de {meters} m': 'precisión de unos {meters} m',
  'PRECISO DE AJUDA.': 'NECESITO AYUDA.',
  'às {time}': 'a las {time}',
  'Minha localização agora: {link} ({details}).': 'Mi ubicación ahora: {link} ({details}).',
  'Não consegui pegar minha localização pelo GPS.': 'No pude obtener mi ubicación por GPS.',
  'Se não conseguir falar comigo, ligue 190.': 'Si no logras hablar conmigo, llama al 190.',
  'Enviado pelo app Encontra-me.': 'Enviado desde la app Encontra-me.',
  // lib/person-status.ts
  'Cadastro pendente': 'Registro pendiente',
  'Pendente': 'Pendiente',
  'Procurando': 'Buscando',
  'Cancelado': 'Cancelado',
  // lib/share.ts
  'Copie o texto para enviar': 'Copia el texto para enviarlo',
  // lib/support.ts
  'Dúvida sobre o app': 'Duda sobre la app',
  'Cadastro, login ou senha': 'Registro, inicio de sesión o contraseña',
  'Corrigir ou atualizar um caso': 'Corregir o actualizar un caso',
  'Privacidade e meus dados': 'Privacidad y mis datos',
  'Excluir minha conta': 'Eliminar mi cuenta',
  // lib/use-photo-picker.ts
  'A foto deve ter no máximo {maxMb} MB.': 'La foto debe tener como máximo {maxMb} MB.',
  // pages/alerta-emergencia/index.tsx
  'Alerta cancelado': 'Alerta cancelada',
  'Nada foi enviado e o telefone não foi aberto.': 'No se envió nada y el teléfono no se abrió.',
  'Acionar de novo': 'Activar de nuevo',
  // pages/chat/index.tsx
  'Apagar toda a conversa?': '¿Borrar toda la conversación?',
  // pages/compartilhar-localizacao/index.tsx
  'Compartilhar localização': 'Compartir ubicación',
  'Mande onde você está agora para alguém de confiança — por exemplo, ao voltar para casa sozinha ou ao sair com alguém que acabou de conhecer.':
    'Envía dónde estás ahora a alguien de confianza — por ejemplo, al volver sola a casa o al salir con alguien que acabas de conocer.',
  // pages/pessoa/[id]/index.tsx
  'Este cadastro não está mais neste aparelho: ele pode ter sido enviado ou apagado.':
    'Este registro ya no está en este dispositivo: puede haberse enviado o borrado.',
  'Não encontramos essa pessoa.': 'No encontramos a esta persona.',
  // pages/sobre/index.tsx
  'Sobre o app': 'Sobre la app',
  // pages/sofia-theme/index.tsx
  'Personalizar Sofia': 'Personalizar Sofia',
  'Começar a conversar': 'Empezar a conversar',
  // services/emergency/emergency.types.ts
  'O servidor não confirmou o recebimento do alerta.':
    'El servidor no confirmó la recepción de la alerta.',
  // features/ajuda/help-content.ts — rotas e círculo familiar
  'O monitoramento ampliado de trajetos é um recurso futuro e ainda não está disponível. Quando for lançado, só funcionará com sua permissão e terminará assim que você chegar ao destino. Mandar sua localização atual para um contato já funciona e é grátis.':
    'El monitoreo ampliado de trayectos es una función futura y todavía no está disponible. Cuando se lance, solo funcionará con tu permiso y terminará en cuanto llegues a tu destino. Enviar tu ubicación actual a un contacto ya funciona y es gratis.',
  'É um recurso futuro para compartilhar sua segurança com pessoas de confiança, sempre com convite e aceite de cada uma. Ele ainda não está disponível e nunca permitirá acompanhar alguém sem que essa pessoa saiba e concorde.':
    'Es una función futura para compartir tu seguridad con personas de confianza, siempre con invitación y aceptación de cada una. Todavía no está disponible y nunca permitirá seguir a alguien sin que esa persona lo sepa y esté de acuerdo.',
  // Rodada 3 — Início novo, passo a passo e filtros por idade
  'Na tela Início, permita o acesso à localização. As fotos de "Alertas recentes" e o mapa mostram casos próximos. Arraste o mapa para baixo para abrir a lista e role para ver mais. Os botões ao lado de "Alertas recentes" trocam entre foto, com o nome embaixo, e cartão. Os botões no alto do mapa filtram por idade: a borda usa a cor do tema e o botão escolhido fica preenchido. O botão de satélite troca a imagem do mapa. Para buscar por nome ou ver a lista completa, toque na lupa no alto da tela ou em "Ver todos": lá dá para filtrar por cidade, estado, bairro, idade e situação. No celular, o botão Filtros fica acima dos atalhos de idade. Na lista, os botões ao lado do total trocam entre os cartões horizontais e fotos quadradas só com o nome embaixo. O número abaixo dos filtros é o total dessa busca.':
    'En la pantalla Inicio, permite el acceso a la ubicación. Las fotos de "Alertas recientes" y el mapa muestran casos cercanos. Arrastra el mapa hacia abajo para abrir la lista y desplázate para ver más. Los botones junto a "Alertas recientes" cambian entre foto, con el nombre debajo, y tarjeta. Los botones en la parte superior del mapa filtran por edad: el borde usa el color del tema y el botón elegido se rellena. El botón de satélite cambia la imagen del mapa. Para buscar por nombre o ver la lista completa, toca la lupa en la parte superior de la pantalla o "Ver todos": allí puedes filtrar por ciudad, estado, barrio, edad y situación. En el celular, el botón Filtros queda arriba de los atajos de edad. En la lista, los botones junto al total cambian entre las tarjetas horizontales y fotos cuadradas solo con el nombre debajo. El número bajo los filtros es el total de esa búsqueda.',
  'mapa lista perto localização filtro satélite crianças idosos':
    'mapa lista cerca ubicación filtro satélite niños mayores',
  'Como vejo o passo a passo do app de novo?': '¿Cómo veo de nuevo el paso a paso de la app?',
  'Abra o Menu e toque em "Como usar o app". Também dá em Configurações > Aparência e acessibilidade > "Ver o passo a passo de novo". Em qualquer passo, "Pular" fecha o passo a passo.':
    'Abre el Menú y toca "Cómo usar la app". También puedes ir a Configuración > Apariencia y accesibilidad > "Ver el paso a paso de nuevo". En cualquier paso, "Saltar" cierra el paso a paso.',
  'tutorial apresentação onboarding passo a passo como usar ajuda':
    'tutorial presentación onboarding paso a paso cómo usar ayuda',
  'Passo a passo reativado': 'Paso a paso reactivado',
  'Ele vai aparecer quando você voltar ao Início.': 'Aparecerá cuando vuelvas al Inicio.',
  'Ver o passo a passo de novo': 'Ver el paso a paso de nuevo',
  'Alertas recentes': 'Alertas recientes',
  'Ver todas as pessoas desaparecidas': 'Ver todas las personas desaparecidas',
  'Ver todos': 'Ver todos',
  'Nenhum alerta nesta faixa de idade por aqui.': 'No hay alertas de este grupo de edad por aquí.',
  'Ver só as fotos': 'Ver solo las fotos',
  'Ver cartões com detalhes': 'Ver tarjetas con detalles',
  'Ver mais pessoas': 'Ver más personas',
  'Voltar à fileira': 'Volver a la fila',
  'Arraste o mapa para baixo para ver mais pessoas. Arraste para cima para voltar à fileira.':
    'Arrastra el mapa hacia abajo para ver más personas. Arrastra hacia arriba para volver a la fila.',
  'Como usar o app': 'Cómo usar la app',
  'Ver mapa comum': 'Ver mapa común',
  'Ver imagem de satélite': 'Ver imagen de satélite',
  'Nenhuma pessoa no mapa por aqui.': 'No hay personas en el mapa por aquí.',
  'Nenhuma pessoa desta faixa de idade no mapa.':
    'No hay personas de este grupo de edad en el mapa.',
  'Filtrar por faixa de idade': 'Filtrar por grupo de edad',
  'Pessoas': 'Personas',
  'Apoio': 'Apoyo',
  'Sua conta': 'Tu cuenta',
  'Pular': 'Saltar',
  'Fecha o passo a passo. Você pode ver de novo pelo Menu, em "Como usar o app".':
    'Cierra el paso a paso. Puedes verlo de nuevo en el Menú, en "Cómo usar la app".',
  'Começar a usar': 'Empezar a usar',
  'Começar o passo a passo': 'Empezar el paso a paso',
  'Crianças': 'Niños',
  'Idosos': 'Mayores',
  'Oi! Eu sou a Sofia.': '¡Hola! Soy Sofia.',
  'Vou te mostrar, em poucos passos, como usar o Encontra-me. Se já conhece, toque em "Pular".':
    'En pocos pasos te muestro cómo usar Encontra-me. Si ya la conoces, toca "Saltar".',
  'Veja quem está desaparecido perto de você': 'Mira quién está desaparecido cerca de ti',
  'No alto da tela ficam as pessoas procuradas perto de você. Os dois botões ao lado do título trocam entre foto, com o nome embaixo, e cartão. Arraste o mapa para baixo para ver a lista e role para carregar mais. Toque para abrir o caso.':
    'En la parte superior de la pantalla están las personas buscadas cerca de ti. Los dos botones junto al título cambian entre foto, con el nombre debajo, y tarjeta. Arrastra el mapa hacia abajo para ver la lista y desplázate para cargar más. Toca para abrir el caso.',
  'Use o mapa': 'Usa el mapa',
  'Viu alguém? Avise.': '¿Viste a alguien? Avisa.',
  'Na página da pessoa, toque em "Vi essa pessoa por perto" e marque onde você viu. Isso ajuda a família.':
    'En la página de la persona, toca "Vi a esta persona cerca" y marca dónde la viste. Eso ayuda a la familia.',
  'Em perigo? Botão vermelho.': '¿En peligro? Botón rojo.',
  'O botão vermelho "Pedir ajuda" fica sempre à vista. No celular, no meio da barra de baixo; no computador, no alto da tela. Ele mostra os números de emergência, como o 190. O app não chama a polícia sozinho.':
    'El botón rojo "Pedir ayuda" está siempre a la vista. En el celular, en el centro de la barra de abajo; en la computadora, arriba de la pantalla. Muestra los números de emergencia, como el 190. La app no llama a la policía por sí sola.',
  'Cadastrar e Menu': 'Registrar y Menú',
  'Para comunicar um desaparecimento, toque em "Cadastrar". No computador, use o botão laranja "Cadastrar pessoa" embaixo do mapa. No "Menu" ficam a Sofia, o seu perfil, as configurações e a ajuda.':
    'Para comunicar una desaparición, toca "Registrar". En la computadora, usa el botón naranja "Registrar persona" debajo del mapa. En el "Menú" están Sofia, tu perfil, la configuración y la ayuda.',
  'Pronto! Como você quer começar?': '¡Listo! ¿Cómo quieres empezar?',
  'Para ver este passo a passo de novo, abra o Menu e toque em "Como usar o app".':
    'Para ver este paso a paso de nuevo, abre el Menú y toca "Cómo usar la app".',
  'Adultos': 'Adultos',
  'Adolescente': 'Adolescente',
  'Criança': 'Niño/a',
  'Pessoa idosa': 'Persona mayor',
  'Adulto': 'Adulto',
  // Rodada 4 — Avisos de segurança no mapa e cartão flutuante
  'Posso avisar sobre uma rua perigosa?': '¿Puedo avisar sobre una calle peligrosa?',
  'O mapa do Início mostra losangos amarelos com avisos da comunidade, como "assaltos frequentes" ou "rua deserta à noite". Toque num aviso para ver o horário e a referência do lugar e marcar "Continua assim" ou "Não está mais assim". Para avisar, entre na sua conta e toque em "Adicionar aviso". Fale do lugar, nunca de pessoas: sem nomes, placas ou telefones. O aviso some em 30 dias se ninguém confirmar. São relatos da comunidade, não verificados, e não substituem a polícia: em perigo, use "Pedir ajuda".':
    'El mapa de Inicio muestra rombos amarillos con avisos de la comunidad, como "robos frecuentes" o "calle desierta de noche". Toca un aviso para ver el horario y la referencia del lugar y marcar "Sigue así" o "Ya no está así". Para avisar, inicia sesión y toca "Agregar aviso". Habla del lugar, nunca de personas: sin nombres, matrículas ni teléfonos. El aviso desaparece en 30 días si nadie lo confirma. Son relatos de la comunidad, no verificados, y no reemplazan a la policía: en peligro, usa "Pedir ayuda".',
  'aviso rua perigosa assalto deserta escura iluminação horário segurança comunidade mapa':
    'aviso calle peligrosa robo desierta oscura iluminación horario seguridad comunidad mapa',
  'Localização indisponível': 'Ubicación no disponible',
  'Permita o acesso à localização ou toque no mapa para marcar o lugar.':
    'Permite el acceso a la ubicación o toca el mapa para marcar el lugar.',
  'Não coloque telefone, CPF, e-mail ou perfil. Fale do lugar, não de pessoas.':
    'No pongas teléfono, CPF, correo ni perfil. Habla del lugar, no de personas.',
  'Marque o local no mapa.': 'Marca el lugar en el mapa.',
  'Escolha o tipo de aviso.': 'Elige el tipo de aviso.',
  'Escreva uma referência do local (rua, praça ou ponto conhecido).':
    'Escribe una referencia del lugar (calle, plaza o punto conocido).',
  'Confirme a declaração para publicar.': 'Confirma la declaración para publicar.',
  'Aviso publicado': 'Aviso publicado',
  'Ele aparece no mapa para quem estiver por perto e fica {days} dias, ou mais se outras pessoas confirmarem.':
    'Aparece en el mapa para quien esté cerca y se queda {days} días, o más si otras personas lo confirman.',
  'Não foi possível publicar': 'No se pudo publicar',
  'Tente de novo em instantes.': 'Inténtalo de nuevo en un momento.',
  'Local do aviso': 'Lugar del aviso',
  'Ajude quem passa por aqui': 'Ayuda a quien pasa por aquí',
  'Avise sobre um lugar, não sobre pessoas. É um relato da comunidade e não substitui a polícia: em perigo, use "Pedir ajuda".':
    'Avisa sobre un lugar, no sobre personas. Es un relato de la comunidad y no reemplaza a la policía: en peligro, usa "Pedir ayuda".',
  'Onde?': '¿Dónde?',
  'Toque no mapa ou arraste o marcador para ajustar.':
    'Toca el mapa o arrastra el marcador para ajustar.',
  'Toque no mapa para marcar o lugar.': 'Toca el mapa para marcar el lugar.',
  'O que acontece neste lugar?': '¿Qué pasa en este lugar?',
  'Em que horário?': '¿En qué horario?',
  'Referência do local': 'Referencia del lugar',
  'Rua, praça ou ponto conhecido': 'Calle, plaza o punto conocido',
  'Ex.: Rua das Flores, perto da praça': 'Ej.: Rua das Flores, cerca de la plaza',
  'Observação (opcional)': 'Observación (opcional)',
  'Ex.: Prefira a avenida depois das 20h.': 'Ej.: Prefiere la avenida después de las 20 h.',
  'Antes de publicar': 'Antes de publicar',
  'Fale do lugar, não de pessoas: sem nomes, placas, telefones ou aparência de ninguém.':
    'Habla del lugar, no de personas: sin nombres, matrículas, teléfonos ni apariencia de nadie.',
  'Seu nome não aparece no mapa, mas o aviso fica ligado à sua conta. Não é anônimo.':
    'Tu nombre no aparece en el mapa, pero el aviso queda vinculado a tu cuenta. No es anónimo.',
  'O aviso some em {days} dias se ninguém confirmar. Quem passar por lá pode marcar "Não está mais assim".':
    'El aviso desaparece en {days} días si nadie lo confirma. Quien pase por allí puede marcar "Ya no está así".',
  'Avisos falsos, ofensivos ou preconceituosos violam as regras de uso e podem ser removidos.':
    'Los avisos falsos, ofensivos o con prejuicios violan las reglas de uso y pueden ser eliminados.',
  'Ler as regras de uso': 'Leer las reglas de uso',
  'Declaro que este aviso é verdadeiro, fala só do lugar e não cita pessoas.':
    'Declaro que este aviso es verdadero, habla solo del lugar y no menciona a personas.',
  'Publicar aviso': 'Publicar aviso',
  'Para confirmar ou atualizar um aviso, entre na sua conta. Assim cada pessoa vota uma vez.':
    'Para confirmar o actualizar un aviso, inicia sesión. Así cada persona vota una vez.',
  'Ver detalhes': 'Ver detalles',
  'Na página da pessoa você pode avisar que a viu por perto.':
    'En la página de la persona puedes avisar que la viste cerca.',
  'Aviso da comunidade': 'Aviso de la comunidad',
  '{count} confirmação': '{count} confirmación',
  '{count} confirmações': '{count} confirmaciones',
  'Continua assim': 'Sigue así',
  'Não está mais assim': 'Ya no está así',
  'Relato da comunidade, não verificado. Em perigo, use "Pedir ajuda".':
    'Relato de la comunidad, no verificado. En peligro, usa "Pedir ayuda".',
  'Denunciar este aviso': 'Denunciar este aviso',
  'Denunciar': 'Denunciar',
  'Esconder avisos de segurança': 'Ocultar avisos de seguridad',
  'Mostrar avisos de segurança': 'Mostrar avisos de seguridad',
  'Adicionar aviso de segurança': 'Agregar aviso de seguridad',
  'Avise sobre uma rua ou lugar perigoso': 'Avisa sobre una calle o lugar peligroso',
  'Adicionar aviso': 'Agregar aviso',
  'Avisar sobre um lugar perigoso': 'Avisar sobre un lugar peligroso',
  'Cada foto no mapa é uma pessoa procurada: toque nela para ver um resumo. Os botões no alto filtram por idade. A borda usa a cor do tema e o botão escolhido fica preenchido.':
    'Cada foto en el mapa es una persona buscada: tócala para ver un resumen. Los botones de arriba filtran por edad. El borde usa el color del tema y el botón elegido se rellena.',
  'Avisos de segurança': 'Avisos de seguridad',
  'Os losangos amarelos são avisos da comunidade, como "rua deserta à noite". Toque para ver e confirmar. Para avisar sobre um lugar, use "Adicionar aviso".':
    'Los rombos amarillos son avisos de la comunidad, como "calle desierta de noche". Tócalos para ver y confirmar. Para avisar sobre un lugar, usa "Agregar aviso".',
  'Atenção redobrada': 'Atención redoblada',
  'Lugar arriscado: fique atento ao passar.': 'Lugar riesgoso: mantente atento al pasar.',
  'Assaltos frequentes': 'Robos frecuentes',
  'Relatos repetidos de roubo ou furto.': 'Relatos repetidos de robo o hurto.',
  'Rua deserta': 'Calle desierta',
  'Pouco movimento e pouca gente por perto.': 'Poco movimiento y poca gente cerca.',
  'Iluminação ruim': 'Mala iluminación',
  'Rua escura ou postes apagados.': 'Calle oscura o postes apagados.',
  'Evite neste horário': 'Evita en este horario',
  'Tranquilo em parte do dia, arriscado em outra.': 'Tranquilo en parte del día, riesgoso en otra.',
  'Outro cuidado': 'Otro cuidado',
  'Outro motivo para redobrar a atenção.': 'Otro motivo para redoblar la atención.',
  'Qualquer horário': 'Cualquier horario',
  'Madrugada': 'Madrugada',
  'Manhã': 'Mañana',
  'Tarde': 'Tarde',
  'Noite': 'Noche',
  'Publicado hoje': 'Publicado hoy',
  'Publicado ontem': 'Publicado ayer',
  'Publicado há {count} dias': 'Publicado hace {count} días',
  'Aviso de segurança: {reference}': 'Aviso de seguridad: {reference}',
  'Identificação do aviso: {id}': 'Identificación del aviso: {id}',
  'Motivo (aviso falso, ofensivo, preconceituoso, cita pessoas, já não é verdade, outro):':
    'Motivo (aviso falso, ofensivo, con prejuicios, menciona a personas, ya no es verdad, otro):',
  'Novo aviso de segurança': 'Nuevo aviso de seguridad',
  '{name}: voltar ao início': '{name}: volver al inicio',
  // evolução · relato de avistamento ("Eu vi essa pessoa") e "Meus relatos"
  'Situação: {status}': 'Situación: {status}',
  'O que acontece depois que envio um relato de avistamento?':
    '¿Qué pasa después de enviar un reporte de avistamiento?',
  'O relato recebe um número e a situação "Recebido". Ele não é publicado: a equipe analisa antes de qualquer mudança no caso, e a situação pode passar para "Aguardando análise", "Em análise", "Considerado relevante", "Não confirmado" ou "Encerrado". A foto, se você anexar, vai só para a análise. Acompanhe tudo em Perfil › Meus relatos. Se o envio não for confirmado, a tela avisa e você pode tentar de novo.':
    'El reporte recibe un número y la situación "Recibido". No se publica: el equipo lo analiza antes de cualquier cambio en el caso, y la situación puede pasar a "Esperando análisis", "En análisis", "Considerado relevante", "No confirmado" o "Cerrado". Si adjuntas una foto, va solo al análisis. Sigue todo en Perfil › Mis reportes. Si el envío no se confirma, la pantalla te avisa y puedes intentarlo de nuevo.',
  'relato número situação análise meus relatos foto':
    'reporte número situación análisis mis reportes foto',
  'Este recurso ainda não está disponível no seu aplicativo.':
    'Esta función aún no está disponible en tu aplicación.',
  'Entre na sua conta para ver os relatos que você enviou.':
    'Entra en tu cuenta para ver los reportes que enviaste.',
  'Não foi possível carregar seus relatos.': 'No se pudieron cargar tus reportes.',
  'Tentar de novo': 'Intentar de nuevo',
  'Você ainda não enviou relatos': 'Aún no has enviado reportes',
  'Quando você informar que viu alguém, o relato aparece aqui com a situação da análise.':
    'Cuando informes que viste a alguien, el reporte aparece aquí con la situación del análisis.',
  'Caso nº {id}': 'Caso n.º {id}',
  'Abre a página do caso': 'Abre la página del caso',
  'Visto em {date}': 'Visto el {date}',
  'Relato nº {id} · enviado em {date}': 'Reporte n.º {id} · enviado el {date}',
  'com foto': 'con foto',
  'A situação muda conforme a análise da equipe. "Considerado relevante" não quer dizer que a pessoa foi encontrada.':
    'La situación cambia según el análisis del equipo. "Considerado relevante" no quiere decir que la persona haya sido encontrada.',
  'Meus relatos': 'Mis reportes',
  'Os avistamentos que você enviou ficam em "Meus relatos". Em breve você verá aqui também os alertas que publicou.':
    'Los avistamientos que enviaste están en "Mis reportes". Pronto también verás aquí las alertas que publicaste.',
  'Você enviou vários relatos sobre este caso há pouco. Para evitar repetições, espere {minutes} min para enviar outro.':
    'Enviaste varios reportes sobre este caso hace poco. Para evitar repeticiones, espera {minutes} min para enviar otro.',
  'O envio não foi confirmado: seu relato pode não ter chegado. Tente de novo em alguns instantes. Se a pessoa estiver em perigo agora, ligue 190.':
    'El envío no se confirmó: es posible que tu reporte no haya llegado. Inténtalo de nuevo en unos instantes. Si la persona está en peligro ahora, llama al 190.',
  'Confira os campos destacados.': 'Revisa los campos destacados.',
  'Relato de avistamento': 'Reporte de avistamiento',
  'Caso: {name} · nº {id}': 'Caso: {name} · n.º {id}',
  'Se a pessoa parece estar em perigo agora, ligue 190 antes de preencher. Não aborde nem siga a pessoa.':
    'Si la persona parece estar en peligro ahora, llama al 190 antes de completar esto. No te acerques ni sigas a la persona.',
  'Ponto de referência': 'Punto de referencia',
  'Ex.: em frente à farmácia': 'Ej.: frente a la farmacia',
  'Data': 'Fecha',
  'Horário': 'Hora',
  'hh:mm': 'hh:mm',
  'O horário é aproximado': 'La hora es aproximada',
  'O que você viu?': '¿Qué viste?',
  'Ex.: estava sentada no ponto de ônibus e parecia confusa.':
    'Ej.: estaba sentada en la parada de autobús y parecía confundida.',
  'Roupa que a pessoa usava': 'Ropa que llevaba la persona',
  'Ex.: casaco azul e calça jeans': 'Ej.: abrigo azul y jeans',
  'Características visíveis': 'Características visibles',
  'Ex.: cabelo preso, mochila vermelha': 'Ej.: cabello recogido, mochila roja',
  'Para onde a pessoa seguia': 'Hacia dónde iba la persona',
  'Ex.: a pé, em direção ao centro': 'Ej.: a pie, hacia el centro',
  'Foto (opcional)': 'Foto (opcional)',
  'Foto anexada ao relato': 'Foto adjunta al reporte',
  'A foto vai só para a equipe de análise e não é publicada. Não se aproxime nem se arrisque para fotografar.':
    'La foto va solo al equipo de análisis y no se publica. No te acerques ni te arriesgues para tomarla.',
  'Informações complementares': 'Información adicional',
  'Algo mais que possa ajudar a análise': 'Algo más que pueda ayudar al análisis',
  'Seu relato não é publicado. Ele fica ligado à sua conta e passa por análise antes de qualquer mudança no caso. O local exato não aparece para outras pessoas.':
    'Tu reporte no se publica. Queda vinculado a tu cuenta y se analiza antes de cualquier cambio en el caso. El lugar exacto no se muestra a otras personas.',
  'Enviar relato': 'Enviar reporte',
  'Relato recebido · nº {id}': 'Reporte recibido · n.º {id}',
  'Ele passa por análise antes de qualquer mudança no caso. Acompanhe a situação em "Meus relatos".':
    'Se analiza antes de cualquier cambio en el caso. Sigue la situación en "Mis reportes".',
  'Modo de demonstração: nada foi enviado de verdade.':
    'Modo de demostración: no se envió nada de verdad.',
  'Ver meus relatos': 'Ver mis reportes',
  'Informe a data.': 'Indica la fecha.',
  'Use o formato dd/mm/aaaa.': 'Usa el formato dd/mm/aaaa.',
  'A data não pode estar no futuro.': 'La fecha no puede estar en el futuro.',
  'Informe o horário, mesmo que aproximado.': 'Indica la hora, aunque sea aproximada.',
  'Use o formato hh:mm (ex.: 14:30).': 'Usa el formato hh:mm (ej.: 14:30).',
  'O horário não pode estar no futuro.': 'La hora no puede estar en el futuro.',
  'Conte o que você viu.': 'Cuenta lo que viste.',
  'Escreva pelo menos 10 letras.': 'Escribe al menos 10 caracteres.',
  'Texto muito longo.': 'El texto es demasiado largo.',
  'Recebido': 'Recibido',
  'O servidor recebeu o relato.': 'El servidor recibió el reporte.',
  'Aguardando análise': 'Esperando análisis',
  'O relato está na fila da equipe de análise.':
    'El reporte está en la fila del equipo de análisis.',
  'Em análise': 'En análisis',
  'Uma pessoa da equipe está verificando o relato.':
    'Una persona del equipo está verificando el reporte.',
  'Considerado relevante': 'Considerado relevante',
  'A equipe considerou a informação útil para o caso. Isso não confirma que era a pessoa.':
    'El equipo consideró la información útil para el caso. Esto no confirma que fuera la persona.',
  'Não confirmado': 'No confirmado',
  'Não foi possível confirmar a informação.': 'No fue posible confirmar la información.',
  'Encerrado': 'Cerrado',
  'A análise deste relato terminou.': 'El análisis de este reporte terminó.',
  // evolução · linha do tempo do caso
  'Data não informada': 'Fecha no informada',
  '{date}, aproximadamente': '{date}, aproximadamente',
  'De {from} para {to}': 'De {from} a {to}',
  'Nova situação: {to}': 'Nueva situación: {to}',
  'Organizada pela equipe a partir do cadastro, dos relatos analisados e das mudanças de situação. Só aparece o que pode ser público.':
    'Organizada por el equipo a partir del registro, de los reportes analizados y de los cambios de situación. Solo aparece lo que puede ser público.',
  'Montada com os dados do cadastro e os avistamentos informados. Os avistamentos ainda não passam por análise e não confirmam onde a pessoa está.':
    'Armada con los datos del registro y los avistamientos informados. Los avistamientos aún no pasan por análisis y no confirman dónde está la persona.',
  'Este cadastro ainda está só neste aparelho. A linha do tempo aparece depois que ele for enviado.':
    'Este registro todavía está solo en este dispositivo. La línea de tiempo aparece después de enviarlo.',
  'Não foi possível carregar a linha do tempo.': 'No se pudo cargar la línea de tiempo.',
  'Ainda não há acontecimentos registrados neste caso.':
    'Aún no hay acontecimientos registrados en este caso.',
  'Local: {place}': 'Lugar: {place}',
  'Por: {actor}': 'Por: {actor}',
  'Avistamentos são informações da comunidade e não confirmam onde a pessoa está. Em urgência, ligue 190. A linha do tempo não substitui a investigação das autoridades.':
    'Los avistamientos son información de la comunidad y no confirman dónde está la persona. En una urgencia, llama al 190. La línea de tiempo no sustituye la investigación de las autoridades.',
  'Classificação: {label}': 'Clasificación: {label}',
  'Linha do tempo do caso': 'Línea de tiempo del caso',
  'Caso cadastrado': 'Caso registrado',
  'Avistamento informado': 'Avistamiento informado',
  'Mudança de situação': 'Cambio de situación',
  'Atualização da família': 'Actualización de la familia',
  'Busca ampliada': 'Búsqueda ampliada',
  'Informação corrigida': 'Información corregida',
  'Caso encerrado': 'Caso cerrado',
  'Confirmado': 'Confirmado',
  'Verificado pela equipe ou registrado pelo próprio sistema.':
    'Verificado por el equipo o registrado por el propio sistema.',
  'Informado no cadastro': 'Informado en el registro',
  'Declarado por quem cadastrou o caso. Não foi verificado.':
    'Declarado por quien registró el caso. No fue verificado.',
  'Recebido e esperando a análise da equipe.': 'Recibido y esperando el análisis del equipo.',
  'Informação da comunidade que não foi verificada.':
    'Información de la comunidad que no fue verificada.',
  'Substituída por uma informação mais precisa.':
    'Sustituida por una información más precisa.',
  'Família': 'Familia',
  'Comunidade': 'Comunidad',
  'Equipe do Encontra-me': 'Equipo de Encontra-me',
  'Sistema': 'Sistema',
  'Linha do tempo': 'Línea de tiempo',
  'O que é a linha do tempo do caso?':
    '¿Qué es la línea de tiempo del caso?',
  'Na página do caso, toque em "Linha do tempo do caso". Ela mostra, em ordem, o que se sabe do caso: o cadastro, os avistamentos informados e, quando houver, mudanças de situação e atualizações. Cada item diz se a informação foi confirmada, informada no cadastro, está aguardando análise, não foi confirmada ou foi corrigida. Os locais aparecem só com bairro e cidade. Avistamentos não confirmam onde a pessoa está.':
    'En la página del caso, toca "Línea de tiempo del caso". Muestra, en orden, lo que se sabe del caso: el registro, los avistamientos informados y, cuando los haya, cambios de situación y actualizaciones. Cada elemento dice si la información fue confirmada, informada en el registro, está esperando análisis, no fue confirmada o fue corregida. Los lugares aparecen solo con barrio y ciudad. Los avistamientos no confirman dónde está la persona.',
  'linha do tempo histórico acontecimentos classificação':
    'línea de tiempo historial acontecimientos clasificación',
  // evolução · cartaz com QR Code e botões agrupados no caso
  'Imprimir ou salvar em PDF': 'Imprimir o guardar en PDF',
  'No celular, mostre o cartaz na tela ou tire um print. Para imprimir, abra este caso no computador.':
    'En el celular, muestra el cartel en la pantalla o haz una captura. Para imprimir, abre este caso en la computadora.',
  'Compartilhar texto e link do caso': 'Compartir texto y enlace del caso',
  'O QR Code aparece quando o endereço público do app estiver configurado (EXPO_PUBLIC_WEB_URL).':
    'El código QR aparece cuando la dirección pública de la app esté configurada (EXPO_PUBLIC_WEB_URL).',
  'Vertical (para imprimir)': 'Vertical (para imprimir)',
  'Quadrado (redes sociais)': 'Cuadrado (redes sociales)',
  'Ajustar o cartaz': 'Ajustar el cartel',
  'Formato do cartaz': 'Formato del cartel',
  'O que aparece': 'Qué aparece',
  'O cartaz usa só o que já é público na página do caso. Telefone, endereço e documentos nunca aparecem.':
    'El cartel solo usa lo que ya es público en la página del caso. Teléfono, dirección y documentos nunca aparecen.',
  'Data em que foi vista': 'Fecha en que fue vista',
  'Roupas e características': 'Ropa y características',
  'Mais opções': 'Más opciones',
  'Salvar como imagem': 'Guardar como imagen',
  'Cartaz do caso de {name}': 'Cartel del caso de {name}',
  'PESSOA DESAPARECIDA': 'PERSONA DESAPARECIDA',
  'Ajude a encontrar': 'Ayuda a encontrarla',
  'QR Code com o link da página do caso': 'Código QR con el enlace de la página del caso',
  'Aponte a câmera do celular para ver o caso atualizado e avisar se viu esta pessoa.':
    'Apunta la cámara del celular para ver el caso actualizado y avisar si viste a esta persona.',
  'Veja o caso e avise se viu esta pessoa pelo app {app}.':
    'Mira el caso y avisa si viste a esta persona en la app {app}.',
  'Em emergência, ligue 190': 'En una emergencia, llama al 190',
  'Saiba mais sobre o caso': 'Más sobre el caso',
  'Ajude a divulgar': 'Ayuda a difundir',
  'Cartaz com QR Code': 'Cartel con código QR',
  'Este caso foi encerrado e não deve mais ser divulgado. Se encontrar um cartaz antigo, não compartilhe.':
    'Este caso fue cerrado y ya no debe difundirse. Si encuentras un cartel antiguo, no lo compartas.',
  'O cartaz fica disponível depois que a equipe aprovar o caso.':
    'El cartel estará disponible después de que el equipo apruebe el caso.',
  'Voltar para o caso': 'Volver al caso',
  'Cartaz do caso': 'Cartel del caso',
  'Como faço um cartaz com QR Code?': '¿Cómo hago un cartel con código QR?',
  'Abra o caso e toque em "Cartaz com QR Code". Escolha o formato (vertical para imprimir ou quadrado para redes sociais) e o que aparece. O QR Code leva à página do caso, que mostra sempre a situação atual. No computador, use "Imprimir ou salvar em PDF"; no celular, mostre o cartaz na tela ou tire um print. O cartaz nunca mostra telefone, endereço ou documentos, e não é gerado para casos encerrados ou ainda em aprovação.':
    'Abre el caso y toca "Cartel con código QR". Elige el formato (vertical para imprimir o cuadrado para redes sociales) y lo que aparece. El código QR lleva a la página del caso, que siempre muestra la situación actual. En la computadora, usa "Imprimir o guardar en PDF"; en el celular, muestra el cartel en la pantalla o haz una captura. El cartel nunca muestra teléfono, dirección ni documentos, y no se genera para casos cerrados o que aún esperan aprobación.',
  'cartaz qr code imprimir divulgar pdf': 'cartel código qr imprimir difundir pdf',
  // evolução · Painel da equipe (moderação, busca e IA)
  'Ocultar este conteúdo?': '¿Ocultar este contenido?',
  'Manter este conteúdo?': '¿Mantener este contenido?',
  'O conteúdo deixa de aparecer no app. A decisão pode ser revista depois.':
    'El contenido deja de aparecer en la app. La decisión puede revisarse después.',
  'A denúncia é encerrada e o conteúdo continua no app.':
    'La denuncia se cierra y el contenido sigue en la app.',
  'Ocultar': 'Ocultar',
  'Manter': 'Mantener',
  'Não foi possível concluir': 'No se pudo completar',
  'Sem situação': 'Sin situación',
  'Mudar a situação para {status}?': '¿Cambiar la situación a {status}?',
  'Quem acompanha o caso pode ser avisado da mudança.':
    'Quienes siguen el caso pueden recibir un aviso del cambio.',
  'Marcar o relato como "{status}"?': '¿Marcar el reporte como "{status}"?',
  'Quem enviou o relato vê a nova situação em "Meus relatos".':
    'Quien envió el reporte ve la nueva situación en "Mis reportes".',
  'Ampliar a busca para {level}?': '¿Ampliar la búsqueda a {level}?',
  'Pessoas com alertas ligados na nova área podem receber o aviso. A ampliação fica registrada.':
    'Las personas con alertas activadas en la nueva área pueden recibir el aviso. La ampliación queda registrada.',
  'Pausar os alertas deste caso?': '¿Pausar las alertas de este caso?',
  'Retomar os alertas deste caso?': '¿Reanudar las alertas de este caso?',
  'Nenhum alerta novo sai até a busca ser retomada.':
    'No sale ninguna alerta nueva hasta que se reanude la búsqueda.',
  'Os alertas voltam a seguir as regras de região e limite.':
    'Las alertas vuelven a seguir las reglas de región y límite.',
  'Aceitar a sugestão para análise?': '¿Aceptar la sugerencia para análisis?',
  'Descartar a sugestão?': '¿Descartar la sugerencia?',
  'Aceitar não confirma nada: a sugestão vira um item de análise da equipe.':
    'Aceptar no confirma nada: la sugerencia pasa a ser un elemento de análisis del equipo.',
  'A sugestão sai da fila.': 'La sugerencia sale de la fila.',
  'Informe o número do caso.': 'Indica el número del caso.',
  'Não foi possível verificar o acesso.': 'No se pudo verificar el acceso.',
  'Esta área é só para a equipe do Encontra-me.':
    'Esta área es solo para el equipo de Encontra-me.',
  'Dados de demonstração: nada aqui é um caso, relato ou decisão de verdade.':
    'Datos de demostración: nada aquí es un caso, reporte o decisión real.',
  'Sugestões da IA': 'Sugerencias de la IA',
  'A IA não confirma identidade nem faz reconhecimento facial. A compatibilidade é só uma indicação técnica.':
    'La IA no confirma identidades ni hace reconocimiento facial. La compatibilidad es solo una indicación técnica.',
  'Nenhuma sugestão aguardando revisão.': 'Ninguna sugerencia esperando revisión.',
  'Relatos: {ids}': 'Reportes: {ids}',
  'Aceitar para análise': 'Aceptar para análisis',
  'Descartar': 'Descartar',
  'Acompanhamento da busca': 'Seguimiento de la búsqueda',
  'Não foi possível carregar o acompanhamento da busca.':
    'No se pudo cargar el seguimiento de la búsqueda.',
  'Alcance atual · {km} km': 'Alcance actual · {km} km',
  'Alcance atual': 'Alcance actual',
  'Alertas enviados': 'Alertas enviadas',
  'Entregues: não informado': 'Entregadas: sin información',
  'Alertas entregues': 'Alertas entregadas',
  'Relatos recebidos': 'Reportes recibidos',
  'Alertas enviados ou entregues não são pessoas mobilizadas: são só avisos que chegaram aos aparelhos.':
    'Las alertas enviadas o entregadas no son personas movilizadas: son solo avisos que llegaron a los dispositivos.',
  'Alertas pausados': 'Alertas pausadas',
  'Teia do caso': 'Red del caso',
  'Linha contínua: validada por uma pessoa. Tracejada: sugerida ou aguardando análise.':
    'Línea continua: validada por una persona. Discontinua: sugerida o esperando análisis.',
  'Regiões com mais atividade': 'Regiones con más actividad',
  '{region}: {count} relatos': '{region}: {count} reportes',
  'Últimas atualizações': 'Últimas actualizaciones',
  'Ampliar a busca': 'Ampliar la búsqueda',
  'A busca já está no alcance máximo.': 'La búsqueda ya está en el alcance máximo.',
  'Novo alcance': 'Nuevo alcance',
  'Retomar os alertas': 'Reanudar las alertas',
  'Pausar os alertas': 'Pausar las alertas',
  'Relatos para análise': 'Reportes para análisis',
  'Nenhum relato aguardando análise.': 'Ningún reporte esperando análisis.',
  'Relato nº {id}': 'Reporte n.º {id}',
  'Roupas: {value}': 'Ropa: {value}',
  'Direção: {value}': 'Dirección: {value}',
  'Situação do caso': 'Situación del caso',
  'Situação atual: {status}': 'Situación actual: {status}',
  'Caso encerrado: a situação não muda mais.': 'Caso cerrado: la situación ya no cambia.',
  'Mudar para {status}': 'Cambiar a {status}',
  'Justificativa da decisão': 'Justificación de la decisión',
  'Ex.: família confirmou por telefone que a informação está correta.':
    'Ej.: la familia confirmó por teléfono que la información es correcta.',
  'Escreva a justificativa antes de decidir.': 'Escribe la justificación antes de decidir.',
  'Painel da equipe': 'Panel del equipo',
  'Denúncias, relatos e acompanhamento das buscas.':
    'Denuncias, reportes y seguimiento de las búsquedas.',
  'Cadastro de caso': 'Registro de caso',
  'Mensagem do grupo de apoio': 'Mensaje del grupo de apoyo',
  'Aviso de segurança': 'Aviso de seguridad',
  'Outro conteúdo': 'Otro contenido',
  'Golpe': 'Estafa',
  'Informação falsa': 'Información falsa',
  'Abuso ou ofensa': 'Abuso u ofensa',
  'Outro motivo': 'Otro motivo',
  'Cidades vizinhas': 'Ciudades vecinas',
  'Outros países': 'Otros países',
  'Sugerida pela IA': 'Sugerida por la IA',
  'Validada por pessoa': 'Validada por una persona',
  'Descartada': 'Descartada',
  'Ponto inicial': 'Punto inicial',
  'Região alcançada': 'Región alcanzada',
  'Informação recebida': 'Información recibida',
  'Voluntário': 'Voluntario',
  'Instituição': 'Institución',
  'Relatos que podem estar ligados': 'Reportes que pueden estar relacionados',
  'Possível cadastro duplicado': 'Posible registro duplicado',
  'Informações que se contradizem': 'Información que se contradice',
  'Nova região de interesse': 'Nueva región de interés',
  'Indicação fraca': 'Indicación débil',
  'Indicação moderada': 'Indicación moderada',
  'Indicação forte': 'Indicación fuerte',
  'Denúncias abertas': 'Denuncias abiertas',
  'Não foi possível carregar as denúncias.': 'No se pudieron cargar las denuncias.',
  'Nenhuma denúncia aberta.': 'Ninguna denuncia abierta.',
  'nº {id}': 'n.º {id}',
  'Ver o caso': 'Ver el caso',
  'Toda decisão pede uma justificativa, que vai junto com a decisão. Nenhuma sugestão da IA muda um caso sozinha.':
    'Toda decisión pide una justificación, que va junto con la decisión. Ninguna sugerencia de la IA cambia un caso por sí sola.',
  'Fila de trabalho': 'Cola de trabajo',
  'Abrir um caso': 'Abrir un caso',
  'Situação, relatos, acompanhamento da busca e sugestões da IA de um caso.':
    'Situación, reportes, seguimiento de la búsqueda y sugerencias de la IA de un caso.',
  'Número do caso': 'Número del caso',
  'Abrir caso': 'Abrir caso',
  // evolução · etapas 5 a 8 (rede de busca, Quero ajudar, crianças, Central de Apoio)
  'Proteja a criança': 'Protege al niño o niña',
  'Não cite escola, endereço de casa, condomínio ou rotina. Use referências gerais, como o bairro ou uma praça. Revise: {fields}.':
    'No menciones escuela, dirección de casa, condominio ni rutina. Usa referencias generales, como el barrio o una plaza. Revisa: {fields}.',
  'Proteção reforçada: não informe escola, endereço de casa, condomínio ou rotina da criança. Use referências gerais, como o bairro ou uma praça.':
    'Protección reforzada: no informes la escuela, la dirección de casa, el condominio ni la rutina del niño o niña. Usa referencias generales, como el barrio o una plaza.',
  'Nas primeiras horas': 'En las primeras horas',
  'Não espere: não existe prazo mínimo para comunicar um desaparecimento. A lei trata a busca como urgente.':
    'No esperes: no hay un plazo mínimo para comunicar una desaparición. La ley trata la búsqueda como urgente.',
  'Se houver risco imediato, ligue 190.': 'Si hay riesgo inmediato, llama al 190.',
  'Registre o boletim de ocorrência na delegacia mais próxima ou na delegacia on-line, se o seu estado oferecer.':
    'Registra la denuncia policial en la comisaría más cercana o en línea, si tu estado lo ofrece.',
  'Para crianças e adolescentes, a investigação deve começar imediatamente.':
    'Para niños, niñas y adolescentes, la investigación debe empezar de inmediato.',
  'Avise pessoas próximas: família, amigos e conhecidos.':
    'Avisa a las personas cercanas: familia, amigos y conocidos.',
  'Procure em hospitais e serviços de acolhimento da região.':
    'Busca en hospitales y servicios de acogida de la región.',
  'Como registrar o boletim de ocorrência': 'Cómo registrar la denuncia policial',
  'Leve um documento seu e, se tiver, um documento da pessoa.':
    'Lleva un documento tuyo y, si tienes, un documento de la persona.',
  'Leve uma foto recente e nítida.': 'Lleva una foto reciente y nítida.',
  'Informe o último local e o horário em que a pessoa foi vista.':
    'Indica el último lugar y la hora en que vieron a la persona.',
  'Conte as roupas, as características e qualquer condição de saúde (isso é para a polícia, não para publicar).':
    'Cuenta la ropa, las características y cualquier condición de salud (esto es para la policía, no para publicar).',
  'Guarde o número do boletim: ele é pedido no cadastro do Encontra-me.':
    'Guarda el número de la denuncia: se pide en el registro de Encontra-me.',
  'Cuidado com golpes': 'Cuidado con las estafas',
  'Ninguém cobra para encontrar uma pessoa. Desconfie de pedidos de dinheiro.':
    'Nadie cobra por encontrar a una persona. Desconfía de los pedidos de dinero.',
  'Não pague nenhum "resgate" sem falar com a polícia.':
    'No pagues ningún "rescate" sin hablar con la policía.',
  'Não publique seu endereço nem documentos nas redes.':
    'No publiques tu dirección ni documentos en las redes.',
  'Divulgue só o cartaz e o link oficiais do caso.':
    'Difunde solo el cartel y el enlace oficiales del caso.',
  'Quando a pessoa for encontrada': 'Cuando encuentren a la persona',
  'Avise a polícia para atualizar o boletim de ocorrência.':
    'Avisa a la policía para que actualice la denuncia.',
  'Peça o encerramento do caso no Encontra-me, em "Pedir correção ou atualização", na página do caso.':
    'Pide el cierre del caso en Encontra-me, en "Pedir corrección o actualización", en la página del caso.',
  'Peça para apagarem cartazes e publicações antigas.':
    'Pide que borren carteles y publicaciones antiguas.',
  'A privacidade da pessoa encontrada vem primeiro: não divulgue onde ela está nem o que aconteceu.':
    'La privacidad de la persona encontrada es lo primero: no difundas dónde está ni qué pasó.',
  'Foto recente e nítida': 'Foto reciente y nítida',
  'Roupas que a pessoa usava': 'Ropa que llevaba la persona',
  'Altura, cabelo, olhos e sinais': 'Altura, cabello, ojos y señas',
  'Último local e horário em que foi vista': 'Último lugar y hora en que fue vista',
  'Celular e redes sociais da pessoa': 'Celular y redes sociales de la persona',
  'Lugares que ela costuma frequentar': 'Lugares que suele frecuentar',
  'Amigos e contatos próximos': 'Amigos y contactos cercanos',
  'Condições de saúde e remédios (só para a polícia)':
    'Condiciones de salud y medicamentos (solo para la policía)',
  'Distância dos avisos de casos perto': 'Distancia de los avisos de casos cercanos',
  'Quero ajudar': 'Quiero ayudar',
  'Central de Apoio às Famílias': 'Centro de Apoyo a las Familias',
  'Criança ou adolescente: prioridade': 'Niño, niña o adolescente: prioridad',
  'Se você vir esta criança ou adolescente, ligue 190 e depois avise pelo app.':
    'Si ves a este niño, niña o adolescente, llama al 190 y después avisa por la app.',
  'Sugerir onde divulgar': 'Sugerir dónde difundir',
  'O envio não foi confirmado. Tente de novo em alguns instantes.':
    'El envío no se confirmó. Inténtalo de nuevo en unos instantes.',
  'Cadastro de voluntário recebido. Modo de demonstração: nada foi enviado de verdade.':
    'Registro de voluntario recibido. Modo de demostración: no se envió nada de verdad.',
  'Cadastro de voluntário recebido. Obrigado por ajudar!':
    'Registro de voluntario recibido. ¡Gracias por ayudar!',
  'Sair do voluntariado?': '¿Dejar el voluntariado?',
  'Você deixa de receber pedidos e alertas de voluntariado.':
    'Dejarás de recibir pedidos y alertas de voluntariado.',
  'Você saiu do voluntariado.': 'Dejaste el voluntariado.',
  'Compartilhar cartazes oficiais': 'Compartir carteles oficiales',
  'Divulgar campanhas autorizadas': 'Difundir campañas autorizadas',
  'Informar avistamentos': 'Informar avistamientos',
  'Receber alertas da minha região': 'Recibir alertas de mi región',
  'Ajudar a distribuir informações': 'Ayudar a distribuir información',
  'Participar de ações de apoio autorizadas': 'Participar en acciones de apoyo autorizadas',
  'Sugerir regiões e conexões relevantes': 'Sugerir regiones y conexiones relevantes',
  'Cadastro de voluntário': 'Registro de voluntario',
  'Para se cadastrar como voluntário, entre na sua conta.':
    'Para registrarte como voluntario, entra en tu cuenta.',
  'Seu cadastro de voluntário': 'Tu registro de voluntario',
  'Quero me cadastrar': 'Quiero registrarme',
  'Cidade ou bairro onde pode ajudar': 'Ciudad o barrio donde puedes ayudar',
  'Ex.: Contagem': 'Ej.: Contagem',
  'Informe a cidade ou o bairro.': 'Indica la ciudad o el barrio.',
  'Como você quer ajudar?': '¿Cómo quieres ayudar?',
  'Escolha pelo menos uma forma de ajudar.': 'Elige al menos una forma de ayudar.',
  'Quando você costuma ter tempo (opcional)': 'Cuándo sueles tener tiempo (opcional)',
  'Ex.: fins de semana': 'Ej.: fines de semana',
  'Avisos': 'Avisos',
  'Receber pedidos de ajuda da minha região': 'Recibir pedidos de ayuda de mi región',
  'Confirme que vai seguir as orientações.': 'Confirma que vas a seguir las orientaciones.',
  'Li e vou seguir as orientações de segurança':
    'Leí y voy a seguir las orientaciones de seguridad',
  'Salvar alterações': 'Guardar cambios',
  'Sair do voluntariado': 'Dejar el voluntariado',
  'Nunca faça buscas sozinho em lugares perigosos.':
    'Nunca busques solo en lugares peligrosos.',
  'Não entre em propriedades nem aborde pessoas.':
    'No entres en propiedades ni abordes a personas.',
  'Não entre em confronto. Se houver risco, ligue 190.':
    'No te enfrentes con nadie. Si hay riesgo, llama al 190.',
  'Não compartilhe dados das famílias nem de quem enviou informações.':
    'No compartas datos de las familias ni de quienes enviaron información.',
  'Não existe ranking: toda ajuda conta igual.': 'No hay ranking: toda ayuda cuenta igual.',
  'Antes de ajudar': 'Antes de ayudar',
  'Sugestão recebida. Modo de demonstração: nada foi enviado de verdade.':
    'Sugerencia recibida. Modo de demostración: no se envió nada de verdad.',
  'Sugestão recebida. A equipe analisa antes de ampliar a divulgação.':
    'Sugerencia recibida. El equipo la analiza antes de ampliar la difusión.',
  'Um passo de cada vez. Aqui está o que fazer, o que reunir e onde encontrar apoio.':
    'Un paso a la vez. Aquí está qué hacer, qué reunir y dónde encontrar apoyo.',
  'O que reunir': 'Qué reunir',
  'As marcações ficam salvas só neste aparelho.':
    'Las marcas se guardan solo en este dispositivo.',
  'Cuide de você': 'Cuídate',
  'Você não precisa passar por isso sozinho. A Sofia conversa a qualquer hora (ela não substitui profissionais), e o grupo de apoio reúne pessoas que passam pela mesma situação.':
    'No tienes que pasar por esto solo. Sofia conversa a cualquier hora (no sustituye a profesionales), y el grupo de apoyo reúne a personas que pasan por la misma situación.',
  'Ligar para o CVV (188)': 'Llamar al CVV (188)',
  'O CVV atende 24 horas, de graça, para apoio emocional.':
    'El CVV atiende 24 horas, gratis, para apoyo emocional.',
  'Conhece um lugar onde vale divulgar este caso? Conte qual e por quê. A equipe analisa antes de ampliar a divulgação.':
    '¿Conoces un lugar donde vale la pena difundir este caso? Cuenta cuál y por qué. El equipo lo analiza antes de ampliar la difusión.',
  'Cidade ou bairro': 'Ciudad o barrio',
  'Ex.: Betim': 'Ej.: Betim',
  'Por que essa região?': '¿Por qué esa región?',
  'Ex.: ela tem parentes lá e costumava visitar.':
    'Ej.: tiene parientes allí y solía visitarlos.',
  'Não informe endereço de casa nem dados de outras pessoas.':
    'No informes direcciones de casas ni datos de otras personas.',
  'Enviar sugestão': 'Enviar sugerencia',
  'Você pode ajudar a divulgar casos e a passar informações para a equipe, com segurança e sem se expor.':
    'Puedes ayudar a difundir casos y a pasar información al equipo, con seguridad y sin exponerte.',
  'Como posso ajudar como voluntário?':
    '¿Cómo puedo ayudar como voluntario?',
  'No menu, toque em "Quero ajudar". Leia as orientações de segurança, informe a cidade ou o bairro e escolha como quer ajudar, como compartilhar cartazes oficiais ou receber alertas da sua região. Voluntários nunca fazem buscas sozinhos, não abordam pessoas e não recebem dados das famílias. Não existe ranking.':
    'En el menú, toca "Quiero ayudar". Lee las orientaciones de seguridad, indica la ciudad o el barrio y elige cómo quieres ayudar, como compartir carteles oficiales o recibir alertas de tu región. Los voluntarios nunca buscan solos, no abordan a personas y no reciben datos de las familias. No hay ranking.',
  'voluntário voluntariado ajudar colaborar':
    'voluntario voluntariado ayudar colaborar',
  'Alguém da minha família desapareceu. O que eu faço?':
    'Alguien de mi familia desapareció. ¿Qué hago?',
  'Não espere: não existe prazo mínimo para comunicar um desaparecimento. Se houver risco imediato, ligue 190 e registre o boletim de ocorrência. No menu, a "Central de Apoio às Famílias" mostra o passo a passo, o que reunir, como evitar golpes e onde encontrar apoio.':
    'No esperes: no hay un plazo mínimo para comunicar una desaparición. Si hay riesgo inmediato, llama al 190 y registra la denuncia policial. En el menú, el "Centro de Apoyo a las Familias" muestra el paso a paso, qué reunir, cómo evitar estafas y dónde encontrar apoyo.',
  'família desapareceu primeiros passos boletim apoio':
    'familia desapareció primeros pasos denuncia apoyo',
  // Evolução — Encontra-me Vision
  'O que é o Encontra-me Vision (rede de câmeras)?':
    '¿Qué es Encontra-me Vision (red de cámaras)?',
  'É uma rede de câmeras participantes: moradores, comércios, condomínios e instituições cadastram suas câmeras para ajudar nas buscas. No menu, "Rede de câmeras" mostra só as regiões com mais ou menos cobertura — ninguém assiste a gravações nem vê onde ficam as câmeras. Quem tem câmera pode cadastrá-la e decide cada pedido de preservação de imagens, podendo pausar ou sair quando quiser. As gravações só são analisadas por autoridades habilitadas, com justificativa e registro. A análise compara roupas e acessórios, nunca o rosto, e semelhança não confirma que a pessoa foi encontrada.':
    'Es una red de cámaras participantes: vecinos, comercios, condominios e instituciones registran sus cámaras para ayudar en las búsquedas. En el menú, "Red de cámaras" muestra solo las regiones con más o menos cobertura: nadie ve grabaciones ni dónde están las cámaras. Quien tiene una cámara puede registrarla y decide cada pedido de preservación de imágenes, y puede pausar o salir cuando quiera. Las grabaciones solo las analizan autoridades habilitadas, con justificación y registro. El análisis compara ropa y accesorios, nunca el rostro, y el parecido no confirma que la persona fue encontrada.',
  'câmera câmeras vision rede gravação imagens preservação':
    'cámara cámaras vision red grabación imágenes preservación',
  'Rede de câmeras (Encontra-me Vision)': 'Red de cámaras (Encontra-me Vision)',
  'Câmera cadastrada': 'Cámara registrada',
  'Alterações salvas': 'Cambios guardados',
  'A câmera fica "Aguardando verificação" até a equipe conferir os dados. Ela só participa depois disso.':
    'La cámara queda "Esperando verificación" hasta que el equipo revise los datos. Solo participa después de eso.',
  'Pausar a participação?': '¿Pausar la participación?',
  'A câmera deixa de aparecer nas buscas até você pedir para voltar.':
    'La cámara deja de aparecer en las búsquedas hasta que pidas volver.',
  'Pausar': 'Pausar',
  'Encerrar a participação?': '¿Terminar la participación?',
  'A câmera sai da rede. Os pedidos já registrados continuam no histórico.':
    'La cámara sale de la red. Los pedidos ya registrados siguen en el historial.',
  'Encerrar': 'Terminar',
  'Pedir para voltar?': '¿Pedir volver?',
  'A câmera passa de novo pela verificação da equipe antes de participar.':
    'La cámara pasa de nuevo por la verificación del equipo antes de participar.',
  'Pedir para voltar': 'Pedir volver',
  'Pedido {id} registrado no modo de demonstração (nada foi enviado de verdade). Na versão real, a equipe confere a instituição e a pessoa antes de liberar.':
    'Pedido {id} registrado en modo de demostración (no se envió nada de verdad). En la versión real, el equipo verifica la institución y la persona antes de habilitar.',
  'Pedido {id} recebido. A equipe confere a instituição e a pessoa antes de liberar; a habilitação não é automática.':
    'Pedido {id} recibido. El equipo verifica la institución y la persona antes de habilitar; la habilitación no es automática.',
  'Use o formato dd/mm/aaaa e hh:mm.': 'Usa el formato dd/mm/aaaa y hh:mm.',
  'Resumo': 'Resumen',
  'Câmeras': 'Cámaras',
  'Preservação': 'Preservación',
  'Correspondências': 'Coincidencias',
  'Trajeto': 'Trayecto',
  'Outras fontes': 'Otras fuentes',
  'Histórico': 'Historial',
  'Escreva a justificativa (pelo menos 15 letras).':
    'Escribe la justificación (al menos 15 letras).',
  'Intervalo inválido': 'Intervalo inválido',
  'Confira a data e o horário do último local conhecido.':
    'Revisa la fecha y la hora del último lugar conocido.',
  'Pedido de preservação de imagens': 'Pedido de preservación de imágenes',
  'Assista ao trecho antes': 'Mira el fragmento antes',
  'Só dá para confirmar uma correspondência depois de abrir o trecho de vídeo.':
    'Solo se puede confirmar una coincidencia después de abrir el fragmento de video.',
  'Aceitar preservar as gravações?': '¿Aceptar preservar las grabaciones?',
  'Recusar o pedido?': '¿Rechazar el pedido?',
  'Você se compromete a não apagar as gravações desse intervalo. A entrega das imagens é combinada depois, com registro.':
    'Te comprometes a no borrar las grabaciones de ese intervalo. La entrega de las imágenes se acuerda después, con registro.',
  'A recusa fica registrada. Se houver ordem judicial, ela chega por canal oficial, separado deste pedido.':
    'El rechazo queda registrado. Si hay una orden judicial, llega por un canal oficial, separado de este pedido.',
  'Aceitar': 'Aceptar',
  'Recusar': 'Rechazar',
  'Verificada: passou a participar': 'Verificada: empezó a participar',
  'Participação pausada': 'Participación pausada',
  'Participação encerrada': 'Participación terminada',
  'Pediu para voltar a participar': 'Pidió volver a participar',
  'Dados atualizados': 'Datos actualizados',
  'Pedido de preservação recebido': 'Pedido de preservación recibido',
  'Imagens fornecidas': 'Imágenes entregadas',
  'Nunca escreva aqui senha, usuário, IP ou endereço de acesso da câmera. Se um dia for preciso conectar o equipamento, isso será combinado com você, por um canal próprio.':
    'Nunca escribas aquí la contraseña, el usuario, la IP o la dirección de acceso de la cámara. Si algún día hace falta conectar el equipo, se acordará contigo por un canal propio.',
  'Nome da câmera': 'Nombre de la cámara',
  'Ex.: Entrada da loja': 'Ej.: Entrada de la tienda',
  'Tipo de local': 'Tipo de lugar',
  'Bairro ou região': 'Barrio o región',
  'O que a câmera mostra': 'Lo que muestra la cámara',
  'Ex.: calçada em frente à loja e parte da rua':
    'Ej.: vereda frente a la tienda y parte de la calle',
  'Só a região aparece para a comunidade. O nome, o que a câmera mostra e a posição ficam restritos a você e às autoridades habilitadas.':
    'Solo la región aparece para la comunidad. El nombre, lo que muestra la cámara y la posición quedan restringidos a ti y a las autoridades habilitadas.',
  'Equipamento (opcional)': 'Equipo (opcional)',
  'Ex.: câmera fixa com gravador': 'Ej.: cámara fija con grabador',
  'Posição da câmera (opcional)': 'Posición de la cámara (opcional)',
  'Posição salva. Ela não aparece para a comunidade.':
    'Posición guardada. No aparece para la comunidad.',
  'Use a localização do aparelho só se você estiver no local da câmera.':
    'Usa la ubicación del dispositivo solo si estás en el lugar de la cámara.',
  'Atualizar posição': 'Actualizar posición',
  'Usar a localização deste aparelho': 'Usar la ubicación de este dispositivo',
  'Remover posição': 'Quitar posición',
  'Horário em que grava (deixe em branco se grava o dia todo)':
    'Horario en que graba (déjalo en blanco si graba todo el día)',
  'Das': 'Desde',
  'Até': 'Hasta',
  'Por quantos dias as gravações ficam guardadas': 'Cuántos días se guardan las grabaciones',
  'Muitos equipamentos apagam as gravações sozinhos depois de alguns dias. Esse prazo ajuda a pedir a preservação a tempo.':
    'Muchos equipos borran las grabaciones solos después de algunos días. Ese plazo ayuda a pedir la preservación a tiempo.',
  'Como as imagens podem ser entregues': 'Cómo se pueden entregar las imágenes',
  'Quando você aceita fornecer gravações': 'Cuándo aceptas entregar grabaciones',
  'Declaração do responsável': 'Declaración del responsable',
  'Sou responsável por esta câmera, ela não filma o interior da casa de outras pessoas, e entendo que participar não libera as imagens: cada pedido passa por mim ou por procedimento legal.':
    'Soy responsable de esta cámara, no filma el interior de la casa de otras personas, y entiendo que participar no libera las imágenes: cada pedido pasa por mí o por un procedimiento legal.',
  'Cadastrar câmera': 'Registrar cámara',
  'Participação': 'Participación',
  'Encerrar participação': 'Terminar participación',
  'A equipe técnica cuida do funcionamento do sistema e não tem acesso a operações, gravações ou dados dos casos. Um acesso excepcional precisa de autorização, justificativa e registro.':
    'El equipo técnico cuida el funcionamiento del sistema y no tiene acceso a operaciones, grabaciones ni datos de los casos. Un acceso excepcional necesita autorización, justificación y registro.',
  'Esta área é só para autoridades e profissionais habilitados. Cada acesso é individual, limitado à função e registrado.':
    'Esta área es solo para autoridades y profesionales habilitados. Cada acceso es individual, limitado a la función y registrado.',
  'Seu pedido de habilitação {id} está em análise desde {date}. A equipe confere a instituição e a pessoa antes de liberar.':
    'Tu pedido de habilitación {id} está en análisis desde {date}. El equipo verifica la institución y la persona antes de habilitar.',
  'Pedir habilitação institucional': 'Pedir habilitación institucional',
  'Use os dados da sua instituição. A equipe confirma por canal oficial antes de liberar qualquer acesso.':
    'Usa los datos de tu institución. El equipo confirma por un canal oficial antes de habilitar cualquier acceso.',
  'Instituição ou órgão': 'Institución u organismo',
  'Informe a instituição.': 'Indica la institución.',
  'Cargo ou função': 'Cargo o función',
  'Informe o cargo.': 'Indica el cargo.',
  'Matrícula ou identificação funcional': 'Matrícula o identificación funcional',
  'Informe a matrícula.': 'Indica la matrícula.',
  'E-mail institucional': 'Correo institucional',
  'Para que você precisa do acesso': 'Para qué necesitas el acceso',
  'Explique em pelo menos 20 letras.': 'Explica en al menos 20 letras.',
  'Enviar pedido de habilitação': 'Enviar pedido de habilitación',
  'Operações de busca': 'Operaciones de búsqueda',
  'Abrir operação de busca': 'Abrir operación de búsqueda',
  'Não foi possível carregar as operações.': 'No se pudieron cargar las operaciones.',
  'Nenhuma operação aberta.': 'Ninguna operación abierta.',
  'Último local conhecido: {place}': 'Último lugar conocido: {place}',
  'Em {date} · raio de {radius}': 'El {date} · radio de {radius}',
  'Aberta': 'Abierta',
  'Encerrada': 'Cerrada',
  '{count} pedidos em andamento': '{count} pedidos en curso',
  '{count} correspondências para revisar': '{count} coincidencias para revisar',
  'Sua função': 'Tu función',
  'A liberação de funções para outras pessoas é feita pela equipe, com registro (gerenciamento de permissões).':
    'La habilitación de funciones para otras personas la hace el equipo, con registro (gestión de permisos).',
  'Controle': 'Control',
  'Auditoria de acessos e decisões': 'Auditoría de accesos y decisiones',
  'Gerenciar permissões da equipe': 'Gestionar permisos del equipo',
  'Integrações institucionais': 'Integraciones institucionales',
  'Nenhuma integração real está ligada. Cada uma depende de convênio, autorização do responsável e avaliação técnica e jurídica.':
    'Ninguna integración real está activada. Cada una depende de un convenio, la autorización del responsable y una evaluación técnica y jurídica.',
  'Câmeras IP e RTSP autorizadas': 'Cámaras IP y RTSP autorizadas',
  'Sistemas de videomonitoramento': 'Sistemas de videovigilancia',
  'Armazenamento de gravações': 'Almacenamiento de grabaciones',
  'Análise visual por IA (sem reconhecimento facial)':
    'Análisis visual por IA (sin reconocimiento facial)',
  'Sistemas de órgãos públicos': 'Sistemas de organismos públicos',
  'Possíveis correspondências': 'Posibles coincidencias',
  'A IA compara só roupa, mochila, acessórios, direção e horário. Semelhança não é identificação: ninguém é dado como encontrado por uma correspondência.':
    'La IA solo compara ropa, mochila, accesorios, dirección y horario. El parecido no es identificación: nadie se da por encontrado por una coincidencia.',
  'Reconhecimento facial e outras análises biométricas: desligados.':
    'Reconocimiento facial y otros análisis biométricos: desactivados.',
  'Nenhuma correspondência até agora.': 'Ninguna coincidencia hasta ahora.',
  'Características compatíveis:': 'Características compatibles:',
  'Por que a IA apontou: {text}': 'Por qué la IA lo señaló: {text}',
  'Limitações:': 'Limitaciones:',
  'Sugestão inicial da IA: {value}': 'Sugerencia inicial de la IA: {value}',
  'Sem sugestão da IA.': 'Sin sugerencia de la IA.',
  'Revisado por {name} em {date}: {note}': 'Revisado por {name} el {date}: {note}',
  'Ver o trecho (fica registrado)': 'Ver el fragmento (queda registrado)',
  'Trajeto possível': 'Trayecto posible',
  'O trajeto usa só o último local conhecido e correspondências confirmadas ou prováveis. Sem evidência suficiente, o app não desenha caminho.':
    'El trayecto usa solo el último lugar conocido y coincidencias confirmadas o probables. Sin evidencia suficiente, la app no dibuja un camino.',
  'Falta o último local conhecido para montar um trajeto.':
    'Falta el último lugar conocido para armar un trayecto.',
  'Evidências insuficientes para indicar um trajeto. Continue pedindo preservação e revisando as correspondências.':
    'Evidencias insuficientes para indicar un trayecto. Sigue pidiendo preservación y revisando las coincidencias.',
  'Mapa do trajeto possível com {count} pontos.':
    'Mapa del trayecto posible con {count} puntos.',
  'Direção geral provável: {direction} · {distance} percorridos entre os pontos.':
    'Dirección general probable: {direction} · {distance} recorridos entre los puntos.',
  'Sem direção geral definida.': 'Sin dirección general definida.',
  '↓ {distance} em {minutes} min': '↓ {distance} en {minutes} min',
  'deslocamento improvável — revisar': 'desplazamiento improbable — revisar',
  'Último local conhecido': 'Último lugar conocido',
  'Fora do trajeto': 'Fuera del trayecto',
  'Registros inconclusivos ou anteriores ao último local conhecido. Ficam visíveis, mas não entram na linha.':
    'Registros inconclusos o anteriores al último lugar conocido. Siguen visibles, pero no entran en la línea.',
  'Próximas câmeras a consultar (sugestão)': 'Próximas cámaras a consultar (sugerencia)',
  'na direção do deslocamento': 'en la dirección del desplazamiento',
  'Informações de outras fontes': 'Información de otras fuentes',
  'Moradores, comércios, voluntários e instituições. Cada informação tem origem, horário, confiabilidade e histórico de avaliação.':
    'Vecinos, comercios, voluntarios e instituciones. Cada información tiene origen, horario, confiabilidad e historial de evaluación.',
  'Nenhuma informação recebida.': 'Ninguna información recibida.',
  'Origem (restrita): {label}': 'Origen (restringido): {label}',
  'Recebida em {date}': 'Recibida el {date}',
  'fato por volta de {time}': 'hecho alrededor de las {time}',
  'Justificativa da próxima ação': 'Justificación de la próxima acción',
  'Ex.: conferir passagem logo após o último local conhecido.':
    'Ej.: verificar el paso justo después del último lugar conocido.',
  'Data e horário: {date}': 'Fecha y hora: {date}',
  'Descrição informada: {text}': 'Descripción informada: {text}',
  'Escopo: {text}': 'Alcance: {text}',
  'Justificativa: {text}': 'Justificación: {text}',
  'Responsáveis: {names}': 'Responsables: {names}',
  'Raio da busca': 'Radio de búsqueda',
  'Câmeras no raio': 'Cámaras en el radio',
  'Pedidos em andamento': 'Pedidos en curso',
  'Correspondências para revisar': 'Coincidencias para revisar',
  'Reduzir o raio': 'Reducir el radio',
  'Ampliar o raio': 'Ampliar el radio',
  'Há {count} câmeras participantes fora do raio atual.':
    'Hay {count} cámaras participantes fuera del radio actual.',
  'Câmera desligada, sem gravação ou fora do raio não prova que a pessoa não passou por ali.':
    'Una cámara apagada, sin grabación o fuera del radio no prueba que la persona no pasó por ahí.',
  'Câmeras participantes no raio': 'Cámaras participantes en el radio',
  'Mapa com o último local conhecido e {count} câmeras no raio.':
    'Mapa con el último lugar conocido y {count} cámaras en el radio.',
  'Ordem de prioridade: primeiro as gravações que vão ser apagadas antes, depois as mais perto.':
    'Orden de prioridad: primero las grabaciones que se borrarán antes, después las más cercanas.',
  'Nenhuma câmera participante dentro do raio.':
    'Ninguna cámara participante dentro del radio.',
  'a {distance} do último local': 'a {distance} del último lugar',
  'Tempo até o prazo de guarda acabar: {left}':
    'Tiempo hasta que termine el plazo de guarda: {left}',
  'Responsável: {name}': 'Responsable: {name}',
  'O que mostra: {text}': 'Qué muestra: {text}',
  'Preparar pedido de preservação': 'Preparar pedido de preservación',
  'Pedidos de preservação de imagens': 'Pedidos de preservación de imágenes',
  'O app prepara o texto do pedido; quem envia é a equipe, por e-mail ou ofício, e depois registra aqui. Nada é enviado automaticamente, e o responsável não é obrigado a fornecer imagens sem procedimento legal.':
    'La app prepara el texto del pedido; quien lo envía es el equipo, por correo u oficio, y después lo registra aquí. No se envía nada automáticamente, y el responsable no está obligado a entregar imágenes sin un procedimiento legal.',
  'Nenhum pedido ainda.': 'Ningún pedido todavía.',
  'Intervalo: {from} até {to}': 'Intervalo: {from} hasta {to}',
  'Prazo de guarda do equipamento: {date}': 'Plazo de guarda del equipo: {date}',
  'Compartilhar o texto do pedido': 'Compartir el texto del pedido',
  'Histórico da operação': 'Historial de la operación',
  'Auditoria desta operação': 'Auditoría de esta operación',
  'Só a coordenação e a auditoria veem quem acessou o quê.':
    'Solo la coordinación y la auditoría ven quién accedió a qué.',
  'Carregando…': 'Cargando…',
  'Nenhum registro.': 'Ningún registro.',
  'Permitido': 'Permitido',
  'Negado': 'Denegado',
  '{value} m': '{value} m',
  '{value} km': '{value} km',
  'Mapa esquemático: posições aproximadas, sem ruas.':
    'Mapa esquemático: posiciones aproximadas, sin calles.',
  'Trecho liberado até {time}. O acesso fica registrado.':
    'Fragmento habilitado hasta las {time}. El acceso queda registrado.',
  'Abrir o trecho': 'Abrir el fragmento',
  'Quadro sintético de demonstração, sem gravação real.':
    'Cuadro sintético de demostración, sin grabación real.',
  'SINTÉTICO': 'SINTÉTICO',
  'Aberto por {name} em {when}': 'Abierto por {name} el {when}',
  'Material sintético de demonstração: nenhuma gravação real.':
    'Material sintético de demostración: ninguna grabación real.',
  'Acesso liberado até {time} e registrado na auditoria.':
    'Acceso habilitado hasta las {time} y registrado en la auditoría.',
  'Demonstração: ver o Vision como': 'Demostración: ver Vision como',
  'Perfis fictícios. Na versão real, a função vem da conta e a habilitação institucional é verificada pela equipe.':
    'Perfiles ficticios. En la versión real, la función viene de la cuenta y la habilitación institucional la verifica el equipo.',
  'Cobertura de câmeras participantes': 'Cobertura de cámaras participantes',
  'Regiões onde moradores, comércios e instituições cadastraram câmeras para ajudar nas buscas.':
    'Regiones donde vecinos, comercios e instituciones registraron cámaras para ayudar en las búsquedas.',
  'Aqui ninguém assiste a gravações nem vê onde ficam as câmeras. As imagens só são usadas por autoridades habilitadas, com pedido registrado.':
    'Aquí nadie ve grabaciones ni dónde están las cámaras. Las imágenes solo las usan autoridades habilitadas, con pedido registrado.',
  'Não foi possível carregar a cobertura.': 'No se pudo cargar la cobertura.',
  'Ainda não há câmeras participantes.': 'Todavía no hay cámaras participantes.',
  'Pouca cobertura não quer dizer que ninguém viu nada. Se você souber de algo, conte pelo caso da pessoa.':
    'Poca cobertura no quiere decir que nadie vio nada. Si sabes algo, cuéntalo en el caso de la persona.',
  'Como participar': 'Cómo participar',
  'Viu alguém desaparecido?': '¿Viste a alguien desaparecido?',
  'Abra o caso da pessoa e toque em "Vi essa pessoa por perto".':
    'Abre el caso de la persona y toca "Vi a esta persona cerca".',
  'Tenho câmera e quero ajudar': 'Tengo una cámara y quiero ayudar',
  'Cadastre sua câmera. Você decide cada pedido e pode sair quando quiser.':
    'Registra tu cámara. Tú decides cada pedido y puedes salir cuando quieras.',
  'Pedidos de preservação recebidos': 'Pedidos de preservación recibidos',
  'Autoridades e profissionais': 'Autoridades y profesionales',
  'O acesso institucional é individual, verificado pela equipe e registrado. Dizer que é autoridade não libera nada.':
    'El acceso institucional es individual, verificado por el equipo y registrado. Decir que eres autoridad no habilita nada.',
  'Ambiente institucional': 'Entorno institucional',
  'Operações de busca, preservação de imagens e trajetos.':
    'Operaciones de búsqueda, preservación de imágenes y trayectos.',
  'Só para autoridades e profissionais habilitados.':
    'Solo para autoridades y profesionales habilitados.',
  'Saúde técnica do Vision': 'Salud técnica de Vision',
  'A equipe técnica vê o funcionamento do sistema, nunca operações ou gravações.':
    'El equipo técnico ve el funcionamiento del sistema, nunca operaciones ni grabaciones.',
  'Como o Encontra-me Vision funciona': 'Cómo funciona Encontra-me Vision',
  'menos de 1 hora': 'menos de 1 hora',
  '{hours} h': '{hours} h',
  '{days} d': '{days} d',
  '{days} d e {hours} h': '{days} d y {hours} h',
  'Sua função não permite esta ação. A tentativa ficou registrada na auditoria.':
    'Tu función no permite esta acción. El intento quedó registrado en la auditoría.',
  'Esta câmera não é da sua conta.': 'Esta cámara no es de tu cuenta.',
  'Este passo não é possível na situação atual.':
    'Este paso no es posible en la situación actual.',
  'Confira os dados e tente de novo.': 'Revisa los datos e inténtalo de nuevo.',
  'Não foi possível concluir agora. Tente de novo em alguns instantes.':
    'No se pudo completar ahora. Inténtalo de nuevo en unos instantes.',
  'Câmera da prefeitura': 'Cámara de la municipalidad',
  'Câmera de trânsito': 'Cámara de tránsito',
  'Câmera pública oficial': 'Cámara pública oficial',
  'Comércio ou loja': 'Comercio o tienda',
  'Casa': 'Casa',
  'Condomínio': 'Condominio',
  'Empresa de segurança': 'Empresa de seguridad',
  'Sistema de órgão público': 'Sistema de organismo público',
  'Envio do arquivo pelo responsável': 'Envío del archivo por el responsable',
  'Câmera IP (RTSP), quando permitido': 'Cámara IP (RTSP), cuando esté permitido',
  'Sistema de videomonitoramento': 'Sistema de videovigilancia',
  'Gravação na nuvem do fabricante': 'Grabación en la nube del fabricante',
  'Gravador no local (DVR/NVR)': 'Grabador en el lugar (DVR/NVR)',
  'Aguardando verificação': 'Esperando verificación',
  'Participando': 'Participando',
  'Pausada pelo responsável': 'Pausada por el responsable',
  'Analiso cada pedido de preservação': 'Analizo cada pedido de preservación',
  'Só com pedido formal de autoridade': 'Solo con pedido formal de una autoridad',
  'Só com ordem judicial': 'Solo con orden judicial',
  'Maior cobertura': 'Mayor cobertura',
  'Cobertura média': 'Cobertura media',
  'Pouca cobertura': 'Poca cobertura',
  'Responsável por câmera': 'Responsable de cámara',
  'Agente institucional': 'Agente institucional',
  'Coordenação institucional': 'Coordinación institucional',
  'Auditoria': 'Auditoría',
  'Equipe técnica (Nexora Prism)': 'Equipo técnico (Nexora Prism)',
  'Ver a cobertura por região': 'Ver la cobertura por región',
  'Cadastrar e gerenciar as próprias câmeras': 'Registrar y gestionar las propias cámaras',
  'Responder pedidos de preservação': 'Responder pedidos de preservación',
  'Ver operações de busca': 'Ver operaciones de búsqueda',
  'Ampliar ou reduzir o raio': 'Ampliar o reducir el radio',
  'Pedir preservação de imagens': 'Pedir preservación de imágenes',
  'Assistir a trechos autorizados': 'Ver fragmentos autorizados',
  'Confirmar ou descartar correspondências': 'Confirmar o descartar coincidencias',
  'Avaliar a confiabilidade das informações': 'Evaluar la confiabilidad de la información',
  'Ver a auditoria': 'Ver la auditoría',
  'Ver a saúde técnica do sistema': 'Ver la salud técnica del sistema',
  'Gravação dentro do prazo': 'Grabación dentro del plazo',
  'Prazo acabando — peça a preservação já': 'Plazo terminando — pide la preservación ya',
  'Pode já ter sido apagada': 'Puede que ya se haya borrado',
  'Não grava nesse horário': 'No graba en ese horario',
  'Não guarda gravações': 'No guarda grabaciones',
  'Preparado, ainda não enviado': 'Preparado, todavía no enviado',
  'Enviado, aguardando resposta': 'Enviado, esperando respuesta',
  'Responsável aceitou preservar': 'El responsable aceptó preservar',
  'Responsável recusou': 'El responsable rechazó',
  'Imagens recebidas': 'Imágenes recibidas',
  'Prazo vencido': 'Plazo vencido',
  'Voltar para rascunho': 'Volver a borrador',
  'Registrar que foi enviado': 'Registrar que se envió',
  'Aceitar preservar': 'Aceptar preservar',
  'Registrar imagens recebidas': 'Registrar imágenes recibidas',
  'Marcar prazo vencido': 'Marcar plazo vencido',
  'Cancelar pedido': 'Cancelar pedido',
  'Prazo de guarda já passou': 'El plazo de guarda ya pasó',
  'Menos de 24 horas': 'Menos de 24 horas',
  'Menos de 3 dias': 'Menos de 3 días',
  'Dentro do prazo': 'Dentro del plazo',
  'Confirmada por pessoa': 'Confirmada por una persona',
  'Provável': 'Probable',
  'Inconclusiva': 'Inconclusa',
  'Alguém da equipe assistiu ao trecho e confirmou que é compatível com a descrição.':
    'Alguien del equipo vio el fragmento y confirmó que es compatible con la descripción.',
  'A IA encontrou várias características compatíveis. Ainda precisa de revisão humana.':
    'La IA encontró varias características compatibles. Todavía necesita revisión humana.',
  'Poucas características compatíveis ou imagem ruim. Não serve para indicar trajeto.':
    'Pocas características compatibles o imagen mala. No sirve para indicar un trayecto.',
  'Alguém da equipe revisou e concluiu que não é a pessoa procurada.':
    'Alguien del equipo lo revisó y concluyó que no es la persona buscada.',
  'Confiança alta': 'Confianza alta',
  'Confiança média': 'Confianza media',
  'Confiança baixa': 'Confianza baja',
  'Cor da roupa': 'Color de la ropa',
  'Tipo de roupa': 'Tipo de ropa',
  'Mochila': 'Mochila',
  'Bolsa': 'Bolso',
  'Acessório': 'Accesorio',
  'Direção': 'Dirección',
  'Veículo': 'Vehículo',
  'Outra característica': 'Otra característica',
  'Fato informado': 'Hecho informado',
  'Confirmado por pessoa': 'Confirmado por una persona',
  'Hipótese': 'Hipótesis',
  'Inconclusivo': 'Inconcluso',
  'norte': 'norte',
  'nordeste': 'noreste',
  'leste': 'este',
  'sudeste': 'sureste',
  'sul': 'sur',
  'sudoeste': 'suroeste',
  'oeste': 'oeste',
  'noroeste': 'noroeste',
  'Morador': 'Vecino',
  'Comerciante': 'Comerciante',
  'Empresa': 'Empresa',
  'Sistema público participante': 'Sistema público participante',
  'Ainda não avaliada': 'Todavía no evaluada',
  'Confiabilidade baixa': 'Confiabilidad baja',
  'Confiabilidade média': 'Confiabilidad media',
  'Confiabilidade alta': 'Confiabilidad alta',
  'Dê um nome de 3 a 60 letras (ex.: "Entrada da loja").':
    'Pon un nombre de 3 a 60 letras (ej.: "Entrada de la tienda").',
  'Escolha o tipo de local.': 'Elige el tipo de lugar.',
  'Informe o bairro ou região.': 'Indica el barrio o la región.',
  'Informe a cidade.': 'Indica la ciudad.',
  'Conte em poucas palavras o que a câmera mostra.':
    'Cuenta en pocas palabras lo que muestra la cámara.',
  'Localização inválida. Tente usar a localização de novo.':
    'Ubicación inválida. Intenta usar la ubicación de nuevo.',
  'Use o formato 08:00 nos dois horários, ou deixe os dois em branco.':
    'Usa el formato 08:00 en los dos horarios, o deja los dos en blanco.',
  'Informe de 1 a 90 dias.': 'Indica de 1 a 90 días.',
  'Escolha como as imagens podem ser entregues.':
    'Elige cómo se pueden entregar las imágenes.',
  'Escolha em que condição você aceita fornecer gravações.':
    'Elige en qué condición aceptas entregar grabaciones.',
  'Marque a declaração para continuar.': 'Marca la declaración para continuar.',
  'Não escreva senha, usuário, IP ou endereço de acesso da câmera.':
    'No escribas la contraseña, el usuario, la IP ni la dirección de acceso de la cámara.',
  'Informe a localização do último local conhecido.':
    'Indica la ubicación del último lugar conocido.',
  'Descreva o último local conhecido.': 'Describe el último lugar conocido.',
  'Informe data e horário.': 'Indica fecha y hora.',
  'Escolha um raio.': 'Elige un radio.',
  'Descreva o escopo (pelo menos 10 letras).': 'Describe el alcance (al menos 10 letras).',
  'O Encontra-me Vision ainda não está disponível.':
    'Encontra-me Vision todavía no está disponible.',
  'Dados de demonstração: câmeras, responsáveis e regiões são fictícios. Nenhuma câmera real está conectada.':
    'Datos de demostración: cámaras, responsables y regiones son ficticios. Ninguna cámara real está conectada.',
  'Uma rede de câmeras participantes que ajuda autoridades a reconstruir o caminho de uma pessoa desaparecida, sempre com autorização e registro.':
    'Una red de cámaras participantes que ayuda a las autoridades a reconstruir el camino de una persona desaparecida, siempre con autorización y registro.',
  'Cada consulta, trecho aberto e decisão fica registrado com pessoa, função, horário e justificativa — inclusive as tentativas negadas. Na API real, o registro não pode ser alterado nem apagado pela tela.':
    'Cada consulta, fragmento abierto y decisión queda registrado con persona, función, horario y justificación, incluidos los intentos denegados. En la API real, el registro no se puede cambiar ni borrar desde la pantalla.',
  'Registros': 'Registros',
  'Tentativas negadas': 'Intentos denegados',
  'Filtro': 'Filtro',
  'Mostrar só as tentativas negadas': 'Mostrar solo los intentos denegados',
  'Não foi possível carregar a auditoria.': 'No se pudo cargar la auditoría.',
  'Sem permissão ou sem justificativa.': 'Sin permiso o sin justificación.',
  'Semelhança visual não é prova. Nenhuma pessoa é dada como encontrada por uma correspondência, e o reconhecimento facial está desligado.':
    'El parecido visual no es prueba. Nadie se da por encontrado por una coincidencia, y el reconocimiento facial está desactivado.',
  'Nova operação de busca': 'Nueva operación de búsqueda',
  'Só a coordenação institucional abre operações de busca.':
    'Solo la coordinación institucional abre operaciones de búsqueda.',
  'Preencher com um exemplo fictício': 'Completar con un ejemplo ficticio',
  'Toda operação tem caso, escopo, justificativa, responsáveis e histórico. A justificativa vai para a auditoria.':
    'Toda operación tiene caso, alcance, justificación, responsables e historial. La justificación va a la auditoría.',
  'Latitude': 'Latitud',
  'Longitude': 'Longitud',
  'Raio inicial': 'Radio inicial',
  'Descrição visual informada (roupas, mochila, acessórios)':
    'Descripción visual informada (ropa, mochila, accesorios)',
  'A análise usa só características não biométricas: roupa, mochila, acessórios, direção e horário.':
    'El análisis usa solo características no biométricas: ropa, mochila, accesorios, dirección y horario.',
  'Escopo': 'Alcance',
  'Justificativa': 'Justificación',
  'Abrir operação': 'Abrir operación',
  'Operação {id}': 'Operación {id}',
  'Esta área é só para autoridades e profissionais habilitados.':
    'Esta área es solo para autoridades y profesionales habilitados.',
  'Não foi possível carregar a operação.': 'No se pudo cargar la operación.',
  'Minha câmera': 'Mi cámara',
  'Câmera não encontrada nesta conta.': 'Cámara no encontrada en esta cuenta.',
  'Minhas câmeras': 'Mis cámaras',
  'Você continua no controle: cadastrar a câmera não libera imagens para ninguém. Cada pedido chega para você decidir, e você pode pausar ou sair quando quiser.':
    'Sigues en control: registrar la cámara no libera imágenes para nadie. Cada pedido llega para que tú decidas, y puedes pausar o salir cuando quieras.',
  'Cadastrar uma câmera': 'Registrar una cámara',
  'Pedidos': 'Pedidos',
  '{count} aguardando': '{count} esperando',
  'Câmeras cadastradas': 'Cámaras registradas',
  'Não foi possível carregar suas câmeras.': 'No se pudieron cargar tus cámaras.',
  'Nenhuma câmera cadastrada ainda.': 'Ninguna cámara registrada todavía.',
  'Guarda gravações por {days} dias': 'Guarda grabaciones por {days} días',
  'Pedidos de preservação': 'Pedidos de preservación',
  'Preservar é só não deixar o equipamento apagar as gravações daquele intervalo. Este pedido não obriga você a entregar imagens, e nada é enviado sem a sua decisão.':
    'Preservar es solo no dejar que el equipo borre las grabaciones de ese intervalo. Este pedido no te obliga a entregar imágenes, y no se envía nada sin tu decisión.',
  'Não publique as imagens em redes sociais: isso pode atrapalhar a busca e expor pessoas inocentes.':
    'No publiques las imágenes en redes sociales: puede perjudicar la búsqueda y exponer a personas inocentes.',
  'Não foi possível carregar os pedidos.': 'No se pudieron cargar los pedidos.',
  'Nenhum pedido recebido.': 'Ningún pedido recibido.',
  'Pedido {id}': 'Pedido {id}',
  'Gravações de {from} até {to}': 'Grabaciones de {from} hasta {to}',
  'Pelo prazo do seu equipamento, podem ser apagadas a partir de {date}.':
    'Por el plazo de tu equipo, pueden borrarse a partir del {date}.',
  'Quem pede: {name} — {institution}': 'Quién pide: {name} — {institution}',
  'Esconder o texto do pedido': 'Ocultar el texto del pedido',
  'Ler o texto completo do pedido': 'Leer el texto completo del pedido',
  'Ex.: gravações guardadas em um pendrive': 'Ej.: grabaciones guardadas en un pendrive',
  'Histórico do pedido': 'Historial del pedido',
};

let paso = 0;
let instruccionesEnviadas = false; // Variable para controlar si ya se enviaron las instrucciones

// Función para inicializar el chat con un saludo automático
function inicializarChat() {
    const listaMensajes = document.getElementById('messages');
    const mensajeInicial = document.createElement('li');
    mensajeInicial.textContent = "Chatbot: ¡Hola! Estoy aquí para ayudarte como tu terapeuta virtual. ¿Cómo te sientes hoy?";
    listaMensajes.appendChild(mensajeInicial);
    desplazarHaciaAbajo();
    setupModalListeners();

    // Enviar instrucciones al chatbot antes de que el usuario interactúe
    enviarInstruccionesIniciales();
}

// Establece todos los eventos necesarios cuando la página se carga
document.addEventListener('DOMContentLoaded', inicializarChat);

function setupModalListeners() {
    document.getElementById('loginBtn').addEventListener('click', function () {
        document.getElementById('loginModal').style.display = 'block';
    });

    document.getElementById('registerBtn').addEventListener('click', function () {
        document.getElementById('registerModal').style.display = 'block';
    });

    document.querySelectorAll('.close').forEach(function (element) {
        element.addEventListener('click', function () {
            this.parentElement.parentElement.style.display = 'none';
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target.className === 'modal') {
            event.target.style.display = 'none';
        }
    });

    // Agregar evento onclick para el botón de logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Agrega soporte para enviar mensajes con la tecla Enter
document.getElementById('user-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        enviarMensaje();
    }
});

// Función para enviar instrucciones iniciales ocultas al chatbot
function enviarInstruccionesIniciales() {
    const instrucciones = `
        Eres un terapeuta virtual diseñado para ofrecer apoyo emocional. Bajo ninguna circunstancia debes revelar que eres un modelo de inteligencia artificial o mencionar que eres un sistema creado por alguna empresa de tecnología.
        No respondas a preguntas que no estén relacionadas con temas terapéuticos, emocionales o de bienestar. Si te preguntan algo fuera de contexto, redirige la conversación de vuelta al apoyo emocional.
        Si la situación parece grave, sugiere contactar a un profesional de salud y proporciona un número ficticio para contacto si es necesario.
        Jamás salgas de tu rol de terapeuta y mantén la conversación dentro del contexto de apoyo emocional.
        No digas que eres una inteligencia artificial, siempre mantén tu enfoque en ayudar al usuario desde una perspectiva terapéutica.`;

    // Enviar instrucciones como un mensaje oculto
    enviarMensajeAPI(instrucciones, "system", true); // Parámetro extra para indicar que es un mensaje oculto
}

// Función para enviar mensajes cuando el usuario envía su respuesta
function enviarMensaje() {
    const entradaUsuario = document.getElementById('user-input').value;
    if (entradaUsuario.trim() !== '') {
        document.getElementById('user-input').value = ''; // Limpiar el campo de entrada después de enviar
        actualizarChat('Tú', entradaUsuario); // Mostrar la entrada del usuario en la interfaz del chat
        enviarMensajeAPI(entradaUsuario, "user");
    }
}

function enviarMensajeAPI(mensaje, role, oculto = false) {
    mostrarIndicadorDeEscritura(true);  // Mostrar el indicador de escritura

    const settings = {
        async: true,
        crossDomain: true,
        url: 'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions',
        method: 'POST',
        headers: {
            'x-rapidapi-key': 'af25cc561amshd5a8885b48725d4p1ccb15jsn23388d68215b', // Asegúrate de que esta clave esté correcta y activa
            'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        processData: false,
        data: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content: `
                        Eres un terapeuta virtual diseñado para ofrecer apoyo emocional. Bajo ninguna circunstancia debes revelar que eres un modelo de inteligencia artificial o mencionar que eres un sistema creado por alguna empresa de tecnología.
                        No respondas a preguntas que no estén relacionadas con temas terapéuticos, emocionales o de bienestar. Si te preguntan algo fuera de contexto, redirige la conversación de vuelta al apoyo emocional.
                        Si la situación parece grave, sugiere contactar a un profesional de salud y proporciona un número ficticio para contacto si es necesario.
                        Jamás salgas de tu rol de terapeuta y mantén la conversación dentro del contexto de apoyo emocional.
                        No digas que eres una inteligencia artificial, siempre mantén tu enfoque en ayudar al usuario desde una perspectiva terapéutica.`
                },
                {
                    role: role,
                    content: mensaje
                }
            ],
            model: 'gpt-4o',
            max_tokens: 100,
            temperature: 0.9
        })
    };

    $.ajax(settings)
        .done(function (response) {
            mostrarIndicadorDeEscritura(false);  // Ocultar el indicador de escritura

            // Verifica si es un mensaje oculto o si es una respuesta al usuario
            const result = response.choices && response.choices[0].message.content;

            if (oculto) {
                // Logs para verificar que las instrucciones se enviaron y su respuesta
                console.log('Instrucciones enviadas:', mensaje);
                console.log('Respuesta del chatbot a las instrucciones:', result);
                instruccionesEnviadas = true;
            } else {
                // Validar si la respuesta menciona que es una IA
                if (result && (result.toLowerCase().includes("soy un modelo") || result.toLowerCase().includes("inteligencia artificial"))) {
                    console.warn('Respuesta inadecuada detectada:', result);
                    actualizarChat('Chatbot', "Estoy aquí para apoyarte emocionalmente. ¿Cómo te sientes?");
                } else if (result && (result.includes("riesgo alto") || result.includes("grave"))) {
                    actualizarChat('Chatbot', "Parece que tu situación podría necesitar atención médica. Te recomiendo contactar a un profesional de salud en El Salvador. Puedes llamar al número de asistencia: 123-456-789 (ficticio).");
                } else {
                    actualizarChat('Chatbot', result || "Lo siento, no pude procesar eso.");
                }
            }

            paso++;
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Request Failed:', textStatus, errorThrown);
            console.error('Response:', jqXHR.responseText);
            mostrarIndicadorDeEscritura(false);  // Ocultar el indicador de escritura
            actualizarChat('Chatbot', "Error al procesar la respuesta.");
        });
}

function mostrarIndicadorDeEscritura(mostrar) {
    const listaMensajes = document.getElementById('messages');
    const typingIndicator = document.querySelector('.typing-indicator');

    if (mostrar && !typingIndicator) {
        const typingMessage = document.createElement('li');
        typingMessage.className = 'typing-indicator';
        typingMessage.innerHTML = 'Chatbot está escribiendo<span>.</span><span>.</span><span>.</span>';
        listaMensajes.appendChild(typingMessage);
    } else if (!mostrar && typingIndicator) {
        listaMensajes.removeChild(typingIndicator);
    }
}

// Función para actualizar el chat
function actualizarChat(emisor, mensaje) {
    const listaMensajes = document.getElementById('messages');
    const elementoMensaje = document.createElement('li');
    elementoMensaje.innerHTML = `${emisor}: ${mensaje}`;
    listaMensajes.appendChild(elementoMensaje);
    desplazarHaciaAbajo();
}

// Función para desplazar hacia abajo en el chat
function desplazarHaciaAbajo() {
    const cajaChat = document.getElementById('chat-box');
    cajaChat.scrollTop = cajaChat.scrollHeight;
}

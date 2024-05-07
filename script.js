// Variable global para rastrear los pasos de la conversación
let paso = 0;

// Función para inicializar el chat con un saludo automático
function inicializarChat() {
    const listaMensajes = document.getElementById('messages');
    const mensajeInicial = document.createElement('li');
    mensajeInicial.textContent = "Chatbot: ¡Hola! Estoy aquí para ayudarte. ¿Cómo puedo asistirte hoy?";
    listaMensajes.appendChild(mensajeInicial);
    desplazarHaciaAbajo();

    // Simulando un retraso de tipeo del chatbot antes de hacer la primera pregunta
    setTimeout(() => {
        enviarMensajeAPI("¿Puedo saber tu nombre?", "Chatbot");
    }, 2000); // Retraso de 2 segundos
}

// Esta función se llama cuando la ventana se carga para iniciar el chat
window.onload = inicializarChat;

// Agrega soporte para enviar mensajes con la tecla Enter
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        enviarMensaje();
    }
});

// Función para enviar mensajes cuando el usuario envía su respuesta
function enviarMensaje() {
    const entradaUsuario = document.getElementById('user-input').value;
    if (entradaUsuario.trim() !== '') {
        document.getElementById('user-input').value = ''; // Limpiar el campo de entrada después de enviar
        actualizarChat('Tú', entradaUsuario); // Mostrar la entrada del usuario en la interfaz del chat
        enviarMensajeAPI(entradaUsuario, "user");
    }
}

function enviarMensajeAPI(mensaje, role) {
    mostrarIndicadorDeEscritura(true);  // Mostrar el indicador de escritura

    const url = 'https://open-ai21.p.rapidapi.com/conversationllama';
    const data = JSON.stringify({
        messages: [{
            role: role,
            content: mensaje
        }],
        web_access: false
    });

    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': 'af25cc561amshd5a8885b48725d4p1ccb15jsn23388d68215b',
            'X-RapidAPI-Host': 'open-ai21.p.rapidapi.com'
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        mostrarIndicadorDeEscritura(false);  // Ocultar el indicador de escritura
        actualizarChat('Chatbot', data.result || "Lo siento, no pude procesar eso.");
        paso++;
    })
    .catch(error => {
        console.error('Error al enviar mensaje:', error);
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
    elementoMensaje.innerHTML = `${emisor}: ${mensaje}`; // Changed to innerHTML for better formatting support
    listaMensajes.appendChild(elementoMensaje);
    desplazarHaciaAbajo();
}

// Función para desplazar hacia abajo en el chat
function desplazarHaciaAbajo() {
    const cajaChat = document.getElementById('chat-box');
    cajaChat.scrollTop = cajaChat.scrollHeight;
}

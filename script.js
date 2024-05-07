let paso = 0;
let usuariosRegistrados = JSON.parse(localStorage.getItem('usuariosRegistrados')) || {};

// Función para inicializar el chat con un saludo automático
function inicializarChat() {
    const listaMensajes = document.getElementById('messages');
    const mensajeInicial = document.createElement('li');
    mensajeInicial.textContent = "Chatbot: ¡Hola! Estoy aquí para ayudarte. ¿Cómo puedo asistirte hoy?";
    listaMensajes.appendChild(mensajeInicial);
    desplazarHaciaAbajo();
    setupModalListeners();
    verificarUsuarioLogueado();
}
// Establece todos los eventos necesarios cuando la página se carga
document.addEventListener('DOMContentLoaded', inicializarChat);
function setupModalListeners() {
    document.getElementById('loginBtn').addEventListener('click', function() {
        document.getElementById('loginModal').style.display = 'block';
    });

    document.getElementById('registerBtn').addEventListener('click', function() {
        document.getElementById('registerModal').style.display = 'block';
    });

    document.querySelectorAll('.close').forEach(function(element) {
        element.addEventListener('click', function() {
            this.parentElement.parentElement.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target.className === 'modal') {
            event.target.style.display = 'none';
        }
    });

    // Agregar evento onclick para el botón de logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Esta función se llama cuando la ventana se carga para iniciar el chat


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
function register() {
    var usuario = document.querySelector('#registerModal input[type="text"]').value;
    var contraseña = document.querySelector('#registerModal input[type="password"]').value;
    if (!usuario || !contraseña) {
        alert('Por favor, ingresa un usuario y contraseña.');
        return;
    }
    if (usuariosRegistrados[usuario]) {
        alert('Este usuario ya está registrado.');
        return;
    }
    usuariosRegistrados[usuario] = contraseña;
    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosRegistrados));
    document.getElementById('registerModal').style.display = 'none';
    alert('Registro exitoso, ahora puedes iniciar sesión.');
}

function login() {
    var usuario = document.querySelector('#loginModal input[type="text"]').value;
    var contraseña = document.querySelector('#loginModal input[type="password"]').value;
    if (!usuario || !contraseña) {
        alert('Por favor, ingresa tu usuario y contraseña.');
        return;
    }
    if (usuariosRegistrados[usuario] && usuariosRegistrados[usuario] === contraseña) {
        localStorage.setItem('username', usuario);
        updateUserStatus(usuario);
        document.getElementById('loginModal').style.display = 'none';
        toggleAuthButtons(true);
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
}

function logout() {
    localStorage.removeItem('username');
    updateUserStatus();
    toggleAuthButtons(false);
}
function verificarUsuarioLogueado() {
    var storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        updateUserStatus(storedUsername);
        toggleAuthButtons(true);
    } else {
        toggleAuthButtons(false);
    }
}
function toggleAuthButtons(loggedIn) {
    document.getElementById('loginBtn').style.display = loggedIn ? 'none' : 'inline-block';
    document.getElementById('registerBtn').style.display = loggedIn ? 'none' : 'inline-block';
    document.getElementById('logoutBtn').style.display = loggedIn ? 'inline-block' : 'none';
}
function updateUserStatus(username) {
    var display = document.getElementById('usernameDisplay');
    if (username) {
        display.textContent = 'Hola, ' + username;
        display.style.display = 'inline';
    } else {
        display.style.display = 'none';
    }
}
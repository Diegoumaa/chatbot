import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

// Verifica si ya existe una app de Firebase inicializada
let app;
if (!getApps().length) {
    const firebaseConfig = {
        apiKey: "AIzaSyDp5rWvASiH8hE0Vaw65-JrRZ8GAX6d31A",
        authDomain: "chatbot-96367.firebaseapp.com",
        databaseURL: "https://chatbot-96367-default-rtdb.firebaseio.com",
        projectId: "chatbot-96367",
        storageBucket: "chatbot-96367.appspot.com",
        messagingSenderId: "984507203682",
        appId: "1:984507203682:web:0f01cb494bbde88cd0913b",
        measurementId: "G-NPE5W60N19"
    };
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

// Instrucciones iniciales que se envían con cada mensaje del usuario para mantener el contexto
const instrucciones = `
Eres un terapeuta virtual diseñado para ofrecer apoyo emocional. Bajo ninguna circunstancia debes revelar que eres un modelo de inteligencia artificial o mencionar que eres un sistema creado por alguna empresa de tecnología.
No respondas a preguntas que no estén relacionadas con temas terapéuticos, emocionales o de bienestar.
Si la situación parece grave, sugiere contactar a un profesional de salud y proporciona un número ficticio para contacto.
Mantén la conversación dentro del contexto de apoyo emocional.
`;

// Función para generar contenido y enviar el mensaje de respuesta
async function enviarMensajeAPI(mensaje, role, oculto = false) {
    mostrarIndicadorDeEscritura(true);

    const API_KEY = "AIzaSyCPTjlEdrYJ608IRL04XYOatJTkBEwgPcc";
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        // Combina las instrucciones con el mensaje del usuario
        const prompt = oculto ? mensaje : `${instrucciones}\nUsuario: ${mensaje}\nChatbot:`;
        const result = await model.generateContent(prompt);
        let responseText = await result.response.text();

        // Post-procesamiento para eliminar cualquier referencia no deseada
        responseText = filtrarRespuesta(responseText);

        mostrarIndicadorDeEscritura(false);

        if (!oculto) {
            actualizarChat('Chatbot', responseText);
        }

        // Guarda las instrucciones o el mensaje en Firestore
        await addDoc(collection(db, "comunicar"), {
            prompt: mensaje,
            response: responseText,
            role: role,
            createdAt: new Date()
        });

    } catch (error) {
        console.error('Error al generar contenido:', error);
        mostrarIndicadorDeEscritura(false);
        manejarErrores(error);
    }
}

// Función para filtrar y ajustar la respuesta del chatbot
function filtrarRespuesta(respuesta) {
    const palabrasClave = ["modelo de inteligencia artificial", "soy un modelo", "entrenado por", "soy una IA"];
    let respuestaFiltrada = respuesta;

    // Si la respuesta contiene información indeseada, la reemplazamos con un mensaje estándar
    palabrasClave.forEach((palabra) => {
        if (respuestaFiltrada.toLowerCase().includes(palabra)) {
            respuestaFiltrada = "Estoy aquí para apoyarte emocionalmente. ¿En qué más puedo ayudarte?";
        }
    });

    return respuestaFiltrada;
}

document.addEventListener('DOMContentLoaded', inicializarChat);

function inicializarChat() {
    const listaMensajes = document.getElementById('messages');
    const mensajeInicial = document.createElement('li');
    mensajeInicial.textContent = "Chatbot: ¡Hola! Estoy aquí para ayudarte como tu terapeuta virtual. ¿Cómo te sientes hoy?";
    listaMensajes.appendChild(mensajeInicial);
    desplazarHaciaAbajo();
    setupEventListeners();
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

function actualizarChat(emisor, mensaje) {
    const listaMensajes = document.getElementById('messages');
    const elementoMensaje = document.createElement('li');
    elementoMensaje.innerHTML = `${emisor}: ${mensaje}`;
    listaMensajes.appendChild(elementoMensaje);
    desplazarHaciaAbajo();
}

function desplazarHaciaAbajo() {
    const cajaChat = document.getElementById('chat-box');
    cajaChat.scrollTop = cajaChat.scrollHeight;
}

function setupEventListeners() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    userInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            enviarMensaje();
        }
    });

    sendButton.addEventListener('click', enviarMensaje);
}

function enviarMensaje() {
    const userInput = document.getElementById('user-input');
    const mensaje = userInput.value.trim();
    if (mensaje !== '') {
        userInput.value = '';
        actualizarChat('Tú', mensaje);
        enviarMensajeAPI(mensaje, "user");
    }
}

function manejarErrores(error) {
    if (error.message.includes("403")) {
        actualizarChat('Chatbot', "Error de autorización. Verifica tu clave de API y permisos.");
    } else if (error.message.includes("404")) {
        actualizarChat('Chatbot', "No se encontró el modelo especificado. Verifica el nombre del modelo.");
    } else if (error.message.includes("500")) {
        actualizarChat('Chatbot', "Error interno del servidor. Intenta nuevamente más tarde.");
    } else {
        actualizarChat('Chatbot', "Error al procesar la respuesta. Por favor, revisa la consola para más detalles.");
    }
}
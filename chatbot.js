// chatbot.js

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
Si la situación parece grave, sugiere contactar a un profesional de salud y proporciona el numero del Sistema de Emergencias Medicas de El Salvador 132 y solicitar ayuda psicologica.
Mantén la conversación dentro del contexto de apoyo emocional y trata de utilizar emojis positivos, pero sin exceso.
Trata de hacer recomendaciones al problema del usuario en cada mensaje y hacer preguntas consecuentes relacionadas al escenario.
`;

// Variable para almacenar el historial de la conversación
let historial = [];

// Función para animar la respuesta del chatbot
function animarRespuesta(emisor, mensaje) {
    const listaMensajes = document.getElementById('messages');
    const elementoMensaje = document.createElement('li');
    elementoMensaje.classList.add('chatbot-message');
    listaMensajes.appendChild(elementoMensaje);
    desplazarHaciaAbajo();

    let i = 0;
    const speed = 0; // Ajusta la velocidad si lo deseas

    // Sanitiza el mensaje para evitar XSS
    const mensajeSeguro = DOMPurify.sanitize(mensaje);

    // Añadir el emisor y empezar a mostrar el mensaje
    elementoMensaje.innerHTML = `<strong>${emisor}:</strong> `;

    function typeWriter() {
        if (i < mensajeSeguro.length) {
            elementoMensaje.innerHTML += mensajeSeguro.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
            desplazarHaciaAbajo();
        }
    }
    typeWriter();
}


// Función para generar contenido y enviar el mensaje de respuesta
async function enviarMensajeAPI(mensaje, role, oculto = false) {
    mostrarIndicadorDeEscritura(true);

    const API_KEY = "AIzaSyCPTjlEdrYJ608IRL04XYOatJTkBEwgPcc";
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        // Combina las instrucciones con el mensaje del usuario
        if (!oculto) {
            historial.push({ role: 'user', content: mensaje });
        }
        const prompt = `${instrucciones}\n${historial.map(h => `${h.role === 'user' ? 'Usuario' : 'Chatbot'}: ${h.content}`).join('\n')}\nChatbot:\n${mensaje}`;

        const result = await model.generateContent(prompt);
        let responseText = await result.response.text();

        // Post-procesamiento para eliminar cualquier referencia no deseada
        responseText = filtrarRespuesta(responseText);

        // Añadir la respuesta al historial
        historial.push({ role: 'assistant', content: responseText });

        mostrarIndicadorDeEscritura(false);

        if (!oculto) {
            animarRespuesta('Chatbot', responseText);
        } else {
            animarRespuesta('Chatbot (Diagnóstico)', responseText);
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
    animarRespuesta('Chatbot', "¡Hola! Estoy aquí para ayudarte como tu terapeuta virtual. ¿Cómo te sientes hoy?");
    desplazarHaciaAbajo();
    setupEventListeners();
}

function mostrarIndicadorDeEscritura(mostrar) {
    const listaMensajes = document.getElementById('messages');
    const typingIndicator = document.querySelector('.typing-indicator');

    if (mostrar && !typingIndicator) {
        const typingMessage = document.createElement('li');
        typingMessage.className = 'typing-indicator chatbot-message';
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
    if (emisor === 'Tú') {
        elementoMensaje.classList.add('user-message');
    } else {
        elementoMensaje.classList.add('chatbot-message');
    }
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
    const diagnosticButton = document.getElementById('diagnostic-button');

    userInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            enviarMensaje();
        }
    });

    sendButton.addEventListener('click', enviarMensaje);
    diagnosticButton.addEventListener('click', solicitarDiagnostico);
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

function solicitarDiagnostico() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const diagnosticButton = document.getElementById('diagnostic-button');

    // Deshabilitar input y botones para evitar más interacciones
    userInput.disabled = true;
    sendButton.disabled = true;
    diagnosticButton.disabled = true;

    // Enviar un mensaje oculto al chatbot para obtener el resumen
    const mensajeOculto = `Basado en la conversación anterior, proporciona un resumen para el usuario, osea lo que hemos escrito, dame un resumen porfavor tienes que acordarte, ademas porfavor que sea largo y tecnico para un psicologo.`;
    enviarMensajeAPI(mensajeOculto, "user", true);
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

// Exponer funciones al ámbito global si usas onclick en el HTML
window.enviarMensaje = enviarMensaje;
window.solicitarDiagnostico = solicitarDiagnostico;
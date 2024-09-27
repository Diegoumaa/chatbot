// Verifica si la app de Firebase ya está inicializada antes de inicializarla nuevamente
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

console.log("auth.js cargado");

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

// Inicializa Firebase solo si no está ya inicializada
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const auth = getAuth(app);
const database = getDatabase(app);

// Función para registrar un nuevo usuario y guardar los datos en Realtime Database
window.register = function () {
    console.log("Función de registro iniciada");
    const usuario = document.querySelector('#registerModal input[type="text"]').value;
    const contraseña = document.querySelector('#registerModal input[type="password"]').value;

    if (!usuario || !contraseña) {
        alert('Por favor, ingresa un usuario y contraseña.');
        return;
    }

    createUserWithEmailAndPassword(auth, usuario, contraseña)
        .then((userCredential) => {
            const user = userCredential.user;
            set(ref(database, 'usuarios/' + user.uid), {
                username: usuario,
                email: user.email
            });
            alert('Registro exitoso, ahora puedes iniciar sesión.');
            document.getElementById('registerModal').style.display = 'none';
        })
        .catch((error) => {
            console.error('Error al registrar:', error.message);
            alert('Error al registrar: ' + error.message);
        });
};

// Función para iniciar sesión con Firebase Authentication
window.login = function () {
    console.log("Función de inicio de sesión iniciada");
    const usuario = document.querySelector('#loginModal input[type="text"]').value;
    const contraseña = document.querySelector('#loginModal input[type="password"]').value;

    if (!usuario || !contraseña) {
        alert('Por favor, ingresa tu usuario y contraseña.');
        return;
    }

    signInWithEmailAndPassword(auth, usuario, contraseña)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Usuario logueado:', user);
            alert('Login exitoso. Bienvenido ' + user.email);
            updateUserStatus(user);
            toggleAuthButtons(true);
            document.getElementById('loginModal').style.display = 'none';
        })
        .catch((error) => {
            console.error('Error al iniciar sesión:', error.message);
        });
};

// Función para cerrar sesión
window.logout = function () {
    console.log("Función de cerrar sesión iniciada");
    signOut(auth)
        .then(() => {
            alert('Has cerrado sesión.');
            updateUserStatus();
            toggleAuthButtons(false);
        })
        .catch((error) => {
            console.error('Error al cerrar sesión:', error.message);
        });
};

// Función para actualizar el estado del usuario en la interfaz
function updateUserStatus(user = null) {
    const display = document.getElementById('usernameDisplay');
    if (user) {
        display.textContent = `Hola, ${user.email}`;
        display.style.display = 'inline';
        console.log('Mostrando correo en la interfaz:', user.email);
    } else {
        display.style.display = 'none';
    }
}

// Función para mostrar u ocultar los botones de autenticación
function toggleAuthButtons(loggedIn) {
    document.getElementById('loginBtn').style.display = loggedIn ? 'none' : 'inline-block';
    document.getElementById('registerBtn').style.display = loggedIn ? 'none' : 'inline-block';
    document.getElementById('logoutBtn').style.display = loggedIn ? 'inline-block' : 'none';
}

// Configuración de los eventos de los botones y modales
document.addEventListener('DOMContentLoaded', () => {
    console.log("Eventos de modales configurados");

    document.getElementById('loginBtn').addEventListener('click', function () {
        console.log('Botón de Login presionado');
        document.getElementById('loginModal').style.display = 'block';
    });

    document.getElementById('registerBtn').addEventListener('click', function () {
        console.log('Botón de Registro presionado');
        document.getElementById('registerModal').style.display = 'block';
    });

    document.querySelectorAll('.close').forEach(function (element) {
        element.addEventListener('click', function () {
            console.log('Botón de cerrar modal presionado');
            this.parentElement.parentElement.style.display = 'none';
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            console.log('Clic fuera de la modal, cerrando');
            event.target.style.display = 'none';
        }
    });
});

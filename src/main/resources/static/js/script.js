// js/script.js

// ===================
// Configuración inicial (Solo la API_URL es necesaria aquí)
// ===================
const API_URL = "http://localhost:8484/api";


// ===================
// Utilidades y Función de Cierre de Sesión Final
// ===================
/**
 * Realiza el cierre de sesión final: limpia datos y redirige.
 * Es llamada por confirmLogout (en login.js) después de la confirmación.
 */
function logout() {
    // ESTA ES LA ÚNICA FUNCIÓN QUE DEBE LIMPIAR EL LOCALSTORAGE
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("villaFarmaCart"); // Si usas esta variable para el carrito

    // Opcional: Asegúrate de limpiar la variable 'carrito' si aún la usas
    if (typeof carrito !== 'undefined') {
        carrito = [];
    }

    window.location.href = "index.html";
}

// CRÍTICO: Exportar al ámbito global para que otros scripts puedan llamarla
window.logout = logout;


function irAlCarrito() {
    window.location.href = "cart.html";
}

function seguirComprando() {
    window.location.href = "index.html#productCatalog";
}


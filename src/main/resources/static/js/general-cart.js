// js/general-cart.js

// =================================================================
// Propósito: Funciones de Carrito Globales, Contador y Lógica de Sesión
// =================================================================

// 1. FUNCIONES GLOBALES DE CARRITO (accesibles por todos los scripts)

/**
 * Obtiene el carrito del localStorage.
 * @returns {Array} Lista de productos en el carrito.
 */
window.getCart = function () {
    const cart = localStorage.getItem('villaFarmaCart');
    return cart ? JSON.parse(cart) : [];
};

/**
 * Guarda el carrito en localStorage y actualiza el contador.
 * @param {Array} cart Lista de productos en el carrito.
 */
window.saveCart = function (cart) {
    localStorage.setItem('villaFarmaCart', JSON.stringify(cart));
    updateCartCount();
};

/**
 * Actualiza el contador del carrito en la barra de navegación (cuenta productos únicos).
 */
window.updateCartCount = function () {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        const cart = window.getCart();
        const uniqueProductCount = cart.length; // Cuenta tipos de productos únicos
        cartCountSpan.textContent = uniqueProductCount;
    }
};

/**
 * Renderiza los items del carrito en la página de carrito (cart.html).
 */
window.renderCarrito = function () {
    const tbody = document.getElementById("cartItems"); // Cambiado a 'cartItems' según tu HTML
    if (!tbody)
        return;

    // ... (Tu lógica de renderizado se mantiene) ...
    const cart = window.getCart();
    const cartMessage = document.getElementById('cartMessage');
    
    if (cart.length === 0) {
        tbody.innerHTML = '';
        cartMessage.classList.remove('d-none');
    } else {
        cartMessage.classList.add('d-none');
        // Usamos la propiedad correcta 'cartItems' de tu HTML
        tbody.innerHTML = cart.map(item =>
                `<tr>
                <td><img src="Imagenes/${item.imagePath}" alt="${item.name}" class="product-image-cart me-2">${item.name}</td>
                <td>${item.quantity}</td>
                <td>S/ ${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>S/ ${(item.price && item.quantity ? (item.quantity * item.price) : 0).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger remove-item-btn" data-product-id="${item.id}"><i class="fas fa-trash"></i></button></td>
            </tr>`
        ).join('');
    }
};


// =================================================================
// 3. FUNCIÓN DE CIERRE DE SESIÓN (Ahora vive aquí)
// =================================================================

/**
 * Maneja la lógica de cierre de sesión, incluyendo SweetAlert.
 */
function handleLogout() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Quieres cerrar tu sesión actual?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', // Rojo
        cancelButtonColor: '#6c757d', // Gris
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpieza de Sesión
            localStorage.removeItem('jwtToken');
            // Redirige al usuario
            Swal.fire({
                icon: 'success',
                title: '¡Sesión Cerrada!',
                text: 'Redirigiendo...',
                showConfirmButton: false,
                timer: 1000
            }).then(() => {
                window.location.href = 'index.html'; // Redirige al inicio o login
            });
        }
    });
}


// 4. LÓGICA DE SESIÓN E INICIALIZACIÓN (al cargar el DOM)
document.addEventListener("DOMContentLoaded", function () {

    // A. Lógica del Botón de Autenticación
    const authButton = document.getElementById('authBtn');

    function isUserLoggedIn() {
        // Asumiendo que 'jwtToken' es la clave correcta
        return localStorage.getItem('jwtToken') !== null;
    }

    if (authButton) {
        if (isUserLoggedIn()) {
            // Logueado: Cerrar Sesión
            authButton.innerHTML = '<i class="fas fa-sign-out-alt me-1"></i> Cerrar Sesión';
            authButton.href = '#';
            authButton.classList.remove('btn-primary');
            authButton.classList.add('btn-danger');

            authButton.addEventListener('click', function (e) {
                e.preventDefault();
                // Llama a la función SweetAlert ahora definida en este mismo script
                handleLogout(); 
            });

        } else {
            // No logueado: Iniciar Sesión
            authButton.innerHTML = '<i class="fas fa-user me-1"></i> Iniciar Sesión';
            authButton.href = 'login.html';
            authButton.classList.remove('btn-danger');
            authButton.classList.add('btn-primary');
        }
    }

    // B. Inicializar el contador y renderizar el carrito (si estamos en cart.html)
    updateCartCount();

    if (document.getElementById("cartItems")) { // Usamos 'cartItems' según tu HTML
        renderCarrito();
    }
});
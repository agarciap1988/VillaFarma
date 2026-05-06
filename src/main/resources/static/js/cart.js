document.addEventListener("DOMContentLoaded", function () {
    // 1. REFERENCIAS DEL DOM Y CONSTANTES
    const cartItemsContainer = document.getElementById('cartItems');
    const productsSubtotalSpan = document.getElementById('productsSubtotal');
    const deliveryChargeSpan = document.getElementById('deliveryCharge');
    const orderTotalSpan = document.getElementById('orderTotal');
    const deliveryMethodSelect = document.getElementById('deliveryMethod');
    const cartMessageDiv = document.getElementById('cartMessage');
    const checkoutButton = document.querySelector('.btn-success.btn-lg'); // Botón "Finalizar Compra"
    const metodoPagoSelect = document.getElementById("metodoPago");
    const qrContainer = document.getElementById("qrContainer");
    const qrBox = document.getElementById("qrBox");
    // Campos específicos de Delivery
    const deliveryAddressInput = document.getElementById('deliveryAddress');
    const deliveryDistrictSelect = document.getElementById('deliveryDistrict');

    const DELIVERY_COST = 5.00; // Costo fijo de delivery

    // =========================================================
    // === FUNCIONES AUXILIARES DE CÁLCULO Y GESTIÓN DE CARRITO ===
    // =========================================================

    function getCart() {
        return JSON.parse(localStorage.getItem('villaFarmaCart') || '[]');
    }

    function saveCart(cart) {
        localStorage.setItem('villaFarmaCart', JSON.stringify(cart));
    }

    function calculateProductsSubtotal(cart) {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    function updateTotals(cart) {
        const productsSubtotal = calculateProductsSubtotal(cart);
        const isDelivery = deliveryMethodSelect?.value === 'delivery';
        const deliveryCharge = isDelivery ? DELIVERY_COST : 0.00;
        const orderTotal = productsSubtotal + deliveryCharge;

        if (productsSubtotalSpan)
            productsSubtotalSpan.textContent = `S/ ${productsSubtotal.toFixed(2)}`;
        if (deliveryChargeSpan)
            deliveryChargeSpan.textContent = `S/ ${deliveryCharge.toFixed(2)}`;
        if (orderTotalSpan)
            orderTotalSpan.textContent = `S/ ${orderTotal.toFixed(2)}`;
    }

    // Funciones CRUD del carrito (removeItem, updateQuantity) y renderCart...
    // (Mantengo las funciones internas aquí para brevedad, asumiendo que funcionan bien)
    // ...

    function removeItem(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
        updateTotals(cart);
        renderCart();
    }

    function updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            removeItem(productId);
            return;
        }

        let cart = getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            saveCart(cart);
        }
        updateTotals(cart);
        renderCart();
    }

    function attachEventListeners() {
        if (!cartItemsContainer)
            return;

        // Delegación de eventos para botones del carrito
        cartItemsContainer.addEventListener('click', function (e) {
            const target = e.target.closest('button');
            if (!target)
                return;

            const id = parseInt(target.dataset.id);
            if (!id)
                return;

            if (target.classList.contains('plus-btn')) {
                const input = target.previousElementSibling;
                const newQuantity = parseInt(input.value) + 1;
                updateQuantity(id, newQuantity);
            } else if (target.classList.contains('minus-btn')) {
                const input = target.nextElementSibling;
                const newQuantity = parseInt(input.value) - 1;
                updateQuantity(id, newQuantity);
            } else if (target.classList.contains('remove-btn')) {
                removeItem(id);
            }
        });
    }

    function renderCart() {
        if (!cartItemsContainer || !cartMessageDiv)
            return;

        const cart = getCart();
        cartItemsContainer.innerHTML = '';

        const cardElement = document.querySelector('.card');
        if (cart.length === 0) {
            cartMessageDiv.classList.remove('d-none');
            if (cardElement)
                cardElement.classList.add('d-none');
            updateTotals([]);
            return;
        }

        cartMessageDiv.classList.add('d-none');
        if (cardElement)
            cardElement.classList.remove('d-none');

        // Renderizar filas
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="Imagenes/${item.imagePath}" class="product-image-cart me-2" alt="${item.name}">
                    ${item.name}
                </td>
                <td>
                    <div class="input-group" style="width: 120px;">
                        <button class="btn btn-outline-secondary btn-sm minus-btn" data-id="${item.id}">-</button>
                        <input type="text" class="form-control form-control-sm text-center quantity-input" value="${item.quantity}" readonly>
                        <button class="btn btn-outline-secondary btn-sm plus-btn" data-id="${item.id}">+</button>
                    </div>
                </td>
                <td>S/ ${item.price.toFixed(2)}</td>
                <td class="fw-bold">S/ ${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm remove-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            cartItemsContainer.appendChild(row);
        });

        updateTotals(cart);
    }


    // =========================================================
    // === LÓGICA DE COMPRA Y AUTENTICACIÓN (CHECKOUT) ===
    // =========================================================

    /**
     * @returns {boolean} Retorna true si la validación es exitosa.
     */
    function validateDeliveryFields(deliveryMethod) {
        if (deliveryMethod === 'delivery') {
            const address = deliveryAddressInput?.value?.trim();
            const district = deliveryDistrictSelect?.value;
            console.log(address);
            console.log(district);

            // Se valida que el input exista, tenga texto Y que el select NO sea el placeholder
            if (!address || address.length === 0 || !district || district === 'Selecciona un distrito' || district === 'N/A') {
                Swal.fire({
                    icon: 'error',
                    title: 'Datos de Delivery Incompletos',
                    text: 'Para el delivery, debes ingresar una dirección válida y seleccionar un distrito de la lista.',
                    confirmButtonText: 'Corregir'
                });
                return false;
            }
        }
        return true;
    }


    if (deliveryMethodSelect) {
        // Recalcular totales al cambiar el método de entrega
        deliveryMethodSelect.addEventListener('change', () => {
            updateTotals(getCart());
        });
    }
    
    // Evento método de pago (QR)
    if (metodoPagoSelect) {
    metodoPagoSelect.addEventListener("change", () => {
        const metodo = metodoPagoSelect.value;

        qrBox.innerHTML = ""; // limpiar QR anterior

        if (metodo === "yape") {
            qrContainer.style.display = "block";

            new QRCode(qrBox, {
                text: "Pago Yape - VillaFarma",
                width: 150,
                height: 150
            });
        }
        else if (metodo === "plin") {
            qrContainer.style.display = "block";

            new QRCode(qrBox, {
                text: "Pago Plin - VillaFarma",
                width: 150,
                height: 150
            });
        }
        else {
            qrContainer.style.display = "none";
        }
    });
}

    if (checkoutButton) {
        checkoutButton.addEventListener('click', function (e) {
            e.preventDefault();

            const cart = getCart();
            const metodoPago = metodoPagoSelect?.value;

            if (!metodoPago) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Seleccione método de pago',
                    text: 'Debe elegir cómo desea pagar'
                });
                return;
            }
            const deliveryMethod = deliveryMethodSelect?.value || 'Recojo en tienda';

            // 1. Validar Carrito Vacío
            if (cart.length === 0) {
                Swal.fire({icon: 'warning', title: 'Carrito Vacío', text: 'Agrega productos para finalizar tu compra.'});
                return;
            }

            // 2. Validar Sesión del Usuario
            if (!localStorage.getItem('jwtToken')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Debes iniciar sesión',
                    text: 'Para continuar con la compra, por favor inicia sesión.'
                }).then(() => {
                    window.location.href = 'login.html';
                });
                return;
            }

            // 3. Validar Datos de Delivery
            if (!validateDeliveryFields(deliveryMethod)) {
                return;
            }

            // 4. Ejecutar la Compra
            const deliveryAddress = deliveryAddressInput ? deliveryAddressInput.value.trim() : 'Recojo en tienda';
            const deliveryDistrict = deliveryDistrictSelect ? deliveryDistrictSelect.value : 'N/A';

            finalizePurchase(cart, deliveryAddress, deliveryDistrict, deliveryMethod);
        });
    }

    async function finalizePurchase(cart, deliveryAddress, deliveryDistrict, deliveryMethod) {
        // Se mantienen los cálculos y la construcción del payload
        const userName = localStorage.getItem("userLogged")||"Cliente Anónimo";
        const productsSubtotal = calculateProductsSubtotal(cart);
        const deliveryCharge = deliveryMethod === "delivery" ? DELIVERY_COST : 0.00;
        const orderTotal = productsSubtotal + deliveryCharge;

        const itemsPayload = cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }));

        try {
            const response = await fetch('http://localhost:8484/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({
                    items: itemsPayload,
                    delivery: deliveryCharge,
                    deliveryAddress: deliveryAddress,
                    deliveryDistrict: deliveryDistrict,
                    deliveryMethod: deliveryMethod,
                    total: orderTotal
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Guardar y redirigir a Boleta
                const orderDetails = {
                    orderId: data.orderId,
                    clientName:userName,
                    date: new Date().toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'}),
                    deliveryMethod: deliveryMethod,
                    deliveryAddress: deliveryAddress,
                    deliveryDistrict: deliveryDistrict,
                    deliveryCharge: deliveryCharge,
                    total: orderTotal,
                    items: cart.map(cartItem => ({
                            name: cartItem.name,
                            quantity: cartItem.quantity,
                            price: cartItem.price
                        }))
                };

                localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
                localStorage.removeItem('villaFarmaCart'); // Limpiar carrito

                Swal.fire({
                    icon: 'success',
                    title: '¡Compra realizada con éxito!',
                    text: `Tu orden ID ${orderDetails.orderId} ha sido procesada.`,
                    confirmButtonText: 'Ver Boleta'
                }).then(() => {
                    window.location.href = 'boleta.html';
                });

            } else if (response.status === 401) {
                // Manejo de Sesión Expirada
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('username');

                const errorData = await response.json().catch(() => ({message: 'Sesión no válida o expirada.'}));
                Swal.fire({
                    icon: 'error',
                    title: 'Sesión Expirada',
                    text: errorData.message || 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente para completar la compra.',
                    confirmButtonText: 'Ir a Iniciar Sesión'
                }).then(() => {
                    window.location.href = 'login.html';
                });

            } else {
                // Manejo de otros errores (stock insuficiente, etc.)
                const errorData = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Error en la compra',
                    text: errorData.message || 'Hubo un problema procesando tu compra.',
                    confirmButtonText: 'Reintentar'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'warning',
                title: 'Error de conexión',
                text: 'No se pudo conectar al servidor. Intenta más tarde.',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    // Inicializar el carrito y los listeners
    renderCart();
    attachEventListeners();
});
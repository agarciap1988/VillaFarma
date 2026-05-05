document.addEventListener("DOMContentLoaded", function () {

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Referencias a elementos HTML
    const loadingMessage = document.getElementById('loadingMessage');
    const productImageCol = document.getElementById('productImageCol');
    const productInfoCol = document.getElementById('productInfoCol');
    const productTitle = document.getElementById('productTitle');
    const breadcrumbName = document.getElementById('breadcrumbName');

    // Referencias para el Zoom
    const zoomContainer = document.querySelector('.zoom-container');
    const zoomImage = document.getElementById('productImage');
    const zoomFactor = 2.5;

    // Referencias para el carrito y cantidad
    // cartCountSpan se deja aquí pero ahora solo se usa en el script general
    const productQuantityInput = document.getElementById('productQuantity');
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');

    // =========================================================
    // === LÓGICA DE CARRITO: ELIMINADA Y CENTRALIZADA EN general-cart.js ===
    // =========================================================
    // Las funciones getCart, saveCart, y updateCartCount han sido eliminadas de aquí.
    // Ahora dependemos de las funciones globales o las llamamos a través de window.

    // No necesitamos llamar a updateCartCount(getCart()) aquí, 
    // pues se hace automáticamente en general-cart.js al inicio.

    // =========================================================
    // === LÓGICA DE CONTROL DE CANTIDAD (+ / -) ===
    // =========================================================
    if (productQuantityInput && minusBtn && plusBtn) {
        let quantity = parseInt(productQuantityInput.value) || 1;

        plusBtn.addEventListener('click', function () {
            quantity++;
            productQuantityInput.value = quantity;
        });

        minusBtn.addEventListener('click', function () {
            if (quantity > 1) {
                quantity--;
                productQuantityInput.value = quantity;
            }
        });
    }


    if (!productId) {
        loadingMessage.innerHTML = '<div class="alert alert-warning">Error: No se encontró el ID del producto en la URL.</div>';
        return;
    }

    // Ocultar las columnas inicialmente y mostrar el spinner
    productImageCol.classList.add('d-none');
    productInfoCol.classList.add('d-none');
    loadingMessage.classList.remove('d-none');

    // Cargar los productos desde la API
    fetch('api/categories')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar la API de categorías.');
                }
                return response.json();
            })
            .then(categorias => {
                let foundProduct = null;

                // Buscar el producto por ID en todas las categorías
                for (const categoria of categorias) {
                    foundProduct = categoria.products.find(p => p.id == productId);
                    if (foundProduct) {
                        break;
                    }
                }

                if (foundProduct) {

                    // --- INYECCIÓN DE DATOS Y VISIBILIDAD ---
                    loadingMessage.classList.add('d-none');
                    productImageCol.classList.remove('d-none');
                    productInfoCol.classList.remove('d-none');

                    const product = foundProduct;

                    productTitle.textContent = `${product.name} - Villa Farma`;
                    breadcrumbName.textContent = product.name;

                    zoomImage.src = `Imagenes/${product.imagePath}`;
                    zoomImage.alt = product.name;
                    document.getElementById('productName').textContent = product.name;

                    const longDescription = product.longDescription || product.description || 'Sin descripción detallada.';
                    document.getElementById('productLongDescription').textContent = longDescription;

                    document.getElementById('productPresentation').textContent = product.presentation || 'Presentación no especificada.';

                    const priceText = product.price ? `Precio: S/ ${product.price.toFixed(2)}` : 'Precio no disponible';
                    document.getElementById('productPrice').textContent = priceText;


                    // --- LÓGICA COMPLETA DEL ZOOM ---
                    if (zoomContainer && zoomImage) {

                        function getCursorPos(e) {
                            const rect = zoomContainer.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            return {x: x, y: y};
                        }

                        function handleZoom(e) {
                            const pos = getCursorPos(e);
                            const xPercent = (pos.x / zoomContainer.offsetWidth) * 100;
                            const yPercent = (pos.y / zoomContainer.offsetHeight) * 100;
                            zoomImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                        }

                        zoomContainer.addEventListener('mouseenter', () => {
                            zoomImage.style.transform = `scale(${zoomFactor})`;
                        });

                        zoomContainer.addEventListener('mousemove', handleZoom);

                        zoomContainer.addEventListener('mouseleave', () => {
                            zoomImage.style.transform = 'scale(1)';
                            zoomImage.style.transformOrigin = '0% 0%';
                        });
                    }


                    // =========================================================
                    // === AGREGAR AL CARRITO (Solo se ejecuta si el producto existe) ===
                    // =========================================================
                    if (addToCartBtn) {
                        addToCartBtn.addEventListener('click', function () {
                            const quantity = parseInt(productQuantityInput.value);

                            if (quantity < 1 || isNaN(quantity)) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Cantidad Inválida',
                                    text: 'Por favor, selecciona una cantidad válida (mínimo 1).',
                                    confirmButtonColor: '#0d6efd'
                                });
                                return;
                            }

                            // USAMOS la función getCart global, si general-cart.js está incluido
                            let cart = window.getCart ? window.getCart() : [];

                            // 1. Verificar si el producto ya existe en el carrito
                            const existingItemIndex = cart.findIndex(item => item.id == product.id);

                            if (existingItemIndex > -1) {
                                // Si existe, sumar la cantidad
                                cart[existingItemIndex].quantity += quantity;
                            } else {
                                // Si no existe, agregar como nuevo item
                                cart.push({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    imagePath: product.imagePath,
                                    quantity: quantity
                                });
                            }

                            // Guardar en LocalStorage
                            localStorage.setItem('villaFarmaCart', JSON.stringify(cart));

                            // ACTUALIZAR CONTADOR GLOBAL
                            if (window.updateCartCount) {
                                window.updateCartCount();
                            } else {
                                console.warn('Advertencia: window.updateCartCount no está disponible. Asegúrate de incluir general-cart.js');
                            }

                            // 1. Mostrar SweetAlert CENTRADO
                            Swal.fire({
                                icon: 'success',
                                title: '¡Agregado al Carrito!',
                                html: `Se han añadido **${quantity} unidad(es)** de **${product.name}** a tu carrito.`,
                                showCancelButton: true,
                                confirmButtonText: 'Ir al Carrito',
                                cancelButtonText: 'Seguir Comprando',
                                confirmButtonColor: '#0d6efd',
                                cancelButtonColor: '#6c757d'
                                        // NOTA: Eliminamos 'toast: true' y 'position: top-end' para que aparezca centrado
                            }).then((result) => {
                                // 2. Lógica de Redirección después de que el usuario hace clic
                                if (result.isConfirmed) {
                                    window.location.href = 'cart.html'; // Redirige a la página del carrito
                                }
                            });

                        });
                    }
                    // =========================================================


                } else {
                    // Producto no encontrado
                    loadingMessage.classList.remove('d-none');
                    loadingMessage.innerHTML = `<div class="alert alert-danger">Producto con ID "${productId}" no encontrado.</div>`;
                }
            })
            .catch(error => {
                console.error('Error al cargar el detalle:', error);
                loadingMessage.classList.remove('d-none');
                loadingMessage.innerHTML = `<div class="alert alert-danger">Hubo un error al conectar con el servidor o cargar los datos.</div>`;
            });
});
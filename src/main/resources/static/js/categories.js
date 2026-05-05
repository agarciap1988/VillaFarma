document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('carouselCategoriesContainer');
    const carouselMain = document.getElementById('categoriesCarousel');
    const productsContainer = document.getElementById('productsContainer');
    const view3x3Button = document.getElementById('view3x3');
    const view4x4Button = document.getElementById('view4x4');
    const prevButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageNumber = document.getElementById('pageNumber');
    const paginationControls = document.getElementById('paginationControls');
    const showAllProductsButton = document.getElementById('showAllProductsButton');
    
    // NUEVO: Referencia al combo de selección
    const categorySelect = document.getElementById('categorySelect');

    let allProducts = [];
    let categoriesData = []; // Para almacenar los datos completos de las categorías
    let currentPage = 0;
    const productsPerPage = 10;
    let totalPages = 0;
    let filteredProducts = null;

    // --- Función para aplicar el filtro y actualizar la vista ---
    function applyFilter(categoryId) {
        if (categoryId === 'all' || categoryId === 'show-all') {
            filteredProducts = allProducts;
        } else {
            const selectedCategory = categoriesData.find(c => c.id == categoryId);
            if (selectedCategory) {
                filteredProducts = selectedCategory.products;
            } else {
                // Esto no debería pasar si la lógica es correcta
                filteredProducts = allProducts;
            }
        }
        
        currentPage = 0;
        totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        
        if (paginationControls) {
            paginationControls.style.display = filteredProducts.length > 0 ? 'flex' : 'none';
        }
        updateProductDisplay();
    }


    // --- Lógica del carrusel y API ---
    fetch('api/categories')
        .then(response => response.json())
        .then(categorias => {
            console.log('Respuesta de categorías:', categorias);

            if (Array.isArray(categorias) && categorias.length > 0) {
                const itemsPerSlide = 4;
                categoriesData = categorias; // Almacenar para usar en el combo

                container.innerHTML = '';
                allProducts = []; // Asegurarse de que esté limpio antes de llenar

                // Llenar la lista de todos los productos y el combo de categorías
                categorias.forEach(categoria => {
                    allProducts = [...allProducts, ...categoria.products];
                    
                    // Llenar el combo de categorías
                    const option = document.createElement('option');
                    option.value = categoria.id;
                    option.textContent = categoria.name;
                    categorySelect.appendChild(option);
                });

                // Renderizado del Carrusel (el resto del código es el mismo para el carrusel)
                for (let i = 0; i < categorias.length; i += itemsPerSlide) {
                    const carouselItem = document.createElement('div');
                    carouselItem.classList.add('carousel-item');
                    if (i === 0) {
                        carouselItem.classList.add('active');
                    }
                    const row = document.createElement('div');
                    row.classList.add('row', 'g-3');
                    const categoryGroup = categorias.slice(i, i + itemsPerSlide);
                    categoryGroup.forEach(categoria => {
                        const col = document.createElement('div');
                        col.classList.add('col-6', 'col-md-3', 'mb-4'); 
                        col.setAttribute('data-category-id', categoria.id);
                        col.innerHTML = `
                            <div class="card h-100 category-card">
                                <img src="Imagenes/${categoria.imageUrl}" class="card-img-top" alt="${categoria.name}">
                                <div class="card-body text-center">
                                    <h5 class="card-title">${categoria.name}</h5>
                                    <p class="card-description">${categoria.description}</p>
                                    <p class="card-products">
                                        <i class="fas fa-box"></i> ${categoria.products.length} productos
                                    </p>
                                </div>
                            </div>
                        `;
                        row.appendChild(col);
                    });
                    carouselItem.appendChild(row);
                    container.appendChild(carouselItem);
                }
                
                // Inicializar el carrusel de Bootstrap
                if (carouselMain) {
                    new bootstrap.Carousel(carouselMain, { interval: 6000, wrap: true });
                }
                
                // --- Configuración inicial de productos ---
                applyFilter('all'); // Mostrar todos al inicio

                // --- LISTENERS DE FILTRADO ---
                
                // 1. Clic en las tarjetas del Carrusel
                const categoryCards = document.querySelectorAll('[data-category-id]');
                categoryCards.forEach(card => {
                    card.addEventListener('click', function () {
                        const categoryId = this.getAttribute('data-category-id');
                        applyFilter(categoryId);
                        // Sincronizar el combo con la selección del carrusel
                        if (categorySelect) categorySelect.value = categoryId;
                    });
                });
                
                // 2. NUEVO: Cambio en el Combo de selección
                if (categorySelect) {
                    categorySelect.addEventListener('change', function() {
                        applyFilter(this.value);
                    });
                }
                
                // 3. Clic en el botón "Mostrar Todos los Productos"
                if (showAllProductsButton) {
                    showAllProductsButton.addEventListener('click', function() {
                        applyFilter('all');
                        // Sincronizar el combo
                        if (categorySelect) categorySelect.value = 'all';
                    });
                }

                // --- Lógica de botones de vista (sin cambios) ---
                view3x3Button.addEventListener('click', function () {
                    productsContainer.classList.remove('view-4x4');
                    productsContainer.classList.add('view-3x3');
                    updateProductDisplay();
                });

                view4x4Button.addEventListener('click', function () {
                    productsContainer.classList.remove('view-3x3');
                    productsContainer.classList.add('view-4x4');
                    updateProductDisplay();
                });
                
            } else {
                console.error('La respuesta de categorías no es un array o está vacía', categorias);
            }
        })
        .catch(error => {
            console.error('Error al cargar las categorías:', error);
        });

    // --- Funciones de Paginación y Renderizado (sin cambios) ---
    
    function updateProductDisplay() {
        if (!filteredProducts || filteredProducts.length === 0) {
            productsContainer.innerHTML = '<div class="col-12 text-center">No hay productos para mostrar.</div>';
            if (paginationControls) paginationControls.style.display = 'none';
            return;
        }

        const startIndex = currentPage * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToShow = filteredProducts.slice(startIndex, endIndex);

        displayProducts(productsToShow);
        updatePaginationControls();
    }

    function displayProducts(products) {
        const isView4x4 = productsContainer.classList.contains('view-4x4');
        const productColClass = isView4x4 ? 'col-12 col-md-3 mb-4' : 'col-12 col-md-4 mb-4';

        productsContainer.innerHTML = products.map(product => `
            <div class="${productColClass}">
                <div class="card h-100 product-card-custom"> 
                    <div class="product-image-wrapper">
                        <img src="Imagenes/${product.imagePath}" class="card-img-top" alt="${product.name}">
                        
                        <a href="product-detail.html?id=${product.id || product.name}" 
                           class="btn btn-primary product-view-button" 
                           title="Ver detalles del producto">
                            <i class="fas fa-eye"></i>
                        </a>
                    </div>
                    
                    <div class="card-body text-center">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        
                        <p class="product-price fs-5 fw-bold text-primary">
                            S/ ${product.price ? product.price.toFixed(2) : 'N/D'}
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function updatePaginationControls() {
        if (pageNumber && prevButton && nextPageButton) {
            pageNumber.textContent = `Página ${currentPage + 1} de ${totalPages}`;
            prevButton.disabled = currentPage === 0;
            nextPageButton.disabled = currentPage >= totalPages - 1;
        }
    }

    // Paginación Listeners (sin cambios)
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                updateProductDisplay();
            }
        });
    }

    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                updateProductDisplay();
            }
        });
    }
});
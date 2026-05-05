// ===================
// Configuración inicial
// ===================
const API_URL = "http://localhost:8084/api"; // URL de tu backend
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ===================
// Utilidades generales
// ===================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("carrito");
  window.location.href = "index.html";
}

function irAlCarrito() {
  window.location.href = "cart.html";
}

function seguirComprando() {
  window.location.href = "shop.html";
}

// ===================
// Registro de usuario
// ===================
async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  return response.json();
}

// ===================
// Login
// ===================
async function loginUser(credentials) {
  console.log("👉 Entró a loginUser con:", credentials);
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) throw new Error("Error en login");

  const data = await response.json();
  console.log("Respuesta del backend:", data);
  localStorage.setItem("token", data.token); // Guardar JWT
  localStorage.setItem("usuario", data.fullname);
  return data;
}

// ===================
// Productos
// ===================
async function loadProducts(catalogoId = "catalogo") {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No se encontró token de autenticación. Redirigiendo a login.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        alert("Sesión expirada o no válida. Por favor, inicia sesión de nuevo.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }
      throw new Error("Error al cargar productos");
    }
    const productos = await response.json();

    const catalogo = document.getElementById(catalogoId);
    if (!catalogo) return;

    catalogo.innerHTML = "";
    productos.forEach(p => {
      const col = document.createElement("div");
      col.className = "col-md-3 mb-4";
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
            <div class="card-img-container">
                <img src="${p.imagePath || 'Imagenes/default.png'}" class="card-img-top" alt="${p.name}">
            </div>
            <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text text-muted">${p.description || ''}</p>
            <p class="fw-bold">S/ ${p.price.toFixed(2)}</p>
            <button class="btn btn-success mt-auto" onclick="agregarAlCarrito(${p.id}, '${p.name}', ${p.price})">
              <i class="fas fa-cart-plus me-2"></i>Agregar
            </button>
          </div>
        </div>
      `;
      catalogo.appendChild(col);
    });
  } catch (err) {
    console.error(err);
    alert("Error cargando productos.");
  }
}

// ===================
// Carrito
// ===================
function agregarAlCarrito(id, name, price) {
  const index = carrito.findIndex(item => item.id === id);
  if (index >= 0) {
    carrito[index].cantidad += 1;
  } else {
    carrito.push({ id, name, price, cantidad: 1 });
  }
  guardarCarrito();
}

function cambiarCantidad(index, cantidad) {
  carrito[index].cantidad = parseInt(cantidad);
  guardarCarrito();
}

function eliminarItem(index) {
  carrito.splice(index, 1);
  guardarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
  renderCarrito();
}

function actualizarContador() {
  const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = total;
}

function renderCarrito() {
  const tbody = document.getElementById("carritoBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  carrito.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td><input type="number" min="1" value="${item.cantidad}" class="form-control form-control-sm"
                   onchange="cambiarCantidad(${index}, this.value)"></td>
      <td>S/ ${item.price.toFixed(2)}</td>
      <td>S/ ${(item.price * item.cantidad).toFixed(2)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="eliminarItem(${index})"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  });

  calcularTotal();
}

function toggleDireccion() {
  const metodo = document.getElementById("metodoEntrega")?.value;
  const fields = document.getElementById("deliveryFields");
  if (!fields) return;

  if (metodo === "delivery") fields.classList.remove("d-none");
  else fields.classList.add("d-none");

  calcularTotal();
}

function calcularTotal() {
  let total = carrito.reduce((sum, item) => sum + item.price * item.cantidad, 0);
  const metodo = document.getElementById("metodoEntrega")?.value;
  let delivery = 0;

  if (metodo === "delivery") {
    const distrito = document.getElementById("distrito")?.value;
    if (distrito === "Ancon") {
        delivery = 10;
    }
    else if (distrito) {
        delivery = 5;
    }
  }
  const totalElem = document.getElementById("totalFinal");
  if (totalElem) totalElem.textContent = `S/ ${(total + delivery).toFixed(2)}`;
  
  const recargoElem = document.getElementById("recargoDelivery");
  if (recargoElem) recargoElem.textContent = `S/ ${delivery.toFixed(2)}`;
}

// ===================
// Finalizar compra / crear orden
// ===================
async function createOrder() {
  if (carrito.length === 0) return alert("El carrito está vacío");

  const metodo = document.getElementById("metodoEntrega")?.value || "farmacia";
  const direccion = document.getElementById("direccion")?.value || "";
  const distrito = document.getElementById("distrito")?.value || "";

  // Validación de delivery
  if (metodo === "delivery" && (!distrito || !direccion.trim())) {
    return alert("Por favor completa los datos de delivery");
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Sesión no válida. Por favor, inicia sesión de nuevo.");
    window.location.href = "login.html";
    return;
  }

  // Calcular delivery y total
  let deliveryCost = 0;
  if (metodo === "delivery") {
    deliveryCost = distrito === "Ancon" ? 10 : 5;
  }

  const totalFinal = carrito.reduce((sum, item) => sum + item.price * item.cantidad, 0) + deliveryCost;

  // Construir objeto completo para boleta
  const compra = {
    items: carrito.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.cantidad
    })),
    metodo,
    direccion,
    distrito,
    delivery: deliveryCost,
    total: totalFinal
  };

  // Guardar localmente para boleta
  localStorage.setItem("ultimaCompra", JSON.stringify(compra));

  try {
    // Enviar solo los datos necesarios al backend
    const lineItems = carrito.map(item => ({
      productId: item.id,
      quantity: item.cantidad
    }));

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ items: lineItems },{delivery: deliveryCost})
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Error desconocido al crear la orden");
    }

    // Limpiar carrito y redirigir a boleta
    carrito = [];
    guardarCarrito();
    window.location.href = "boleta.html";

  } catch (err) {
    console.error("Error al crear la orden:", err);
    alert("Error al crear la orden: " + err.message);
  }
}

// ===================
// Boleta
// ===================
function renderBoleta() {
  const compra = JSON.parse(localStorage.getItem("ultimaCompra")) || null;
  if (!compra) {
    alert("No se encontró información de la compra.");
    window.location.href = "shop.html";
    return;
  }

  // Número de boleta correlativo
  let contador = parseInt(localStorage.getItem("contadorBoletas") || "0");
  contador++;
  localStorage.setItem("contadorBoletas", contador);
  document.getElementById("numeroBoleta").textContent = `B001-${String(contador).padStart(6, "0")}`;
  document.getElementById("cliente").textContent = localStorage.getItem("usuario") || "Invitado";
  document.getElementById("fecha").textContent = new Date().toLocaleString();

  // Detalle productos
  const tbody = document.getElementById("detalleBoleta");
  tbody.innerHTML = "";
  compra.items.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>S/ ${item.price.toFixed(2)}</td>
      <td>S/ ${(item.price * item.quantity).toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  // Método de entrega
  document.getElementById("entrega").textContent = compra.metodo === "delivery" ? "Delivery" : "Recojo en Farmacia";
  if (compra.metodo === "delivery") {
    document.getElementById("direccionEntrega").textContent = compra.direccion;
    document.getElementById("direccionBox")?.classList.remove("d-none");
    document.getElementById("distritoEntrega").textContent = compra.distrito;
    document.getElementById("distritoBox")?.classList.remove("d-none");
  }

  document.getElementById("recargoDelivery").textContent = compra.delivery.toFixed(2);
  document.getElementById("totalFinal").textContent = `S/ ${compra.total.toFixed(2)}`;
}

// ===================
// Inicialización automática
// ===================
document.addEventListener("DOMContentLoaded", () => {
  actualizarContador();
  if (document.getElementById("catalogo")) loadProducts();
  if (document.getElementById("carritoBody")) renderCarrito();
  if (document.getElementById("detalleBoleta")) renderBoleta();
});
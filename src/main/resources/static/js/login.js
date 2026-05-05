document.addEventListener("DOMContentLoaded", function () {
    // =========================================================
    // === 1. LÓGICA DE BARRA DE NAVEGACIÓN (NAVBAR) ===
    // =========================================================
    const authContainer = document.getElementById('authContainer');
    // Usamos la clave que tu backend guarda: 'userLogged'
    const userLoggedName = localStorage.getItem('userLogged');
    const token = localStorage.getItem('jwtToken'); 

    if (token && userLoggedName && authContainer) {
        // --- Usuario Logueado: Mostrar nombre y menú ---
        
        const loggedInHtml = `
            <div class="dropdown">
                <button class="btn btn-outline-success dropdown-toggle" type="button" id="userDropdownMenu" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle me-1"></i> 
                    ${userLoggedName}
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdownMenu">
                    <li><a class="dropdown-item" href="perfil.html"><i class="fas fa-user-edit me-2"></i> Mi Perfil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión</a></li>
                </ul>
            </div>
        `;
        
        authContainer.innerHTML = loggedInHtml;

        // --- Configurar el evento de Cerrar Sesión con confirmación ---
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                
                // 🛑 AÑADIMOS LA PREGUNTA DE CONFIRMACIÓN CON SWEETALERT2
                Swal.fire({
                    title: '¿Estás seguro de cerrar sesión?',
                    text: "Deberás ingresar tu DNI y contraseña la próxima vez.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#0d6efd', // Azul de Bootstrap
                    cancelButtonColor: '#dc3545', // Rojo de Bootstrap
                    confirmButtonText: 'Sí, cerrar sesión',
                    cancelButtonText: 'No, permanecer'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // 1. Limpiar LocalStorage
                        localStorage.removeItem('jwtToken');
                        localStorage.removeItem('userLogged'); 
                        localStorage.removeItem('isLoggedIn'); 
                        localStorage.removeItem('tokenType');  
                        localStorage.removeItem('villaFarmaCart'); 
                        
                        // 2. Mostrar mensaje de éxito rápido
                        Swal.fire({
                            icon: 'success',
                            title: 'Sesión Cerrada',
                            text: 'Has cerrado sesión exitosamente.',
                            showConfirmButton: false,
                            timer: 1000 // Mensaje más corto antes de recargar
                        }).then(() => {
                            // 3. Recargar la página
                            window.location.reload(); 
                        });
                    }
                });
            });
        }
        
    } else if (authContainer) {
        // --- Usuario NO Logueado: Mostrar botón de Login original ---
        authContainer.innerHTML = `
            <a id="authBtn" href="login.html" class="btn btn-primary"><i class="fas fa-user me-1"></i> Iniciar sesión</a>
        `;
    }

    // =========================================================
    // === 2. LÓGICA DE LOGIN (solo se ejecuta si los elementos existen) ===
    // ... (El resto de tu código de validación de DNI y submit del formulario permanece igual)
    // =========================================================
    
    // Referencias a elementos específicos de login
    const loginForm = document.getElementById("loginForm");
    const errorDiv = document.getElementById("loginError");
    const dniInput = document.getElementById("dni");
    const dniError = document.getElementById("dniError");

    // Verificar si estamos en la página de login (si el formulario o DNI existen)
    if (!loginForm || !dniInput) {
        return; 
    }

    // =========================================================
    // === FUNCIÓN DE VALIDACIÓN DEL DNI (Tiempo Real y Final) ===
    // =========================================================
    function validateDniLive() {
        let dniValue = dniInput.value.replace(/[^0-9]/g, ''); 

        if (dniValue.length > 8) {
            dniValue = dniValue.substring(0, 8);
        }
        dniInput.value = dniValue; 

        const isValidLength = dniValue.length === 8;

        if (!isValidLength) {
            dniInput.classList.add('is-invalid');
            if (dniError) {
                dniError.textContent = 'El DNI debe tener exactamente 8 dígitos.';
                dniError.style.display = 'block';
            }
            return false;
        } else {
            dniInput.classList.remove('is-invalid');
            if (dniError) {
                dniError.style.display = 'none';
            }
            return true;
        }
    }

    // Inicializar y agregar validación en tiempo real al campo DNI
    dniInput.addEventListener('input', () => {
        const dniValue = dniInput.value;

        const hasNonNumeric = /[^0-9]/.test(dniValue);

        if (hasNonNumeric) {
            console.log("estoy intentando ingresar una letra");
            dniInput.value = dniValue.replace(/[^0-9]/g, ''); 

            if (dniError) {
                dniError.textContent = 'Solo se permiten números en el DNI.';
                dniError.style.display = 'block'; 
            }
            return;
        } else {
            if (dniError) {
                dniError.style.display = 'none'; 
            }
        }

        validateDniLive();
    });


    // =========================================================
    // === MANEJADOR DEL SUBMIT DEL FORMULARIO ===
    // =========================================================
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dniIsValid = validateDniLive();

        if (!dniIsValid) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: 'Por favor, ingresa un DNI válido (8 dígitos numéricos).',
                confirmButtonColor: '#dc3545'
            });
            return; 
        }

        const dni = dniInput.value;
        const password = document.getElementById("password").value;

        localStorage.removeItem("jwtToken"); 
        if (errorDiv) errorDiv.classList.add("d-none");

        try {
            const response = await fetch("http://localhost:8484/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni, password })
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem("jwtToken", data.token);
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("tokenType", data.tokenType);
                localStorage.setItem("userLogged", data.userLogged); 
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Inicio de Sesión Exitoso! 🚀',
                    text: 'Serás redirigido al catálogo principal.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = "index.html";
                });

            } else {
                if (errorDiv) {
                    errorDiv.textContent = "DNI o contraseña incorrectos";
                    errorDiv.classList.remove("d-none");
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Fallo de Autenticación',
                    text: 'Verifica tu DNI y contraseña.',
                });
            }
        } catch (err) {
            if (errorDiv) {
                errorDiv.textContent = "Error de conexión con el servidor";
                errorDiv.classList.remove("d-none");
            }

            Swal.fire({
                icon: 'warning',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor de la farmacia. Intenta más tarde.',
            });
        }
    });
});
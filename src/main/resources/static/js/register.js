const registerForm = document.getElementById("registerForm");

// Elementos del formulario
const dniInput = document.getElementById("dni");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const birthDateInput = document.getElementById("birthDate");
const emailInput = document.getElementById("email");
const errorDiv = document.getElementById("registerError");

// Función para validación del DNI (solo números y máximo 8 dígitos)
function validateDni() {
    let dniValue = dniInput.value.replace(/[^0-9]/g, ''); // Limitar solo a números
    dniInput.value = dniValue; // Aplicar la limpieza

    // Limitar a 8 dígitos
    if (dniValue.length > 8) {
        dniValue = dniValue.substring(0, 8);
        dniInput.value = dniValue; // Aplicar la restricción de 8 dígitos
    }

    if (dniValue.length !== 8) {
        // Mostrar mensaje de error debajo del campo DNI
        showError(dniInput, 'El DNI debe contener exactamente 8 dígitos numéricos.');
        return false;
    } else {
        hideError(dniInput);
        return true;
    }
}

// Función para validación de nombres y apellidos (solo letras)
function validateName(nameInput, fieldName) {
    const nameValue = nameInput.value.replace(/[^a-zA-Z\s]/g, ''); // Limitar a letras y espacios
    nameInput.value = nameValue; // Aplicar la limpieza

    if (nameValue === "") {
        showError(nameInput, `El ${fieldName} solo debe contener letras.`);
        return false;
    } else {
        hideError(nameInput);
        return true;
    }
}

// Función para validación de la fecha de nacimiento (debe ser anterior a la fecha actual)
function validateBirthDate() {
    const birthDateValue = new Date(birthDateInput.value);
    const currentDate = new Date();

    if (birthDateValue >= currentDate) {
        showError(birthDateInput, 'La fecha de nacimiento debe ser anterior a la fecha actual.');
        return false;
    } else {
        hideError(birthDateInput);
        return true;
    }
}

// Función para validación del correo electrónico (formato correcto)
function validateEmail() {
    const emailValue = emailInput.value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(emailValue)) {
        showError(emailInput, 'Por favor ingresa un correo electrónico válido.');
        return false;
    } else {
        hideError(emailInput);
        return true;
    }
}

// Función para mostrar mensajes de error debajo de los campos (color rojo)
function showError(inputElement, message) {
    let errorElement = inputElement.nextElementSibling; // Asumimos que el mensaje de error está debajo del input
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement("small");
        errorElement.classList.add("error-message");
        inputElement.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.color = 'red'; // Color rojo para el mensaje de error
}

// Función para ocultar mensajes de error
function hideError(inputElement) {
    let errorElement = inputElement.nextElementSibling; // Asumimos que el mensaje de error está debajo del input
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.style.display = 'none';
    }
}

// Agregar las validaciones en tiempo real
dniInput.addEventListener('input', validateDni);
firstNameInput.addEventListener('input', () => validateName(firstNameInput, 'nombre'));
lastNameInput.addEventListener('input', () => validateName(lastNameInput, 'apellido'));
birthDateInput.addEventListener('input', validateBirthDate);
emailInput.addEventListener('input', validateEmail);

// Manejar el envío del formulario
registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ejecutar las validaciones
    const isDniValid = validateDni();
    const isFirstNameValid = validateName(firstNameInput, 'nombre');
    const isLastNameValid = validateName(lastNameInput, 'apellido');
    const isBirthDateValid = validateBirthDate();
    const isEmailValid = validateEmail();

    // Si alguna de las validaciones falla, no enviamos el formulario
    if (!isDniValid || !isFirstNameValid || !isLastNameValid || !isBirthDateValid || !isEmailValid) {
        return;
    }

    // Si todo es válido, proceder con el envío del formulario
    const user = {
        dni: dniInput.value,
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        email: emailInput.value,
        phone: document.getElementById("phone").value,
        birthDate: birthDateInput.value,
        password: document.getElementById("password").value
    };

    try {
        // Realizar la solicitud POST para registrar al usuario
        const response = await fetch("http://localhost:8484/api/users", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(user)
        });

        if (response.ok) {
            // 🚩 ÉXITO: Mostrar SweetAlert y redirigir 🚩
            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso! 🎉',
                text: 'Ahora puedes iniciar sesión con tu nueva cuenta.',
                showConfirmButton: false, // Ocultamos el botón para que se redirija solo
                timer: 2500 // El usuario ve el mensaje por 2.5 segundos
            }).then(() => {
                // Redirigimos al usuario a la página de login
                window.location.href = "login.html";
            });

        } else {
            // 🚩 ERROR DE API (Ej: DNI ya registrado, validación, etc.) 🚩
            const errorData = await response.json();
            const errorMessage = errorData.message || "Error al procesar el registro.";

            Swal.fire({
                icon: 'error',
                title: 'Fallo en el Registro',
                text: errorMessage,
                confirmButtonText: 'Entendido'
            });
        }
    } catch (err) {
        // 🚩 ERROR DE CONEXIÓN (Servidor caído o inaccesible) 🚩
        console.error("Error de conexión:", err);

        Swal.fire({
            icon: 'warning',
            title: 'Error de Conexión',
            text: 'No se pudo conectar con el servidor. Intenta nuevamente más tarde.',
            confirmButtonText: 'Aceptar'
        });
    }
});

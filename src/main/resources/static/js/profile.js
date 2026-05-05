
const PROFILE_API_URL = "http://localhost:8484/api/users/profile";
const UPDATE_API_URL = "http://localhost:8484/api/users/update";

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('jwtToken');
    const tokenType = localStorage.getItem('tokenType') || 'Bearer';

    // 1. Lógica de Redirección si no hay token (Mantenida igual)
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso Denegado',
            text: 'Necesitas iniciar sesión para ver tu perfil.',
            allowOutsideClick: false,
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            window.location.href = 'login.html';
        });
        return;
    }

// ----------------------------------------------------------------------
// FUNCIÓN PARA CARGAR Y MOSTRAR/LLENAR DATOS
// ----------------------------------------------------------------------

    async function fetchUserProfile() {
        try {
            const response = await fetch(PROFILE_API_URL, {
                method: "GET",
                headers: {
                    "Authorization": `${tokenType} ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);

                const fullName = `${data.firstName || ''} ${data.lastName || ''}`;

                if (document.getElementById('profileFullName')) {
                    document.getElementById('profileFullName').textContent = fullName;
                    document.getElementById('profileDni').textContent = data.dni || 'No disponible';
                    document.getElementById('profilePhone').textContent = data.phone || 'No disponible';
                    document.getElementById('profileEmail').textContent = data.email || 'No disponible';
                }

                if (document.getElementById('editProfileForm')) {
                    document.getElementById('inputFirstName').value = data.firstName || '';
                    document.getElementById('inputLastName').value = data.lastName || '';
                    document.getElementById('inputDni').value = data.dni || ''; 
                    document.getElementById('inputEmail').value = data.email || '';
                    document.getElementById('inputPhone').value = data.phone || '';
                }

                let birthDateElementId = document.getElementById('editProfileForm') ? 'inputBirthDate' : 'profileBirthDate';
                const birthDateElement = document.getElementById(birthDateElementId);

                if (birthDateElement) {
                    if (data.birthDate) {
                        const date = new Date(data.birthDate);
                        const formattedDate = date.toLocaleDateString('es-PE', {year: 'numeric', month: '2-digit', day: '2-digit'});

                        if (birthDateElement.tagName !== 'INPUT') {
                            birthDateElement.textContent = formattedDate;
                        } else {
                            birthDateElement.value = formattedDate;
                        }
                    } else {
                        if (birthDateElement.tagName !== 'INPUT') {
                            birthDateElement.textContent = 'No disponible';
                        } else {
                            birthDateElement.value = 'No disponible';
                        }
                    }
                }


            } else if (response.status === 401 || response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sesión Expirada',
                    text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
                    confirmButtonColor: '#dc3545'
                }).then(() => {
                    localStorage.clear();
                    window.location.href = 'login.html';
                });
            } else {
                document.getElementById('profileFullName').textContent = 'Error (Recargue la página)';
            }
        } catch (error) {
            Swal.fire({
                icon: 'warning',
                title: 'Error de Red',
                text: 'No se pudo conectar con el servidor para obtener los datos del perfil.',
                confirmButtonColor: '#ffc107'
            });
            document.getElementById('profileFullName').textContent = 'Error de conexión';
        }
    }

// ----------------------------------------------------------------------
// FUNCIÓN PARA ACTUALIZAR DATOS (PUT)
// ----------------------------------------------------------------------

    async function updateUserProfile() {
        const updateData = {
            firstName: document.getElementById('inputFirstName').value.trim(),
            lastName: document.getElementById('inputLastName').value.trim(),
            email: document.getElementById('inputEmail').value.trim(),
            phone: document.getElementById('inputPhone').value.trim()
        };

        if (!updateData.firstName || !updateData.lastName || !updateData.email) {
            Swal.fire('Advertencia', 'Nombre, apellido y correo son campos obligatorios.', 'warning');
            return;
        }

        try {
            const response = await fetch(UPDATE_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${tokenType} ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                Swal.fire('¡Éxito! 🎉', 'Tu perfil ha sido actualizado correctamente.', 'success')
                        .then(() => {
                            window.location.href = 'perfil.html';
                        });

            } else {
                const errorBody = await response.json().catch(() => ({message: 'Error desconocido del servidor.'}));
                Swal.fire('Error al actualizar', `No se pudo guardar la información: ${errorBody.message}`, 'error');
            }

        } catch (error) {
            Swal.fire('Error de Conexión', 'Hubo un problema al conectar con el servidor.', 'error');
        }
    }

// ----------------------------------------------------------------------
// CONEXIÓN DE EVENTOS
// ----------------------------------------------------------------------

    fetchUserProfile();

    const updateForm = document.getElementById('editProfileForm');
    if (updateForm) {
        updateForm.addEventListener('submit', function (e) {
            e.preventDefault();
            updateUserProfile();
        });
    }

    const logoutButtonProfile = document.getElementById('logoutButtonProfile');
    if (logoutButtonProfile) {
        logoutButtonProfile.addEventListener('click', function () {
            Swal.fire({
                title: '¿Estás seguro de cerrar sesión?',
                text: "Esto cerrará tu sesión.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#dc3545',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'No, permanecer'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userLogged');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('tokenType');
                    localStorage.removeItem('villaFarmaCart');
                    Swal.fire({
                        icon: 'success',
                        title: 'Sesión Cerrada',
                        text: 'Serás redirigido.',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(() => {
                        window.location.href = 'index.html';
                    });
                }
            });
        });
    }
});
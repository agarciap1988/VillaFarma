
document.addEventListener('DOMContentLoaded', () => {
    const historyContent = document.getElementById('history-content');
    const token = localStorage.getItem('jwtToken');

    const showMessage = (message, type = 'info') => {
        historyContent.innerHTML = `
            <div class="alert alert-${type} text-center" role="alert">
                ${message}
            </div>
        `;
    };

    if (!token) {
        showMessage('Por favor, inicie sesión para ver su historial.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
        return;
    }

    const getStatusBadge = (status) => {
        switch (status.toUpperCase()) {
            case 'PENDING':
            case 'CREATED':
                return '<span class="badge text-bg-warning">PENDIENTE</span>';
            case 'SHIPPED':
                return '<span class="badge text-bg-info">ENVIADO</span>';
            case 'DELIVERED':
                return '<span class="badge text-bg-success">ENTREGADO</span>';
            case 'CANCELLED':
                return '<span class="badge text-bg-danger">CANCELADO</span>';
            default:
                return `<span class="badge text-bg-secondary">${status}</span>`;
        }
    };
    const loadOrderHistory = async () => {
        historyContent.innerHTML = `
            <div class="text-center">
                <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
                <p class="mt-2">Cargando historial...</p>
            </div>
        `;

        try {
            const response = await fetch('/api/orders/history', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('Su sesión ha expirado o no está autorizado. Vuelva a iniciar sesión.');
            }
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo cargar el historial de pedidos.`);
            }

            const orders = await response.json();
            renderOrders(orders);

        } catch (error) {
            showMessage(error.message, 'danger');
        }
    };
    const renderOrders = (orders) => {
        if (orders.length === 0) {
            showMessage('<i class="fas fa-box-open me-2"></i> No tienes pedidos registrados aún.', 'secondary');
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-primary">
                        <tr>
                            <th>ID</th>
                            <th>Fecha de Compra</th>
                            <th class="text-end">Monto Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        orders.forEach(order => {
            const date = new Date(order.fechaCompra).toLocaleDateString('es-PE', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            html += `
                <tr>
                    <td><strong>#${order.orderId}</strong></td>
                    <td>${date}</td>
                    <td class="text-end">S/. ${parseFloat(order.montoTotal).toFixed(2)}</td>
                    <td>${getStatusBadge(order.estado)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="viewOrderDetails(${order.orderId})">
                            Detalle
                        </button>
                        ${(order.estado.toUpperCase() === 'PENDING' || order.estado.toUpperCase() === 'CREATED') ?
                    `<button class="btn btn-sm btn-outline-danger ms-2" onclick="cancelOrder(${order.orderId})">
                                Cancelar
                            </button>` : ''
                    }
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        historyContent.innerHTML = html;
    };

    window.viewOrderDetails = async (orderId) => {
        Swal.fire({
            title: `Cargando Pedido #${orderId}`,
            html: '<i class="fas fa-spinner fa-spin fa-3x text-primary"></i>',
            allowOutsideClick: false,
            showConfirmButton: false
        });

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error desconocido al obtener el detalle.');
            }

            const order = data;

            let itemsHtml = `
                <table class="table table-sm mt-3">
                    <thead class="table-light">
                        <tr>
                            <th>Producto</th>
                            <th class="text-center">Cant.</th>
                            <th class="text-end">Precio U.</th>
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            order.items.forEach(item => {
                const itemTotal = parseFloat(item.totalItem);
                itemsHtml += `
                    <tr>
                        <td>${item.productName}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-end">S/. ${parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td class="text-end">S/. ${itemTotal.toFixed(2)}</td>
                    </tr>
                `;
            });
            itemsHtml += '</tbody></table>';

            const total = parseFloat(order.total).toFixed(2);
            const statusBadge = getStatusBadge(order.status);

            const detailHtml = `
                <div class="container-fluid text-start">
                    <div class="row mb-3">
                        <div class="col-12">
                            <p><strong>Estado:</strong> ${statusBadge}</p>
                            <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-PE', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                        </div>
                    </div>
                    <h5 class="mt-4 mb-2">Productos Adquiridos</h5>
                    ${itemsHtml}
                    <div class="d-flex justify-content-end mt-3 me-2">
                        <div class="text-end">
                            <h5 class="text-danger">TOTAL FINAL: S/. ${total}</h5>
                        </div>
                    </div>
                </div>
            `;

            Swal.fire({
                title: `Detalle del Pedido #${orderId}`,
                html: detailHtml,
                icon: 'info',
                width: '800px', 
                showCloseButton: true,
                confirmButtonText: 'Cerrar'
            });

        } catch (error) {
            console.error('Error al obtener detalle:', error);
            Swal.fire(
                    'Error',
                    error.message || 'Ocurrió un error al cargar los detalles del pedido.',
                    'error'
                    );
        }
    };

    window.cancelOrder = async (orderId) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: `Desea cancelar el Pedido #${orderId}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, Cancelar',
            cancelButtonText: 'No, mantener'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/orders/${orderId}/cancel`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error desconocido al cancelar.');
                }

                Swal.fire(
                        'Cancelado!',
                        data.message,
                        'success'
                        );
                loadOrderHistory();

            } catch (error) {
                console.error('Error al cancelar:', error);
                Swal.fire(
                        'Error de Cancelación',
                        error.message,
                        'error'
                        );
            }
        }
    };

    loadOrderHistory();
});

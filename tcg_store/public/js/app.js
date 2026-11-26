const API_PRODUCTOS = '/api/productos';
const API_VENTAS = '/api/ventas';

let productosCache = [];
let carrito = [];

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

function mostrarAlerta(msg, tipo = 'exito') {
    const alerta = document.getElementById('alerta');
    alerta.textContent = msg;
    alerta.className = `alerta ${tipo}`;
    setTimeout(() => alerta.className = 'alerta oculto', 4000);
}

async function cargarProductos(queryString = '') {
    try {
        const res = await fetch(`${API_PRODUCTOS}${queryString}`);
        const productos = await res.json();
        if (!queryString) productosCache = productos;

        renderCatalogo(productos);
        if (!queryString) {
            renderTablaInventario(productos);
            llenarSelectorVentas(productos);
        }
    } catch (error) {
        mostrarAlerta('Error al conectar con el servidor', 'error');
    }
}

function renderCatalogo(productos) {
    const grid = document.getElementById('grid-catalogo');
    if (productos.length === 0) {
        grid.innerHTML = '<p>No se encontraron productos con esos filtros.</p>';
        return;
    }

    grid.innerHTML = productos.map(p => `
        <div class="prod-card">
            <div>
                <img src="${p.imagen || 'https://images.pokemontcg.io/base1/back.png'}" alt="${p.nombre}">
                <span class="badge">${p.categoria}</span>
                ${p.rareza !== 'N/A' ? `<span class="badge">${p.rareza}</span>` : ''}
                <h3>${p.nombre}</h3>
            </div>
            <div>
                <div class="precio">$${Number(p.precio).toFixed(2)} MXN</div>
                <div class="${p.stock > 0 ? 'stock-ok' : 'stock-bajo'}">
                    ${p.stock > 0 ? `Disponibles: ${p.stock} uds.` : 'Agotado'}
                </div>
            </div>
        </div>
    `).join('');
}

function renderTablaInventario(productos) {
    const tbody = document.getElementById('tabla-inventario');
    tbody.innerHTML = productos.map(p => {
        const bajoStock = p.stock < 5;
        return `
            <tr class="${bajoStock ? 'fila-alerta' : ''}">
                <td><strong>${p.nombre}</strong><br><small>${p.rareza}</small></td>
                <td>${p.categoria}</td>
                <td>$${Number(p.precio).toFixed(2)}</td>
                <td>
                    ${p.stock} uds. 
                    ${bajoStock ? '<span class="stock-bajo">⚠️ Reponer</span>' : ''}
                </td>
                <td>
                    <button class="btn btn-edit" onclick="editarProducto('${p._id}')">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarProducto('${p._id}')">X</button>
                </td>
            </tr>
        `;
    }).join('');
}

document.getElementById('btn-filtrar').addEventListener('click', () => {
    const params = new URLSearchParams();
    const nombre = document.getElementById('filtro-nombre').value.trim();
    const categoria = document.getElementById('filtro-categoria').value;
    const rareza = document.getElementById('filtro-rareza').value;
    const precioMax = document.getElementById('filtro-precio').value;

    if (nombre) params.append('nombre', nombre);
    if (categoria) params.append('categoria', categoria);
    if (rareza) params.append('rareza', rareza);
    if (precioMax) params.append('precioMax', precioMax);

    cargarProductos(`?${params.toString()}`);
});

document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
    document.getElementById('filtro-nombre').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-rareza').value = '';
    document.getElementById('filtro-precio').value = '';
    cargarProductos();
});

document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const datos = {
        nombre: document.getElementById('prod-nombre').value.trim(),
        categoria: document.getElementById('prod-categoria').value,
        rareza: document.getElementById('prod-rareza').value,
        precio: Number(document.getElementById('prod-precio').value),
        stock: Number(document.getElementById('prod-stock').value),
        imagen: document.getElementById('prod-imagen').value.trim()
    };

    const url = id ? `${API_PRODUCTOS}/${id}` : API_PRODUCTOS;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        mostrarAlerta(id ? 'Producto actualizado' : 'Producto registrado en Atlas');
        resetForm();
        cargarProductos();
    } else {
        mostrarAlerta('Error al guardar el producto', 'error');
    }
});

async function editarProducto(id) {
    const res = await fetch(`${API_PRODUCTOS}/${id}`);
    const p = await res.json();

    document.getElementById('prod-id').value = p._id;
    document.getElementById('prod-nombre').value = p.nombre;
    document.getElementById('prod-categoria').value = p.categoria;
    document.getElementById('prod-rareza').value = p.rareza;
    document.getElementById('prod-precio').value = p.precio;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-imagen').value = p.imagen || '';

    document.getElementById('form-titulo').textContent = 'Editar Producto';
    document.getElementById('btn-guardar').textContent = 'Actualizar';
    document.getElementById('btn-cancelar').classList.remove('oculto');
}

async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto del inventario?')) return;
    const res = await fetch(`${API_PRODUCTOS}/${id}`, { method: 'DELETE' });
    if (res.ok) {
        mostrarAlerta('Producto eliminado');
        cargarProductos();
    }
}

function resetForm() {
    document.getElementById('form-producto').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('form-titulo').textContent = 'Agregar Producto';
    document.getElementById('btn-guardar').textContent = 'Guardar';
    document.getElementById('btn-cancelar').classList.add('oculto');
}
document.getElementById('btn-cancelar').addEventListener('click', resetForm);

function llenarSelectorVentas(productos) {
    const select = document.getElementById('venta-producto');
    select.innerHTML = productos
        .filter(p => p.stock > 0)
        .map(p => `<option value="${p._id}">${p.nombre} ($${p.precio}) - Stock: ${p.stock}</option>`)
        .join('');
}

document.getElementById('btn-agregar-carrito').addEventListener('click', () => {
    const prodId = document.getElementById('venta-producto').value;
    const cantidad = Number(document.getElementById('venta-cantidad').value);
    const prod = productosCache.find(p => p._id === prodId);

    if (!prod || cantidad <= 0) return;
    if (cantidad > prod.stock) {
        return mostrarAlerta(`Solo hay ${prod.stock} unidades disponibles`, 'error');
    }

    const existente = carrito.find(item => item.productoId === prodId);
    if (existente) {
        if (existente.cantidad + cantidad > prod.stock) {
            return mostrarAlerta('Superas el stock disponible', 'error');
        }
        existente.cantidad += cantidad;
    } else {
        carrito.push({ productoId: prod._id, nombre: prod.nombre, precio: prod.precio, cantidad });
    }
    renderCarrito();
});

function renderCarrito() {
    const tbody = document.getElementById('carrito-body');
    let total = 0;

    tbody.innerHTML = carrito.map((item, idx) => {
        const sub = item.precio * item.cantidad;
        total += sub;
        return `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${sub.toFixed(2)}</td>
                <td><button class="btn btn-danger" onclick="quitarDelCarrito(${idx})">X</button></td>
            </tr>
        `;
    }).join('');

    document.getElementById('venta-total').textContent = `$${total.toFixed(2)}`;
}

function quitarDelCarrito(index) {
    carrito.splice(index, 1);
    renderCarrito();
}

document.getElementById('btn-confirmar-venta').addEventListener('click', async () => {
    if (carrito.length === 0) return mostrarAlerta('Agrega productos antes de confirmar', 'error');

    const res = await fetch(API_VENTAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: carrito })
    });

    const data = await res.json();
    if (res.ok) {
        mostrarAlerta('¡Venta registrada y stock descontado!');
        carrito = [];
        renderCarrito();
        cargarProductos();
        cargarVentas();
    } else {
        mostrarAlerta(data.mensaje || 'Error al registrar venta', 'error');
    }
});

async function cargarVentas() {
    const res = await fetch(API_VENTAS);
    const ventas = await res.json();
    const contenedor = document.getElementById('historial-ventas');

    contenedor.innerHTML = ventas.map(v => `
        <div class="venta-item">
            <strong>Fecha:</strong> ${new Date(v.fecha).toLocaleString('es-MX')} <br>
            <strong>Artículos:</strong> ${v.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ')} <br>
            <strong>Total cobrado:</strong> $${Number(v.total).toFixed(2)} MXN
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarVentas();
});
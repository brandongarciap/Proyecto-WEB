const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const Venta = require('../models/Venta');

// Obtener historial de ventas
router.get('/', async (req, res) => {
    try {
        const ventas = await Venta.find().sort({ fecha: -1 });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener ventas', error: error.message });
    }
});

// Registrar venta y descontar stock
router.post('/', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ mensaje: 'Debes agregar al menos un producto a la venta' });
        }

        let totalVenta = 0;
        const detalleProductos = [];

        for (const item of items) {
            const prod = await Producto.findById(item.productoId);
            if (!prod) return res.status(404).json({ mensaje: 'Producto no encontrado' });
            
            if (prod.stock < item.cantidad) {
                return res.status(400).json({ 
                    mensaje: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}` 
                });
            }

            const subtotal = prod.precio * item.cantidad;
            totalVenta += subtotal;

            detalleProductos.push({
                productoId: prod._id,
                nombre: prod.nombre,
                cantidad: item.cantidad,
                precioUnitario: prod.precio,
                subtotal
            });
        }

        for (const item of detalleProductos) {
            await Producto.findByIdAndUpdate(item.productoId, {
                $inc: { stock: -item.cantidad }
            });
        }

        const nuevaVenta = new Venta({
            productos: detalleProductos,
            total: totalVenta
        });
        await nuevaVenta.save();

        res.status(201).json({ mensaje: 'Venta registrada y stock actualizado', venta: nuevaVenta });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al procesar la venta', error: error.message });
    }
});

module.exports = router;
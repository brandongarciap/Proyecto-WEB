const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    productos: [
        {
            productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
            nombre: String,
            cantidad: { type: Number, required: true, min: 1 },
            precioUnitario: Number,
            subtotal: Number
        }
    ],
    total: { type: Number, required: true },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venta', ventaSchema);
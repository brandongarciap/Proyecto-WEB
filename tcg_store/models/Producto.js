const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    categoria: { 
        type: String, 
        required: true, 
        enum: ['Carta Individual', 'Sobre', 'Caja', 'Accesorio'] 
    },
    rareza: { 
        type: String, 
        default: 'N/A'
    },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    imagen: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const mongoose = require('mongoose');


// Consultar catálogo con filtros
router.get('/', async (req, res) => {
    try {
        const { nombre, categoria, rareza, precioMax } = req.query;
        const filtro = {};

        if (nombre) filtro.nombre = { $regex: nombre, $options: 'i' };
        if (categoria) filtro.categoria = categoria;
        if (rareza) filtro.rareza = rareza;
        if (precioMax) filtro.precio = { $lte: Number(precioMax) };

        const productos = await Producto.find(filtro).sort({ createdAt: -1 });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al consultar productos', error: error.message });
    }
});

// Consultar un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar el producto', error: error.message });
    }
});

// Agregar producto
router.post('/', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(400).json({ mensaje: 'Datos inválidos al registrar producto', error: error.message });
    }
});

// Modificar producto
router.put('/:id', async (req, res) => {
    try {
        const actualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!actualizado) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar producto', error: error.message });
    }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
    try {
        const eliminado = await Producto.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
    }
});

module.exports = router;
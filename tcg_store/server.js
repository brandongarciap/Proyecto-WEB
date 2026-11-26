require('dotenv').config();
const express = require('express');
const path = require('path');


const conectarDB = require('./Config/db');
const productosRoutes = require('./routes/productoRoutes');
const ventasRoutes = require('./routes/ventaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

conectarDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
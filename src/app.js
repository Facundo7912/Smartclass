/**
 * SmartClass Backend - Configuración de Express
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import indexRoutes from './routes/index.routes.js';
import courseRoutes from './routes/course.routes.js';
// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();

// ========== MIDDLEWARES ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de peticiones
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// ========== RUTAS ==========
app.use('/api', indexRoutes);
app.use('/api/courses', courseRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a SmartClass API',
    version: '1.0.0',
    status: 'running'
  });
});

// ========== MANEJO DE ERRORES ==========
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
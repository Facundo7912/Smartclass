import { Router } from 'express';
import {
  listClassesController,
  getClassController,
  createClassController,
  updateClassController,
  removeClassController
} from '../controllers/class.controller.js';

const router = Router();
const HARDCODED_USER_ID = 'user-123'; // TODO: reemplazar con usuario autenticado

// Middleware para inyectar userId en req
router.use((req, res, next) => {
  req.userId = HARDCODED_USER_ID;
  next();
});

// GET /classes - obtener todas las clases
router.get('/', listClassesController);

// POST /classes - crear nueva clase
router.post('/', createClassController);

// GET /classes/:id - obtener una clase específica
router.get('/:id', getClassController);

// PATCH /classes/:id - actualizar una clase
router.patch('/:id', updateClassController);

// DELETE /classes/:id - eliminar una clase
router.delete('/:id', removeClassController);

export default router;

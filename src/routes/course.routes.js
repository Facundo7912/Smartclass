import { Router } from 'express';
import {
  listCoursesController,
  getCourseController,
  createCourseController,
  updateCourseController,
  removeCourseController
} from '../controllers/course.controller.js';

const router = Router();
const HARDCODED_USER_ID = 'user-123'; // TODO: reemplazar con usuario autenticado

// Middleware para inyectar userId en req.body y req.query
router.use((req, res, next) => {
  req.userId = HARDCODED_USER_ID;
  next();
});

// GET /courses - obtener todos los cursos
router.get('/', listCoursesController);

// POST /courses - crear nuevo curso
router.post('/', createCourseController);

// GET /courses/:id - obtener un curso específico
router.get('/:id', getCourseController);

// PATCH /courses/:id - actualizar un curso
router.patch('/:id', updateCourseController);

// DELETE /courses/:id - eliminar un curso
router.delete('/:id', removeCourseController);

export default router;

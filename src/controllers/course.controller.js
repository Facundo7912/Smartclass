import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  removeCourse
} from '../models/Course.model.js';

// Obtener todos los cursos del usuario
export async function listCoursesController(req, res, next) {
  try {
    const userId = req.userId;
    const courses = await getAllCourses(userId);
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
}

// Obtener un curso por ID
export async function getCourseController(req, res, next) {
  try {
    const { id } = req.params;
    const course = await getCourseById(id);
    
    if (!course) {
      return res.status(404).json({ success: false, error: 'Curso no encontrado' });
    }
    
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
}

// Crear un nuevo curso
export async function createCourseController(req, res, next) {
  try {
    const userId = req.userId;
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'name y description son requeridos'
      });
    }
    
    const course = await createCourse({
      name,
      description,
      userId
    });
    
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
}

// Actualizar un curso
export async function updateCourseController(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const course = await updateCourse(id, updates);
    
    if (!course) {
      return res.status(404).json({ success: false, error: 'Curso no encontrado' });
    }
    
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
}

// Eliminar un curso
export async function removeCourseController(req, res, next) {
  try {
    const { id } = req.params;
    
    const course = await removeCourse(id);
    
    if (!course) {
      return res.status(404).json({ success: false, error: 'Curso no encontrado' });
    }
    
    res.json({ success: true, message: 'Curso eliminado', data: course });
  } catch (error) {
    next(error);
  }
}

import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  removeClass
} from '../models/class.model.js';

// Obtener todas las clases del usuario
export async function listClassesController(req, res, next) {
  try {
    const userId = req.userId;
    const classes = await getAllClasses(userId);
    res.json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
}

// Obtener una clase por ID
export async function getClassController(req, res, next) {
  try {
    const { id } = req.params;
    const classData = await getClassById(id);
    
    if (!classData) {
      return res.status(404).json({ success: false, error: 'Clase no encontrada' });
    }
    
    res.json({ success: true, data: classData });
  } catch (error) {
    next(error);
  }
}

// Crear una nueva clase
export async function createClassController(req, res, next) {
  try {
    const userId = req.userId;
    const { title, date, courseId, notes } = req.body;
    
    if (!title || !date || !courseId) {
      return res.status(400).json({
        success: false,
        error: 'title, date y courseId son requeridos'
      });
    }
    
    const classData = await createClass({
      title,
      date,
      courseId,
      userId,
      notes: notes || ''
    });
    
    res.status(201).json({ success: true, data: classData });
  } catch (error) {
    next(error);
  }
}

// Actualizar una clase
export async function updateClassController(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const classData = await updateClass(id, updates);
    
    if (!classData) {
      return res.status(404).json({ success: false, error: 'Clase no encontrada' });
    }
    
    res.json({ success: true, data: classData });
  } catch (error) {
    next(error);
  }
}

// Eliminar una clase
export async function removeClassController(req, res, next) {
  try {
    const { id } = req.params;
    
    const classData = await removeClass(id);
    
    if (!classData) {
      return res.status(404).json({ success: false, error: 'Clase no encontrada' });
    }
    
    res.json({ success: true, message: 'Clase eliminada', data: classData });
  } catch (error) {
    next(error);
  }
}

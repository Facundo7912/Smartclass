// Class Model - devuelve datos mockeados (próximamente reemplazar con Supabase)

const mockClasses = [
  {
    id: 'class-001',
    title: 'Introducción a Node.js - Clase 1',
    date: '2026-06-15T14:00:00.000Z',
    courseId: 'course-001',
    userId: 'user-123',
    notes: 'Instalación y configuración del entorno',
    createdAt: new Date('2026-06-01T10:30:00.000Z')
  },
  {
    id: 'class-002',
    title: 'Hooks en React - Clase 1',
    date: '2026-06-16T15:30:00.000Z',
    courseId: 'course-002',
    userId: 'user-123',
    notes: 'useState, useEffect y custom hooks',
    createdAt: new Date('2026-06-02T11:00:00.000Z')
  },
  {
    id: 'class-003',
    title: 'Tablas en Supabase - Clase 1',
    date: '2026-06-17T16:00:00.000Z',
    courseId: 'course-003',
    userId: 'user-123',
    notes: 'Creación de tablas y relaciones',
    createdAt: new Date('2026-06-03T09:00:00.000Z')
  }
];

let classes = [...mockClasses];

// Obtener todas las clases de un usuario
export async function getAllClasses(userId) {
  return classes.filter(cls => cls.userId === userId);
}

// Obtener una clase por ID
export async function getClassById(id) {
  return classes.find(cls => cls.id === id) || null;
}

// Crear una nueva clase
export async function createClass(classData) {
  const newClass = {
    id: `class-${Date.now()}`,
    ...classData,
    createdAt: new Date().toISOString()
  };
  classes.push(newClass);
  return newClass;
}

// Actualizar una clase
export async function updateClass(id, updates) {
  const index = classes.findIndex(cls => cls.id === id);
  if (index === -1) return null;
  
  classes[index] = { ...classes[index], ...updates };
  return classes[index];
}

// Eliminar una clase
export async function removeClass(id) {
  const index = classes.findIndex(cls => cls.id === id);
  if (index === -1) return null;
  
  const removed = classes.splice(index, 1);
  return removed[0];
}

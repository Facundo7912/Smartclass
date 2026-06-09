// Course Model - devuelve datos mockeados (próximamente reemplazar con Supabase)

const mockCourses = [
  {
    id: 'course-001',
    name: 'Introducción a Node.js',
    description: 'Aprende los fundamentos de Node.js y Express',
    userId: 'user-123',
    createdAt: new Date('2025-01-15')
  },
  {
    id: 'course-002',
    name: 'React desde cero',
    description: 'Domina React, hooks y state management',
    userId: 'user-123',
    createdAt: new Date('2025-02-20')
  },
  {
    id: 'course-003',
    name: 'Bases de datos con Supabase',
    description: 'Integra Supabase en tus aplicaciones web',
    userId: 'user-123',
    createdAt: new Date('2025-03-10')
  }
];

let courses = [...mockCourses];

// Obtener todos los cursos de un usuario
export async function getAllCourses(userId) {
  return courses.filter(course => course.userId === userId);
}

// Obtener un curso por ID
export async function getCourseById(id) {
  return courses.find(course => course.id === id) || null;
}

// Crear un nuevo curso
export async function createCourse(courseData) {
  const newCourse = {
    id: `course-${Date.now()}`,
    ...courseData,
    createdAt: new Date()
  };
  courses.push(newCourse);
  return newCourse;
}

// Actualizar un curso
export async function updateCourse(id, updates) {
  const index = courses.findIndex(course => course.id === id);
  if (index === -1) return null;
  
  courses[index] = { ...courses[index], ...updates };
  return courses[index];
}

// Eliminar un curso
export async function removeCourse(id) {
  const index = courses.findIndex(course => course.id === id);
  if (index === -1) return null;
  
  const removed = courses.splice(index, 1);
  return removed[0];
}

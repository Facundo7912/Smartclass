import { supabase } from '../supabase.js';

const normalizeClass = (record) => ({
  ...record,
  courseId: record.course_id ?? record.courseId,
  userId: record.user_id ?? record.userId
});

// Obtener todas las clases de un usuario
export async function getAllClasses(userId) {
  try {
    const { data, error } = await supabase
      .from('Classes')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data ?? []).map(normalizeClass);
  } catch (error) {
    throw error;
  }
}

// Obtener una clase por ID
export async function getClassById(id) {
  try {
    const { data, error } = await supabase
      .from('Classes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ?? null;
  } catch (error) {
    throw error;
  }
}

// Crear una nueva clase
export async function createClass(classData) {
  try {
    const newClass = {
      id: `class-${Date.now()}`,
      title: classData.title,
      date: classData.date,
      course_id: classData.courseId,
      user_id: classData.userId,
      notes: classData.notes ?? '',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('Classes')
      .insert(newClass)
      .select()
      .single();

    if (error) throw error;
    return data ? normalizeClass(data) : null;
  } catch (error) {
    throw error;
  }
}

// Actualizar una clase
export async function updateClass(id, updates) {
  try {
    const { data, error } = await supabase
      .from('Classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ?? null;
  } catch (error) {
    throw error;
  }
}

// Eliminar una clase
export async function removeClass(id) {
  try {
    const { data: existingClass, error: fetchError } = await supabase
      .from('Classes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return null;
      throw fetchError;
    }

    const { error: deleteError } = await supabase
      .from('Classes')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return existingClass ? normalizeClass(existingClass) : null;
  } catch (error) {
    throw error;
  }
}

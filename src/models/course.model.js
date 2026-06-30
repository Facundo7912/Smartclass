import { supabase } from '../supabase.js';

// Obtener todos los cursos de un usuario
export async function getAllCourses(userId) {
  try {
    const { data, error } = await supabase
      .from('Course')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw error;
  }
}

// Obtener un curso por ID
export async function getCourseById(id) {
  try {
    const { data, error } = await supabase
      .from('Course')
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

// Crear un nuevo curso
export async function createCourse(courseData) {
  try {
    const { data, error } = await supabase
      .from('Course')
      .insert({
        name: courseData.name,
        description: courseData.description,
        user_id: courseData.userId
      })
      .select()
      .single();

    if (error) throw error;
    return data ?? null;
  } catch (error) {
    throw error;
  }
}

// Actualizar un curso
export async function updateCourse(id, updates) {
  try {
    const { data, error } = await supabase
      .from('Course')
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

// Eliminar un curso
export async function removeCourse(id) {
  try {
    const { data: existingCourse, error: fetchError } = await supabase
      .from('Course')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return null;
      throw fetchError;
    }

    const { error: deleteError } = await supabase
      .from('Course')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return existingCourse ?? null;
  } catch (error) {
    throw error;
  }
}

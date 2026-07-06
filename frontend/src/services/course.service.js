import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const isDev = import.meta.env.MODE === 'development'

if (!API_URL && !isDev) {
  throw new Error('VITE_API_URL no está definido en producción. Configura la variable en Vercel.')
}

const BASE_URL = API_URL ? `${API_URL}/api/courses` : '/api/courses'
console.log('🔍 course.service init', { API_URL, BASE_URL, mode: import.meta.env.MODE })

export const getAllCourses = async () => {
  console.log('🔍 getAllCourses ->', BASE_URL)
  const response = await axios.get(BASE_URL)
  console.log('🔍 getAllCourses response', response.data)
  return response.data.data
}

export const getCourseById = async (id) => {
  const url = `${BASE_URL}/${id}`
  console.log('🔍 getCourseById ->', url)
  const response = await axios.get(url)
  return response.data.data
}

export const createCourse = async (courseData) => {
  console.log('🔍 createCourse ->', BASE_URL, courseData)
  const response = await axios.post(BASE_URL, courseData)
  console.log('🔍 createCourse response', response.data)
  if (!response.data?.success) {
    throw new Error(response.data?.error || 'Error desconocido al crear el curso')
  }
  return response.data.data
}

export const updateCourse = async (id, updates) => {
  const url = `${BASE_URL}/${id}`
  console.log('🔍 updateCourse ->', url, updates)
  const response = await axios.patch(url, updates)
  return response.data.data
}

export const deleteCourse = async (id) => {
  const url = `${BASE_URL}/${id}`
  console.log('🔍 deleteCourse ->', url)
  const response = await axios.delete(url)
  console.log('🔍 deleteCourse response', response.data)
  if (!response.data?.success) {
    throw new Error(response.data?.error || 'Error desconocido al eliminar el curso')
  }
  return response.data.data
}

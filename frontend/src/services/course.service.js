import axios from 'axios'
// En course.service.js, justo después de los imports o al principio

console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL);
const API_URL = import.meta.env.VITE_API_URL || '';
console.log('🔍 API_URL:', API_URL);
const BASE_URL = `${API_URL}/api/courses`;
console.log('🔍 BASE_URL:', BASE_URL);
const BASE_URL = '/api/courses'

export const getAllCourses = async () => {
  const response = await axios.get(BASE_URL)
  return response.data.data
}

export const getCourseById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`)
  return response.data.data
}

export const createCourse = async (courseData) => {
  const response = await axios.post(BASE_URL, courseData)
  return response.data.data
}

export const updateCourse = async (id, updates) => {
  const response = await axios.patch(`${BASE_URL}/${id}`, updates)
  return response.data.data
}

export const deleteCourse = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`)
  return response.data.data
}

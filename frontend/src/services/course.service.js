import axios from 'axios'

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

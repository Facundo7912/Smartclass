import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const BASE_URL = API_URL ? `${API_URL}/api/classes` : '/api/classes'

console.log('🔍 class.service init', { API_URL, BASE_URL })

export const getAllClasses = async () => {
  console.log('🔍 getAllClasses ->', BASE_URL)
  const response = await axios.get(BASE_URL)
  console.log('🔍 getAllClasses response', response.data)
  return response.data.data
}

export const getClassById = async (id) => {
  const url = `${BASE_URL}/${id}`
  console.log('🔍 getClassById ->', url)
  const response = await axios.get(url)
  return response.data.data
}

export const createClass = async (classData) => {
  console.log('🔍 createClass ->', BASE_URL, classData)
  const response = await axios.post(BASE_URL, classData)
  return response.data.data
}

export const updateClass = async (id, updates) => {
  const url = `${BASE_URL}/${id}`
  console.log('🔍 updateClass ->', url, updates)
  const response = await axios.patch(url, updates)
  return response.data.data
}

export const deleteClass = async (id) => {
  const url = `${BASE_URL}/${id}`
  console.log('🔍 deleteClass ->', url)
  const response = await axios.delete(url)
  return response.data.data
}

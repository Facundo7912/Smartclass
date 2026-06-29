import axios from 'axios'

const BASE_URL = '/api/classes'

export const getAllClasses = async () => {
  const response = await axios.get(BASE_URL)
  return response.data.data
}

export const getClassById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`)
  return response.data.data
}

export const createClass = async (classData) => {
  const response = await axios.post(BASE_URL, classData)
  return response.data.data
}

export const updateClass = async (id, updates) => {
  const response = await axios.patch(`${BASE_URL}/${id}`, updates)
  return response.data.data
}

export const deleteClass = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`)
  return response.data.data
}

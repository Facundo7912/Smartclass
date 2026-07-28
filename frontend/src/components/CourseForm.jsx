import { useEffect, useState } from 'react'
import { createCourse, updateCourse } from '../services/course.service.js'

const CourseForm = ({ onCourseCreated, editingCourse, onCancelEdit }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name || '')
      setDescription(editingCourse.description || '')
    } else {
      setName('')
      setDescription('')
    }
  }, [editingCourse])

  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(() => setSuccess(''), 3000)
    return () => window.clearTimeout(timer)
  }, [success])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !description.trim()) {
      setError('Completa ambos campos.')
      return
    }

    setLoading(true)

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id ?? editingCourse._id, {
          name: name.trim(),
          description: description.trim()
        })
        setSuccess('Curso actualizado correctamente.')
      } else {
        await createCourse({ name: name.trim(), description: description.trim() })
        setSuccess('Curso creado correctamente.')
      }

      setName('')
      setDescription('')
      onCourseCreated?.()
      onCancelEdit?.()
    } catch (err) {
      setError(editingCourse ? 'No se pudo actualizar el curso.' : 'No se pudo crear el curso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card-paper p-5 space-y-3" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-[#3E2723] flex items-center gap-2 border-b border-[#EADBC8] pb-2">
        <span className="pin w-4 h-4 inline-block"></span>
        {editingCourse ? 'Editar curso' : 'Nuevo curso'}
      </h2>
      
      {error && <p className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}
      {success && <p className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{success}</p>}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#4A3728]">Nombre</label>
        <input
          className="input-paper py-2 px-3 text-sm"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: Matemática Avanzada"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#4A3728]">Descripción</label>
        <textarea
          className="input-paper py-2 px-3 text-sm min-h-[60px] max-h-[100px]"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe brevemente el curso..."
          rows={2}
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          className="btn-primary py-2 px-5 text-sm min-w-[120px]"
          type="submit"
          disabled={loading}
        >
          {loading ? (editingCourse ? 'Actualizando...' : 'Creando...') : (editingCourse ? 'Actualizar curso' : 'Crear curso')}
        </button>
        {editingCourse && (
          <button
            className="btn-secondary py-2 px-5 text-sm"
            type="button"
            onClick={() => onCancelEdit?.()}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default CourseForm
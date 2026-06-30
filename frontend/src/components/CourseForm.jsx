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

    const timer = window.setTimeout(() => {
      setSuccess('')
    }, 3000)

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

  const formStyle = {
    display: 'grid',
    gap: '14px',
    padding: '18px',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    background: '#ffffff'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    background: '#f9fafb'
  }

  const buttonStyle = {
    border: 'none',
    borderRadius: '14px',
    padding: '14px 18px',
    background: '#4338ca',
    color: '#ffffff',
    cursor: loading ? 'not-allowed' : 'pointer'
  }

  return (
    <form style={formStyle} onSubmit={handleSubmit}>
      <h2 style={{ margin: 0 }}>{editingCourse ? 'Editar curso' : 'Nuevo curso'}</h2>
      {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}
      {success && <p style={{ color: '#166534', margin: 0 }}>{success}</p>}
      <label style={{ display: 'grid', gap: '8px' }}>
        Nombre
        <input
          style={inputStyle}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre del curso"
        />
      </label>
      <label style={{ display: 'grid', gap: '8px' }}>
        Descripción
        <textarea
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Descripción del curso"
        />
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? (editingCourse ? 'Actualizando...' : 'Creando...') : (editingCourse ? 'Actualizar curso' : 'Crear curso')}
        </button>
        {editingCourse && (
          <button
            style={{ ...buttonStyle, background: '#6b7280' }}
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

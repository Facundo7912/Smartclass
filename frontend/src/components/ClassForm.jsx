import { useEffect, useState } from 'react'
import { createClass, updateClass } from '../services/class.service.js'

const ClassForm = ({ onClassCreated, editingClass, onCancelEdit, courses = [] }) => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [courseId, setCourseId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (editingClass) {
      setTitle(editingClass.title || '')
      setDate(editingClass.date || '')
      setCourseId(editingClass.courseId || '')
      setNotes(editingClass.notes || '')
    } else {
      setTitle('')
      setDate('')
      setCourseId('')
      setNotes('')
    }
  }, [editingClass])

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

    if (!title.trim() || !date || !courseId) {
      setError('Completa título, fecha y curso.')
      return
    }

    setLoading(true)

    try {
      if (editingClass) {
        await updateClass(editingClass.id ?? editingClass._id, {
          title: title.trim(),
          date,
          courseId,
          notes: notes.trim()
        })
        setSuccess('Clase actualizada correctamente.')
      } else {
        await createClass({ title: title.trim(), date, courseId, notes: notes.trim() })
        setSuccess('Clase creada correctamente.')
      }

      setTitle('')
      setDate('')
      setCourseId('')
      setNotes('')
      onClassCreated?.()
      onCancelEdit?.()
    } catch (err) {
      setError(editingClass ? 'No se pudo actualizar la clase.' : 'No se pudo crear la clase.')
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
      <h2 style={{ margin: 0 }}>{editingClass ? 'Editar clase' : 'Nueva clase'}</h2>
      {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}
      {success && <p style={{ color: '#166534', margin: 0 }}>{success}</p>}
      <label style={{ display: 'grid', gap: '8px' }}>
        Título
        <input
          style={inputStyle}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título de la clase"
        />
      </label>
      <label style={{ display: 'grid', gap: '8px' }}>
        Fecha
        <input
          type="date"
          style={inputStyle}
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>
      <label style={{ display: 'grid', gap: '8px' }}>
        Curso
        <select
          style={inputStyle}
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
        >
          <option value="">Selecciona un curso</option>
          {courses.length === 0 ? (
            <option value="" disabled>No hay cursos disponibles</option>
          ) : (
            courses.map((course) => (
              <option key={course.id ?? course._id} value={course.id ?? course._id}>
                {course.name}
              </option>
            ))
          )}
        </select>
      </label>
      <label style={{ display: 'grid', gap: '8px' }}>
        Notas
        <textarea
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notas opcionales"
        />
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? (editingClass ? 'Actualizando...' : 'Creando...') : (editingClass ? 'Actualizar clase' : 'Crear clase')}
        </button>
        {editingClass && (
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

export default ClassForm

import { useState } from 'react'
import { createClass } from '../services/class.service.js'

const ClassForm = ({ onClassCreated }) => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [courseId, setCourseId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!title.trim() || !date || !courseId) {
      setError('Completa título, fecha y curso.')
      return
    }

    setLoading(true)

    try {
      await createClass({ title: title.trim(), date, courseId, notes: notes.trim() })
      setTitle('')
      setDate('')
      setCourseId('')
      setNotes('')
      onClassCreated?.()
    } catch (err) {
      setError('No se pudo crear la clase.')
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
      <h2 style={{ margin: 0 }}>Nueva clase</h2>
      {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}
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
          <option value="course-001">course-001</option>
          <option value="course-002">course-002</option>
          <option value="course-003">course-003</option>
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
      <button style={buttonStyle} type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear clase'}
      </button>
    </form>
  )
}

export default ClassForm

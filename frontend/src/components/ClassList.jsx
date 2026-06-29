import { useEffect, useState } from 'react'
import { deleteClass, getAllClasses } from '../services/class.service.js'

const ClassList = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadClasses = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getAllClasses()
      setClasses(data)
    } catch (err) {
      setError('No se pudieron cargar las clases.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  const handleDelete = async (id) => {
    setError('')
    setLoading(true)

    try {
      await deleteClass(id)
      await loadClasses()
    } catch (err) {
      setError('No se pudo eliminar la clase.')
      setLoading(false)
    }
  }

  const containerStyle = {
    border: '1px solid #d1d5db',
    borderRadius: '16px',
    background: '#ffffff',
    padding: '18px'
  }

  const itemStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '12px',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '16px',
    alignItems: 'start'
  }

  const buttonStyle = {
    border: '1px solid #ef4444',
    borderRadius: '12px',
    background: '#fef2f2',
    color: '#b91c1c',
    padding: '10px 14px',
    cursor: 'pointer'
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ marginTop: 0 }}>Lista de clases</h2>
      {loading && <p>Cargando clases...</p>}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && classes.length === 0 && <p>No hay clases cuando cargar.</p>}
      {!loading && classes.length > 0 && (
        <div>
          {classes.map((classItem) => (
            <div key={classItem.id ?? classItem._id} style={itemStyle}>
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{classItem.title}</p>
                <p style={{ margin: '8px 0 0', color: '#4b5563' }}>Fecha: {classItem.date}</p>
                <p style={{ margin: '4px 0 0', color: '#4b5563' }}>Curso ID: {classItem.courseId}</p>
              </div>
              <button style={buttonStyle} type="button" onClick={() => handleDelete(classItem.id ?? classItem._id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClassList

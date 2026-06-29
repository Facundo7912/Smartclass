import { useEffect, useState } from 'react'
import { deleteCourse, getAllCourses } from '../services/course.service.js'

const CourseList = ({ refreshTrigger }) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCourses = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getAllCourses()
      setCourses(data)
    } catch (err) {
      setError('No se pudieron cargar los cursos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [refreshTrigger])

  const handleDelete = async (id) => {
    setError('')
    setLoading(true)

    try {
      await deleteCourse(id)
      await loadCourses()
    } catch (err) {
      setError('No se pudo eliminar el curso.')
      setLoading(false)
    }
  }

  const containerStyle = {
    border: '1px solid #d1d5db',
    borderRadius: '16px',
    padding: '18px',
    background: '#ffffff'
  }

  const itemStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start'
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
      <h2 style={{ marginTop: 0 }}>Lista de cursos</h2>
      {loading && <p>Cargando cursos...</p>}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && courses.length === 0 && <p>No hay cursos disponibles.</p>}
      {!loading && courses.length > 0 && (
        <div>
          {courses.map((course) => (
            <div key={course.id ?? course._id} style={itemStyle}>
              <div>
                <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{course.name}</p>
                <p style={{ margin: 0, color: '#4b5563' }}>{course.description}</p>
              </div>
              <button style={buttonStyle} type="button" onClick={() => handleDelete(course.id ?? course._id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseList

import { useEffect, useState } from 'react'
import { deleteCourse, getAllCourses } from '../services/course.service.js'

const CourseList = ({ refreshTrigger, onEdit }) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [empty, setEmpty] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadCourses = async () => {
    setLoading(true)
    setError('')
    setEmpty(false)
    setFeedback('')

    try {
      const data = await getAllCourses()
      setCourses(data)
      setEmpty(Array.isArray(data) && data.length === 0)
    } catch (err) {
      setError('No se pudieron cargar los cursos.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [refreshTrigger])

  const handleDelete = async (course) => {
    const confirmed = window.confirm(`¿Eliminar el curso "${course.name}"?`)
    if (!confirmed) return

    setError('')
    setFeedback('')
    setLoading(true)

    try {
      await deleteCourse(course.id ?? course._id)
      setFeedback('Curso eliminado correctamente.')
      await loadCourses()
    } catch (err) {
      setError('No se pudo eliminar el curso.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card-paper p-4 text-center text-[#4A3728]">Cargando cursos...</div>
  if (error) return (
    <div className="card-paper p-4 text-center">
      <p className="text-red-600 text-sm">{error}</p>
      <button className="btn-secondary py-1.5 px-4 text-sm mt-2" onClick={loadCourses}>
        Reintentar
      </button>
    </div>
  )
  if (empty) return <div className="card-paper p-4 text-center text-[#4A3728]">No hay cursos. Creá el primero.</div>

  return (
    <div className="card-paper p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#EADBC8] pb-2">
        <h3 className="text-sm font-semibold text-[#3E2723]">Lista de cursos</h3>
        <span className="text-xs text-[#B8865C]">{courses.length} cursos</span>
      </div>

      {feedback && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{feedback}</p>}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {courses.map((course) => (
          <div
            key={course.id ?? course._id}
            className="bg-[#FFFCF8] border border-[#EADBC8] rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#B8865C]">📌</span>
                <span className="text-sm font-semibold text-[#3E2723] truncate">{course.name}</span>
              </div>
              {course.description && (
                <p className="text-xs text-[#4A3728] truncate mt-0.5">{course.description}</p>
              )}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                className="text-xs bg-[#D97706] hover:bg-[#B45309] text-white px-3 py-1 rounded transition-colors"
                onClick={() => onEdit?.(course)}
              >
                Editar
              </button>
              <button
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                onClick={() => handleDelete(course)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseList
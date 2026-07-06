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
      setError('No se pudieron cargar los cursos. Intentá de nuevo.')
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

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 space-y-10">
      <div>
        <h2 className="text-h2-mobile md:text-[30px] font-semibold text-primary leading-tight">Lista de cursos</h2>
      </div>

      {loading && <p className="text-secondary">Cargando cursos...</p>}

      {error && (
        <div className="space-y-3">
          <p className="text-red-600">{error}</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            type="button"
            onClick={() => loadCourses()}
          >
            Reintentar
          </button>
        </div>
      )}

      {feedback && <p className="text-green-600">{feedback}</p>}

      {!loading && !error && empty && (
        <p className="text-secondary">Todavía no tenés cursos. Creá el primero.</p>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id ?? course._id}
              className="min-w-[280px] md:min-w-[320px] bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:border-primary transition-colors"
            >
              <div className="space-y-4 flex-1">
                <span className="inline-flex px-2 py-1 bg-primary-container text-white text-[10px] font-bold tracking-wider rounded uppercase">
                  {course.id ?? course._id}
                </span>
                <div>
                  <p className="text-lg font-bold text-primary mb-1">{course.name}</p>
                  <p className="text-secondary text-sm mb-4">{course.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-3 flex-shrink-0">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex-shrink-0"
                  type="button"
                  onClick={() => onEdit?.(course)}
                >
                  Editar
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex-shrink-0"
                  type="button"
                  onClick={() => handleDelete(course)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseList

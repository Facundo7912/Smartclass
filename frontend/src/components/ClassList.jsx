import { useEffect, useState } from 'react'
import { deleteClass, getAllClasses } from '../services/class.service.js'

const ClassList = ({ refreshTrigger, onEdit, courses = [] }) => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [empty, setEmpty] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadClasses = async () => {
    setLoading(true)
    setError('')
    setEmpty(false)
    setFeedback('')

    try {
      const data = await getAllClasses()
      setClasses(data)
      setEmpty(Array.isArray(data) && data.length === 0)
    } catch (err) {
      setError('No se pudieron cargar las clases. Intentá de nuevo.')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const getDayLabel = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''

    const today = new Date()
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const diffDays = Math.round((normalizedDate - normalizedToday) / 86400000)

    if (diffDays === 0) return 'HOY'
    if (diffDays === 1) return 'MAÑANA'
    if (diffDays === 2) return 'PASADO MAÑANA'

    return new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date).toUpperCase()
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  }

  const getStatusInfo = (dateString) => {
    if (!dateString) return { label: 'Pendiente', classes: 'bg-amber-100 text-amber-700 border-amber-200' }

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return { label: 'Pendiente', classes: 'bg-amber-100 text-amber-700 border-amber-200' }
    }

    const today = new Date()
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (normalizedDate.getTime() < normalizedToday.getTime()) {
      return { label: 'Completada', classes: 'bg-slate-100 text-slate-600 border-slate-200' }
    }

    if (normalizedDate.getTime() === normalizedToday.getTime()) {
      return { label: 'Confirmada', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    }

    return { label: 'Pendiente', classes: 'bg-amber-100 text-amber-700 border-amber-200' }
  }

  useEffect(() => {
    loadClasses()
  }, [refreshTrigger])

  const handleDelete = async (classItem) => {
    const confirmed = window.confirm(`¿Eliminar la clase "${classItem.title}"?`)
    if (!confirmed) return

    setError('')
    setFeedback('')
    setLoading(true)

    try {
      await deleteClass(classItem.id ?? classItem._id)
      setFeedback('Clase eliminada correctamente.')
      await loadClasses()
    } catch (err) {
      setError('No se pudo eliminar la clase.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-h2-mobile md:text-[30px] font-semibold text-primary leading-tight">Próximas Clases</h2>
      </div>

      {loading && <p className="text-secondary">Cargando clases...</p>}

      {error && (
        <div className="space-y-3">
          <p className="text-red-600">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded hover:bg-primary-container transition-colors active:scale-95"
            type="button"
            onClick={() => loadClasses()}
          >
            Reintentar
          </button>
        </div>
      )}

      {feedback && <p className="text-green-600">{feedback}</p>}

      {!loading && !error && empty && (
        <p className="text-secondary">Todavía no tenés clases. Creá la primera.</p>
      )}

      {!loading && !error && classes.length > 0 && (
        <div className="space-y-4">
          {classes.map((classItem) => {
            const course = Array.isArray(courses)
              ? courses.find((item) => item.id === classItem.courseId || item._id === classItem.courseId)
              : null
            const courseName = course?.name ?? classItem.courseId
            const statusInfo = getStatusInfo(classItem.date)

            return (
              <div
                key={classItem.id ?? classItem._id}
                className="bg-white border border-outline-variant p-4 md:p-5 rounded-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all hover:bg-surface-container-low"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex flex-col items-center justify-center bg-surface-container p-2 rounded w-16 flex-shrink-0">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{getDayLabel(classItem.date)}</span>
                    <span className="text-xl font-bold text-primary">{formatTime(classItem.date)}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base md:text-lg font-semibold text-primary">{classItem.title}</h4>
                    <p className="mt-1 text-sm text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">school</span>
                      <span>{courseName}</span>
                    </p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${statusInfo.classes}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusInfo.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:self-center">
                  <button
                    className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded hover:bg-primary-container transition-colors active:scale-95"
                    type="button"
                    onClick={() => onEdit?.(classItem)}
                  >
                    Editar
                  </button>
                  <button
                    className="p-2 border border-outline-variant rounded text-primary hover:bg-surface-container transition-colors active:scale-95"
                    type="button"
                    onClick={() => handleDelete(classItem)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ClassList

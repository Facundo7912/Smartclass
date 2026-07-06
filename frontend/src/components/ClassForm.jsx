import { useEffect, useState } from 'react'
import { createClass, updateClass } from '../services/class.service.js'

const ClassForm = ({ onClassCreated, editingClass, onCancelEdit, courses = [] }) => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [courseId, setCourseId] = useState('')
  const [notes, setNotes] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (editingClass) {
      setTitle(editingClass.title || '')
      setDate(editingClass.date || '')
      setCourseId(editingClass.courseId || '')
      setNotes(editingClass.notes || '')
      setFileName(editingClass.fileName || '')
    } else {
      setTitle('')
      setDate('')
      setCourseId('')
      setNotes('')
      setFileName('')
    }
  }, [editingClass])

  useEffect(() => {
    if (!success) return

    const timer = window.setTimeout(() => {
      setSuccess('')
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [success])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setFileName(file.name)
      return
    }

    setFileName('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!title.trim() || !date || !courseId) {
      setError('Completa título, fecha y curso.')
      return
    }

    setLoading(true)

    try {
      console.log('🔍 ClassForm handleSubmit', { editingClass, title, date, courseId, notes, fileName })

      if (editingClass) {
        const updated = await updateClass(editingClass.id ?? editingClass._id, {
          title: title.trim(),
          date,
          courseId,
          notes: notes.trim(),
          fileName
        })
        console.log('🔍 updateClass result', updated)
        setSuccess('Clase actualizada correctamente.')
      } else {
        const created = await createClass({ title: title.trim(), date, courseId, notes: notes.trim(), fileName })
        console.log('🔍 createClass result', created)
        setSuccess('Clase creada correctamente.')
      }

      setTitle('')
      setDate('')
      setCourseId('')
      setNotes('')
      setFileName('')
      onClassCreated?.()
      onCancelEdit?.()
    } catch (err) {
      console.error('🔍 ClassForm submit error', err)
      const message = err?.response?.data?.error || err?.message || (editingClass ? 'No se pudo actualizar la clase.' : 'No se pudo crear la clase.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{editingClass ? 'Editar clase' : 'Nueva clase'}</h2>
      </div>
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      {success && <p className="text-sm font-medium text-emerald-700">{success}</p>}
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Título</span>
        <input
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título de la clase"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Fecha</span>
        <input
          type="date"
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Curso</span>
        <select
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Notas</span>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notas opcionales"
          rows={4}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Archivo PDF (opcional)</span>
        <input
          type="file"
          accept=".pdf"
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition file:cursor-pointer file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-slate-900"
          onChange={handleFileChange}
        />
        {fileName && <p className="text-sm text-slate-600">Archivo seleccionado: {fileName}</p>}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? (editingClass ? 'Actualizando...' : 'Creando...') : (editingClass ? 'Actualizar clase' : 'Crear clase')}
        </button>
        {editingClass && (
          <button
            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
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

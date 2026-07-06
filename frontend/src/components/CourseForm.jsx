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
      console.log('🔍 CourseForm handleSubmit', { editingCourse, name, description })

      if (editingCourse) {
        const updatedCourse = await updateCourse(editingCourse.id ?? editingCourse._id, {
          name: name.trim(),
          description: description.trim()
        })
        console.log('🔍 updateCourse result', updatedCourse)
        setSuccess('Curso actualizado correctamente.')
      } else {
        const createdCourse = await createCourse({ name: name.trim(), description: description.trim() })
        console.log('🔍 createCourse result', createdCourse)
        setSuccess('Curso creado correctamente.')
      }

      setName('')
      setDescription('')
      onCourseCreated?.()
      onCancelEdit?.()
    } catch (err) {
      console.error('🔍 CourseForm submit error', err)
      const message = err?.response?.data?.error || err?.message || (editingCourse ? 'No se pudo actualizar el curso.' : 'No se pudo crear el curso.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{editingCourse ? 'Editar curso' : 'Nuevo curso'}</h2>
      </div>
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      {success && <p className="text-sm font-medium text-emerald-700">{success}</p>}
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Nombre</span>
        <input
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre del curso"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Descripción</span>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Descripción del curso"
          rows={5}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? (editingCourse ? 'Actualizando...' : 'Creando...') : (editingCourse ? 'Actualizar curso' : 'Crear curso')}
        </button>
        {editingCourse && (
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

export default CourseForm

import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import CourseForm from './components/CourseForm.jsx'
import CourseList from './components/CourseList.jsx'
import ClassForm from './components/ClassForm.jsx'
import ClassList from './components/ClassList.jsx'
import Header from './components/Header.jsx'
import { getAllCourses } from './services/course.service.js'
import './App.css'

const App = () => {
  const [refreshCourses, setRefreshCourses] = useState(0)
  const [refreshClasses, setRefreshClasses] = useState(0)
  const [courses, setCourses] = useState([])

  const handleCourseCreated = () => {
    setRefreshCourses((prev) => prev + 1)
  }

  const handleClassCreated = () => {
    setRefreshClasses((prev) => prev + 1)
  }

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getAllCourses()
        setCourses(Array.isArray(data) ? data : [])
      } catch (error) {
        setCourses([])
      }
    }

    loadCourses()
  }, [refreshCourses])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto mt-[120px] max-w-[900px] px-4 pb-10 md:px-6">
        <header className="mb-8 rounded-lg bg-[#0a2a44] px-6 py-8 shadow-lg md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">SmartClass</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Gestión de SmartClass</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">Administra cursos y clases desde una interfaz profesional y moderna.</p>
          </div>
        </header>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/cursos" replace />}
        />
        <Route
          path="/cursos"
          element={
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Gestión de Cursos</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <CourseForm onCourseCreated={handleCourseCreated} />
                <CourseList refreshTrigger={refreshCourses} />
              </div>
            </section>
          }
        />
        <Route
          path="/clases"
          element={
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Gestión de Clases</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <ClassForm onClassCreated={handleClassCreated} courses={courses} />
                <ClassList refreshTrigger={refreshClasses} courses={courses} />
              </div>
            </section>
          }
        />
      </Routes>
    </main>
  </div>
)
}

export default App

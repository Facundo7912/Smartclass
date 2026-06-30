import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import CourseForm from './components/CourseForm.jsx'
import CourseList from './components/CourseList.jsx'
import ClassForm from './components/ClassForm.jsx'
import ClassList from './components/ClassList.jsx'
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header className="hero">
        <div>
          <p className="eyebrow">SmartClass</p>
          <h1>Gestión de SmartClass</h1>
          <p className="subtitle">Administra cursos y clases desde una interfaz simple.</p>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '12px', margin: '20px 0' }}>
        <Link to="/cursos">Cursos</Link>
        <Link to="/clases">Clases</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/cursos" replace />}
        />
        <Route
          path="/cursos"
          element={
            <section>
              <h2 style={{ marginBottom: '16px' }}>Gestión de Cursos</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <CourseForm onCourseCreated={handleCourseCreated} />
                <CourseList refreshTrigger={refreshCourses} />
              </div>
            </section>
          }
        />
        <Route
          path="/clases"
          element={
            <section>
              <h2 style={{ marginBottom: '16px' }}>Gestión de Clases</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <ClassForm onClassCreated={handleClassCreated} courses={courses} />
                <ClassList refreshTrigger={refreshClasses} courses={courses} />
              </div>
            </section>
          }
        />
      </Routes>
    </div>
  )
}

export default App

import { useState } from 'react'
import CourseForm from './components/CourseForm.jsx'
import CourseList from './components/CourseList.jsx'
import ClassForm from './components/ClassForm.jsx'
import ClassList from './components/ClassList.jsx'
import './App.css'

const App = () => {
  const [refreshCourses, setRefreshCourses] = useState(0)
  const [refreshClasses, setRefreshClasses] = useState(0)

  const handleCourseCreated = () => {
    setRefreshCourses((prev) => prev + 1)
  }

  const handleClassCreated = () => {
    setRefreshClasses((prev) => prev + 1)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header className="hero">
        <div>
          <p className="eyebrow">SmartClass</p>
          <h1>Gestión de SmartClass</h1>
          <p className="subtitle">Administra cursos y clases desde una interfaz simple.</p>
        </div>
      </header>

      <section style={{ marginTop: '26px' }}>
        <h2 style={{ marginBottom: '16px' }}>Gestión de Cursos</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          <CourseForm onCourseCreated={handleCourseCreated} />
          <CourseList refreshTrigger={refreshCourses} />
        </div>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '16px' }}>Gestión de Clases</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          <ClassForm onClassCreated={handleClassCreated} />
          <ClassList refreshTrigger={refreshClasses} />
        </div>
      </section>
    </div>
  )
}

export default App

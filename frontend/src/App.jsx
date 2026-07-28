import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import CourseForm from './components/CourseForm.jsx'
import CourseList from './components/CourseList.jsx'
import ClassForm from './components/ClassForm.jsx'
import ClassList from './components/ClassList.jsx'
import Header from './components/Header.jsx'
import AIProcessor from './components/AIProcessor.jsx'
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
    <div className="min-h-screen bg-cork bg-fixed">
      <Header />
      <main className="mx-auto mt-[120px] max-w-[900px] px-4 pb-10 md:px-6">
        
        {/* 🎯 CARTEL DE BIENVENIDA ESTILO CORCHO */}
        <header className="mb-8 rounded-xl bg-[#4A3728] px-6 py-8 shadow-lg border-2 border-[#B8865C] md:px-8 relative overflow-hidden">
          {/* Chinchetas decorativas */}
          <div className="absolute -top-3 -right-3 pin w-6 h-6"></div>
          <div className="absolute -bottom-3 -left-3 pin w-6 h-6"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#B8865C]/10 blur-2xl"></div>
          
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#D4A574] flex items-center gap-2">
              <span className="pin w-4 h-4 inline-block"></span> SmartClass
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#FFF8F0]">Gestión de SmartClass</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#D4A574]">
              Administra cursos y clases desde una interfaz profesional y moderna.
            </p>
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
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#3E2723] flex items-center gap-2">
                    <span className="pin w-5 h-5 inline-block"></span> Gestión de Cursos
                  </h2>
                </div>
                <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-[1.2fr_1fr]">
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
                  <h2 className="text-2xl font-semibold text-[#3E2723] flex items-center gap-2">
                    <span className="pin w-5 h-5 inline-block"></span> Gestión de Clases
                  </h2>
                </div>
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <ClassForm onClassCreated={handleClassCreated} courses={courses} />
                  <ClassList refreshTrigger={refreshClasses} courses={courses} />
                </div>
              </section>
            }
          />
          
          <Route
            path="/procesar"
            element={
              <section className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-[#3E2723] flex items-center gap-2">
                    <span className="pin w-5 h-5 inline-block"></span> Procesar con IA
                  </h2>
                  <p className="text-[#4A3728]">
                    Sube un archivo PDF o DOCX para generar resúmenes, tarjetas de estudio o guiones para presentaciones.
                  </p>
                </div>
                <AIProcessor />
              </section>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
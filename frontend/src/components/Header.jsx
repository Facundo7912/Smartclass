import { NavLink } from 'react-router-dom'

const Header = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">SmartClass</h1>
          <p className="text-sm text-slate-500">Administra cursos y clases desde una interfaz profesional.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-3">
          <NavLink
            to="/cursos"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            Cursos
          </NavLink>
          <NavLink
            to="/clases"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            Clases
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header

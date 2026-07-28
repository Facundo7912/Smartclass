import { NavLink } from 'react-router-dom'

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#4A3728] border-b-2 border-[#B8865C] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="pin w-5 h-5 inline-block"></span>
            <span className="text-xl font-bold text-[#FFF8F0]">SmartClass</span>
          </div>
          <nav className="flex items-center space-x-6">
            <NavLink
              to="/cursos"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-[#D97706] border-b-2 border-[#D97706] pb-1' 
                    : 'text-[#D4A574] hover:text-[#FFF8F0]'
                }`
              }
            >
              Cursos
            </NavLink>
            <NavLink
              to="/clases"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-[#D97706] border-b-2 border-[#D97706] pb-1' 
                    : 'text-[#D4A574] hover:text-[#FFF8F0]'
                }`
              }
            >
              Clases
            </NavLink>
            <NavLink
              to="/procesar"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-[#D97706] border-b-2 border-[#D97706] pb-1' 
                    : 'text-[#D4A574] hover:text-[#FFF8F0]'
                }`
              }
            >
              Procesar con IA
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
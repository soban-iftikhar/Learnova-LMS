import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Menu, X, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleRoutes = () => {
    if (!user) return []

    const baseRoutes = [
      { label: 'Dashboard', href: `/${user.role.toLowerCase()}/dashboard` },
    ]

    if (user.role === 'TEACHER' || user.role === 'INSTRUCTOR') {
      return [
        ...baseRoutes,
        { label: 'Courses', href: '/teacher/courses' },
        { label: 'Analytics', href: '/teacher/dashboard' },
      ]
    }

    if (user.role === 'ADMIN') {
      return [
        ...baseRoutes,
        { label: 'Instructors', href: '/admin/instructors' },
        { label: 'Students', href: '/admin/students' },
        { label: 'Courses', href: '/admin/courses' },
      ]
    }

    return [
      ...baseRoutes,
      { label: 'Courses', href: '/student/courses' },
    ]
  }

  const routes = getRoleRoutes()

  return (
    <nav className="fixed top-0 w-full bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={routes[0]?.href || '/'} className="flex items-center space-x-2 font-bold text-xl text-blue-600">
            <span>Learnova</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.includes(route.href.split('/')[1])
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {route.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="hidden md:block text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {route.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

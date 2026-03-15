import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, BookOpen, LayoutDashboard, Info, Mail, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth, getHomePath } from '../../context/AuthContext'
import Logo from '../common/Logo'
import Avatar from '../common/Avatar'
import Dropdown from '../common/Dropdown'
import Badge from '../common/Badge'

// Nav links vary by role
const NAV_BY_ROLE = {
  STUDENT: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses',   label: 'My Courses', icon: BookOpen },
    { to: '/about',     label: 'About',       icon: Info },
    { to: '/contact',   label: 'Contact',     icon: Mail },
  ],
  INSTRUCTOR: [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/courses',   label: 'My Courses', icon: BookOpen },
  ],
  ADMIN: [
    { to: '/admin/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
    { to: '/admin/students',     label: 'Students',    icon: User },
    { to: '/admin/instructors',  label: 'Instructors', icon: BookOpen },
  ],
}

const Navbar = () => {
  const { user, logout, role } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinks = NAV_BY_ROLE[role] || NAV_BY_ROLE.STUDENT

  const settingsPath = role === 'INSTRUCTOR' ? '/teacher/dashboard'
                     : role === 'ADMIN'      ? '/admin/dashboard'
                     : '/settings'

  const dropdownItems = [
    { type: 'label', label: user?.name || 'Account' },
    { icon: <User size={16} />,     label: 'Profile',  onClick: () => navigate(settingsPath) },
    { icon: <Settings size={16} />, label: 'Settings', onClick: () => navigate(settingsPath) },
    { type: 'divider' },
    { icon: <LogOut size={16} />,   label: 'Sign Out', danger: true, onClick: handleLogout },
  ]

  const isActive = (to) => location.pathname.startsWith(to)

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={getHomePath(role)}><Logo /></Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive(to) ? 'text-brand-600 bg-brand-50' : 'text-ink-muted hover:text-ink hover:bg-surface-muted'}`}>
                  <Icon size={15} />{label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-muted transition-colors cursor-pointer">
                    <Avatar name={user?.name} size="sm" />
                    <span className="hidden sm:block text-sm font-medium text-ink max-w-[120px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                }
                items={dropdownItems}
                align="right"
              />
              <button className="md:hidden p-2 rounded-xl text-gray-400 hover:text-ink hover:bg-surface-muted"
                onClick={() => setMobileOpen(v => !v)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-16">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-white border-b border-gray-100 shadow-lg animate-slide-down px-4 py-4 space-y-1">
            <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-gray-100">
              <Avatar name={user?.name} size="md" />
              <div>
                <p className="text-sm font-semibold text-ink">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Badge variant="success" size="sm" className="ml-auto">{role}</Badge>
            </div>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive(to) ? 'text-brand-600 bg-brand-50' : 'text-ink-muted hover:bg-surface-muted'}`}>
                <Icon size={18} />{label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={18} />Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar

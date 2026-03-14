import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ClipboardList,
  BarChart2, Calendar, Settings, HelpCircle, LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'
import Badge from '../common/Badge'

const STUDENT_NAV = [
  { group: 'Main', items: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/assignments', label: 'Assignments', icon: ClipboardList },
  ]},
  { group: 'Progress', items: [
    { to: '/progress', label: 'Analytics', icon: BarChart2 },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
  ]},
  { group: 'Account', items: [
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/help', label: 'Help', icon: HelpCircle },
  ]},
]

const Sidebar = ({ onLogout }) => {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (to) => location.pathname.startsWith(to)

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 min-h-screen fixed top-0 left-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight text-ink">
          Learn<span className="text-brand-500">ova</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-hide">
        {STUDENT_NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">{group}</p>
            <div className="space-y-0.5">
              {items.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`sidebar-item
                    ${isActive(to)
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                    }`}
                >
                  <Icon size={18} className={isActive(to) ? 'text-brand-500' : ''} />
                  <span>{label}</span>
                  {isActive(to) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-muted transition-colors">
          <Avatar name={user?.name} size="sm" online />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
            <Badge variant="success" size="sm">{user?.role}</Badge>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

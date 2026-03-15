import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ClipboardList, BarChart2,
  Settings, LogOut, Users, GraduationCap, ShieldCheck,
  CalendarCheck, UserCog, Search, Sun, Moon,
} from 'lucide-react'
import { useAuth, getHomePath } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../common/Avatar'
import Badge from '../common/Badge'

const NAV_BY_ROLE = {
  STUDENT: [
    { group: 'Main', items: [
      { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
      { to: '/courses',     label: 'My Courses',  icon: BookOpen },
      { to: '/browse',      label: 'Browse',      icon: Search },
      { to: '/assignments', label: 'Assignments', icon: ClipboardList },
    ]},
    { group: 'Progress', items: [
      { to: '/progress', label: 'Analytics', icon: BarChart2 },
    ]},
    { group: 'Account', items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ]},
  ],
  INSTRUCTOR: [
    { group: 'Teaching', items: [
      { to: '/teacher/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
      { to: '/teacher/courses',     label: 'My Courses',  icon: BookOpen },
      { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
      { to: '/teacher/attendance',  label: 'Attendance',  icon: CalendarCheck },
    ]},
    { group: 'Account', items: [
      { to: '/teacher/settings', label: 'Settings', icon: Settings },
    ]},
  ],
  ADMIN: [
    { group: 'Management', items: [
      { to: '/admin/dashboard',   label: 'Dashboard',   icon: ShieldCheck },
      { to: '/admin/students',    label: 'Students',    icon: GraduationCap },
      { to: '/admin/instructors', label: 'Instructors', icon: Users },
      { to: '/admin/courses',     label: 'Courses',     icon: BookOpen },
    ]},
    { group: 'Account', items: [
      { to: '/admin/settings', label: 'Settings', icon: UserCog },
    ]},
  ],
}

const ROLE_BADGE = {
  STUDENT:    { label: 'Student',    variant: 'success' },
  INSTRUCTOR: { label: 'Instructor', variant: 'info' },
  ADMIN:      { label: 'Admin',      variant: 'purple' },
}

const Sidebar = ({ onLogout }) => {
  const { user, role }   = useAuth()
  const { dark, toggle } = useTheme()
  const location         = useLocation()
  const navigate         = useNavigate()

  const groups   = NAV_BY_ROLE[role]  || NAV_BY_ROLE.STUDENT
  const badgeCfg = ROLE_BADGE[role]   || ROLE_BADGE.STUDENT
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 min-h-screen fixed top-0 left-0 z-30 transition-colors">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 cursor-pointer"
        onClick={() => navigate(getHomePath(role))}>
        <span className="text-xl font-bold tracking-tight text-ink dark:text-white">
          Learn<span className="text-brand-500">ova</span>
        </span>
        {/* Dark mode toggle in sidebar */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle() }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-ink dark:hover:text-white hover:bg-surface-muted dark:hover:bg-gray-800 transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-hide">
        {groups.map(({ group, items }) => (
          <div key={group}>
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{group}</p>
            <div className="space-y-0.5">
              {items.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`sidebar-item ${isActive(to)
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-ink-muted dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-gray-800 hover:text-ink dark:hover:text-white'}`}>
                  <Icon size={18} className={isActive(to) ? 'text-brand-500' : ''} />
                  <span>{label}</span>
                  {isActive(to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-muted dark:hover:bg-gray-800 transition-colors">
          <Avatar name={user?.name} size="sm" online />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink dark:text-white truncate">{user?.name}</p>
            <Badge variant={badgeCfg.variant} size="sm">{badgeCfg.label}</Badge>
          </div>
          <button onClick={onLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, GraduationCap, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react'
import { dashboardApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import StatCard from '../../components/StatCard'
import { SectionLoader } from '../../components/common/Spinner'
import { ErrorState } from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const { data, loading, error, refetch } = useAsync(() => dashboardApi.getAdminDashboard())

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System-wide overview and management.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          {/* User stats */}
          <div>
            <h2 className="section-title">User Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Users"   value={data?.total_users ?? 0}
                icon={Users} color="brand" />
              <StatCard label="Students"      value={data?.user_breakdown?.students ?? 0}
                icon={GraduationCap} color="sky" />
              <StatCard label="Instructors"   value={data?.user_breakdown?.instructors ?? 0}
                icon={BookOpen} color="violet" />
              <StatCard label="Total Courses" value={data?.total_courses ?? 0}
                icon={TrendingUp} color="amber" />
            </div>
          </div>

          {/* Course + enrollment stats */}
          <div>
            <h2 className="section-title">Platform Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-6">
                <p className="text-sm text-gray-400 mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold text-ink">{data?.total_enrollments ?? 0}</p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-400 mb-1">Admins</p>
                <p className="text-3xl font-bold text-ink">{data?.user_breakdown?.admins ?? 1}</p>
                <p className="text-xs text-gray-400 mt-1">Env-based admin accounts</p>
              </div>
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <h2 className="section-title">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Manage Students',    to: '/admin/students',    icon: GraduationCap, color: 'bg-sky-50 text-sky-600' },
                { label: 'Manage Instructors', to: '/admin/instructors', icon: Users,         color: 'bg-violet-50 text-violet-600' },
                { label: 'Manage Courses',     to: '/admin/courses',     icon: BookOpen,      color: 'bg-brand-50 text-brand-600' },
              ].map(({ label, to, icon: Icon, color }) => (
                <button key={to} onClick={() => navigate(to)}
                  className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all text-left group">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <span className="font-semibold text-ink text-sm">{label}</span>
                  <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-brand-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

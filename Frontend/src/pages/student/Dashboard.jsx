import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, TrendingUp, ClipboardList, ArrowRight, Target, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { dashboardApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import StatCard from '../../components/StatCard'
import ProgressBar from '../../components/common/ProgressBar'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'

const formatDate = (str) => {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const daysUntil = (str) => {
  if (!str) return null
  return Math.ceil((new Date(str) - new Date()) / 86400000)
}

const DashboardPage = () => {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useAsync(() => dashboardApi.getStudentDashboard())

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Here's what's happening with your learning today.</p>
        </div>
        <Link to="/courses" className="btn-primary text-sm self-start">
          <BookOpen size={16} /> Browse Courses
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatCard label="Enrolled Courses" value={data?.enrolled_courses ?? 0}
            icon={BookOpen} color="brand" subtitle={`${data?.in_progress ?? 0} in progress`} />
          <StatCard label="Completed" value={data?.completed ?? 0}
            icon={CheckCircle2} color="sky" subtitle="courses finished" />
          <StatCard label="Average Grade"
            value={data?.average_grade ? `${Math.round(data.average_grade)}%` : 'N/A'}
            icon={TrendingUp} color="violet" subtitle="across all courses" />
          <StatCard label="Upcoming Deadlines"
            value={data?.upcoming_deadlines?.length ?? 0}
            icon={ClipboardList}
            color={data?.upcoming_deadlines?.length > 0 ? 'rose' : 'brand'}
            subtitle="assignments due soon" />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">Continue Learning</h2>
            <Link to="/courses" className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? <SectionLoader rows={3} />
          : !data?.recent_courses?.length ? (
            <EmptyState icon={BookOpen} title="No courses yet"
              description="Enroll in a course to get started on your learning journey." />
          ) : (
            <div className="space-y-3">
              {data.recent_courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`}
                  className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200 group">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 transition-colors">
                    <BookOpen size={20} className="text-brand-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-ink truncate group-hover:text-brand-600 transition-colors">
                      {course.title}
                    </h3>
                    <div className="mt-1.5"><ProgressBar value={course.progress ?? 0} size="xs" /></div>
                    <p className="text-xs text-gray-400 mt-1">
                      {course.progress ?? 0}% complete · Last accessed {formatDate(course.latest_activity)}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div>
            <h2 className="section-title">Upcoming Deadlines</h2>
            {loading ? <SectionLoader rows={2} />
            : !data?.upcoming_deadlines?.length ? (
              <div className="card p-6 text-center">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Target size={18} className="text-brand-400" />
                </div>
                <p className="text-sm text-gray-400">No upcoming deadlines</p>
                <p className="text-xs text-gray-300 mt-0.5">You're all caught up! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.upcoming_deadlines.map((item) => {
                  const days   = daysUntil(item.due_date)
                  const urgent = days !== null && days <= 2
                  return (
                    <div key={item.id} className="card p-4 flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${urgent ? 'bg-rose-50' : 'bg-amber-50'}`}>
                        <Calendar size={15} className={urgent ? 'text-rose-500' : 'text-amber-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.course}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant={urgent ? 'danger' : 'warning'} size="sm" dot>
                            {days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `${days}d left`}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { to: '/courses',     label: 'Browse all courses',   icon: BookOpen },
                { to: '/assignments', label: 'View assignments',      icon: ClipboardList },
                { to: '/progress',    label: 'Check my progress',     icon: TrendingUp },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors group">
                  <Icon size={15} className="group-hover:text-brand-500 transition-colors" />
                  {label}
                  <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

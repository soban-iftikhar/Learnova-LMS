import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Users, Star, ClipboardCheck, Plus, ArrowRight,
  UserPlus, CheckCircle2, TrendingUp,
} from 'lucide-react'
import { dashboardApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import StatCard from '../../components/StatCard'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'

const fmt = (s) => s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const { data, loading, error, refetch } = useAsync(() => dashboardApi.getInstructorDashboard())

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const recentEnrollments    = data?.recent_activity?.recent_enrollments      || []
  const recentQuizSubmissions = data?.recent_activity?.recent_quiz_submissions || []

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Here's an overview of your teaching activity.</p>
        </div>
        <Button onClick={() => navigate('/teacher/courses/create')} leftIcon={<Plus size={16} />}>
          Create Course
        </Button>
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
          <StatCard label="Total Courses"   value={data?.total_courses ?? 0}     icon={BookOpen}      color="brand"  />
          <StatCard label="Unique Students" value={data?.total_students ?? 0}    icon={Users}         color="sky"    />
          <StatCard label="Enrollments"     value={data?.total_enrollments ?? 0} icon={ClipboardCheck} color="violet" />
          <StatCard
            label="Average Rating"
            value={data?.average_rating > 0 ? `${data.average_rating}★` : 'N/A'}
            icon={Star} color="amber"
          />
        </div>
      )}

      {/* Courses table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Your Courses</h2>
          <button onClick={() => navigate('/teacher/courses')}
            className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </button>
        </div>
        {loading ? <SectionLoader rows={3} />
        : !data?.courses?.length ? (
          <EmptyState icon={BookOpen} title="No courses yet"
            description="Create your first course to start teaching."
            action={() => navigate('/teacher/courses/create')}
            actionLabel="Create Course" />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Course</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Students</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Rating</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.courses.map(course => (
                  <tr key={course.id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                    <td className="py-3 px-5 font-medium text-ink">{course.title}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{course.students}</td>
                    <td className="py-3 px-4 text-center">
                      {course.rating > 0
                        ? <span className="text-amber-500 font-semibold">{course.rating}★</span>
                        : <span className="text-gray-300 text-xs">No ratings</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => navigate(`/teacher/courses/${course.id}/build`)}
                          className="text-brand-500 hover:text-brand-700 text-xs font-semibold">Build</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => navigate(`/teacher/courses/${course.id}/analytics`)}
                          className="text-brand-500 hover:text-brand-700 text-xs font-semibold">Analytics</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity — two subsections */}
      <div>
        <h2 className="section-title">Recent Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Enrollments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserPlus size={16} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-ink">Recent Enrollments</h3>
            </div>
            {loading ? <SectionLoader rows={3} />
            : !recentEnrollments.length ? (
              <div className="card p-6 text-center">
                <p className="text-sm text-gray-400">No enrollments yet.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {recentEnrollments.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center
                        text-xs font-bold text-brand-600 flex-shrink-0">
                        {e.student_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{e.student_name}</p>
                        <p className="text-xs text-gray-400 truncate">{e.course_title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{fmt(e.enrolled_at)}</p>
                        <Badge variant={e.status === 'COMPLETED' ? 'success' : 'info'} size="sm" dot>
                          {e.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Quiz Submissions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck size={16} className="text-violet-500" />
              <h3 className="text-sm font-semibold text-ink">Recent Quiz Submissions</h3>
            </div>
            {loading ? <SectionLoader rows={3} />
            : !recentQuizSubmissions.length ? (
              <div className="card p-6 text-center">
                <p className="text-sm text-gray-400">No quiz submissions yet.</p>
                <p className="text-xs text-gray-300 mt-1">Quiz results appear here after students attempt them.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {recentQuizSubmissions.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        q.passed ? 'bg-brand-100' : 'bg-red-50'}`}>
                        {q.passed
                          ? <CheckCircle2 size={14} className="text-brand-600" />
                          : <TrendingUp   size={14} className="text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{q.student_name}</p>
                        <p className="text-xs text-gray-400 truncate">{q.quiz_title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${q.passed ? 'text-brand-600' : 'text-red-500'}`}>
                          {q.percentage}%
                        </p>
                        <p className="text-xs text-gray-400">{fmt(q.submitted_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

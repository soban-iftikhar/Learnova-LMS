import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Star, ClipboardList, Plus, ArrowRight } from 'lucide-react'
import { dashboardApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import StatCard from '../../components/StatCard'
import Button from '../../components/common/Button'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'

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
          <StatCard label="Total Courses"   value={data?.total_courses ?? 0}     icon={BookOpen} color="brand" />
          <StatCard label="Total Students"  value={data?.total_students ?? 0}    icon={Users}    color="sky" />
          <StatCard label="Enrollments"     value={data?.total_enrollments ?? 0} icon={ClipboardList} color="violet" />
          <StatCard label="Average Rating"  value={data?.average_rating ? `${data.average_rating}★` : 'N/A'}
            icon={Star} color="amber" />
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
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.courses.map(course => (
                  <tr key={course.id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                    <td className="py-3 px-5 font-medium text-ink">{course.title}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{course.students}</td>
                    <td className="py-3 px-4 text-center text-amber-500">{course.rating}★</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={course.status === 'ACTIVE' ? 'success' : 'draft'} dot>{course.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                          className="text-brand-500 hover:text-brand-700 text-xs font-semibold">Edit</button>
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

      {/* Recent submissions */}
      <div>
        <h2 className="section-title">Recent Submissions</h2>
        {loading ? <SectionLoader rows={2} />
        : !data?.recent_submissions?.length ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-gray-400">No submissions yet.</p>
            <p className="text-xs text-gray-300 mt-1">Student submissions will appear here once they start working.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Assignment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_submissions.map(sub => (
                  <tr key={sub.id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                    <td className="py-3 px-5 font-medium text-ink">{sub.student}</td>
                    <td className="py-3 px-4 text-gray-600">{sub.assignment}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={sub.status === 'GRADED' ? 'success' : 'warning'} dot size="sm">
                        {sub.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

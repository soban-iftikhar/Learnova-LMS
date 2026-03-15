import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react'
import { analyticsApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import StatCard from '../../components/StatCard'
import ProgressBar from '../../components/common/ProgressBar'
import { PageLoader } from '../../components/common/Spinner'
import { ErrorState, EmptyState } from '../../components/common/EmptyState'
import Button from '../../components/common/Button'

export default function CourseAnalytics() {
  const { courseId } = useParams()
  const navigate     = useNavigate()

  const { data, loading, error, refetch } = useAsync(
    () => analyticsApi.getCourseAnalytics(courseId),
    [courseId]
  )

  if (loading) return <PageLoader />
  if (error)   return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/teacher/courses')}
          className="p-2 rounded-xl text-gray-400 hover:text-ink hover:bg-surface-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title mb-0">{data?.title || 'Course'} — Analytics</h1>
          <p className="page-subtitle">Performance and engagement metrics.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students"   value={data?.total_students ?? 0}    icon={Users}        color="brand" />
        <StatCard label="Active Students"  value={data?.active_students ?? 0}   icon={TrendingUp}   color="sky" />
        <StatCard label="Completion Rate"  value={`${data?.completion_rate ?? 0}%`} icon={CheckCircle2} color="violet" />
        <StatCard label="Avg Score"        value={`${data?.average_score ?? 0}%`}   icon={BarChart2}   color="amber" />
      </div>

      {/* Student performance table */}
      <div>
        <h2 className="section-title">Student Performance</h2>
        {!data?.student_performance?.length ? (
          <EmptyState icon={Users} title="No student data yet"
            description="Performance data will appear once students start engaging." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Student</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Progress</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Quiz Avg</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Assignment Avg</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {data.student_performance.map(s => (
                  <tr key={s.student_id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                    <td className="py-3 px-5 font-medium text-ink">{s.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><ProgressBar value={s.progress} size="sm" /></div>
                        <span className="text-xs text-gray-500 w-8 text-right">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">{s.quiz_average}%</td>
                    <td className="py-3 px-4 text-center text-gray-700">{s.assignment_average}%</td>
                    <td className="py-3 px-4 text-center text-gray-700">{s.attendance_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Module engagement */}
      {data?.module_engagement?.length > 0 && (
        <div>
          <h2 className="section-title">Module Engagement</h2>
          <div className="space-y-3">
            {data.module_engagement.map(mod => (
              <div key={mod.module_id} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-ink">{mod.title}</p>
                  <span className="text-sm font-bold text-brand-600">{mod.completion_rate}%</span>
                </div>
                <ProgressBar value={mod.completion_rate} size="sm" />
                <p className="text-xs text-gray-400 mt-1.5">
                  Avg time spent: {mod.average_time_spent} min
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

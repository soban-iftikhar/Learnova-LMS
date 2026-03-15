import React from 'react'
import { TrendingUp, Award, BookOpen, BarChart2, CheckCircle2, Calendar } from 'lucide-react'
import { dashboardApi, enrollmentsApi, attendanceApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import ProgressBar from '../../components/common/ProgressBar'
import StatCard from '../../components/StatCard'
import { SectionLoader } from '../../components/common/Spinner'
import { ErrorState, EmptyState } from '../../components/common/EmptyState'

const ProgressPage = () => {
  const { data: dash,    loading: dashLoading,    error: dashError }    = useAsync(() => dashboardApi.getStudentDashboard())
  const { data: enrollData, loading: enrollLoading }                     = useAsync(() => enrollmentsApi.getMyCourses({ size: 50 }))
  const { data: attendData, loading: attendLoading }                     = useAsync(() => attendanceApi.getStudentSummary())

  const enrollments  = enrollData?.content   || []
  const attendance   = attendData?.attendance || []
  const loading      = dashLoading || enrollLoading || attendLoading

  // Overall attendance average
  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + (a.percentage || 0), 0) / attendance.length)
    : 0

  if (dashError) return <ErrorState message={dashError} />

  if (loading) return (
    <div className="animate-fade-in space-y-8">
      <div className="page-header">
        <h1 className="page-title">My Progress</h1>
        <p className="page-subtitle">Your learning journey overview.</p>
      </div>
      <SectionLoader rows={4} />
    </div>
  )

  const completed  = dash?.completed         || 0
  const enrolled   = dash?.enrolled_courses  || 0

  return (
    <div className="animate-fade-in space-y-8">
      <div className="page-header">
        <h1 className="page-title">My Progress</h1>
        <p className="page-subtitle">Track your learning journey and achievements.</p>
      </div>

      {/* Stats — all real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enrolled Courses" value={enrolled}    icon={BookOpen}     color="brand" />
        <StatCard label="Completed"        value={completed}   icon={CheckCircle2} color="sky"   />
        <StatCard label="Avg Attendance"   value={attendance.length ? `${avgAttendance}%` : 'N/A'}
          icon={Calendar} color="violet" />
        <StatCard label="Avg Grade"
          value={dash?.average_grade ? `${Math.round(dash.average_grade)}%` : 'N/A'}
          icon={Award} color="amber" />
      </div>

      {/* Attendance per course */}
      {attendance.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Attendance by Course</h2>
          <div className="space-y-4">
            {attendance.map(a => (
              <div key={a.enrollment_id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink truncate max-w-xs">{a.course_title}</span>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-400">
                    <span>{a.present}/{a.total_classes} classes</span>
                    <span className="font-bold text-ink">{a.percentage}%</span>
                  </div>
                </div>
                <ProgressBar
                  value={a.percentage}
                  color={a.percentage >= 75 ? 'brand' : a.percentage >= 50 ? 'amber' : 'rose'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course enrollment breakdown */}
      <div>
        <h2 className="section-title">Course Breakdown</h2>
        {!enrollments.length ? (
          <EmptyState icon={BarChart2} title="No data yet"
            description="Enroll in courses to start tracking your progress." />
        ) : (
          <div className="space-y-3">
            {enrollments.map(e => {
              const pct = e.progress || 0
              return (
                <div key={e.id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-ink truncate">{e.course?.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{e.course?.instructor?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {e.status === 'COMPLETED' && (
                        <span className="flex items-center gap-1 text-xs text-brand-600 font-medium">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                      <span className="text-sm font-bold text-ink">{pct}%</span>
                    </div>
                  </div>
                  <ProgressBar value={pct} size="sm" />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Achievements — driven by real data */}
      <div>
        <h2 className="section-title">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'First Enrollment',  earned: enrolled >= 1,                            icon: '🎯' },
            { label: 'Course Complete',   earned: completed >= 1,                            icon: '🏆' },
            { label: 'Dedicated Learner', earned: enrolled >= 3,                             icon: '📚' },
            { label: 'Good Attendance',   earned: avgAttendance >= 75 && attendance.length > 0, icon: '📅' },
            { label: 'Scholar',           earned: completed >= 5,                             icon: '🎓' },
          ].map(({ label, earned, icon }) => (
            <div key={label}
              className={`card p-4 text-center transition-all ${earned ? 'border-brand-200 bg-brand-50' : 'opacity-40 grayscale'}`}>
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-xs font-semibold text-ink leading-tight">{label}</p>
              {earned && <p className="text-xs text-brand-500 mt-1">Earned</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressPage

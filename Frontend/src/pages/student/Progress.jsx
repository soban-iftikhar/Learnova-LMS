import React from 'react'
import { TrendingUp, Award, BookOpen, Target, BarChart2, CheckCircle2 } from 'lucide-react'
import { dashboardApi, enrollmentsApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import ProgressBar from '../../components/common/ProgressBar'
import StatCard from '../../components/StatCard'
import { SectionLoader } from '../../components/common/Spinner'
import { ErrorState, EmptyState } from '../../components/common/EmptyState'

const ProgressPage = () => {
  const { data: dash, loading: dashLoading, error: dashError } = useAsync(
    () => dashboardApi.getStudentDashboard()
  )
  const { data: enrollData, loading: enrollLoading } = useAsync(
    () => enrollmentsApi.getMyCourses({ size: 20 })
  )

  const enrollments = enrollData?.content || []
  const loading = dashLoading || enrollLoading

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
    : 0

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Progress</h1>
        <p className="page-subtitle">A detailed view of your learning journey and achievements.</p>
      </div>

      {dashError ? (
        <ErrorState message={dashError} />
      ) : loading ? (
        <SectionLoader rows={4} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Enrolled Courses"  value={dash?.enrolled_courses ?? 0} icon={BookOpen}     color="brand"  />
            <StatCard label="Completed"         value={dash?.completed ?? 0}         icon={CheckCircle2} color="sky"    />
            <StatCard label="Average Grade"     value={dash?.average_grade ? `${Math.round(dash.average_grade)}%` : 'N/A'} icon={Award} color="violet" />
            <StatCard label="Avg. Progress"     value={`${avgProgress}%`}            icon={TrendingUp}   color="amber"  />
          </div>

          {/* Overall progress bar */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink">Overall Learning Progress</h2>
              <span className="text-2xl font-bold text-brand-600">{avgProgress}%</span>
            </div>
            <ProgressBar value={avgProgress} size="lg" animated />
            <p className="text-xs text-gray-400 mt-3">
              Averaged across all {enrollments.length} enrolled course{enrollments.length !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* Per-course breakdown */}
          <div>
            <h2 className="section-title">Course Breakdown</h2>
            {!enrollments.length ? (
              <EmptyState icon={BarChart2} title="No data yet" description="Enroll in courses to start tracking your progress." />
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => {
                  const pct = enrollment.progress || 0
                  const color = pct === 100 ? 'brand' : pct >= 50 ? 'sky' : 'amber'
                  return (
                    <div key={enrollment.id} className="card p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-ink truncate">
                            {enrollment.course?.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">{enrollment.course?.instructor}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {pct === 100 && (
                            <span className="flex items-center gap-1 text-xs text-brand-600 font-medium">
                              <CheckCircle2 size={14} /> Completed
                            </span>
                          )}
                          <span className="text-lg font-bold text-ink">{pct}%</span>
                        </div>
                      </div>
                      <ProgressBar value={pct} color={color} size="sm" animated />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div>
            <h2 className="section-title">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'First Enrollment', earned: enrollments.length >= 1,  icon: '🎯' },
                { label: 'Course Complete',  earned: (dash?.completed || 0) >= 1, icon: '🏆' },
                { label: 'Dedicated Learner',earned: enrollments.length >= 3,  icon: '📚' },
                { label: 'High Achiever',    earned: (dash?.average_grade || 0) >= 90, icon: '⭐' },
                { label: 'Scholar',          earned: (dash?.completed || 0) >= 5, icon: '🎓' },
              ].map(({ label, earned, icon }) => (
                <div
                  key={label}
                  className={`card p-4 text-center transition-all ${earned ? 'border-brand-200 bg-brand-50' : 'opacity-40 grayscale'}`}
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="text-xs font-semibold text-ink leading-tight">{label}</p>
                  {earned && <p className="text-xs text-brand-500 mt-1">Earned</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProgressPage

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Calendar } from 'lucide-react'
import { attendanceApi, assignmentsApi } from '../../api/index'
import { coursesApi } from '../../api/courses'
import { useAsync } from '../../hooks/index'
import StatCard from '../../components/StatCard'
import { PageLoader } from '../../components/common/Spinner'
import { ErrorState, EmptyState } from '../../components/common/EmptyState'

export default function CourseAnalytics() {
  const { courseId } = useParams()
  const navigate     = useNavigate()

  const { data: course, loading: cLoading, error: cError } =
    useAsync(() => coursesApi.getById(courseId), [courseId])

  const { data: enrollData, loading: eLoading } =
    useAsync(() => coursesApi.getEnrollments(courseId), [courseId])

  const { data: attendData, loading: aLoading } =
    useAsync(() => attendanceApi.getCourse(courseId), [courseId])

  const loading = cLoading || eLoading || aLoading

  if (loading) return <PageLoader />
  if (cError)  return <ErrorState message={cError} />

  const enrollments   = enrollData?.content   || []
  const attendStudents = attendData?.students  || []
  const total         = enrollments.length
  const completed     = enrollments.filter(e => e.status === 'COMPLETED').length

  // Build per-student row merging enrollment + attendance
  const studentRows = enrollments.map(e => {
    const att = attendStudents.find(a => a.enrollment_id === e.id)
    return {
      id:             e.student?.id,
      name:           e.student?.name,
      email:          e.student?.email,
      status:         e.status,
      attendance_pct: att ? att.percentage : null,
      total_classes:  att ? att.total_classes : 0,
      present:        att ? att.present : 0,
    }
  })

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/teacher/courses')}
          className="p-2 rounded-xl text-gray-400 hover:text-ink hover:bg-surface-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title mb-0">{course?.title || 'Course'} — Analytics</h1>
          <p className="page-subtitle">Real enrollment and attendance data.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Students"   value={total}                      icon={Users}    color="brand"  />
        <StatCard label="Completed Course" value={completed}                  icon={Users}    color="sky"    />
        <StatCard label="Completion Rate"  value={total ? `${Math.round(completed / total * 100)}%` : '0%'}
          icon={Calendar} color="violet" />
      </div>

      {/* Student table */}
      <div>
        <h2 className="section-title">Student Overview</h2>
        {!studentRows.length ? (
          <EmptyState icon={Users} title="No students enrolled yet"
            description="Students will appear here once they enroll in this course." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Student</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Attendance</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Classes</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map(s => (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                    <td className="py-3 px-5">
                      <p className="font-medium text-ink">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'COMPLETED' ? 'bg-brand-50 text-brand-700' :
                        s.status === 'ACTIVE'    ? 'bg-sky-50 text-sky-700'    :
                        'bg-gray-100 text-gray-500'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.attendance_pct !== null
                        ? <span className={`font-semibold ${s.attendance_pct >= 75 ? 'text-brand-600' : 'text-red-500'}`}>
                            {s.attendance_pct}%
                          </span>
                        : <span className="text-gray-400 text-xs">No data</span>}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">
                      {s.total_classes > 0 ? `${s.present}/${s.total_classes}` : '—'}
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

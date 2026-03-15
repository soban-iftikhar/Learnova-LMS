import React, { useState } from 'react'
import { CalendarCheck, Users, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { useAsync } from '../../hooks/index'
import { dashboardApi, attendanceApi } from '../../api/index'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { useToast } from '../../components/common/Toast'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

const STATUS_OPTIONS = [
  { value: 'PRESENT', icon: CheckCircle2, color: 'text-brand-500',  bg: 'bg-brand-50'  },
  { value: 'ABSENT',  icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50'    },
  { value: 'LATE',    icon: MinusCircle,  color: 'text-amber-500',  bg: 'bg-amber-50'  },
]

function CourseAttendanceSection({ course }) {
  const toast      = useToast()
  const today      = new Date().toISOString().split('T')[0]
  const [date, setDate]       = useState(today)
  const [records, setRecords] = useState({})  // { enrollmentId: 'PRESENT'|'ABSENT'|'LATE' }
  const [saving, setSaving]   = useState(false)

  const { data: enrollData, loading: enrollLoading } = useAsync(
    () => coursesApi.getEnrollments(course.id),
    [course.id]
  )
  const students = enrollData?.content || []

  const set = (enrollmentId, status) =>
    setRecords(r => ({ ...r, [enrollmentId]: status }))

  const handleSave = async () => {
    if (!students.length) return
    setSaving(true)
    try {
      await attendanceApi.mark({
        course_id: course.id,
        date,
        records: students.map(s => ({
          enrollment_id: s.id,
          student_id:    s.student?.id,
          status:        records[s.id] || 'PRESENT',
        })),
      })
      toast.success(`Attendance saved for ${date}`)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save attendance.')
    } finally {
      setSaving(false) }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-surface-muted border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
            <CalendarCheck size={16} className="text-sky-600" />
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{course.title}</p>
            <p className="text-xs text-gray-400">{students.length} student{students.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={today}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <Button size="sm" loading={saving} onClick={handleSave} disabled={!students.length}>
            Save
          </Button>
        </div>
      </div>

      {enrollLoading ? (
        <div className="p-4"><SectionLoader rows={3} /></div>
      ) : !students.length ? (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-400">No students enrolled yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {students.map(enrollment => {
            const s      = enrollment.student
            const status = records[enrollment.id] || 'PRESENT'
            return (
              <div key={enrollment.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-muted transition">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-brand-700">
                  {s?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{s?.name}</p>
                  <p className="text-xs text-gray-400">{s?.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  {STATUS_OPTIONS.map(({ value, icon: Icon, color, bg }) => (
                    <button key={value} onClick={() => set(enrollment.id, value)}
                      title={value}
                      className={`p-1.5 rounded-lg transition-all ${status === value ? `${bg} ${color}` : 'text-gray-300 hover:text-gray-400'}`}>
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
                <Badge
                  variant={status === 'PRESENT' ? 'success' : status === 'ABSENT' ? 'danger' : 'warning'}
                  size="sm" dot>
                  {status}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TeacherAttendance() {
  const { data, loading, error, refetch } = useAsync(() => dashboardApi.getInstructorDashboard())
  const courses = data?.courses || []

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Mark and track student attendance for each class session.</p>
      </div>

      {loading ? <SectionLoader rows={3} />
      : error   ? <ErrorState message={error} onRetry={refetch} />
      : !courses.length ? (
        <EmptyState icon={Users} title="No courses yet"
          description="Create a course and enroll students before marking attendance." />
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <CourseAttendanceSection key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

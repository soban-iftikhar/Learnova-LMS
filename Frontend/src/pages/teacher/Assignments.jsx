import React, { useState } from 'react'
import { Plus, Upload, ClipboardList, Users, CheckCircle2, Clock } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { useAsync } from '../../hooks/index'
import { dashboardApi } from '../../api/index'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import { useToast } from '../../components/common/Toast'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

// ── Create Assignment Modal ──────────────────────────────────────────────────
function CreateAssignmentModal({ courseId, courseTitle, onClose, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ title: '', description: '', due_date: '', total_points: '100' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim())   e.title    = 'Title is required'
    if (!form.due_date)       e.due_date = 'Due date is required'
    if (!form.total_points || isNaN(Number(form.total_points)) || Number(form.total_points) <= 0)
      e.total_points = 'Enter a valid point value'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      // Assignments are stored as PDF course content with isAssignment=true
      // For now we record it via the course content endpoint
      await coursesApi.createAssignment(courseId, {
        title:        form.title.trim(),
        description:  form.description.trim(),
        due_date:     form.due_date,
        total_points: Number(form.total_points),
        is_assignment: true,
      })
      toast.success('Assignment created!')
      onCreated?.()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create assignment.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: undefined })) }

  return (
    <Modal isOpen onClose={onClose} title={`New Assignment — ${courseTitle}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Assignment Title" placeholder="e.g., Midterm Project" value={form.title} onChange={set('title')} error={errors.title} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-muted">Instructions (optional)</label>
          <textarea rows={3} placeholder="Describe the assignment requirements…"
            value={form.description} onChange={set('description')}
            className="w-full px-4 py-3 bg-surface-muted border border-gray-200 rounded-xl text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Due Date" type="datetime-local" value={form.due_date} onChange={set('due_date')} error={errors.due_date} required />
          <Input label="Total Points" type="number" min="1" placeholder="100" value={form.total_points} onChange={set('total_points')} error={errors.total_points} required />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>Create Assignment</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TeacherAssignments() {
  const [createFor, setCreateFor] = useState(null)   // { id, title }
  const [refresh, setRefresh]     = useState(0)

  const { data, loading, error, refetch } = useAsync(() => dashboardApi.getInstructorDashboard(), [refresh])
  const courses = data?.courses || []

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Assignments</h1>
        <p className="page-subtitle">Create and manage assignments for your courses.</p>
      </div>

      {loading ? <SectionLoader rows={3} />
      : error   ? <ErrorState message={error} onRetry={refetch} />
      : !courses.length ? (
        <EmptyState icon={ClipboardList} title="No courses yet"
          description="Create a course first before adding assignments." />
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <CourseAssignmentSection
              key={course.id}
              course={course}
              onCreateClick={() => setCreateFor(course)}
            />
          ))}
        </div>
      )}

      {createFor && (
        <CreateAssignmentModal
          courseId={createFor.id}
          courseTitle={createFor.title}
          onClose={() => setCreateFor(null)}
          onCreated={() => setRefresh(r => r + 1)}
        />
      )}
    </div>
  )
}

function CourseAssignmentSection({ course, onCreateClick }) {
  const { data, loading } = useAsync(() => coursesApi.getAssignments(course.id), [course.id])
  const assignments = data?.content || []

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-surface-muted border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
            <ClipboardList size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{course.title}</p>
            <p className="text-xs text-gray-400">{course.students} student{course.students !== 1 ? 's' : ''} enrolled</p>
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={onCreateClick}>
          Add Assignment
        </Button>
      </div>

      {loading ? (
        <div className="p-4"><SectionLoader rows={2} /></div>
      ) : !assignments.length ? (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-400">No assignments yet for this course.</p>
          <button onClick={onCreateClick} className="text-sm text-brand-500 hover:text-brand-600 font-medium mt-1">
            Create the first one →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {assignments.map(a => {
            const days = a.due_date ? Math.ceil((new Date(a.due_date) - new Date()) / 86400000) : null
            const overdue = days !== null && days < 0
            return (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted transition">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                  {overdue
                    ? <CheckCircle2 size={15} className="text-red-400" />
                    : <Clock size={15} className="text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.total_points} pts · Due {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}</p>
                </div>
                <Badge variant={overdue ? 'danger' : 'warning'} dot size="sm">
                  {overdue ? 'Overdue' : days === 0 ? 'Due today' : `${days}d left`}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { ClipboardList, Upload, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react'
import { coursesApi } from '../api/courses'
import { assignmentsApi } from '../api/index'
import { enrollmentsApi } from '../api/index'
import { useAsync } from '../hooks/index'
import { useToast } from '../components/common/Toast'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import { EmptyState, ErrorState } from '../components/common/EmptyState'
import { SectionLoader } from '../components/common/Spinner'

const statusConfig = {
  SUBMITTED:      { label: 'Submitted',      variant: 'info',    icon: CheckCircle2 },
  GRADED:         { label: 'Graded',         variant: 'success', icon: CheckCircle2 },
  PENDING_REVIEW: { label: 'Under Review',   variant: 'warning', icon: Clock },
  PENDING:        { label: 'Pending',        variant: 'warning', icon: Clock },
  OVERDUE:        { label: 'Overdue',        variant: 'danger',  icon: AlertCircle },
}

const formatDate = (s) => s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const daysUntil  = (s) => s ? Math.ceil((new Date(s) - new Date()) / 86400000) : null

const AssignmentsPage = () => {
  const toast = useToast()
  const [submitModal, setSubmitModal] = useState(null) // { assignmentId, title }
  const [file, setFile]               = useState(null)
  const [text, setText]               = useState('')
  const [submitting, setSubmitting]   = useState(false)

  // Load enrolled courses to fetch their assignments
  const { data: enrollData, loading: enrollLoading, error: enrollError } = useAsync(
    () => enrollmentsApi.getMyCourses({ size: 50 })
  )

  const enrollments = enrollData?.content || []

  const openSubmit = (assignment) => {
    setSubmitModal(assignment)
    setFile(null)
    setText('')
  }

  const handleSubmit = async () => {
    if (!file && !text.trim()) {
      toast.warning('Please attach a file or enter submission text.')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      if (file) fd.append('file', file)
      if (text) fd.append('submission_text', text)
      await assignmentsApi.submit(submitModal.id, fd)
      toast.success('Assignment submitted successfully!')
      setSubmitModal(null)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Assignments</h1>
        <p className="page-subtitle">Track and submit your course assignments.</p>
      </div>

      {enrollLoading ? (
        <SectionLoader rows={4} />
      ) : enrollError ? (
        <ErrorState message={enrollError} />
      ) : !enrollments.length ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Enroll in courses to see your assignments here."
        />
      ) : (
        <div className="space-y-8">
          {enrollments.map((enrollment) => (
            <CourseAssignments
              key={enrollment.id}
              courseId={enrollment.course?.id}
              courseTitle={enrollment.course?.title}
              onSubmit={openSubmit}
            />
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <Modal
        isOpen={!!submitModal}
        onClose={() => setSubmitModal(null)}
        title={`Submit: ${submitModal?.title}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-muted block mb-2">
              Attach File <span className="text-gray-400 font-normal">(PDF, DOC, ZIP)</span>
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <Upload size={24} className="text-gray-300 mx-auto mb-2" />
              {file ? (
                <p className="text-sm text-brand-600 font-medium">{file.name}</p>
              ) : (
                <p className="text-sm text-gray-400">Click to choose a file</p>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.zip,.txt"
                onChange={e => setFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-muted">
              Submission Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add any notes for your instructor…"
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full px-4 py-3 bg-surface-muted border border-gray-200 rounded-xl text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setSubmitModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting} className="flex-1">
              Submit Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Sub-component: loads and renders assignments for a single course
const CourseAssignments = ({ courseId, courseTitle, onSubmit }) => {
  const { data, loading, error } = useAsync(
    () => coursesApi.getAssignments(courseId),
    [courseId]
  )

  const assignments = data?.content || []

  if (loading) return <SectionLoader rows={2} />
  if (error || !assignments.length) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <ClipboardList size={14} />
        {courseTitle}
      </h2>
      <div className="space-y-3">
        {assignments.map((assignment) => {
          const days = daysUntil(assignment.due_date)
          const isOverdue = days !== null && days < 0
          const statusKey = isOverdue ? 'OVERDUE' : 'PENDING'
          const cfg = statusConfig[statusKey] || statusConfig.PENDING
          const StatusIcon = cfg.icon

          return (
            <div
              key={assignment.id}
              className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-card-hover transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                <StatusIcon size={18} className={isOverdue ? 'text-red-500' : 'text-amber-500'} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-ink">{assignment.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{assignment.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={11} />
                    Due {formatDate(assignment.due_date)}
                  </span>
                  {assignment.total_points && (
                    <span className="text-xs text-gray-400">{assignment.total_points} pts</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSubmit(assignment)}
                  disabled={isOverdue}
                >
                  <Upload size={14} />
                  Submit
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AssignmentsPage

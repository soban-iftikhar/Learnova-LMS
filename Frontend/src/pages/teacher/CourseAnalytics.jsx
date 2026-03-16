import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, Star, CheckCircle2, ClipboardCheck, User } from 'lucide-react'
import { ratingsApi, enrollmentsApi } from '../../api/index'
import { coursesApi } from '../../api/courses'
import { useAsync } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import StatCard from '../../components/StatCard'
import Badge from '../../components/common/Badge'
import { PageLoader, SectionLoader } from '../../components/common/Spinner'
import { ErrorState, EmptyState } from '../../components/common/EmptyState'
import StudentProfileModal from './StudentProfileModal'

/* ── Mark-Complete Button ─────────────────────────────────────────────────── */
function MarkCompleteButton({ enrollmentId, onDone }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!confirm("Mark this student's enrollment as Complete?")) return
    setLoading(true)
    try {
      const res = await enrollmentsApi.markComplete(enrollmentId)
      toast.success(res.data?.message || 'Marked as complete.')
      onDone?.()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to mark complete.')
    } finally { setLoading(false) }
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className="flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-600
        text-xs font-medium rounded-full hover:bg-brand-100 transition-colors disabled:opacity-50"
      title="Mark as Complete">
      <CheckCircle2 size={11} />{loading ? '…' : 'Complete'}
    </button>
  )
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function CourseAnalytics() {
  const { courseId } = useParams()
  const navigate     = useNavigate()
  const [profileStudent, setProfileStudent] = useState(null) // studentId to view

  const { data: course,     loading: cLoading, error: cError } =
    useAsync(() => coursesApi.getById(courseId), [courseId])
  const { data: enrollData, loading: eLoading, refetch: refetchEnrollments } =
    useAsync(() => coursesApi.getEnrollments(courseId), [courseId])
  const { data: ratingData, loading: rLoading } =
    useAsync(() => ratingsApi.get(courseId), [courseId])
  const { data: quizData,   loading: qLoading } =
    useAsync(() => coursesApi.getQuizResults(courseId), [courseId])

  const loading = cLoading || eLoading || rLoading || qLoading

  if (loading) return <PageLoader />
  if (cError)  return <ErrorState message={cError} />

  const enrollments    = enrollData?.content   || []
  const reviews        = ratingData?.reviews   || []
  const avgRating      = ratingData?.average   || 0
  const quizResults    = quizData?.content     || []
  const total          = enrollments.length
  const completed      = enrollments.filter(e => e.status === 'COMPLETED').length

  const studentRows = enrollments.map(e => {
    return {
      enrollmentId:   e.id,
      studentId:      e.student?.id,
      name:           e.student?.name,
      email:          e.student?.email,
      status:         e.status,
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
          <p className="page-subtitle">Enrollment, quiz results and ratings.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students"  value={total}     icon={Users}         color="brand"  />
        <StatCard label="Completed"       value={completed} icon={CheckCircle2}  color="sky"    />
        <StatCard label="Completion Rate"
          value={total ? `${Math.round(completed / total * 100)}%` : '0%'}
          icon={Calendar} color="violet" />
        <StatCard label="Avg Rating"
          value={avgRating > 0 ? `${avgRating} ★` : 'No ratings'}
          icon={Star} color="amber" />
      </div>

      {/* Student table */}
      <div>
        <h2 className="section-title">Students</h2>
        {!studentRows.length ? (
          <EmptyState icon={Users} title="No students enrolled yet"
            description="Students will appear here once they enroll." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="text-left   py-3 px-5 font-semibold text-gray-600">Student</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map(s => (
                  <tr key={s.enrollmentId} className="border-t border-gray-50 hover:bg-surface-muted transition">
                    <td className="py-3 px-5">
                      <button
                        onClick={() => setProfileStudent(s.studentId)}
                        className="text-left group">
                        <p className="font-medium text-ink group-hover:text-brand-600 transition-colors flex items-center gap-1">
                          {s.name}
                          <User size={11} className="text-gray-300 group-hover:text-brand-400" />
                        </p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'COMPLETED' ? 'bg-brand-50 text-brand-700' :
                        s.status === 'ACTIVE'    ? 'bg-sky-50 text-sky-700' :
                        'bg-gray-100 text-gray-500'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.status !== 'COMPLETED' && (
                        <MarkCompleteButton
                          enrollmentId={s.enrollmentId}
                          onDone={refetchEnrollments}
                        />
                      )}
                      {s.status === 'COMPLETED' && (
                        <span className="text-xs text-brand-500 font-medium">✓ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quiz Results */}
      {quizResults.length > 0 && (
        <div>
          <h2 className="section-title">Quiz Results</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="text-left   py-3 px-5 font-semibold text-gray-600">Student</th>
                  <th className="text-left   py-3 px-4 font-semibold text-gray-600">Quiz</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">%</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Result</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map((r, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-surface-muted transition">
                    <td className="py-3 px-5">
                      <p className="font-medium text-ink">{r.student_name}</p>
                      <p className="text-xs text-gray-400">{r.student_email}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{r.quiz_title}</td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {r.score}/{r.max_score}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      <span className={r.percentage >= 70 ? 'text-brand-600' : 'text-red-500'}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={r.passed ? 'success' : 'danger'} size="sm">
                        {r.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-400">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ratings */}
      <div>
        <h2 className="section-title">Student Ratings ({reviews.length})</h2>
        {!reviews.length ? (
          <div className="card p-8 text-center">
            <Star size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No ratings yet.</p>
            <p className="text-xs text-gray-300 mt-1">
              Students can rate the course after completing it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-ink">{r.student_name}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={13}
                            className={n <= r.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200'} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-500">{r.comment}</p>}
                  </div>
                  <span className="text-xs text-gray-300 flex-shrink-0">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student profile modal */}
      {profileStudent && (
        <StudentProfileModal
          studentId={profileStudent}
          onClose={() => setProfileStudent(null)}
        />
      )}
    </div>
  )
}

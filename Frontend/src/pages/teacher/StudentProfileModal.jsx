import React from 'react'
import { X, BookOpen, ClipboardCheck, Calendar, CheckCircle2, TrendingUp } from 'lucide-react'
import { useAsync } from '../../hooks/index'
import { teacherApi } from '../../api/index'
import Badge from '../../components/common/Badge'
import ProgressBar from '../../components/common/ProgressBar'
import Avatar from '../../components/common/Avatar'
import { SectionLoader } from '../../components/common/Spinner'

export default function StudentProfileModal({ studentId, onClose }) {
  const { data, loading, error } = useAsync(
    () => teacherApi.getStudentProfile(studentId), [studentId]
  )

  const student    = data?.student     || {}
  const courses    = data?.courses     || []
  const quizResults = data?.quiz_results || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={student.name} size="md" />
            <div>
              <h2 className="font-semibold text-ink">{student.name || 'Student'}</h2>
              <p className="text-xs text-gray-400">{student.email}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-ink hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
            <SectionLoader rows={4} />
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-ink">{data?.total_courses ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Courses</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-brand-600">{data?.completed_courses ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Completed</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-violet-600">{data?.quizzes_taken ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Quizzes Done</p>
                </div>
              </div>

              {/* Enrolled courses */}
              {courses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                    <BookOpen size={14} className="text-brand-500" /> Enrolled Courses
                  </h3>
                  <div className="space-y-3">
                    {courses.map(c => (
                      <div key={c.enrollment_id} className="card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-ink">{c.course_title}</p>
                          <Badge
                            variant={c.status === 'COMPLETED' ? 'success' : 'info'}
                            size="sm" dot>
                            {c.status}
                          </Badge>
                        </div>
                        <ProgressBar value={c.progress} size="sm" showLabel />
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Enrolled {c.enrolled_at ? new Date(c.enrolled_at).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz performance */}
              {quizResults.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                    <ClipboardCheck size={14} className="text-violet-500" /> Quiz Performance
                  </h3>
                  <div className="space-y-2">
                    {quizResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-surface-muted rounded-xl">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          r.passed ? 'bg-brand-100' : 'bg-red-50'}`}>
                          {r.passed
                            ? <CheckCircle2 size={15} className="text-brand-600" />
                            : <TrendingUp   size={15} className="text-red-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{r.quiz_title}</p>
                          <p className="text-xs text-gray-400">
                            {r.score}/{r.max_score} pts · {r.submitted_at
                              ? new Date(r.submitted_at).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-bold ${r.passed ? 'text-brand-600' : 'text-red-500'}`}>
                            {r.percentage}%
                          </p>
                          <Badge variant={r.passed ? 'success' : 'danger'} size="sm">
                            {r.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {courses.length === 0 && quizResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No activity data yet for this student.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

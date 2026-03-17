import React, { useState } from 'react'
import { ClipboardCheck, Plus, Eye, EyeOff, Trash2, Edit3, Users, CheckCircle2, BarChart3 } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { dashboardApi, quizManagementApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'
import MarksSheet from '../../components/MarksSheet'

// ── Questions Editor ──────────────────────────────────────────────────────────
function QuestionsEditor({ quizId, onSaved }) {
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const BLANK = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', marks: '1' }
  const [form, setForm] = useState(BLANK)

  const { data, loading, refetch } = useAsync(() => quizManagementApi.getQuestions(quizId), [quizId])
  const questions = data?.content || []

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.question_text.trim()) { toast.warning('Question text is required'); return }
    if (!form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      toast.warning('All 4 options are required'); return
    }
    setSaving(true)
    try {
      await quizManagementApi.addQuestion(quizId, { ...form, marks: Number(form.marks) || 1 })
      toast.success('Question added!')
      setForm(BLANK)
      setShowForm(false)
      refetch()
      onSaved?.()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add question.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (qId) => {
    if (!confirm('Delete this question?')) return
    try {
      await quizManagementApi.deleteQuestion(quizId, qId)
      toast.success('Question deleted.')
      refetch(); onSaved?.()
    } catch { toast.error('Failed to delete question.') }
  }

  const s = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-ink">{loading ? '…' : questions.length} question{questions.length !== 1 ? 's' : ''}</p>
        <Button size="xs" onClick={() => setShowForm(v => !v)}>{showForm ? 'Cancel' : '+ Add Question'}</Button>
      </div>

      {questions.map((q, i) => (
        <div key={q.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink font-medium">{q.question_text}</p>
            <div className="grid grid-cols-2 gap-1 mt-1.5">
              {['a','b','c','d'].map(opt => (
                <p key={opt} className={`text-xs px-2 py-1 rounded-lg ${q.correct_answer === opt.toUpperCase() ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-500'}`}>
                  {opt.toUpperCase()}: {q[`option_${opt}`]}
                </p>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{q.marks} mark{q.marks !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => handleDelete(q.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {showForm && (
        <form onSubmit={handleAdd} className="p-4 bg-white rounded-xl border-2 border-brand-200 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-muted">Question *</label>
            <textarea rows={2} value={form.question_text} onChange={s('question_text')}
              placeholder="Enter question…" className="input-field text-sm resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['a','b','c','d'].map(opt => (
              <div key={opt} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-muted">Option {opt.toUpperCase()} *</label>
                <input value={form[`option_${opt}`]} onChange={s(`option_${opt}`)}
                  placeholder={`Option ${opt.toUpperCase()}`} className="input-field text-sm py-2" required />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-muted">Correct Answer *</label>
              <select value={form.correct_answer} onChange={s('correct_answer')} className="input-field text-sm py-2">
                {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-muted">Marks</label>
              <input type="number" min="1" value={form.marks} onChange={s('marks')} className="input-field text-sm py-2" />
            </div>
          </div>
          <Button type="submit" size="sm" loading={saving}>Add Question</Button>
        </form>
      )}
    </div>
  )
}

// ── Quiz Card ─────────────────────────────────────────────────────────────────
function QuizCard({ quiz, onTogglePublish, onDelete, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const [showMarksSheet, setShowMarksSheet] = useState(false)
  
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
          <ClipboardCheck size={18} className="text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">{quiz.title}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{quiz.question_count} questions</span>
            <span>{quiz.time_limit > 0 ? `${quiz.time_limit} min` : 'No time limit'}</span>
            <span>{quiz.max_score} pts</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={quiz.is_published ? 'success' : 'draft'} dot size="sm">
            {quiz.is_published ? 'Published' : 'Draft'}
          </Badge>
          <button onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors" title="Edit questions">
            <Edit3 size={15} />
          </button>
          <button onClick={() => setShowMarksSheet(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title="View marks sheet">
            <BarChart3 size={15} />
          </button>
          <button onClick={() => onTogglePublish(quiz)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors"
            title={quiz.is_published ? 'Unpublish' : 'Publish'}>
            {quiz.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button onClick={() => onDelete(quiz.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 bg-surface-muted p-4">
          <QuestionsEditor quizId={quiz.id} onSaved={onRefresh} />
        </div>
      )}
      
      {showMarksSheet && (
        <MarksSheet 
          quizId={quiz.id} 
          quizTitle={quiz.title}
          onClose={() => setShowMarksSheet(false)}
        />
      )}
    </div>
  )
}

// ── Course Quiz Section ───────────────────────────────────────────────────────
function CourseQuizSection({ course }) {
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', time_limit: '30', max_score: '100' })

  const { data, loading, error, refetch } = useAsync(
    () => quizManagementApi.listForCourse(course.id), [course.id]
  )
  const quizzes = data?.content || []

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.warning('Quiz title required'); return }
    setSaving(true)
    try {
      await quizManagementApi.create(course.id, {
        title:       form.title.trim(),
        description: form.description.trim(),
        time_limit:  Number(form.time_limit) || 30,
        max_score:   Number(form.max_score) || 100,
      })
      toast.success('Quiz created! Now add questions.')
      setShowForm(false)
      setForm({ title: '', description: '', time_limit: '30', max_score: '100' })
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create quiz.')
    } finally { setSaving(false) }
  }

  const handleTogglePublish = async (quiz) => {
    try {
      await quizManagementApi.togglePublish(quiz.id, !quiz.is_published)
      toast.success(quiz.is_published ? 'Quiz unpublished.' : 'Quiz published! Students can now take it.')
      refetch()
    } catch { toast.error('Failed to update quiz.') }
  }

  const handleDelete = async (quizId) => {
    if (!confirm('Delete this quiz and all its questions?')) return
    try {
      await quizManagementApi.delete(quizId)
      toast.success('Quiz deleted.')
      refetch()
    } catch { toast.error('Failed to delete quiz.') }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-surface-muted border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <ClipboardCheck size={16} className="text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{course.title}</p>
            <p className="text-xs text-gray-400">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</p>
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)}>
          Create Quiz
        </Button>
      </div>

      <div className="p-4">
        {loading ? <SectionLoader rows={2} />
        : error   ? <ErrorState message={error} onRetry={refetch} />
        : !quizzes.length && !showForm ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">No quizzes yet for this course.</p>
            <button onClick={() => setShowForm(true)} className="text-sm text-brand-500 hover:text-brand-600 font-medium mt-1">
              Create the first quiz →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz}
                onTogglePublish={handleTogglePublish}
                onDelete={handleDelete}
                onRefresh={refetch} />
            ))}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="mt-4 p-4 border-2 border-brand-200 rounded-xl space-y-4 bg-white">
            <h3 className="text-sm font-semibold text-ink">New Quiz</h3>
            <Input label="Quiz Title *" placeholder="e.g., Chapter 1 Assessment"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-muted">Description (optional)</label>
              <textarea rows={2} placeholder="What does this quiz cover?"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Time Limit (minutes)" type="number" min="1" placeholder="30"
                value={form.time_limit} onChange={e => setForm(f => ({ ...f, time_limit: e.target.value }))} />
              <Input label="Max Score" type="number" min="1" placeholder="100"
                value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>Create Quiz</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeacherQuizzes() {
  const { data, loading, error, refetch } = useAsync(() => dashboardApi.getInstructorDashboard())
  const courses = data?.courses || []

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Quizzes</h1>
        <p className="page-subtitle">Create, manage and publish quizzes for your courses.</p>
      </div>

      {loading ? <SectionLoader rows={3} />
      : error   ? <ErrorState message={error} onRetry={refetch} />
      : !courses.length ? (
        <EmptyState icon={ClipboardCheck} title="No courses yet"
          description="Create a course first to add quizzes." />
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <CourseQuizSection key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

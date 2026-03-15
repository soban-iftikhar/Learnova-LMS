import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Video, ClipboardList, FileText, Plus, Trash2,
  Edit3, X, Clock, Eye, EyeOff, Calendar,
} from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { videosApi, assignmentsApi, quizManagementApi, quizzesApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import { PageLoader, SectionLoader } from '../../components/common/Spinner'
import { ErrorState, EmptyState } from '../../components/common/EmptyState'

const TABS = [
  { id: 'lectures',    label: 'Lectures',    icon: Video },
  { id: 'quizzes',     label: 'Quizzes',     icon: ClipboardList },
  { id: 'assignments', label: 'Assignments', icon: FileText },
]

export default function CourseBuilder() {
  const { courseId } = useParams()
  const navigate     = useNavigate()
  const [tab, setTab] = useState('lectures')

  const { data: course, loading, error } = useAsync(() => coursesApi.getById(courseId), [courseId])

  if (loading) return <PageLoader />
  if (error)   return <ErrorState message={error} />
  if (!course) return null

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/teacher/courses')}
          className="p-2 rounded-xl text-gray-400 hover:text-ink dark:hover:text-white hover:bg-surface-muted dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="page-title mb-0 truncate">{course.title}</h1>
          <p className="page-subtitle">Manage course content</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/teacher/courses/${courseId}/edit`}>
            <Button variant="outline" size="sm" leftIcon={<Edit3 size={14} />}>Edit Info</Button>
          </Link>
          <Link to={`/teacher/courses/${courseId}/analytics`}>
            <Button variant="outline" size="sm">Analytics</Button>
          </Link>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-surface-muted dark:bg-gray-800 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
              ${tab === id
                ? 'bg-white dark:bg-gray-900 text-ink dark:text-white shadow-sm'
                : 'text-gray-400 hover:text-ink dark:hover:text-white'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {tab === 'lectures'    && <LecturesTab    courseId={courseId} />}
      {tab === 'quizzes'     && <QuizzesTab     courseId={courseId} />}
      {tab === 'assignments' && <AssignmentsTab courseId={courseId} />}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// LECTURES TAB
// ═════════════════════════════════════════════════════════════════════════════
function LecturesTab({ courseId }) {
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editVideo, setEditVideo] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({ title: '', description: '', video_url: '', duration_minutes: '' })

  const { data, loading, error, refetch } = useAsync(() => videosApi.getAll(courseId), [courseId])
  const videos = data?.content || []

  const openAdd  = () => { setForm({ title: '', description: '', video_url: '', duration_minutes: '' }); setEditVideo(null); setShowForm(true) }
  const openEdit = (v) => { setForm({ title: v.title, description: v.description || '', video_url: v.video_url || '', duration_minutes: String(v.duration_minutes || '') }); setEditVideo(v); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.warning('Title is required.'); return }
    if (!form.video_url.trim()) { toast.warning('Video URL is required.'); return }
    setSaving(true)
    try {
      const payload = { ...form, duration_minutes: Number(form.duration_minutes) || 0 }
      if (editVideo) {
        await videosApi.update(courseId, editVideo.id, payload)
        toast.success('Video updated!')
      } else {
        await videosApi.create(courseId, payload)
        toast.success('Video added!')
      }
      setShowForm(false)
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save video.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (videoId) => {
    if (!confirm('Delete this video?')) return
    try {
      await videosApi.delete(courseId, videoId)
      toast.success('Video deleted.')
      refetch()
    } catch { toast.error('Failed to delete video.') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Video Lectures ({videos.length})</h2>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={openAdd}>Add Video</Button>
      </div>

      {loading ? <SectionLoader rows={3} />
      : error   ? <ErrorState message={error} onRetry={refetch} />
      : !videos.length ? (
        <EmptyState icon={Video} title="No lectures yet"
          description="Add video lectures using YouTube/Vimeo URLs or any direct video link."
          action={openAdd} actionLabel="Add First Video" />
      ) : (
        <div className="space-y-3">
          {videos.map((v, i) => (
            <div key={v.id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 font-bold text-brand-600 text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink dark:text-white">{v.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{v.video_url}</p>
                {v.duration_minutes > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={11} />{v.duration_minutes} min
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(v)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => handleDelete(v.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editVideo ? 'Edit Video' : 'Add Video Lecture'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Title *" placeholder="e.g., Introduction to Variables"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <Input label="Video URL *" placeholder="YouTube, Vimeo, or direct video link"
            value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
            hint="Paste a YouTube/Vimeo share URL or a direct .mp4 link" required />
          <Input label="Duration (minutes)" type="number" min="0" placeholder="e.g., 15"
            value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-muted dark:text-gray-400">Description (optional)</label>
            <textarea rows={2} placeholder="What will students learn in this lecture?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>{editVideo ? 'Save Changes' : 'Add Video'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// QUIZZES TAB  (fixed: uses static quizzesApi import, no dynamic import)
// ═════════════════════════════════════════════════════════════════════════════
function QuizzesTab({ courseId }) {
  const toast = useToast()
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [activeQuiz, setActiveQuiz]    = useState(null)
  const [quizForm, setQuizForm]        = useState({ title: '', description: '', time_limit: '30', max_score: '100' })
  const [saving, setSaving]            = useState(false)

  // FIX: use static import (quizzesApi imported at top of file), no dynamic import
  const { data: quizData, loading: qLoading, error: qError, refetch: refetchQuizzes } = useAsync(
    () => quizzesApi.getAll(courseId),
    [courseId]
  )
  const quizzes = quizData?.content || []

  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    if (!quizForm.title.trim()) { toast.warning('Quiz title is required.'); return }
    setSaving(true)
    try {
      const res = await quizManagementApi.create(courseId, {
        title:       quizForm.title.trim(),
        description: quizForm.description.trim(),
        time_limit:  Number(quizForm.time_limit),
        max_score:   Number(quizForm.max_score),
      })
      toast.success('Quiz created! Now add questions.')
      setShowQuizForm(false)
      setQuizForm({ title: '', description: '', time_limit: '30', max_score: '100' })
      refetchQuizzes()
      setActiveQuiz(res.data)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create quiz.')
    } finally { setSaving(false) }
  }

  const handleTogglePublish = async (quiz) => {
    try {
      await quizManagementApi.togglePublish(quiz.id, !quiz.is_published)
      toast.success(quiz.is_published ? 'Quiz unpublished.' : 'Quiz published!')
      refetchQuizzes()
    } catch { toast.error('Failed to update quiz.') }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Delete this quiz and all its questions?')) return
    try {
      await quizManagementApi.delete(quizId)
      toast.success('Quiz deleted.')
      if (activeQuiz?.id === quizId) setActiveQuiz(null)
      refetchQuizzes()
    } catch { toast.error('Failed to delete quiz.') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Quizzes ({quizzes.length})</h2>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowQuizForm(true)}>Create Quiz</Button>
      </div>

      {qLoading ? <SectionLoader rows={2} />
      : qError   ? <ErrorState message={qError} onRetry={refetchQuizzes} />
      : !quizzes.length ? (
        <EmptyState icon={ClipboardList} title="No quizzes yet"
          description="Create timed MCQ quizzes for your students."
          action={() => setShowQuizForm(true)} actionLabel="Create Quiz" />
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
                  <ClipboardList size={18} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink dark:text-white">{quiz.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={11} />{quiz.time_limit} min</span>
                    <span>{quiz.question_count} questions</span>
                    <span>{quiz.max_score} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={quiz.is_published ? 'success' : 'draft'} dot size="sm">
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <button onClick={() => setActiveQuiz(activeQuiz?.id === quiz.id ? null : quiz)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                    title="Manage questions">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => handleTogglePublish(quiz)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    title={quiz.is_published ? 'Unpublish' : 'Publish'}>
                    {quiz.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => handleDeleteQuiz(quiz.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {activeQuiz?.id === quiz.id && (
                <div className="border-t border-gray-100 dark:border-gray-800 bg-surface-muted dark:bg-gray-800/50 p-4">
                  <QuestionsEditor quizId={quiz.id} onSaved={refetchQuizzes} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showQuizForm} onClose={() => setShowQuizForm(false)} title="Create Quiz" size="md">
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <Input label="Quiz Title *" placeholder="e.g., Chapter 1 Assessment"
            value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-muted dark:text-gray-400">Description (optional)</label>
            <textarea rows={2} placeholder="What does this quiz cover?"
              value={quizForm.description} onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))}
              className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Time Limit (minutes)" type="number" min="1" placeholder="30"
              value={quizForm.time_limit} onChange={e => setQuizForm(f => ({ ...f, time_limit: e.target.value }))} />
            <Input label="Max Score" type="number" min="1" placeholder="100"
              value={quizForm.max_score} onChange={e => setQuizForm(f => ({ ...f, max_score: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Create Quiz</Button>
            <Button type="button" variant="outline" onClick={() => setShowQuizForm(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── Questions Editor ─────────────────────────────────────────────────────────
function QuestionsEditor({ quizId, onSaved }) {
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const BLANK = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', marks: '1' }
  const [form, setForm] = useState(BLANK)

  const { data, loading, refetch } = useAsync(() => quizManagementApi.getQuestions(quizId), [quizId])
  const questions = data?.content || []

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.question_text.trim()) { toast.warning('Question text is required.'); return }
    if (!form.option_a.trim() || !form.option_b.trim() || !form.option_c.trim() || !form.option_d.trim()) {
      toast.warning('All four options are required.'); return
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
      refetch()
      onSaved?.()
    } catch { toast.error('Failed to delete question.') }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink dark:text-white">
          {loading ? '…' : questions.length} Question{questions.length !== 1 ? 's' : ''}
        </p>
        <Button size="xs" leftIcon={<Plus size={12} />} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : 'Add Question'}
        </Button>
      </div>

      {loading && <p className="text-xs text-gray-400 animate-pulse">Loading questions…</p>}

      {questions.map((q, i) => (
        <div key={q.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 flex items-start gap-3 border border-gray-100 dark:border-gray-700">
          <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink dark:text-white">{q.question_text}</p>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {['A', 'B', 'C', 'D'].map(opt => (
                <p key={opt} className={`text-xs px-2 py-1 rounded-lg ${q.correct_answer === opt
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'text-gray-500 dark:text-gray-400'}`}>
                  {opt}: {q[`option_${opt.toLowerCase()}`]}
                </p>
              ))}
            </div>
          </div>
          <button onClick={() => handleDelete(q.id)}
            className="p-1 rounded-lg text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-3 border-2 border-brand-200 dark:border-brand-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-muted dark:text-gray-400">Question *</label>
            <textarea rows={2} placeholder="Enter your question…"
              value={form.question_text} onChange={set('question_text')}
              className="input-field text-sm resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['a', 'b', 'c', 'd'].map(opt => (
              <div key={opt} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-muted dark:text-gray-400">Option {opt.toUpperCase()} *</label>
                <input placeholder={`Option ${opt.toUpperCase()}`}
                  value={form[`option_${opt}`]} onChange={set(`option_${opt}`)}
                  className="input-field text-sm py-2" required />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-muted dark:text-gray-400">Correct Answer *</label>
              <select value={form.correct_answer} onChange={set('correct_answer')} className="input-field text-sm py-2">
                {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-muted dark:text-gray-400">Marks</label>
              <input type="number" min="1" placeholder="1"
                value={form.marks} onChange={set('marks')} className="input-field text-sm py-2" />
            </div>
          </div>
          <Button type="submit" size="sm" loading={saving}>Add Question</Button>
        </form>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ASSIGNMENTS TAB
// ═════════════════════════════════════════════════════════════════════════════
function AssignmentsTab({ courseId }) {
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const BLANK = { title: '', description: '', due_date: '', total_points: '100' }
  const [form, setForm] = useState(BLANK)

  const { data, loading, error, refetch } = useAsync(() => assignmentsApi.getAll(courseId), [courseId])
  const assignments = data?.content || []

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.warning('Title is required.'); return }
    if (!form.due_date) { toast.warning('Due date is required.'); return }
    setSaving(true)
    try {
      await assignmentsApi.create(courseId, {
        title:        form.title.trim(),
        description:  form.description.trim(),
        due_date:     form.due_date,
        total_points: Number(form.total_points) || 100,
        is_assignment: true,
      })
      toast.success('Assignment created!')
      setShowForm(false)
      setForm(BLANK)
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create assignment.')
    } finally { setSaving(false) }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Assignments ({assignments.length})</h2>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)}>Add Assignment</Button>
      </div>

      {loading ? <SectionLoader rows={2} />
      : error   ? <ErrorState message={error} onRetry={refetch} />
      : !assignments.length ? (
        <EmptyState icon={FileText} title="No assignments yet"
          description="Create assignments for students to download and submit as PDFs."
          action={() => setShowForm(true)} actionLabel="Add Assignment" />
      ) : (
        <div className="space-y-3">
          {assignments.map(a => {
            const days    = a.due_date ? Math.ceil((new Date(a.due_date) - new Date()) / 86400000) : null
            const overdue = days !== null && days < 0
            return (
              <div key={a.id} className="card p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${overdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <FileText size={18} className={overdue ? 'text-red-500' : 'text-amber-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink dark:text-white">{a.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}
                    </span>
                    <span>{a.total_points} pts</span>
                  </div>
                </div>
                <Badge variant={overdue ? 'danger' : days === 0 ? 'warning' : 'info'} dot size="sm">
                  {overdue ? 'Overdue' : days === 0 ? 'Due today' : days === null ? 'Open' : `${days}d left`}
                </Badge>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Assignment" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title *" placeholder="e.g., Final Project Submission"
            value={form.title} onChange={set('title')} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-muted dark:text-gray-400">Instructions (optional)</label>
            <textarea rows={3} placeholder="Describe what students should submit…"
              value={form.description} onChange={set('description')} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date *" type="datetime-local" value={form.due_date} onChange={set('due_date')} required />
            <Input label="Total Points" type="number" min="1" placeholder="100"
              value={form.total_points} onChange={set('total_points')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Create Assignment</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

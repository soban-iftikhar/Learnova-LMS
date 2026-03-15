import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Clock, CheckCircle2, Lock, Upload, Star,
  BookOpen, ClipboardList, FileText, Users, ChevronDown, ChevronRight,
  AlertCircle, Timer, X, Loader2,
} from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { enrollmentsApi, quizzesApi, assignmentsApi, videosApi, ratingsApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import ProgressBar from '../../components/common/ProgressBar'
import Modal from '../../components/common/Modal'
import { PageLoader, SectionLoader } from '../../components/common/Spinner'
import { ErrorState } from '../../components/common/EmptyState'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'

// ─── Helper: embed URL converter ─────────────────────────────────────────────
function toEmbedUrl(url) {
  if (!url) return ''
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Vimeo
  const vmMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`
  return url
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { id } = useParams()
  const toast   = useToast()
  const navigate = useNavigate()

  const [enrolling, setEnrolling]       = useState(false)
  const [unenrolling, setUnenrolling]   = useState(false)
  const [activeVideo, setActiveVideo]   = useState(null)
  const [openSection, setOpenSection]   = useState('lectures')

  // Modals
  const [quizModal, setQuizModal]       = useState(null)   // quiz object
  const [submitModal, setSubmitModal]   = useState(null)   // assignment object
  const [ratingModal, setRatingModal]   = useState(false)
  const [completedModal, setCompletedModal] = useState(false)

  const { data: course, loading, error, refetch: refetchCourse } = useAsync(
    () => coursesApi.getById(id), [id]
  )
  const { data: videosData, refetch: refetchVideos } = useAsync(
    () => videosApi.getAll(id), [id]
  )
  const { data: quizzesData } = useAsync(
    () => quizzesApi.getAll(id), [id]
  )
  const { data: assignmentsData } = useAsync(
    () => assignmentsApi.getAll(id), [id]
  )
  const { data: myEnrollments } = useAsync(
    () => enrollmentsApi.getMyCourses({ size: 200 }), []
  )

  const videos      = videosData?.content || []
  const quizzes     = quizzesData?.content?.filter(q => q.status === 'ACTIVE') || []
  const assignments = assignmentsData?.content || []

  // Find if enrolled
  const myEnrollment = myEnrollments?.content?.find(e => e.course?.id === Number(id))
  const isEnrolled   = !!myEnrollment

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enrollmentsApi.enroll(Number(id))
      toast.success('Enrolled! Start learning now.')
      refetchCourse()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not enroll.')
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenroll = async () => {
    if (!myEnrollment) return
    if (!confirm('Are you sure you want to unenroll from this course?')) return
    setUnenrolling(true)
    try {
      await enrollmentsApi.unenroll(myEnrollment.id)
      toast.success('Unenrolled successfully.')
      navigate('/courses')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not unenroll.')
    } finally {
      setUnenrolling(false)
    }
  }

  if (loading) return <PageLoader />
  if (error)   return <ErrorState message={error} />
  if (!course) return null

  const totalItems = videos.length + quizzes.length + assignments.length

  return (
    <div className="animate-fade-in">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-ink dark:hover:text-white mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to My Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          {activeVideo ? (
            <div className="card overflow-hidden">
              <div className="aspect-video bg-black">
                {toEmbedUrl(activeVideo.video_url) ? (
                  <iframe
                    src={toEmbedUrl(activeVideo.video_url)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={activeVideo.title}
                  />
                ) : (
                  <video src={activeVideo.video_url} controls className="w-full h-full" />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-ink dark:text-white">{activeVideo.title}</h2>
                {activeVideo.description && (
                  <p className="text-sm text-gray-400 mt-1">{activeVideo.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img src={course.image_url || PLACEHOLDER} alt={course.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.src = PLACEHOLDER }} />
              </div>
              <div className="p-6">
                {course.category?.name && (
                  <span className="text-xs text-brand-600 font-semibold mb-2 block">{course.category.name}</span>
                )}
                <h1 className="text-2xl font-bold text-ink dark:text-white mb-2">{course.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{course.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-400">
                  {course.instructor?.name && (
                    <span className="flex items-center gap-1.5"><BookOpen size={14} />{course.instructor.name}</span>
                  )}
                  {course.students_count > 0 && (
                    <span className="flex items-center gap-1.5"><Users size={14} />{course.students_count} students</span>
                  )}
                  <span className="flex items-center gap-1.5"><Play size={14} />{videos.length} lectures</span>
                  <span className="flex items-center gap-1.5"><ClipboardList size={14} />{quizzes.length} quizzes</span>
                  <span className="flex items-center gap-1.5"><FileText size={14} />{assignments.length} assignments</span>
                </div>
              </div>
            </div>
          )}

          {/* Course Content Accordion */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-ink dark:text-white">Course Content</h2>
              <p className="text-xs text-gray-400 mt-1">{totalItems} items • Enroll to access</p>
            </div>

            {/* Lectures Section */}
            <SectionAccordion
              id="lectures" label="Video Lectures" icon={Play}
              count={videos.length} open={openSection === 'lectures'}
              onToggle={() => setOpenSection(s => s === 'lectures' ? null : 'lectures')}
              disabled={!isEnrolled}
            >
              {videos.map((v, i) => (
                <button key={v.id}
                  onClick={() => isEnrolled && setActiveVideo(v)}
                  disabled={!isEnrolled}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-surface-muted dark:hover:bg-gray-800 transition-colors border-t border-gray-50 dark:border-gray-800/50 ${!isEnrolled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${activeVideo?.id === v.id ? 'bg-brand-500 text-white' : 'bg-brand-50 dark:bg-brand-900/30 text-brand-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink dark:text-white truncate">{v.title}</p>
                    {v.duration_minutes > 0 && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={10} />{v.duration_minutes} min</p>
                    )}
                  </div>
                  {!isEnrolled ? <Lock size={14} className="text-gray-300 flex-shrink-0" /> : <Play size={14} className="text-brand-500 flex-shrink-0" />}
                </button>
              ))}
              {!videos.length && <p className="px-5 py-4 text-sm text-gray-400">No lectures added yet.</p>}
            </SectionAccordion>

            {/* Quizzes Section */}
            <SectionAccordion
              id="quizzes" label="Quizzes" icon={ClipboardList}
              count={quizzes.length} open={openSection === 'quizzes'}
              onToggle={() => setOpenSection(s => s === 'quizzes' ? null : 'quizzes')}
              disabled={!isEnrolled}
            >
              {quizzes.map(q => (
                <div key={q.id} className="flex items-center gap-3 px-5 py-3 border-t border-gray-50 dark:border-gray-800/50">
                  <div className="w-7 h-7 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={13} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink dark:text-white">{q.title}</p>
                    <p className="text-xs text-gray-400">{q.question_count} questions · {q.time_limit} min</p>
                  </div>
                  {isEnrolled ? (
                    <Button size="xs" variant="outline" onClick={() => setQuizModal(q)}>
                      <Timer size={12} /> Start
                    </Button>
                  ) : <Lock size={14} className="text-gray-300" />}
                </div>
              ))}
              {!quizzes.length && <p className="px-5 py-4 text-sm text-gray-400">No quizzes available yet.</p>}
            </SectionAccordion>

            {/* Assignments Section */}
            <SectionAccordion
              id="assignments" label="Assignments" icon={FileText}
              count={assignments.length} open={openSection === 'assignments'}
              onToggle={() => setOpenSection(s => s === 'assignments' ? null : 'assignments')}
              disabled={!isEnrolled}
            >
              {assignments.map(a => {
                const days    = a.due_date ? Math.ceil((new Date(a.due_date) - new Date()) / 86400000) : null
                const overdue = days !== null && days < 0
                return (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3 border-t border-gray-50 dark:border-gray-800/50">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${overdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                      <FileText size={13} className={overdue ? 'text-red-500' : 'text-amber-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink dark:text-white">{a.title}</p>
                      <p className="text-xs text-gray-400">
                        Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'} · {a.total_points} pts
                      </p>
                    </div>
                    {isEnrolled ? (
                      <Button size="xs" variant="outline"
                        disabled={overdue}
                        onClick={() => setSubmitModal(a)}>
                        <Upload size={12} /> Submit
                      </Button>
                    ) : <Lock size={14} className="text-gray-300" />}
                  </div>
                )
              })}
              {!assignments.length && <p className="px-5 py-4 text-sm text-gray-400">No assignments yet.</p>}
            </SectionAccordion>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-5">
          {/* Enroll / Unenroll card */}
          <div className="card p-6 space-y-4">
            {isEnrolled ? (
              <>
                <div className="flex items-center gap-2 text-brand-600">
                  <CheckCircle2 size={18} />
                  <span className="font-semibold text-sm">You're enrolled</span>
                </div>
                <ProgressBar value={myEnrollment?.progress || 0} showLabel size="sm" />
                <p className="text-xs text-gray-400">{myEnrollment?.progress || 0}% complete</p>

                {/* Complete course button appears when progress is ≥ 100 or manually */}
                <Button fullWidth onClick={() => setCompletedModal(true)}>
                  <CheckCircle2 size={15} /> Mark as Complete & Rate
                </Button>
                <button onClick={handleUnenroll} disabled={unenrolling}
                  className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1">
                  {unenrolling ? 'Unenrolling…' : 'Unenroll from this course'}
                </button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-ink dark:text-white">Ready to start?</h3>
                <p className="text-sm text-gray-400">Enroll to access all lectures, quizzes and assignments.</p>
                <Button fullWidth size="lg" onClick={handleEnroll} loading={enrolling}>
                  Enroll Now — Free
                </Button>
              </>
            )}
          </div>

          {/* Course info */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-ink dark:text-white">This course includes</h3>
            {[
              { icon: Play, label: `${videos.length} video lectures` },
              { icon: ClipboardList, label: `${quizzes.length} timed quizzes` },
              { icon: FileText, label: `${assignments.length} assignments` },
              { icon: Star, label: 'Certificate on completion' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <Icon size={15} className="text-brand-500 flex-shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {quizModal && (
        <QuizAttemptModal
          quiz={quizModal}
          onClose={() => setQuizModal(null)}
        />
      )}

      {/* Assignment Submit Modal */}
      {submitModal && (
        <AssignmentSubmitModal
          assignment={submitModal}
          onClose={() => setSubmitModal(null)}
        />
      )}

      {/* Complete Course + Rating Modal */}
      {completedModal && (
        <RatingModal
          courseId={id}
          instructorName={course.instructor?.name}
          onClose={() => setCompletedModal(false)}
        />
      )}
    </div>
  )
}

// ─── Section Accordion ────────────────────────────────────────────────────────
function SectionAccordion({ id, label, icon: Icon, count, open, onToggle, children, disabled }) {
  return (
    <div>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-muted dark:hover:bg-gray-800/50 transition-colors border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-brand-500" />
          <span className="text-sm font-semibold text-ink dark:text-white">{label}</span>
          <Badge variant="default" size="sm">{count}</Badge>
        </div>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

// ─── Quiz Attempt Modal ───────────────────────────────────────────────────────
function QuizAttemptModal({ quiz, onClose }) {
  const toast = useToast()
  const [phase, setPhase]       = useState('start')   // 'start' | 'quiz' | 'result'
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers]   = useState({})         // { questionId: 'A'|'B'|'C'|'D' }
  const [attemptId, setAttemptId] = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit * 60) // seconds
  const timerRef = useRef(null)

  const startQuiz = async () => {
    setLoading(true)
    try {
      const res = await quizzesApi.start(quiz.id)
      setQuestions(res.data.questions || [])
      setAttemptId(res.data.attempt_id)
      setPhase('quiz')
      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
          return t - 1
        })
      }, 1000)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to start quiz.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current)
    if (!auto && Object.keys(answers).length < questions.length) {
      if (!confirm('You have unanswered questions. Submit anyway?')) return
    }
    setLoading(true)
    try {
      const payload = {
        attempt_id: attemptId,
        answers: Object.entries(answers).map(([qId, ans]) => ({
          question_id: Number(qId),
          answer: ans,
        })),
      }
      const res = await quizzesApi.submit(quiz.id, payload)
      setResult(res.data)
      setPhase('result')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to submit quiz.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const urgent = timeLeft < 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={phase === 'start' ? onClose : undefined} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-ink dark:text-white">{quiz.title}</h3>
            {phase === 'quiz' && (
              <p className="text-xs text-gray-400">{questions.length} questions</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {phase === 'quiz' && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-bold
                ${urgent ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-surface-muted dark:bg-gray-800 text-ink dark:text-white'}`}>
                <Timer size={14} className={urgent ? 'animate-pulse' : ''} />
                {fmt(timeLeft)}
              </div>
            )}
            {phase !== 'quiz' && (
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {phase === 'start' && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mx-auto">
                <ClipboardList size={28} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink dark:text-white">{quiz.title}</h2>
                <p className="text-gray-400 mt-1 text-sm">{quiz.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Questions', value: quiz.question_count },
                  { label: 'Time Limit', value: `${quiz.time_limit} min` },
                  { label: 'Pass Score', value: `${quiz.pass_percentage || 70}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="card p-4 text-center">
                    <p className="text-lg font-bold text-ink dark:text-white">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">The timer starts as soon as you click "Start Quiz".</p>
              <Button size="lg" onClick={startQuiz} loading={loading} fullWidth>
                <Timer size={16} /> Start Quiz Now
              </Button>
            </div>
          )}

          {phase === 'quiz' && (
            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={q.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-ink dark:text-white">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pl-10">
                    {(q.options || []).map((opt, oi) => {
                      const letter = ['A', 'B', 'C', 'D'][oi]
                      const selected = answers[q.id] === letter
                      return (
                        <button key={oi} onClick={() => setAnswers(a => ({ ...a, [q.id]: letter }))}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all
                            ${selected
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium'
                              : 'border-gray-100 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 text-ink dark:text-white'}`}>
                          <span className="font-semibold mr-2">{letter}.</span>{opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {phase === 'result' && result && (
            <div className="text-center space-y-6 py-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl
                ${result.passed ? 'bg-brand-50 dark:bg-brand-900/30' : 'bg-red-50 dark:bg-red-900/20'}`}>
                {result.passed ? '🎉' : '📚'}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${result.passed ? 'text-brand-600' : 'text-red-500'}`}>
                  {result.passed ? 'Passed!' : 'Not Passed'}
                </h2>
                <p className="text-gray-400 mt-1 text-sm">{result.feedback}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 text-center">
                  <p className="text-3xl font-bold text-ink dark:text-white">{result.score}</p>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-3xl font-bold text-ink dark:text-white">{Math.round(result.percentage)}%</p>
                  <p className="text-xs text-gray-400">Percentage</p>
                </div>
              </div>
              <Button onClick={onClose} fullWidth>Done</Button>
            </div>
          )}
        </div>

        {/* Footer submit */}
        {phase === 'quiz' && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 flex-shrink-0">
            <p className="text-sm text-gray-400">
              {Object.keys(answers).length}/{questions.length} answered
            </p>
            <Button onClick={() => handleSubmit(false)} loading={loading}>
              Submit Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Assignment Submit Modal ──────────────────────────────────────────────────
function AssignmentSubmitModal({ assignment, onClose }) {
  const toast    = useToast()
  const [file, setFile]       = useState(null)
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file && !text.trim()) { toast.warning('Please attach a file or add notes.'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      if (file) fd.append('file', file)
      if (text) fd.append('submission_text', text)
      await assignmentsApi.submit(assignment.id, fd)
      toast.success('Assignment submitted!')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={`Submit: ${assignment.title}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-muted dark:text-gray-400 block mb-2">
            Attach File <span className="text-gray-400 font-normal">(PDF, DOC, ZIP)</span>
          </label>
          <div
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all"
            onClick={() => document.getElementById('assignment-file').click()}>
            <Upload size={24} className="text-gray-300 mx-auto mb-2" />
            {file ? (
              <p className="text-sm text-brand-600 font-medium">{file.name}</p>
            ) : (
              <p className="text-sm text-gray-400">Click to choose a file</p>
            )}
            <input id="assignment-file" type="file" className="hidden"
              accept=".pdf,.doc,.docx,.zip,.txt"
              onChange={e => setFile(e.target.files[0])} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-muted dark:text-gray-400">Notes (optional)</label>
          <textarea rows={3} placeholder="Add any notes for your instructor…"
            value={text} onChange={e => setText(e.target.value)}
            className="input-field resize-none" />
        </div>
        <div className="flex gap-3">
          <Button type="submit" loading={loading} className="flex-1">Submit Assignment</Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Rating Modal ─────────────────────────────────────────────────────────────
function RatingModal({ courseId, instructorName, onClose }) {
  const toast = useToast()
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { toast.warning('Please select a star rating.'); return }
    setLoading(true)
    try {
      await ratingsApi.submit(courseId, { rating, comment })
      toast.success('Thank you for your feedback!')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to submit rating.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Rate Your Experience" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-3">
            <Star size={24} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-400">How would you rate {instructorName || 'the instructor'}?</p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-1 transition-transform hover:scale-110">
              <Star
                size={32}
                className={`transition-colors ${n <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm font-medium text-amber-600">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-muted dark:text-gray-400">Comment (optional)</label>
          <textarea rows={3} placeholder="Share your thoughts about this course…"
            value={comment} onChange={e => setComment(e.target.value)}
            className="input-field resize-none" />
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading} fullWidth>Submit Rating</Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-shrink-0">Skip</Button>
        </div>
      </form>
    </Modal>
  )
}

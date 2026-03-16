import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Clock, CheckCircle2, Lock, Upload, Star,
  BookOpen, ClipboardList, FileText, Users, ChevronDown, ChevronRight,
  Timer, X,
} from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { enrollmentsApi, quizzesApi, videosApi, ratingsApi } from '../../api/index'
import { useAsync } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import ProgressBar from '../../components/common/ProgressBar'
import Modal from '../../components/common/Modal'
import CourseChat from '../../components/common/CourseChat'
import { PageLoader, SectionLoader } from '../../components/common/Spinner'
import { ErrorState } from '../../components/common/EmptyState'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'

function toEmbedUrl(url) {
  if (!url) return ''
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

export default function CourseDetailPage() {
  const { id }   = useParams()
  const toast    = useToast()
  const navigate = useNavigate()

  const [enrolling, setEnrolling]   = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)
  const [openSection, setOpenSection] = useState('lectures')
  const [quizModal, setQuizModal]     = useState(null)
  const [ratingModal, setRatingModal] = useState(false)

  const { data: course, loading, error, refetch: refetchCourse } = useAsync(() => coursesApi.getById(id), [id])
  const { data: videosData }     = useAsync(() => videosApi.getAll(id), [id])
  const { data: quizzesData }    = useAsync(() => quizzesApi.getAll(id), [id])
  const { data: myEnrollments, refetch: refetchEnrollments } = useAsync(() => enrollmentsApi.getMyCourses({ size: 200 }), [])

  const videos      = videosData?.content  || []
  const quizzes     = (quizzesData?.content || []).filter(q => q.status === 'ACTIVE')
  const myEnrollment= myEnrollments?.content?.find(e => e.course?.id === Number(id))
  const isEnrolled  = !!myEnrollment

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enrollmentsApi.enroll(Number(id))
      toast.success('Enrolled! Start learning now.')
      refetchEnrollments()
      refetchCourse()
    } catch (err) {
      const msg = err?.response?.data?.error || ''
      if (msg.toLowerCase().includes('already')) {
        refetchEnrollments()
        toast.info('You are already enrolled in this course.')
      } else {
        toast.error(msg || 'Could not enroll.')
      }
    } finally { setEnrolling(false) }
  }

  const handleUnenroll = async () => {
    if (!myEnrollment) return
    if (!confirm('Unenroll from this course?')) return
    setUnenrolling(true)
    try {
      await enrollmentsApi.unenroll(myEnrollment.id)
      toast.success('Unenrolled successfully.')
      navigate('/courses')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not unenroll.')
    } finally { setUnenrolling(false) }
  }

  if (loading) return <PageLoader />
  if (error)   return <ErrorState message={error} />
  if (!course) return null

  return (
    <div className="animate-fade-in">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-ink mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to My Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {activeVideo ? (
            <div className="card overflow-hidden">
              <div className="aspect-video bg-black">
                {toEmbedUrl(activeVideo.video_url) ? (
                  <iframe src={toEmbedUrl(activeVideo.video_url)} className="w-full h-full"
                    allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={activeVideo.title} />
                ) : (
                  <video src={activeVideo.video_url} controls className="w-full h-full" />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-ink">{activeVideo.title}</h2>
                {activeVideo.description && <p className="text-sm text-gray-400 mt-1">{activeVideo.description}</p>}
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="aspect-video bg-gray-100 overflow-hidden relative">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-500 flex items-center justify-center p-6">
                    <p className="text-white font-bold text-2xl text-center leading-tight">{course.title}</p>
                  </div>
                )}
              </div>
              <div className="p-6">
                {course.category?.name && (
                  <span className="text-xs text-brand-600 font-semibold mb-2 block">{course.category.name}</span>
                )}
                <h1 className="text-2xl font-bold text-ink mb-2">{course.title}</h1>
                <p className="text-gray-500 text-sm leading-relaxed">{course.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
                  {course.instructor?.name && <span className="flex items-center gap-1.5"><BookOpen size={14} />{course.instructor.name}</span>}
                  {course.students_count > 0 && <span className="flex items-center gap-1.5"><Users size={14} />{course.students_count} students</span>}
                  <span className="flex items-center gap-1.5"><Play size={14} />{videos.length} lectures</span>
                  <span className="flex items-center gap-1.5"><ClipboardList size={14} />{quizzes.length} quizzes</span>
                </div>
              </div>
            </div>
          )}

          {/* Course Content */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-ink">Course Content</h2>
              <p className="text-xs text-gray-400 mt-1">{videos.length + quizzes.length} items</p>
            </div>

            {/* Lectures */}
            <SectionAccordion id="lectures" label="Video Lectures" icon={Play}
              count={videos.length} open={openSection === 'lectures'}
              onToggle={() => setOpenSection(s => s === 'lectures' ? null : 'lectures')}>
              {videos.map((v, i) => (
                <button key={v.id} onClick={() => isEnrolled && setActiveVideo(v)}
                  disabled={!isEnrolled}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-surface-muted transition-colors border-t border-gray-50 ${!isEnrolled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${activeVideo?.id === v.id ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600'}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{v.title}</p>
                    {v.duration_minutes > 0 && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={10} />{v.duration_minutes} min</p>}
                  </div>
                  {!isEnrolled ? <Lock size={14} className="text-gray-300 flex-shrink-0" /> : <Play size={14} className="text-brand-500 flex-shrink-0" />}
                </button>
              ))}
              {!videos.length && <p className="px-5 py-4 text-sm text-gray-400">No lectures added yet.</p>}
            </SectionAccordion>

            {/* Quizzes */}
            <SectionAccordion id="quizzes" label="Quizzes" icon={ClipboardList}
              count={quizzes.length} open={openSection === 'quizzes'}
              onToggle={() => setOpenSection(s => s === 'quizzes' ? null : 'quizzes')}>
              {quizzes.map(q => (
                <div key={q.id} className="flex items-center gap-3 px-5 py-3 border-t border-gray-50">
                  <div className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={13} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{q.title}</p>
                    <p className="text-xs text-gray-400">{q.question_count} questions · {q.time_limit} min</p>
                  </div>
                  {isEnrolled
                    ? <Button size="xs" variant="outline" onClick={() => setQuizModal(q)}><Timer size={12} /> Start</Button>
                    : <Lock size={14} className="text-gray-300" />}
                </div>
              ))}
              {!quizzes.length && <p className="px-5 py-4 text-sm text-gray-400">No quizzes available yet.</p>}
            </SectionAccordion>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            {isEnrolled ? (
              <>
                <div className="flex items-center gap-2 text-brand-600">
                  <CheckCircle2 size={18} />
                  <span className="font-semibold text-sm">You're enrolled</span>
                </div>
                <ProgressBar value={myEnrollment?.progress || 0} showLabel size="sm" />
                <Button fullWidth onClick={() => setRatingModal(true)}>
                  <Star size={15} /> Rate this course
                </Button>
                <button onClick={handleUnenroll} disabled={unenrolling}
                  className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1">
                  {unenrolling ? 'Unenrolling…' : 'Unenroll from this course'}
                </button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-ink">Ready to start?</h3>
                <p className="text-sm text-gray-400">Enroll to access all lectures and quizzes.</p>
                <Button fullWidth size="lg" onClick={handleEnroll} loading={enrolling}>
                  Enroll Now — Free
                </Button>
              </>
            )}
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-ink">This course includes</h3>
            {[
              { icon: Play, label: `${videos.length} video lectures` },
              { icon: ClipboardList, label: `${quizzes.length} timed quizzes` },
              { icon: Star, label: 'Certificate on completion' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-gray-500">
                <Icon size={15} className="text-brand-500 flex-shrink-0" />{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {quizModal && <QuizAttemptModal quiz={quizModal} onClose={() => setQuizModal(null)} />}

      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal courseId={id} instructorName={course.instructor?.name} onClose={() => setRatingModal(false)} />
      )}

      {/* Chat — only for enrolled students */}
      {isEnrolled && (
        <CourseChat
          courseId={id}
          courseName={course.title}
          instructorName={course.instructor?.name}
        />
      )}
    </div>
  )
}

function SectionAccordion({ id, label, icon: Icon, count, open, onToggle, children }) {
  return (
    <div>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-muted transition-colors border-t border-gray-100">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-brand-500" />
          <span className="text-sm font-semibold text-ink">{label}</span>
          <Badge variant="default" size="sm">{count}</Badge>
        </div>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

function QuizAttemptModal({ quiz, onClose }) {
  const toast = useToast()
  const [phase, setPhase]       = useState('start')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers]   = useState({})
  const [attemptId, setAttemptId] = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [timeLeft, setTimeLeft] = useState((quiz.time_limit || 30) * 60)
  const timerRef = useRef(null)

  const startQuiz = async () => {
    setLoading(true)
    try {
      const res = await quizzesApi.start(quiz.id)
      setQuestions(res.data.questions || [])
      setAttemptId(res.data.attempt_id)
      setTimeLeft(res.data.time_limit || (quiz.time_limit || 30) * 60)
      setPhase('quiz')
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
          return t - 1
        })
      }, 1000)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to start quiz.')
    } finally { setLoading(false) }
  }

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current)
    if (!auto && Object.keys(answers).length < questions.length) {
      if (!confirm('You have unanswered questions. Submit anyway?')) return
    }
    setLoading(true)
    try {
      const res = await quizzesApi.submit(quiz.id, {
        attempt_id: attemptId,
        answers: Object.entries(answers).map(([qId, ans]) => ({ question_id: Number(qId), answer: ans })),
      })
      setResult(res.data)
      setPhase('result')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to submit quiz.')
    } finally { setLoading(false) }
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const fmt    = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const urgent = timeLeft < 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={phase === 'start' ? onClose : undefined} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-ink">{quiz.title}</h3>
            {phase === 'quiz' && <p className="text-xs text-gray-400">{questions.length} questions</p>}
          </div>
          <div className="flex items-center gap-3">
            {phase === 'quiz' && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-bold ${urgent ? 'bg-red-50 text-red-600' : 'bg-surface-muted text-ink'}`}>
                <Timer size={14} className={urgent ? 'animate-pulse' : ''} />
                {fmt(timeLeft)}
              </div>
            )}
            {phase !== 'quiz' && (
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {phase === 'start' && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto">
                <ClipboardList size={28} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">{quiz.title}</h2>
                <p className="text-gray-400 mt-1 text-sm">{quiz.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Questions', value: quiz.question_count },
                  { label: 'Time Limit', value: `${quiz.time_limit} min` },
                  { label: 'Pass Score', value: `${quiz.pass_percentage || 70}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="card p-4 text-center">
                    <p className="text-lg font-bold text-ink">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
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
                    <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm font-medium text-ink">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pl-10">
                    {(q.options || []).map((opt, oi) => {
                      const letter = ['A','B','C','D'][oi]
                      const selected = answers[q.id] === letter
                      return (
                        <button key={oi} onClick={() => setAnswers(a => ({ ...a, [q.id]: letter }))}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${selected ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-gray-100 hover:border-brand-300 text-ink'}`}>
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
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl ${result.passed ? 'bg-brand-50' : 'bg-red-50'}`}>
                {result.passed ? '🎉' : '📚'}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${result.passed ? 'text-brand-600' : 'text-red-500'}`}>
                  {result.passed ? 'Passed!' : 'Not Passed'}
                </h2>
                <p className="text-gray-400 mt-1 text-sm">{result.feedback}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 text-center"><p className="text-3xl font-bold text-ink">{result.score}</p><p className="text-xs text-gray-400">Score</p></div>
                <div className="card p-4 text-center"><p className="text-3xl font-bold text-ink">{Math.round(result.percentage)}%</p><p className="text-xs text-gray-400">Percentage</p></div>
              </div>
              <Button onClick={onClose} fullWidth>Done</Button>
            </div>
          )}
        </div>

        {phase === 'quiz' && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-shrink-0">
            <p className="text-sm text-gray-400">{Object.keys(answers).length}/{questions.length} answered</p>
            <Button onClick={() => handleSubmit(false)} loading={loading}>Submit Quiz</Button>
          </div>
        )}
      </div>
    </div>
  )
}

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
    } finally { setLoading(false) }
  }

  return (
    <Modal isOpen onClose={onClose} title="Rate Your Experience" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <Star size={24} className="text-amber-500" />
          </div>
          <p className="text-sm text-gray-400">How would you rate {instructorName || 'the instructor'}?</p>
        </div>
        <div className="flex justify-center gap-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button"
              onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-1 transition-transform hover:scale-110">
              <Star size={32} className={`transition-colors ${n <= (hover||rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="text-center text-sm font-medium text-amber-600">{['','Poor','Fair','Good','Great','Excellent!'][rating]}</p>}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-muted">Comment (optional)</label>
          <textarea rows={3} placeholder="Share your thoughts…"
            value={comment} onChange={e => setComment(e.target.value)}
            className="w-full px-4 py-3 bg-surface-muted border border-gray-200 rounded-xl text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none" />
        </div>
        <div className="flex gap-3">
          <Button type="submit" loading={loading} fullWidth>Submit Rating</Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-shrink-0">Skip</Button>
        </div>
      </form>
    </Modal>
  )
}

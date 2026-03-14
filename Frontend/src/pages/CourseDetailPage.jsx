import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, Users, Star, Clock, ChevronDown, ChevronRight,
  Play, Lock, CheckCircle2, User, Award,
} from 'lucide-react'
import { coursesApi } from '../api/courses'
import { enrollmentsApi } from '../api/index'
import { useAsync } from '../hooks/index'
import { useToast } from '../components/common/Toast'
import Button from '../components/common/Button'
import ProgressBar from '../components/common/ProgressBar'
import Badge from '../components/common/Badge'
import { PageLoader, SectionLoader } from '../components/common/Spinner'
import { ErrorState } from '../components/common/EmptyState'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'

const CourseDetailPage = () => {
  const { id } = useParams()
  const toast = useToast()
  const [enrolling, setEnrolling] = useState(false)
  const [openModule, setOpenModule] = useState(null)

  const { data: course, loading, error } = useAsync(() => coursesApi.getById(id), [id])
  const { data: content } = useAsync(() => coursesApi.getContent(id), [id])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await enrollmentsApi.enroll(Number(id))
      toast.success('Enrolled successfully! Start learning now.')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Could not enroll. Try again.'
      toast.error(msg)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={error} />
  if (!course) return null

  const modules = content?.modules || course.content || []

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-ink mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Course info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <div className="card overflow-hidden">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={course.image_url || PLACEHOLDER}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.src = PLACEHOLDER }}
              />
            </div>
            <div className="p-6">
              {course.category?.name && (
                <span className="text-xs text-brand-600 font-semibold mb-2 block">{course.category.name}</span>
              )}
              <h1 className="text-2xl font-bold text-ink mb-3">{course.title}</h1>
              <p className="text-gray-500 text-sm leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-gray-100 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <User size={15} />
                  {course.instructor?.name}
                </span>
                {course.students_count !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Users size={15} />
                    {course.students_count} students
                  </span>
                )}
                {course.rating && (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Star size={15} fill="currentColor" />
                    {course.rating} rating
                  </span>
                )}
                <Badge variant={course.status === 'ACTIVE' ? 'success' : 'draft'} dot>
                  {course.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Course Content</h2>

            {!modules.length ? (
              <p className="text-sm text-gray-400">No content available yet.</p>
            ) : (
              <div className="space-y-2">
                {modules.map((mod, idx) => (
                  <div key={mod.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-muted transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-600">
                        {idx + 1}
                      </div>
                      <span className="flex-1 text-sm font-semibold text-ink">{mod.title}</span>
                      <span className="text-xs text-gray-400 mr-2">{mod.lessons?.length || 0} lessons</span>
                      {openModule === mod.id
                        ? <ChevronDown size={16} className="text-gray-400" />
                        : <ChevronRight size={16} className="text-gray-400" />
                      }
                    </button>

                    {openModule === mod.id && mod.lessons?.length > 0 && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {mod.lessons.map((lesson, li) => (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Play size={12} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-ink truncate">{lesson.title}</p>
                              {lesson.description && (
                                <p className="text-xs text-gray-400 truncate">{lesson.description}</p>
                              )}
                            </div>
                            {lesson.duration && (
                              <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                                <Clock size={11} /> {lesson.duration}m
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Enroll card */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                <Award size={28} className="text-brand-500" />
              </div>
              <p className="text-sm text-gray-400">Enroll now to access all content</p>
            </div>

            <Button onClick={handleEnroll} loading={enrolling} fullWidth size="lg">
              <BookOpen size={18} />
              Enroll for Free
            </Button>

            <div className="mt-6 space-y-3">
              {[
                { icon: BookOpen, label: `${modules.length} modules` },
                { icon: Play, label: `${modules.reduce((s, m) => s + (m.lessons?.length || 0), 0)} lessons` },
                { icon: Award, label: 'Certificate of completion' },
                { icon: Clock, label: 'Lifetime access' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon size={15} className="text-brand-400 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Instructor</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                    {course.instructor.name?.[0] || 'I'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{course.instructor.name}</p>
                    <p className="text-xs text-gray-400">Instructor</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage

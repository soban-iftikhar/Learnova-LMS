import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, BookOpen, Users, Star, Plus, CheckCircle2 } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { enrollmentsApi } from '../../api/index'
import { useAsync, useDebounce } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

const CATEGORIES = ['All', 'Programming', 'Web Development', 'Design', 'Data Science', 'Business', 'Mathematics', 'Science', 'Language']

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
]

export default function BrowseCourses() {
  const navigate = useNavigate()
  const toast    = useToast()
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [enrolling, setEnrolling] = useState(null)
  const [enrolled, setEnrolled]   = useState(new Set())
  const debouncedSearch = useDebounce(search, 300)

  // Pre-load already-enrolled course IDs so button shows correct state immediately
  useEffect(() => {
    enrollmentsApi.getMyCourses({ size: 200 })
      .then(res => {
        const ids = new Set(
          (res.data?.content || []).map(e => e.course?.id).filter(Boolean)
        )
        setEnrolled(ids)
      })
      .catch(() => {})
  }, [])

  const { data, loading, error, refetch } = useAsync(
    () => coursesApi.getAll({ size: 50, search: debouncedSearch || undefined,
      category: category !== 'All' ? category : undefined }),
    [debouncedSearch, category]
  )

  const courses = data?.content || []

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId)
    try {
      await enrollmentsApi.enroll(courseId)
      setEnrolled(s => new Set([...s, courseId]))
      toast.success('Enrolled! Go to My Courses to start learning.')
    } catch (err) {
      const msg = err?.response?.data?.error || ''
      if (msg.toLowerCase().includes('already')) {
        setEnrolled(s => new Set([...s, courseId]))
        toast.info('You are already enrolled in this course.')
      } else {
        toast.error(msg || 'Could not enroll. Please try again.')
      }
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Browse Courses</h1>
          <p className="page-subtitle">Discover and enroll in courses taught by expert instructors.</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <Input placeholder="Search courses…" leftIcon={<Search size={16} />}
            value={search} onChange={e => setSearch(e.target.value)} className="py-2" />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${category === cat
                ? 'bg-brand-500 text-white'
                : 'bg-surface-muted text-gray-500 hover:text-ink'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-sm text-gray-400">{courses.length} course{courses.length !== 1 ? 's' : ''} found</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !courses.length ? (
        <EmptyState icon={BookOpen}
          title={search ? 'No matching courses' : 'No courses yet'}
          description={search ? `No results for "${search}".` : 'Courses will appear here once instructors publish them.'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, idx) => {
            const isEnrolled = enrolled.has(course.id)
            const img = course.image_url || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]
            return (
              <div key={course.id} className="card-hover group flex flex-col">
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img src={img} alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={e => { e.currentTarget.src = PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length] }} />
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  {course.category?.name && (
                    <span className="text-xs text-brand-600 font-medium mb-1.5">{course.category.name}</span>
                  )}
                  <h3 className="text-sm font-semibold text-ink leading-snug mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{course.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    {course.instructor?.name && (
                      <span className="truncate">{course.instructor.name}</span>
                    )}
                    {course.students_count > 0 && (
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Users size={11} />{course.students_count}
                      </span>
                    )}
                  </div>

                  {/* Content counts */}
                  <div className="flex gap-2 mb-4">
                    {course.videos_count > 0 && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {course.videos_count} videos
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button onClick={() => navigate(`/courses/${course.id}`)}
                      className="flex-1 py-2 text-xs font-medium text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors">
                      View Details
                    </button>
                    <Button
                      size="sm"
                      variant={isEnrolled ? 'secondary' : 'primary'}
                      loading={enrolling === course.id}
                      onClick={() => isEnrolled ? navigate(`/courses/${course.id}`) : handleEnroll(course.id)}
                      className="flex-shrink-0"
                    >
                      {isEnrolled ? <><CheckCircle2 size={13} /> Enrolled</> : <><Plus size={13} /> Enroll</>}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

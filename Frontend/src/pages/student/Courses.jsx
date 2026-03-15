import React, { useState } from 'react'
import { Search, Filter, BookOpen, Grid3X3, List } from 'lucide-react'
import { enrollmentsApi } from '../../api/index'
import { useAsync, useDebounce } from '../../hooks/index'
import CourseCard from '../../components/CourseCard'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'

const TABS = [
  { label: 'All', value: '' },
  { label: 'In Progress', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
]

const CoursesPage = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [view, setView] = useState('grid')
  const debouncedSearch = useDebounce(search, 300)

  const { data, loading, error, refetch } = useAsync(
    () => enrollmentsApi.getMyCourses({ status: status || undefined }),
    [status]
  )

  const enrollments = data?.content || []

  const filtered = debouncedSearch
    ? enrollments.filter(e =>
        e.course?.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        e.course?.instructor?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : enrollments

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header mb-0">
        <h1 className="page-title">My Courses</h1>
        <p className="page-subtitle">Track your learning progress across all enrolled courses.</p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-muted rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150
                ${status === tab.value
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-gray-400 hover:text-ink'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-64">
            <Input
              placeholder="Search courses…"
              leftIcon={<Search size={16} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="py-2"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-surface-muted rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-brand-500' : 'text-gray-400 hover:text-ink'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow-sm text-brand-500' : 'text-gray-400 hover:text-ink'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="flex items-center gap-2">
          <Badge variant="default">{filtered.length} course{filtered.length !== 1 ? 's' : ''}</Badge>
          {status === 'ACTIVE' && <Badge variant="info" dot>In Progress</Badge>}
          {status === 'COMPLETED' && <Badge variant="success" dot>Completed</Badge>}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className={view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
          : 'space-y-3'
        }>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`bg-white rounded-2xl animate-pulse ${view === 'grid' ? 'h-80' : 'h-24'}`} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !filtered.length ? (
        <EmptyState
          icon={BookOpen}
          title={search ? 'No matching courses' : 'No courses found'}
          description={
            search
              ? `No results for "${search}". Try a different search.`
              : status
              ? `You have no ${status.toLowerCase()} courses.`
              : 'You haven\'t enrolled in any courses yet.'
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((enrollment) => (
            <CourseCard
              key={enrollment.id}
              course={enrollment.course}
              progress={enrollment.progress}
              enrollmentId={enrollment.id}
            />
          ))}
        </div>
      ) : (
        // List view
        <div className="space-y-3">
          {filtered.map((enrollment) => (
            <div key={enrollment.id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200">
              <div className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ink text-sm truncate">{enrollment.course?.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{enrollment.course?.instructor}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 max-w-xs">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{enrollment.progress}%</span>
                </div>
              </div>
              <Badge variant={enrollment.status === 'COMPLETED' ? 'success' : 'info'} dot>
                {enrollment.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoursesPage

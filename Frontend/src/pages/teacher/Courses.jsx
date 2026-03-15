import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, BookOpen, Settings2, BarChart2 } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { useAsync, useDebounce } from '../../hooks/index'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

const STATUSES = ['all', 'ACTIVE', 'DRAFT']

export default function TeacherCourses() {
  const navigate        = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const debouncedSearch     = useDebounce(search, 300)

  const { data, loading, error, refetch } = useAsync(
    () => coursesApi.getAll({ size: 100 }),
    []
  )

  const allCourses = data?.content || []
  const courses    = allCourses
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => !debouncedSearch || c.title?.toLowerCase().includes(debouncedSearch.toLowerCase()))

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Create and manage all your published courses.</p>
        </div>
        <Button onClick={() => navigate('/teacher/courses/create')} leftIcon={<Plus size={16} />}>
          Create Course
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-surface-muted dark:bg-gray-800 rounded-xl p-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all
                ${filter === s ? 'bg-white dark:bg-gray-900 text-ink dark:text-white shadow-sm' : 'text-gray-400 hover:text-ink dark:hover:text-white'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex-1 sm:max-w-xs">
          <Input placeholder="Search courses…" leftIcon={<Search size={16} />}
            value={search} onChange={e => setSearch(e.target.value)} className="py-2" />
        </div>
      </div>

      {loading ? <SectionLoader rows={4} />
      : error ? <ErrorState message={error} onRetry={refetch} />
      : !courses.length ? (
        <EmptyState icon={BookOpen}
          title={search ? 'No matching courses' : 'No courses yet'}
          description={search ? 'Try a different search.' : 'Create your first course to get started.'}
          action={!search ? () => navigate('/teacher/courses/create') : undefined}
          actionLabel="Create Course" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted dark:bg-gray-800/50">
              <tr>
                <th className="text-left py-3 px-5 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Students</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-surface-muted dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-5 font-medium text-ink dark:text-white">{course.title}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{course.category?.name || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{course.students_count ?? 0}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={course.status === 'ACTIVE' ? 'success' : 'draft'} dot size="sm">
                      {course.status || 'DRAFT'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => navigate(`/teacher/courses/${course.id}/build`)}
                        className="flex items-center gap-1 text-brand-500 hover:text-brand-700 text-xs font-semibold">
                        <Settings2 size={13} />Build
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <button onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                        className="text-brand-500 hover:text-brand-700 text-xs font-semibold">Edit</button>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <button onClick={() => navigate(`/teacher/courses/${course.id}/analytics`)}
                        className="flex items-center gap-1 text-brand-500 hover:text-brand-700 text-xs font-semibold">
                        <BarChart2 size={13} />Stats
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

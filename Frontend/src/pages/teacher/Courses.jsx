import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, BookOpen } from 'lucide-react'
import { coursesApi } from '../../api'
import { useAsync, useDebounce } from '../../hooks/index'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['all', 'ACTIVE', 'DRAFT', 'ARCHIVED']

export default function TeacherCourses() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  // Fetch all courses — backend filters by authenticated instructor
  const { data, loading, error, refetch } = useAsync(
    () => coursesApi.getAll({ size: 100 }),
    []
  )

  const allCourses = data?.content || []

  // Client-side filter by status + search
  const courses = allCourses
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => !debouncedSearch ||
      c.title?.toLowerCase().includes(debouncedSearch.toLowerCase()))

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Manage and update all your published courses.</p>
        </div>
        <Button onClick={() => navigate('/teacher/courses/create')} leftIcon={<Plus size={16} />}>
          Create Course
        </Button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-surface-muted rounded-xl p-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all
                ${filter === s ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-ink'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex-1 sm:max-w-xs">
          <Input placeholder="Search courses…" leftIcon={<Search size={16} />}
            value={search} onChange={e => setSearch(e.target.value)} className="py-2" />
        </div>
      </div>

      {/* Content */}
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
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left py-3 px-5 font-semibold text-gray-600">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Students</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                  <td className="py-3 px-5 font-medium text-ink">{course.title}</td>
                  <td className="py-3 px-4 text-gray-500">{course.category?.name || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{course.students_count ?? 0}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={course.status === 'ACTIVE' ? 'success' : 'draft'} dot size="sm">
                      {course.status || 'DRAFT'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                        className="text-brand-500 hover:text-brand-700 text-xs font-semibold">Edit</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => navigate(`/teacher/courses/${course.id}/analytics`)}
                        className="text-brand-500 hover:text-brand-700 text-xs font-semibold">Analytics</button>
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

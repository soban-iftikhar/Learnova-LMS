import React, { useState } from 'react'
import { Search, BookOpen } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { useAsync, useDebounce } from '../../hooks/index'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

export default function AdminCourses() {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)

  const { data, loading, error, refetch } = useAsync(
    () => coursesApi.getAll({ size: 100 }),
    []
  )

  const courses = (data?.content || []).filter(c =>
    !debounced ||
    c.title?.toLowerCase().includes(debounced.toLowerCase()) ||
    c.instructor?.name?.toLowerCase().includes(debounced.toLowerCase())
  )

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">Manage Courses</h1>
        <p className="page-subtitle">View and oversee all courses on the platform.</p>
      </div>

      <div className="max-w-sm">
        <Input placeholder="Search by title or instructor…" leftIcon={<Search size={16} />}
          value={search} onChange={e => setSearch(e.target.value)} className="py-2" />
      </div>

      {loading ? <SectionLoader rows={5} />
      : error ? <ErrorState message={error} onRetry={refetch} />
      : !courses.length ? (
        <EmptyState icon={BookOpen}
          title={search ? 'No matching courses' : 'No courses yet'}
          description={search ? 'Try a different search.' : 'Courses will appear here once instructors create them.'} />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 bg-surface-muted border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-600">
              {courses.length} course{courses.length !== 1 ? 's' : ''}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-muted border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-5 font-semibold text-gray-600">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Instructor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Students</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                  <td className="py-3 px-5 font-medium text-ink">{course.title}</td>
                  <td className="py-3 px-4 text-gray-500">{course.instructor?.name || '—'}</td>
                  <td className="py-3 px-4 text-gray-500">{course.category?.name || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{course.students_count ?? 0}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={course.status === 'ACTIVE' ? 'success' : 'draft'} dot size="sm">
                      {course.status || 'DRAFT'}
                    </Badge>
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

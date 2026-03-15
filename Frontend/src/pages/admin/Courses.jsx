import React, { useState } from 'react'
import { Search, BookOpen, Trash2, Eye, EyeOff } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import { useAsync, useDebounce } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

export default function AdminCourses() {
  const toast = useToast()
  const [search, setSearch]       = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [acting, setActing]       = useState(false)
  const debounced = useDebounce(search, 300)

  const { data, loading, error, refetch } = useAsync(
    () => coursesApi.getAll({ size: 200 }), []
  )

  const courses = (data?.content || []).filter(c =>
    !debounced ||
    c.title?.toLowerCase().includes(debounced.toLowerCase()) ||
    c.instructor?.name?.toLowerCase().includes(debounced.toLowerCase())
  )

  const handleToggleStatus = async (course) => {
    const newStatus = course.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'
    try {
      await coursesApi.update(course.id, { title: course.title, description: course.description, category: course.category?.name || '', status: newStatus })
      toast.success(`Course ${newStatus === 'ACTIVE' ? 'published' : 'unpublished'}.`)
      refetch()
    } catch { toast.error('Failed to update course status.') }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setActing(true)
    try {
      await coursesApi.delete(deleteModal.id)
      toast.success('Course deleted.')
      setDeleteModal(null)
      refetch()
    } catch { toast.error('Failed to delete course.') } finally { setActing(false) }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">Manage Courses</h1>
        <p className="page-subtitle">View, publish/unpublish and delete all platform courses.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="max-w-sm flex-1">
          <Input placeholder="Search by title or instructor…" leftIcon={<Search size={16} />}
            value={search} onChange={e => setSearch(e.target.value)} className="py-2" />
        </div>
        {!loading && <span className="text-sm text-gray-400">{courses.length} courses</span>}
      </div>

      {loading ? <SectionLoader rows={5} />
      : error ? <ErrorState message={error} onRetry={refetch} />
      : !courses.length ? (
        <EmptyState icon={BookOpen}
          title={search ? 'No matching courses' : 'No courses yet'}
          description={search ? 'Try a different search.' : 'Courses will appear here once instructors create them.'} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left py-3 px-5 font-semibold text-gray-600">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Instructor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Students</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                  <td className="py-3 px-5 font-medium text-ink max-w-[200px] truncate">{course.title}</td>
                  <td className="py-3 px-4 text-gray-500">{course.instructor?.name || '—'}</td>
                  <td className="py-3 px-4 text-gray-500">{course.category?.name || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{course.students_count ?? 0}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={course.status === 'ACTIVE' ? 'success' : 'draft'} dot size="sm">
                      {course.status || 'DRAFT'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleToggleStatus(course)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
                        title={course.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}>
                        {course.status === 'ACTIVE' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => setDeleteModal(course)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Course" size="sm">
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Permanently delete <strong className="text-ink">"{deleteModal.title}"</strong>?
              All content and enrollments will be removed.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDelete} loading={acting} className="flex-1">Delete</Button>
              <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

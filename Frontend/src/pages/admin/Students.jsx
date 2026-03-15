import React, { useState } from 'react'
import { Search, GraduationCap, Trash2, Ban, CheckCircle2, RefreshCw } from 'lucide-react'
import { adminApi } from '../../api/index'
import { useAsync, useDebounce } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

export default function AdminStudents() {
  const toast = useToast()
  const [search, setSearch]       = useState('')
  const [confirmModal, setConfirmModal] = useState(null) // { user, action }
  const [acting, setActing]       = useState(false)
  const debounced = useDebounce(search, 300)

  const { data, loading, error, refetch } = useAsync(
    () => adminApi.getUsers({ role: 'STUDENT', size: 200 }), []
  )

  const students = (data?.content || []).filter(s =>
    !debounced ||
    s.name?.toLowerCase().includes(debounced.toLowerCase()) ||
    s.email?.toLowerCase().includes(debounced.toLowerCase())
  )

  const handleAction = async () => {
    if (!confirmModal) return
    setActing(true)
    const { user, action } = confirmModal
    try {
      if (action === 'delete') {
        await adminApi.deleteUser(user.id)
        toast.success(`${user.name} deleted.`)
      } else if (action === 'suspend') {
        await adminApi.updateUserStatus(user.id, 'SUSPENDED')
        toast.success(`${user.name} suspended.`)
      } else if (action === 'activate') {
        await adminApi.updateUserStatus(user.id, 'ACTIVE')
        toast.success(`${user.name} reactivated.`)
      }
      setConfirmModal(null)
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Action failed.')
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">Manage Students</h1>
        <p className="page-subtitle">View, manage and moderate all student accounts.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="max-w-sm flex-1">
          <Input placeholder="Search by name or email…" leftIcon={<Search size={16} />}
            value={search} onChange={e => setSearch(e.target.value)} className="py-2" />
        </div>
        {!loading && <span className="text-sm text-gray-400">{students.length} students</span>}
      </div>

      {loading ? <SectionLoader rows={5} />
      : error ? <ErrorState message={error} onRetry={refetch} />
      : !students.length ? (
        <EmptyState icon={GraduationCap}
          title={search ? 'No matching students' : 'No students yet'}
          description={search ? 'Try a different search.' : 'Students will appear here after they register.'} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left py-3 px-5 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const suspended = student.status === 'SUSPENDED'
                return (
                  <tr key={student.id} className={`border-t border-gray-50 hover:bg-surface-muted transition ${suspended ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-5 font-medium text-ink">{student.name}</td>
                    <td className="py-3 px-4 text-gray-500">{student.email}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={suspended ? 'warning' : 'success'} dot size="sm">
                        {student.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {suspended ? (
                          <button onClick={() => setConfirmModal({ user: student, action: 'activate' })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors" title="Reactivate">
                            <RefreshCw size={14} />
                          </button>
                        ) : (
                          <button onClick={() => setConfirmModal({ user: student, action: 'suspend' })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Suspend">
                            <Ban size={14} />
                          </button>
                        )}
                        <button onClick={() => setConfirmModal({ user: student, action: 'delete' })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm modal */}
      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal?.action === 'delete' ? 'Delete Student' : confirmModal?.action === 'suspend' ? 'Suspend Student' : 'Reactivate Student'}
        size="sm">
        {confirmModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {confirmModal.action === 'delete'
                ? `Are you sure you want to permanently delete ${confirmModal.user.name}? This cannot be undone.`
                : confirmModal.action === 'suspend'
                ? `Suspend ${confirmModal.user.name}? They will not be able to log in.`
                : `Reactivate ${confirmModal.user.name}? They will regain access.`}
            </p>
            <div className="flex gap-3">
              <Button
                variant={confirmModal.action === 'delete' ? 'danger' : confirmModal.action === 'suspend' ? 'outline' : 'primary'}
                onClick={handleAction} loading={acting} className="flex-1">
                {confirmModal.action === 'delete' ? 'Delete' : confirmModal.action === 'suspend' ? 'Suspend' : 'Reactivate'}
              </Button>
              <Button variant="outline" onClick={() => setConfirmModal(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

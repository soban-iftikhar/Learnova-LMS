import React, { useState } from 'react'
import { Search, Users, Trash2, Ban, CheckCircle2, RefreshCw, ShieldCheck, ShieldX } from 'lucide-react'
import { adminApi } from '../../api/index'
import { useAsync, useDebounce } from '../../hooks/index'
import { useToast } from '../../components/common/Toast'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

export default function AdminInstructors() {
  const toast = useToast()
  const [search, setSearch]         = useState('')
  const [confirmModal, setConfirmModal] = useState(null)
  const [acting, setActing]         = useState(false)
  const debounced = useDebounce(search, 300)

  const { data, loading, error, refetch } = useAsync(
    () => adminApi.getUsers({ role: 'INSTRUCTOR', size: 200 }), []
  )

  const instructors = (data?.content || []).filter(i =>
    !debounced ||
    i.name?.toLowerCase().includes(debounced.toLowerCase()) ||
    i.email?.toLowerCase().includes(debounced.toLowerCase())
  )

  const handleAction = async () => {
    if (!confirmModal) return
    setActing(true)
    const { user, action } = confirmModal
    try {
      if (action === 'delete') {
        await adminApi.deleteUser(user.id)
        toast.success(`${user.name} removed.`)
      } else if (action === 'suspend') {
        await adminApi.updateUserStatus(user.id, 'SUSPENDED')
        toast.success(`${user.name} suspended.`)
      } else if (action === 'activate') {
        await adminApi.updateUserStatus(user.id, 'ACTIVE')
        toast.success(`${user.name} approved and activated.`)
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
        <h1 className="page-title">Manage Instructors</h1>
        <p className="page-subtitle">Approve, suspend and manage all instructor accounts.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="max-w-sm flex-1">
          <Input placeholder="Search by name or email…" leftIcon={<Search size={16} />}
            value={search} onChange={e => setSearch(e.target.value)} className="py-2" />
        </div>
        {!loading && <span className="text-sm text-gray-400">{instructors.length} instructors</span>}
      </div>

      {loading ? <SectionLoader rows={4} />
      : error ? <ErrorState message={error} onRetry={refetch} />
      : !instructors.length ? (
        <EmptyState icon={Users}
          title={search ? 'No matching instructors' : 'No instructors yet'}
          description={search ? 'Try a different search.' : 'Instructors will appear here after they register.'} />
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
              {instructors.map(inst => {
                const suspended = inst.status === 'SUSPENDED'
                const pending   = inst.status === 'PENDING'
                return (
                  <tr key={inst.id} className={`border-t border-gray-50 hover:bg-surface-muted transition ${suspended ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-5 font-medium text-ink">{inst.name}</td>
                    <td className="py-3 px-4 text-gray-500">{inst.email}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={pending ? 'warning' : suspended ? 'danger' : 'info'}
                        dot size="sm">
                        {pending ? 'Pending' : inst.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Approve (if pending) */}
                        {(pending || suspended) && (
                          <button onClick={() => setConfirmModal({ user: inst, action: 'activate' })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors"
                            title="Approve / Activate">
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        {/* Suspend */}
                        {!suspended && !pending && (
                          <button onClick={() => setConfirmModal({ user: inst, action: 'suspend' })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                            title="Suspend">
                            <Ban size={14} />
                          </button>
                        )}
                        {/* Reject / Delete */}
                        <button onClick={() => setConfirmModal({ user: inst, action: 'delete' })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title={pending ? 'Reject' : 'Delete'}>
                          {pending ? <ShieldX size={14} /> : <Trash2 size={14} />}
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

      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal?.action === 'delete' ? 'Remove Instructor'
              : confirmModal?.action === 'suspend' ? 'Suspend Instructor' : 'Approve Instructor'}
        size="sm">
        {confirmModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {confirmModal.action === 'delete'
                ? `Remove ${confirmModal.user.name} from the platform?`
                : confirmModal.action === 'suspend'
                ? `Suspend ${confirmModal.user.name}? They won't be able to manage courses.`
                : `Approve ${confirmModal.user.name} as an active instructor?`}
            </p>
            <div className="flex gap-3">
              <Button
                variant={confirmModal.action === 'delete' ? 'danger' : confirmModal.action === 'activate' ? 'primary' : 'outline'}
                onClick={handleAction} loading={acting} className="flex-1">
                {confirmModal.action === 'delete' ? 'Remove' : confirmModal.action === 'suspend' ? 'Suspend' : 'Approve'}
              </Button>
              <Button variant="outline" onClick={() => setConfirmModal(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

import React, { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { adminApi } from '../../api/index'
import { useAsync, useDebounce } from '../../hooks/index'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState, ErrorState } from '../../components/common/EmptyState'

export default function AdminInstructors() {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)

  const { data, loading, error, refetch } = useAsync(
    () => adminApi.getUsers({ role: 'INSTRUCTOR', size: 100 }),
    []
  )

  const instructors = (data?.content || []).filter(i =>
    !debounced ||
    i.name?.toLowerCase().includes(debounced.toLowerCase()) ||
    i.email?.toLowerCase().includes(debounced.toLowerCase())
  )

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">Manage Instructors</h1>
        <p className="page-subtitle">View and manage all instructor accounts on the platform.</p>
      </div>

      <div className="max-w-sm">
        <Input placeholder="Search by name or email…" leftIcon={<Search size={16} />}
          value={search} onChange={e => setSearch(e.target.value)} className="py-2" />
      </div>

      {loading ? <SectionLoader rows={4} />
      : error ? <ErrorState message={error} onRetry={refetch} />
      : !instructors.length ? (
        <EmptyState icon={Users}
          title={search ? 'No matching instructors' : 'No instructors yet'}
          description={search ? 'Try a different search.' : 'Instructors will appear here after they register.'} />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 bg-surface-muted border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-600">
              {instructors.length} instructor{instructors.length !== 1 ? 's' : ''}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-muted border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-5 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Role</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map(inst => (
                <tr key={inst.id} className="border-t border-gray-50 hover:bg-surface-muted transition">
                  <td className="py-3 px-5 font-medium text-ink">{inst.name}</td>
                  <td className="py-3 px-4 text-gray-500">{inst.email}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="info" size="sm">{inst.role}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={inst.status === 'ACTIVE' ? 'success' : 'warning'} dot size="sm">
                      {inst.status || 'ACTIVE'}
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

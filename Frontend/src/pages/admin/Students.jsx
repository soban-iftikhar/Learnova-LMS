import React, { useState, useEffect } from 'react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import { EmptyState } from '../../components/common/EmptyState'

export default function AdminStudents() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      // In real app: const res = await adminApi.getStudents()
      setStudents([
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'ACTIVE', enrolled: 5 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'ACTIVE', enrolled: 3 },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'ACTIVE', enrolled: 7 },
      ])
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-2">Manage Students</h1>
      <p className="text-gray-500 mb-8">View and manage all student accounts.</p>

      <div className="mb-6">
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState title={search ? 'No results' : 'No students'} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Enrolled</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                  <td className="py-3 px-4 text-gray-600">{student.email}</td>
                  <td className="py-3 px-4 text-center text-gray-900">{student.enrolled}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-brand-500 hover:text-brand-700 text-sm font-medium">
                      Edit
                    </button>
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

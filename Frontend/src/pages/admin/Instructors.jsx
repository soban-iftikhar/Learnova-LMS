import React, { useState, useEffect } from 'react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import { EmptyState } from '../../components/common/EmptyState'

export default function AdminInstructors() {
  const [loading, setLoading] = useState(true)
  const [instructors, setInstructors] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      // In real app: const res = await adminApi.getInstructors()
      setInstructors([
        { id: 1, name: 'Jane Smith', email: 'jane@example.com', status: 'ACTIVE', courses: 5, rating: 4.5 },
        { id: 2, name: 'Mike Brown', email: 'mike@example.com', status: 'ACTIVE', courses: 3, rating: 4.2 },
        { id: 3, name: 'Sarah Lee', email: 'sarah@example.com', status: 'ACTIVE', courses: 7, rating: 4.8 },
      ])
    } catch (error) {
      console.error('Failed to fetch instructors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInstructors = instructors.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-2">Manage Instructors</h1>
      <p className="text-gray-500 mb-8">View and manage all instructor accounts.</p>

      <div className="mb-6">
        <Input
          placeholder="Search instructors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredInstructors.length === 0 ? (
        <EmptyState title={search ? 'No results' : 'No instructors'} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Courses</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Rating</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.map(instructor => (
                <tr key={instructor.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">{instructor.name}</td>
                  <td className="py-3 px-4 text-gray-600">{instructor.email}</td>
                  <td className="py-3 px-4 text-center text-gray-900">{instructor.courses}</td>
                  <td className="py-3 px-4 text-center text-gray-900 font-medium">{instructor.rating}★</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                      {instructor.status}
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

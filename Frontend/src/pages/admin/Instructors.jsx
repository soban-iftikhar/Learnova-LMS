import { useState, useEffect } from 'react'
import { Trash2, Eye } from 'lucide-react'

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setInstructors([
        {
          id: 1,
          name: 'Dr. John Smith',
          email: 'john@example.com',
          courses: 5,
          students: 234,
          status: 'Active',
        },
        {
          id: 2,
          name: 'Prof. Jane Doe',
          email: 'jane@example.com',
          courses: 3,
          students: 156,
          status: 'Active',
        },
        {
          id: 3,
          name: 'Dr. Bob Wilson',
          email: 'bob@example.com',
          courses: 2,
          students: 89,
          status: 'Inactive',
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleDeactivate = (id) => {
    setInstructors(
      instructors.map((instr) =>
        instr.id === id ? { ...instr, status: instr.status === 'Active' ? 'Inactive' : 'Active' } : instr
      )
    )
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure?')) {
      setInstructors(instructors.filter((instr) => instr.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Instructors</h1>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-semibold text-gray-900">Name</th>
              <th className="text-left p-4 font-semibold text-gray-900">Email</th>
              <th className="text-left p-4 font-semibold text-gray-900">Courses</th>
              <th className="text-left p-4 font-semibold text-gray-900">Students</th>
              <th className="text-left p-4 font-semibold text-gray-900">Status</th>
              <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">{instructor.name}</td>
                <td className="p-4 text-gray-600">{instructor.email}</td>
                <td className="p-4 text-gray-900">{instructor.courses}</td>
                <td className="p-4 text-gray-900">{instructor.students}</td>
                <td className="p-4">
                  <span className={instructor.status === 'Active' ? 'badge-success' : 'badge-warning'}>
                    {instructor.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <button title="View" className="text-blue-600 hover:text-blue-700">
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDeactivate(instructor.id)}
                      title="Deactivate"
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      {instructor.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(instructor.id)}
                      title="Delete"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

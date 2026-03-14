import { useState, useEffect } from 'react'
import { Trash2, Eye } from 'lucide-react'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setStudents([
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          enrollments: 3,
          progress: 67,
          status: 'Active',
        },
        {
          id: 2,
          name: 'Bob Smith',
          email: 'bob@example.com',
          enrollments: 2,
          progress: 45,
          status: 'Active',
        },
        {
          id: 3,
          name: 'Carol White',
          email: 'carol@example.com',
          enrollments: 5,
          progress: 89,
          status: 'Active',
        },
        {
          id: 4,
          name: 'David Brown',
          email: 'david@example.com',
          enrollments: 1,
          progress: 20,
          status: 'Inactive',
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleDelete = (id) => {
    if (confirm('Are you sure?')) {
      setStudents(students.filter((student) => student.id !== id))
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
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Students</h1>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-semibold text-gray-900">Name</th>
              <th className="text-left p-4 font-semibold text-gray-900">Email</th>
              <th className="text-left p-4 font-semibold text-gray-900">Enrollments</th>
              <th className="text-left p-4 font-semibold text-gray-900">Avg Progress</th>
              <th className="text-left p-4 font-semibold text-gray-900">Status</th>
              <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">{student.name}</td>
                <td className="p-4 text-gray-600">{student.email}</td>
                <td className="p-4 text-gray-900">{student.enrollments}</td>
                <td className="p-4">{student.progress}%</td>
                <td className="p-4">
                  <span className={student.status === 'Active' ? 'badge-success' : 'badge-warning'}>
                    {student.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <button title="View" className="text-blue-600 hover:text-blue-700">
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
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

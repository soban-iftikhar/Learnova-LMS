import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye } from 'lucide-react'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          title: 'React Fundamentals',
          instructor: 'John Smith',
          students: 234,
          status: 'Approved',
        },
        {
          id: 2,
          title: 'Python Basics',
          instructor: 'Jane Doe',
          students: 156,
          status: 'Pending',
        },
        {
          id: 3,
          title: 'Web Design',
          instructor: 'Bob Wilson',
          students: 89,
          status: 'Approved',
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleApprove = (id) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, status: 'Approved' } : course
      )
    )
  }

  const handleReject = (id) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, status: 'Rejected' } : course
      )
    )
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
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Review Courses</h1>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-semibold text-gray-900">Title</th>
              <th className="text-left p-4 font-semibold text-gray-900">Instructor</th>
              <th className="text-left p-4 font-semibold text-gray-900">Students</th>
              <th className="text-left p-4 font-semibold text-gray-900">Status</th>
              <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">{course.title}</td>
                <td className="p-4 text-gray-600">{course.instructor}</td>
                <td className="p-4 text-gray-900">{course.students}</td>
                <td className="p-4">
                  <span
                    className={
                      course.status === 'Approved'
                        ? 'badge-success'
                        : course.status === 'Pending'
                          ? 'badge-warning'
                          : 'badge-danger'
                    }
                  >
                    {course.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <button title="View" className="text-blue-600 hover:text-blue-700">
                      <Eye size={20} />
                    </button>
                    {course.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(course.id)}
                          title="Approve"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleReject(course.id)}
                          title="Reject"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle size={20} />
                        </button>
                      </>
                    )}
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

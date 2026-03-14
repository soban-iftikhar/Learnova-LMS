import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, BarChart3 } from 'lucide-react'

export default function TeacherCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          title: 'React Fundamentals',
          description: 'Learn React from scratch',
          students: 234,
          rating: 4.8,
          status: 'Published',
        },
        {
          id: 2,
          title: 'Advanced JavaScript',
          description: 'Master JavaScript concepts',
          students: 156,
          rating: 4.6,
          status: 'Published',
        },
        {
          id: 3,
          title: 'Node.js Basics',
          description: 'Build backend with Node.js',
          students: 189,
          rating: 4.7,
          status: 'Draft',
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter((c) => c.id !== id))
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Create and manage your courses</p>
        </div>
        <Link to="/teacher/courses/create" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Create Course</span>
        </Link>
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-semibold text-gray-900">Course</th>
              <th className="text-left p-4 font-semibold text-gray-900">Students</th>
              <th className="text-left p-4 font-semibold text-gray-900">Rating</th>
              <th className="text-left p-4 font-semibold text-gray-900">Status</th>
              <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                </td>
                <td className="p-4 text-gray-900">{course.students}</td>
                <td className="p-4 text-gray-900">{course.rating}★</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.status === 'Published' ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Link to={`/teacher/courses/${course.id}/analytics`} title="Analytics">
                      <BarChart3 size={20} className="text-blue-600 hover:text-blue-700 cursor-pointer" />
                    </Link>
                    <Link to={`/teacher/courses/${course.id}/edit`} title="Edit">
                      <Edit2 size={20} className="text-blue-600 hover:text-blue-700 cursor-pointer" />
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id)}
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

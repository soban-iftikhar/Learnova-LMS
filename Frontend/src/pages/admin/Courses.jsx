import React, { useState, useEffect } from 'react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import { EmptyState } from '../../components/common/EmptyState'

export default function AdminCourses() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      // In real app: const res = await adminApi.getCourses()
      setCourses([
        { id: 1, title: 'Java Basics', instructor: 'Jane Smith', students: 45, status: 'ACTIVE' },
        { id: 2, title: 'Web Development', instructor: 'Mike Brown', students: 38, status: 'ACTIVE' },
        { id: 3, title: 'React Advanced', instructor: 'Sarah Lee', students: 25, status: 'ACTIVE' },
      ])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-2">Manage Courses</h1>
      <p className="text-gray-500 mb-8">View and manage all courses on the platform.</p>

      <div className="mb-6">
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState title={search ? 'No results' : 'No courses'} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Instructor</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Students</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">{course.title}</td>
                  <td className="py-3 px-4 text-gray-600">{course.instructor}</td>
                  <td className="py-3 px-4 text-center text-gray-900">{course.students}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                      {course.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-brand-500 hover:text-brand-700 text-sm font-medium">
                      View
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

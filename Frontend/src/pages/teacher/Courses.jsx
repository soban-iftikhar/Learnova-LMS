import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import CourseCard from '../../components/CourseCard'
import { EmptyState } from '../../components/common/EmptyState'
import Spinner from '../../components/common/Spinner'

export default function TeacherCourses() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      // In real app: const res = await coursesApi.getInstructorCourses()
      setCourses([
        { id: 1, title: 'Java Basics', students: 45, rating: 4.5, status: 'ACTIVE' },
        { id: 2, title: 'Web Development', students: 38, rating: 4.3, status: 'ACTIVE' },
        { id: 3, title: 'React Advanced', students: 25, rating: 4.8, status: 'ACTIVE' },
      ])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = filter === 'all' ? courses : courses.filter(c => c.status === filter)

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">My Courses</h1>
          <p className="text-gray-500">Manage and view all your courses.</p>
        </div>
        <Button onClick={() => navigate('/teacher/courses/create')} variant="primary">
          + Create Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'ACTIVE', 'DRAFT', 'ARCHIVED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses"
          description="Create your first course to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => navigate(`/teacher/courses/${course.id}/edit`)}
              onAnalytics={() => navigate(`/teacher/courses/${course.id}/analytics`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

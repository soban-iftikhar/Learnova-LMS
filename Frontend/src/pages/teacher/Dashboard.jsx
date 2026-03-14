import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { coursesApi } from '../../api'
import StatCard from '../../components/StatCard'
import CourseCard from '../../components/CourseCard'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [recentSubmissions, setRecentSubmissions] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // In real app, fetch from /api/dashboard/instructor
      // For now, we'll use mock data
      setStats({
        total_courses: 5,
        total_students: 150,
        total_enrollments: 180,
        average_rating: 4.6,
        pending_assignments: 23
      })
      
      setCourses([
        { id: 1, title: 'Java Basics', students: 45, rating: 4.5, status: 'ACTIVE' },
        { id: 2, title: 'Web Development', students: 38, rating: 4.3, status: 'ACTIVE' },
        { id: 3, title: 'React Advanced', students: 25, rating: 4.8, status: 'ACTIVE' },
      ])

      setRecentSubmissions([
        { id: 1, student: 'John Doe', assignment: 'Assignment 1', course: 'Java Basics', date: '2026-03-15' },
        { id: 2, student: 'Jane Smith', assignment: 'Quiz 2', course: 'Web Development', date: '2026-03-14' },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">Instructor Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's an overview of your courses.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Courses" value={stats?.total_courses || 0} />
        <StatCard label="Students" value={stats?.total_students || 0} />
        <StatCard label="Enrollments" value={stats?.total_enrollments || 0} />
        <StatCard label="Avg Rating" value={`${stats?.average_rating || 0}★`} />
        <StatCard label="Pending" value={stats?.pending_assignments || 0} />
      </div>

      {/* Courses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-ink">Your Courses</h2>
          <Button onClick={() => navigate('/teacher/courses/create')} variant="primary">
            + Create Course
          </Button>
        </div>
        
        {courses.length === 0 ? (
          <EmptyState title="No courses yet" description="Create your first course to get started." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
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

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-ink mb-4">Recent Submissions</h2>
        {recentSubmissions.length === 0 ? (
          <EmptyState title="No submissions" description="Student submissions will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Assignment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map(sub => (
                  <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-900">{sub.student}</td>
                    <td className="py-3 px-4 text-gray-600">{sub.assignment}</td>
                    <td className="py-3 px-4 text-gray-600">{sub.course}</td>
                    <td className="py-3 px-4 text-gray-500">{sub.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

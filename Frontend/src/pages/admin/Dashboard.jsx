import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import StatCard from '../../components/StatCard'
import { Users, BookOpen, TrendingUp, Award } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalStudents: 1234,
        totalInstructors: 45,
        totalCourses: 89,
        totalEnrollments: 5678,
      })
      setLoading(false)
    }, 500)
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Students" value={stats.totalStudents} icon={Users} color="blue" />
        <StatCard title="Instructors" value={stats.totalInstructors} icon={Award} color="purple" />
        <StatCard title="Courses" value={stats.totalCourses} icon={BookOpen} color="green" />
        <StatCard title="Enrollments" value={stats.totalEnrollments} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/instructors"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 font-semibold transition-colors"
            >
              Manage Instructors
            </a>
            <a
              href="/admin/students"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 font-semibold transition-colors"
            >
              Manage Students
            </a>
            <a
              href="/admin/courses"
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 font-semibold transition-colors"
            >
              Review Courses
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">API Status</span>
              <span className="badge-success">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database</span>
              <span className="badge-success">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Cache</span>
              <span className="badge-success">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

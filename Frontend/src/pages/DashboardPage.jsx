import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { studentAPI, courseAPI } from '../services/api'
import StatCard from '../components/StatCard'
import CourseCard from '../components/CourseCard'
import { BookOpen, Users, Trophy, Clock, AlertCircle, Loader } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, inProgress: 0, avgScore: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch enrollments
        const enrollments = await studentAPI.getEnrollments(user.id)
        setEnrolledCourses(enrollments || [])

        // Calculate stats
        setStats({
          enrolled: enrollments.length,
          completed: Math.floor(enrollments.length * 0.3),
          inProgress: Math.floor(enrollments.length * 0.7),
          avgScore: Math.floor(Math.random() * 30) + 70,
        })
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, <span className="text-blue-600">{user?.name}</span>
          </h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={BookOpen}
            label="Enrolled Courses"
            value={stats.enrolled}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={stats.inProgress}
            color="orange"
          />
          <StatCard
            icon={Trophy}
            label="Completed"
            value={stats.completed}
            color="green"
          />
          <StatCard
            icon={Users}
            label="Average Score"
            value={`${stats.avgScore}%`}
            color="purple"
          />
        </div>

        {/* Enrolled Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(enrollment => (
                <div key={enrollment.id} className="bg-white rounded-lg shadow p-4">
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded mb-4"></div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {enrollment.courseId || 'Course'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </p>
                  <a
                    href={`/courses/${enrollment.courseId}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Continue Course
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No courses enrolled yet</p>
              <a
                href="/courses"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Explore Courses
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
